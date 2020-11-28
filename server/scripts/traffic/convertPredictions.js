const { MongoClient } = require('mongodb');

const Trip = require('../../models/nextbus/Trip');
const Subroute = require('../../models/nextbus/Subroute');
const SystemSetting = require('../../models/SystemSetting');

const dirTagRegex = new RegExp('[0-9]{1,3}_[0-1]_');
const DEFAULT_TIME_RANGE = 5 * 60 * 1000; // 5 minutes

const findRecentTripIntervals = async (lastProcessed, routeTag) => {
  const pipeline = [{
    '$match': {
      'timestamp': { '$gt': lastProcessed },
      'routeTag': routeTag
    }
  }, {
    '$group': {
      '_id': {
        'interval': {
          '$subtract': ['$timestamp', {
            '$mod': [
              '$timestamp',
              DEFAULT_TIME_RANGE
            ]
          }]
        }
      },
      'trips': {
        '$push': '$$ROOT'
      }
    }
  }, {
    '$project': {
      'interval': '$_id.interval',
      'trips': '$trips'
    }
  }];

  const tripIntervals = [];
  const cursor = await Trip.aggregate(pipeline);
  await cursor.forEach((result) => {
    tripIntervals.push(result);
  });

  return tripIntervals;
};

/**
 * Bus/Streetcar predictions are grouped as individual trips to reduce
 * storage space. This function restores predictions into the original
 * flat list for ease of analysis.
 * @param {*} trips  the trip groups to be converted into a flat list
 * of predictions
 */
const flattenTripsToPredictions = (trips, interval) => {
  const allPredictions = [];
  trips.forEach((trip) => {
    const predictions = tripToPredictions(trip, interval);
    allPredictions.push(...predictions);
  });

  return allPredictions;
};

/**
 * Turn a single trip group of predictions into a flat list of predictions
 * populated with original route/direction/branch/trip attributes
 * @param {*} trip
 */
const tripToPredictions = (trip, interval) => {
  const { tripTag, routeTag, routeTitle, dirTag, branch, timestamp } = trip;
  const predictions = Object.keys(trip.predictions).map((key) => {
    const prediction = trip.predictions[key];

    return {
      ...prediction,
      tripTag,
      routeTag,
      routeTitle,
      dirTag,
      branch,
      timestamp,
      interval
    };
  });

  return predictions;
};

/**
 * Grouping predictions by stop allows easier observation of how predictions
 * change over time at a single location
 * @param {*} predictions
 */
const groupPredictionsByStops = (predictions) => {
  const stops = predictions.reduce((acc, prediction) => {
    const { stopTag } = prediction;
    acc[stopTag] = acc[stopTag] || {
      stopTag: stopTag,
      predictions: []
    };

    acc[stopTag].predictions.push(prediction);

    return acc;
  }, {});

  return stops;
};

/**
 * This function attempts to compute prediction timing changes over
 * time at each stop. Each prediction has:
 * - `timestamp` - denotesthe time at which the prediction is reported
 * - `seconds` -  denotes the number of seconds till the vehicle
 * arrives at the stop.
 * By comparing changes in actual time and changes in prediction time,
 * we can infer whether the traffic is busy or not at each stop.
 *
 * For now, to simplify the algorithm and reduce other factors that
 * might affect traffic along the entire route of a trip, we are
 * only observing, for each stop, the prediction change in the
 * nearest vehicle that has already passed the previous stop and is
 * on the way to the current stop.
 *
 * The output of the function will contain, for each stop, a stop
 * tag and a list of prediction changes by trip. For each trip,
 * there are three values:
 * - `diff` - the sum of all differences between prediction time
 * and actual time, over all qualifying predictions
 * - `count` - number of qualifying predictions that made up the
 * sum
 * - `directions` - the direction tag for the vehicle. This is
 * essential for later to figure out the previous stop for the
 * vehicle. Note that theoretically there should be only one
 * direction per trip, but using an array for now to observe
 * if there can be any data error
 * @param {*} stops
 * @param {*} tripLocations
 */
const computeTrafficByStop = (stops, tripLocations) => {
  const trafficMap = {};

  Object.keys(stops).forEach((key) => {
    const stop = stops[key];
    stop.predictions.sort((p1, p2) => {
      return p1.timestamp - p2.timestamp;
    });

    if (!stop.predictions.length) {
      return;
    }

    let previousTimingMap = {};
    let stopTripMap = {};
    stop.predictions.forEach((prediction) => {
      const { tripTag, dirTag } = prediction;
      const previousTiming = previousTimingMap[tripTag];

      const tripStopLocation = tripLocations[prediction.timestamp][tripTag];
      const isTripAtStop = tripStopLocation.stopTag === stop.stopTag;

      if (previousTiming) {
        prediction.last = { ...previousTiming }

        const change = {
          isFirst: false,
          isTripAtStop: isTripAtStop,
          elapsed: Math.round((prediction.timestamp - prediction.last.timestamp) / 1000),
          timing: -(prediction.seconds - prediction.last.seconds),
        };
        change.diff = change.elapsed - change.timing; // a negative diff means less busy traffic, a position diff means busier traffic
        prediction.change = change;

        if (isTripAtStop) {
          stopTripMap[tripTag] = stopTripMap[tripTag] || {
            diff: 0,
            count: 0,
            timestamp: prediction.timestamp,
            interval: prediction.interval,
            directions: {}  // theoretically only trip-direction is a 1-to-1 mapping, but setting this to array to observe all possible values
          };

          stopTripMap[tripTag].diff += change.diff;
          stopTripMap[tripTag].count++;

          stopTripMap[tripTag].directions[dirTag] = stopTripMap[tripTag].directions[dirTag] || 0;
          stopTripMap[tripTag].directions[dirTag]++;

          stopTripMap[tripTag].hasMultipleDirections = Object.keys(stopTripMap[tripTag].directions).length > 1;
        }
      } else {
        prediction.change = { isFirst: true };
      }

      previousTimingMap[prediction.tripTag] = {
        timestamp: prediction.timestamp,
        seconds: prediction.seconds,
        tripTag: prediction.tripTag
      };
    });

    trafficMap[stop.stopTag] = {
      stopTag: stop.stopTag,
      trips: stopTripMap
    }
  });

  return trafficMap;
};

