/**
 * The purpose of this script is to update all existing path and
 * path status data. This is helpful in many scenarios:
 * - update routing direction between stops based on updated/better
 * routing data from Mapbox API. One instance is that the earlier
 * versino of the routing is based on driving directions, but later
 * the cycling directions match much closer to public transit
 * directions
 * - update routing direction due to updated stop information. One
 * possible example is that the coordinates provided by Nextbus
 * API is incorrect, and this script can be run after those
 * coordinates data have been correctly updated
 */
const _ = require('lodash');

const mongoose = require('mongoose');
const Stop = require('../../models/nextbus/Stop');
const Path = require('../../models/traffic/Path');
const PathStatus = require('../../models/traffic/PathStatus');

const mbxClient = require('@mapbox/mapbox-sdk');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');

const tokens = require('../configs/tokens.json');
const baseClient = mbxClient({ accessToken: tokens.mapbox });
const directionsService = mbxDirections(baseClient);


mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

(async () => {
  const stopMap = {};
  const stops = await Stop.find().lean();
  for (const stop of stops) {
    stopMap[stop.tag] = stop;
  }

  const paths = await Path.find();
  let counter = 0;
  for (const path of paths) {
    const pathFrom = path.get('from');
    const pathTo = path.get('to');

    const fromStop = stopMap[pathFrom];
    const toStop = stopMap[pathTo];

    const response = await directionsService.getDirections({
      // Using a `cycling` profile because of many local traffic rules that affect
      // driving directions for personal vehicles. Cycling route has way fewer
      // rules and match more closely to public transit directions
      profile: 'cycling',
      alternatives: true,
      waypoints: [{
        coordinates: [fromStop.lon, fromStop.lat],
        approach: 'unrestricted'
      }, {
        coordinates: [toStop.lon, toStop.lat],
      }],
      geometries: 'geojson'
    }).send();

    const mostDirect = {
      legs: null,
      distance: -1
    };

    for (const route of response.body.routes) {
      const shouldReplace = (mostDirect.distance === -1
        || route.distance < mostDirect.distance);

      if (shouldReplace) {
        mostDirect.legs = route.geometry.coordinates;
        mostDirect.distance = route.distance;
      }
    }

    const legs = mostDirect.legs;
    if (!legs) {
      continue;
    }

    await Path.updateMany({
      from: pathFrom,
      to: pathTo
    }, {
      legs: legs
    });

    await PathStatus.updateMany({
      'path.from': pathFrom,
      'path.to': pathTo
    }, {
      'path.legs': legs
    });

    counter++;
    console.log(`${counter} of ${paths.length} updated`);
  }
})();
