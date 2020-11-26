/*
[{
  stopTag: '23885',
  trips: {
    '40919442': {
      diff: 42,
      count: 1,
      directions: [Object],
      hasMultipleDirections: false,
      lastStopTag: '23887'
    }
  }
}]
*/

const Stop = require('../../models/nextbus/Stop');
const Path = require('../../models/traffic/Path');
const PathStatus = require('../../models/traffic/PathStatus');

const MBX_ACCESS_TOKEN = '';
const mbxClient = require('@mapbox/mapbox-sdk');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const baseClient = mbxClient({ accessToken: MBX_ACCESS_TOKEN });
const directionsService = mbxDirections(baseClient);

const trafficToPathData = (traffic) => {
  const pathMap = {};
  const stopMap = {};

  Object.keys(traffic).forEach((stopTag) => {
    const trips = traffic[stopTag].trips;
    Object.keys(trips).forEach((tripTag) => {
      if (!trips) {
        return;
      }

      const trip = trips[tripTag];
      const {lastStopTag, timestamp, diff, count} = trip;

      if (lastStopTag) {
        const pathStatus = {
          timestamp,
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
          from: stopTag,
          to: lastStopTag,
          pathStatus: pathStatus
        };
        const pathIdentifier = `${stopTag}---${lastStopTag}`;

        pathMap[pathIdentifier] = path;

        stopMap[stopTag] = 1;
        stopMap[lastStopTag] = 1;
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

const findOrFetchPath = async (paths, stopData) => {
  for (const path of paths) {
    const fromStopData = stopData[path.from];
    const toStopData = stopData[path.to];

    const pathObj = await Path.findOne({
      from: path.from,
      to: path.to
    });

    if (pathObj) {
      path.legs = pathObj.legs;
      path.obj = pathObj;
      continue;
    }

    const response = await directionsService.getDirections({
      profile: 'driving-traffic',
      waypoints: [{
        coordinates: [fromStopData.lon, fromStopData.lat],
        approach: 'unrestricted'
      }, {
        coordinates: [toStopData.lon, toStopData.lat],
      }],
      geometries: 'geojson'
    }).send();

    const legs = response.body.routes[0].geometry.coordinates;
    const updatedPathObj = await Path.findOneAndUpdate({
      from: path.from,
      to: path.to
    }, {
      legs: legs
    }, {
      new: true,
      upsert: true
    });

    path.legs = legs;
    path.obj = updatedPathObj;
  }
};

const savePathStatuses = async (paths) => {
  for (const path of paths) {
    const { pathStatus, obj } = path;
    pathStatus.path = obj;

    await PathStatus.findOneAndUpdate({
      path: pathStatus.path,
      timestamp: pathStatus.timestamp,
    }, {
      ...pathStatus
    }, {
      new: true,
      upsert: true
    });
  }
};

const computePathData = async (traffic) => {
  const pathData = trafficToPathData(traffic);
  const stopData = await findStopData(pathData.stopTags);
  await findOrFetchPath(pathData.paths, stopData);
  await savePathStatuses(pathData.paths);
};

module.exports = computePathData;
