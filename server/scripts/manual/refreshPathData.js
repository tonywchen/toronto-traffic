/**
 * The purpose of this script is to update all existing path and
 * path status data. This is helpful in many scenarios:
 * - update routing direction between stops based on updated/better
 * routing data. Attempts have been made to get routing data from
 * Mapbox "driving" direction, Mapbox "cycling" direction, Google
 * Maps "transit" direction, and Google Map "cycling" direction.
 * So far none of the options are perfect, but Google Map "cycling"
 * direction fits the routing the best out of the 4. This is why
 * the current version is using Google Map "cycling" direction to
 * provide the routing.
 * - update routing direction due to updated stop information. One
 * possible example is that the coordinates provided by Nextbus
 * API is incorrect, and this script can be run after those
 * coordinates data have been correctly updated
 */
const _ = require('lodash');

const mongoose = require('mongoose');
const Subroute = require('../../models/nextbus/Subroute');
const Stop = require('../../models/nextbus/Stop');
const Path = require('../../models/traffic/Path');
const PathStatus = require('../../models/traffic/PathStatus');
const TrafficService = require('../../services/Traffic');

const polyline = require('@mapbox/polyline');
const tokens = require('../configs/tokens.json');

const GoogleMaps = require("@googlemaps/google-maps-services-js");
const GoogleMapsClient = GoogleMaps.Client;

const bookmark = require('debug')('bookmark');
const benchmark = require('debug')('benchmark');
const inspect = require('debug')('inspect');

// should accept the following command line arguments:
// --populate    - to populate paths based on existing Nextbus routes (not very useful when there are lots of data already)
// --validate    - to validate existing paths against path routes (check modelPathRoute.js)
// --direction   - to re-fetch all directions data
const yargs = require('yargs/yargs');
const argv = yargs(process.argv).argv;

mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const populatePaths = async () => {
  bookmark(`(populatePaths)`);
  const paths = await Path.find().lean();
  const pathMap = {};
  paths.forEach(({ from, to, legs }) => {
    if (legs) {
      const identifier = `${from}-${to}`;
      pathMap[identifier] = {
        from,
        to
      };
    }
  });

  const potentialPathMap = {};
  const subroutes = await Subroute.find().lean();
  subroutes.forEach((subroute) => {
    subroute.stops.forEach((stop, stopIndex) => {
      if (stopIndex >= subroute.stops.length - 1) {
        return;
      }

      const nextStopIndex = stopIndex + 1;
      const stopTag = stop.tag;
      const nextStopTag = subroute.stops[nextStopIndex].tag;

      const identifier = `${stopTag}-${nextStopTag}`;
      potentialPathMap[identifier] = {
        from: stopTag,
        to: nextStopTag
      }
    });
  });

  const pathIdentifiers = Object.keys(pathMap);
  const potentialPathIdentifiers = Object.keys(potentialPathMap);
  const missingPathIdentifiers = _.difference(potentialPathIdentifiers, pathIdentifiers);
  const unexpectedPaths = _.difference(pathIdentifiers, potentialPathIdentifiers);

  for (const missingPathIdentifier of missingPathIdentifiers) {
    const missingPath = potentialPathMap[missingPathIdentifier];
    if (!missingPath) {
      return;
    }

    await Path.findOneAndUpdate({
      from: missingPath.from,
      to: missingPath.to
    }, {}, {
      new: true,
      upsert: true
    });
  }

  inspect(`(populatePaths) ${missingPathIdentifiers.length} missing paths generated`);
};

const validatePaths = async () => {
  bookmark(`(validatePaths)`);
  const TrafficServiceInstance = new TrafficService();

  const paths = await Path.find().lean();
  inspect(`(validatePaths) paths.length: ${paths.length}`);

  for (const path of paths) {
    const {from, to} = path;
    const isPathValid = await TrafficServiceInstance.checkPathAgainstPathRoute(from, to, '504');

    await Path.updateMany({
      from,
      to
    }, {
      valid: isPathValid
    });

    const res = await PathStatus.updateMany({
      'path.from': from,
      'path.to': to
    }, {
      'path.valid': isPathValid
    });
    inspect(`(validatePaths) ${from}-${to}: ${res.nModified} path statuses updated`);
  }
}

const fetchDirections = async () => {
  bookmark(`(fetchDirections)`);
  const googleMapsClient = new GoogleMapsClient({});

  const stopMap = {};
  const stops = await Stop.find().lean();
  for (const stop of stops) {
    stopMap[stop.tag] = stop;
  }

  const paths = await Path.find({
    valid: true
  });
  inspect(`(fetchDirections) paths.length: ${paths.length}`);

  let counter = 0;
  for (const path of paths) {
    const pathFrom = path.get('from');
    const pathTo = path.get('to');

    const fromStop = stopMap[pathFrom];
    const toStop = stopMap[pathTo];

    const response = await googleMapsClient.directions({
      params: {
        origin: [fromStop.lat, fromStop.lon],
        destination: [toStop.lat, toStop.lon],
        key: tokens.googleMaps,
        mode: 'bicycling',
      }
    });

    const result = processDirectionsResponse(response);
    if (!result.success) {
      continue;
    }

    await Path.updateMany({
      from: pathFrom,
      to: pathTo
    }, {
      legs: result.legs,
      polyline: result.polyline
    });

    await PathStatus.updateMany({
      'path.from': pathFrom,
      'path.to': pathTo
    }, {
      'path.legs': result.legs,
      'path.polyline': result.polyline
    });

    counter++;

    if (counter % 10 === 0) {
      inspect(`(fetchDirections) ${counter} of ${paths.length} paths updated`);
    }
  }
};

const processDirectionsResponse = (response) => {
  const polylineObj = response.data.routes[0].overview_polyline;
  const polylineValue = polylineObj.points;

  const legs = polyline.decode(polylineValue);
  if (!legs || legs.length === 0) {
    return {
      success: false
    };
  }

  const transformedLegs = legs.map((leg) => {
    // For coordinates, Google Maps uses [Lat, Lng] format whereas
    // Mapbox uses [Lng, Lat] format. For now we are sticking with
    // Mapbox's convention
    return [leg[1], leg[0]];
  });

  return {
    success: true,
    legs: transformedLegs,
    polyline: polylineValue
  };
};


(async () => {
  if (argv.populate) {
    await populatePaths();
  }

  if (argv.validate) {
    await validatePaths();
  }

  if (argv.direction) {
    await fetchDirections();
  }

  benchmark(`(return)`);
})();

// DEBUG=bookmark,benchmark,inspect node scripts/manual/refreshPathData.js --populate --validate --direction