/**
 * This function looks at all predictions and figures out the vehicle
 * locations at each reported time. This groups all predictions by
 * the report time, and for each report time group, find the stop that
 * has the lowest `seconds` till arrival at the stop.
 * @param {*} predictions
 */
const getCurrentTripLocations = (predictions) => {
  const predictionsByTimestamps = predictions.reduce((acc, prediction) => {
    const { timestamp } = prediction;
    acc[timestamp] = acc[timestamp] || {
      timestamp: timestamp,
      predictions: []
    };

    acc[timestamp].predictions.push(prediction);

    return acc;
  }, {});

  const tripLocationsByTimestamp = {};

  Object.keys(predictionsByTimestamps).forEach((timestamp) => {
    let tripLocations = {};

    const predictions = predictionsByTimestamps[timestamp].predictions;
    predictions.forEach((prediction) => {
      const { seconds, stopTag, tripTag } = prediction;
      tripLocations[tripTag] = tripLocations[tripTag] || {
        seconds,
        stopTag
      };

      if (seconds < tripLocations[tripTag].seconds) {
        tripLocations[tripTag] = {
          seconds,
          stopTag
        }
      }
    });

    tripLocationsByTimestamp[timestamp] = tripLocations;
  });

  return tripLocationsByTimestamp;
};

const findSubroutes = async (routeTag) => {
  const query = {routeTag};

  const subroutes = [];
  const documents = await Subroute.find(query);
  for (const document of documents) {
    subroutes.push(document.toObject());
  };

  return subroutes;
};

const matchTrafficToDirections = (traffic, subrouteData) => {
  // TODO: optimize the algorithm to use fewer nestings
  Object.keys(traffic).forEach((stopTag) => {
    const trips = traffic[stopTag].trips;
    Object.keys(trips).forEach((tripTag) => {
      const trip = trips[tripTag];
      const dirTag = Object.keys(trip.directions)[0];

      const lastStop = findLastStop(dirTag, stopTag, subrouteData);
      if (lastStop) {
        trip.lastStopTag = lastStop.tag;
      }
    });
  });
};

const findLastStop = (dirTag, stopTag, subrouteData) => {
  let fullMatch, partialMatch;
  for (const subrouteDatum of subrouteData) {
    if (!subrouteDatum.tag || !dirTag) {
      continue;
    }

    if (subrouteDatum.tag === dirTag) {
      fullMatch = subrouteDatum;
    }

    // By observation, the `dirTag` used by TTC has a format of
    // `{route}_{direction}_{branch}` where:
    // - `route`: Route number of the vehicle (eg. 6, 72, 504)
    // - `direction`: either 0 or 1 denoting westbound/eastbound or
    // southbound/northbound
    // - `branch`: usually the route number followed by an internal
    // unique identifier
    //
    // There are many instances where the `dirTag` from a trip does not
    // match existing definitions. Possibly because if a trip has
    // to make a detour or short-turn, a non-predefined `branch` value
    // seems to be assigned to the `dirTag` of the trip.
    //
    // To workaround it, only match the `route` and `direction`
    const datumResults = dirTagRegex.exec(subrouteDatum);
    const valueResults = dirTagRegex.exec(dirTag);

    if (datumResults && valueResults && datumResults[0] === valueResults[0]) {
      partialMatch = subrouteDatum;
    }
  }

  const matchedSubroute = fullMatch || partialMatch;

  if (matchedSubroute) {
    const foundStopIndex = matchedSubroute.stops.findIndex((stop, i) => {
      return stop.tag === stopTag;
    });

    if (foundStopIndex > 0) {
      return matchedSubroute.stops[foundStopIndex - 1];
    }
  }
};

const convertPredictions = async (routeTag) => {
  if (!routeTag) {
    return;
  }

  const lastProcessed = await SystemSetting.findLastProcessed();
  const tripIntervals = await findRecentTripIntervals(lastProcessed, routeTag);

  const trafficGroups = [];
  for (const { interval, trips } of tripIntervals) {
    const predictions = flattenTripsToPredictions(trips, interval);
    const predictionsByStop = groupPredictionsByStops(predictions);
    const currentTripLocations = getCurrentTripLocations(predictions);

    const traffic = computeTrafficByStop(predictionsByStop, currentTripLocations);
    const subroutes = await findSubroutes();

    matchTrafficToDirections(traffic, subroutes);

    trafficGroups.push(traffic);
  }

  return trafficGroups;
}

module.exports = convertPredictions;
