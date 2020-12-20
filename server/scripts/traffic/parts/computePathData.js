const {performance} = require('perf_hooks');
const moment = require('moment-timezone');

const tokens = require('../../configs/tokens.json');
const GoogleMaps = require("@googlemaps/google-maps-services-js");
const GoogleMapsClient = GoogleMaps.Client;
const polyline = require('@mapbox/polyline');

const Stop = require('../../../models/nextbus/Stop');
const Path = require('../../../models/traffic/Path');
const PathStatus = require('../../../models/traffic/PathStatus');
const SystemSetting = require('../../../models/SystemSetting');

const bookmark = require('debug')('computePathData:bookmark');
const benchmark = require('debug')('computePathData:benchmark');
const benchmarkInner = require('debug')('computePathData:benchmarkInner');
const benchmarkApi = require('debug')('computePathData:benchmarkApi');
const inspect = require('debug')('computePathData:inspect');

const mapObject = (obj, mapFn) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    newObj[key] = mapFn(value);
  });

  return newObj;
};

const Compute = (debug = false) => {
  const googleMapsClient = new GoogleMapsClient({});

  const trafficToPathData = async (traffic) => {
    const pathMap = {};
    const stopMap = {};

    Object.keys(traffic).forEach((stopTag) => {
      const trips = traffic[stopTag].trips;
      Object.keys(trips).forEach((previousStopTag) => {
        if (!trips) {
          return;
        }

        const trip = trips[previousStopTag];
        const {timestamp, interval, diff, count} = trip;

        const localMoment = moment(timestamp).tz('America/Toronto');
        const localDateTime = {
          year: localMoment.year(),
          month: localMoment.month() + 1, // moment.month is 0-based
          date: localMoment.date(),
          day: localMoment.day(),
          hour: localMoment.hour(),
          minute: localMoment.minute()
        };

        if (previousStopTag) {
          const pathStatus = {
            timestamp,
            interval,
            localDateTime,
            score: diff,
            weight: count,
            segments: [{
              from: 0,
              to: 1,
              score: diff,
              weight: count
            }]
          };

          const path = {
            from: previousStopTag,
            to: stopTag,
            pathStatus: pathStatus
          };
          const pathIdentifier = `${previousStopTag}---${stopTag}`;

          pathMap[pathIdentifier] = path;

          stopMap[previousStopTag] = 1;
          stopMap[stopTag] = 1;
        }
      });
    });

    return {
      paths: Object.values(pathMap),
      stopTags: Object.keys(stopMap)
    };
  };

  // TODO: add a fetch function in case
  // no stop data exists for a tag
  const findStopData = async (stopTags) => {
    bookmark(`(findStopData)`);

    const stopData = {};
    for (const stopTag of stopTags) {
      stopData[stopTag] = null;
    }

    const documents = await Stop.find({
      tag: {'$in': stopTags}
    });

    for (const document of documents) {
      const stopTag = document.get('tag');
      stopData[stopTag] = document.toObject();
    }

    return stopData;
  };

  const preparePathData = async (allPaths) => {
    bookmark(`(preparePathData)`);
    const pathData = {};
    for (const paths of allPaths) {
      for (const path of paths) {
        const {from, to} = path;
        const identifier = `${from}-${to}`;
        pathData[identifier] = pathData[identifier] || {
          from,
          to,
          paths: []
        };
        pathData[identifier].paths.push(path);
      }
    }

    return pathData;
  }

  const findOrPopulatePaths = async (pathData, stopData) => {
    bookmark(`(findOrPopulatePaths)`);
    for (const pathDatum of Object.values(pathData)) {
      const isPathDatumFound = await findPathDatum(pathDatum);

      if (!isPathDatumFound) {
        await populatePathDatum(pathDatum, stopData);
      } else {
        // indicate the path is still active after changes to
        // new computing algorithm version
        const { _id } = pathDatum.obj;
        await Path.findOneAndUpdate({_id}, {});
      }
    }
  }

  const findPathDatum = async (pathDatum) => {
    const pathDatumObj = await Path.findOne({
      from: pathDatum.from,
      to: pathDatum.to
    });

    if (pathDatumObj) {
      pathDatum.legs = pathDatumObj.legs;
      pathDatum.polyline = pathDatumObj.polyline;
      pathDatum.obj = pathDatumObj;

      return true;
    }

    return false;
  };
  const populatePathDatum = async (pathDatum, stopData) => {
    bookmark(`(populatePathDatum) from=${pathDatum.from} to=${pathDatum.to}`);

    const fromStopData = stopData[pathDatum.from];
    const toStopData = stopData[pathDatum.to];

    benchmarkApi(`(populatePathDatum) googleMapsClient.directions`)
    const response = await googleMapsClient.directions({
      params: {
        origin: [fromStopData.lat, fromStopData.lon],
        destination: [toStopData.lat, toStopData.lon],
        key: tokens.googleMaps,
        mode: 'bicycling',
      }
    });
    benchmarkApi(`(populatePathDatum) googleMapsClient.directions - end`);

    const result = processDirectionsResponse(response);
    if (!result.success) {
      return;
    }

    const updatedPathObj = await Path.findOneAndUpdate({
      from: pathDatum.from,
      to: pathDatum.to
    }, {
      legs: result.legs,
      polyline: result.polyline
    }, {
      new: true,
      upsert: true
    });

    pathDatum.legs = result.legs;
    pathDatum.polyline = result.polyline;
    pathDatum.obj = updatedPathObj;
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

  const savePathStatuses = async (pathData) => {
    bookmark(`(savePathStatuses)`);

    benchmark(`(savePathStatuses) ${Object.keys(pathData).length} pathData`);
    for (const {paths, obj} of Object.values(pathData)) {
      benchmarkInner(`(savePathStatuses) ${paths.length} paths`);
      for (const path of paths) {
        const { pathStatus } = path;

        await PathStatus.findOneAndUpdate({
          path: obj,
          timestamp: pathStatus.timestamp,
          interval: pathStatus.interval
        }, {
          ...pathStatus
        }, {
          new: true,
          upsert: true
        });
      }
      benchmarkInner(`(savePathStatuses) ${paths.length} paths - end`);
    }
    benchmark(`(savePathStatuses) ${Object.keys(pathData).length} pathData - end`);
  };

  const _benchmark = (fn) => {
    // TODO: research if there is a way to make this work with
    // both synchronous/asynchronous functions
    return async (...args) => {
      if (!debug) {
        return await fn(...args);
      }

      const before = performance.now();
      const result = await fn(...args);
      const after = performance.now();
      const duration = after - before;

      console.log(`[${fn.name}] ${duration}ms`);

      return result;
    }
  };

  const publicFn = {
    trafficToPathData,
    findStopData,
    preparePathData,
    findOrPopulatePaths,
    savePathStatuses
  };

  return mapObject(publicFn, _benchmark)
};

const computePathData = async (trafficGroups, maxTimestamp, debug = false) => {
  const compute = Compute(debug);

  const allPaths = [];
  const stopTagMap = {};

  bookmark(`(trafficToPathData)`);
  for (const traffic of trafficGroups) {
    const {paths, stopTags} = await compute.trafficToPathData(traffic);

    allPaths.push(paths);
    for (const stopTag of stopTags) {
      stopTagMap[stopTag] = true;
    }
  }

  const stopTags = Object.keys(stopTagMap);

  const stopData = await compute.findStopData(stopTags);
  const pathData = await compute.preparePathData(allPaths);

  await compute.findOrPopulatePaths(pathData, stopData);
  await compute.savePathStatuses(pathData);

  bookmark(`(SystemSetting.setLastProcessed)`);
  await SystemSetting.setLastProcessed(maxTimestamp);

  bookmark(`(return)`);
};

module.exports = computePathData;
