const {performance} = require('perf_hooks');
const moment = require('moment-timezone');

const Stop = require('../../models/nextbus/Stop');
const Path = require('../../models/traffic/Path');
const PathStatus = require('../../models/traffic/PathStatus');

const MBX_ACCESS_TOKEN = 'pk.eyJ1IjoidG9ueXdjaGVuIiwiYSI6ImNraHBlODYwZDBjcTMyem54YWw5bm8yajAifQ.3j0gYt0zWIa_5rXk63grLQ';
const mbxClient = require('@mapbox/mapbox-sdk');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const baseClient = mbxClient({ accessToken: MBX_ACCESS_TOKEN });
const directionsService = mbxDirections(baseClient);

const mapObject = (obj, mapFn) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    newObj[key] = mapFn(value);
  });

  return newObj;
};

const Compute = (debug = false) => {

  const trafficToPathData = async (traffic) => {
    const pathMap = {};
    const stopMap = {};

    Object.keys(traffic).forEach((stopTag) => {
      const trips = traffic[stopTag].trips;
      Object.keys(trips).forEach((tripTag) => {
        if (!trips) {
          return;
        }

        const trip = trips[tripTag];
        const {lastStopTag, timestamp, interval, diff, count} = trip;

        const localMoment = moment(timestamp).tz('America/Toronto');
        const localDateTime = {
          year: localMoment.year(),
          month: localMoment.month() + 1, // moment.month is 0-based
          date: localMoment.date(),
          day: localMoment.day(),
          hour: localMoment.hour(),
          minute: localMoment.minute()
        };

        if (lastStopTag) {
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

  const preparePathData = async (allPaths) => {
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
        pathData[identifier].paths.push(path)
      }
    }

    return pathData;
  }

  const findOrPopulatePaths = async (pathData, stopData) => {
    for (const pathDatum of Object.values(pathData)) {
      const isPathDatumFound = await findPathDatum(pathDatum);

      if (!isPathDatumFound) {
        await populatePathDatum(pathDatum, stopData);
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
      pathDatum.obj = pathDatumObj;

      return true;
    }

    return false;
  };
  const populatePathDatum = async (pathDatum, stopData) => {
    const fromStopData = stopData[pathDatum.from];
    const toStopData = stopData[pathDatum.to];

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
      from: pathDatum.from,
      to: pathDatum.to
    }, {
      legs: legs
    }, {
      new: true,
      upsert: true
    });

    for (const path of pathDatum.paths) {
      path.legs = legs;
      path.obj = updatedPathObj;
    }
  };

  const savePathStatuses = async (pathData) => {
    for (const {paths, obj} of Object.values(pathData)) {
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
    }
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

const computePathData = async (trafficGroups, debug = false) => {
  const compute = Compute(debug);

  const allPaths = [];
  const stopTagMap = {};

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
};

module.exports = computePathData;
