const _ = require('lodash');
const mongoose = require('mongoose');

const Trip = require('../../../models/nextbus/Trip');
const SystemSetting = require('../../../models/SystemSetting');

const DEFAULT_TIME_RANGE = 5 * 60 * 1000; // 5 minutes interval
const MAX_TIME_RANGE = 24 * 60 * 60 * 1000; // limit script to process only at most 24 hours of data at a time

/**
 * This script computes traffic data by taking prediction data in
 * time batches defined by `DEFAULT_TIME_RANGE` (ie. 5-minute
 * batches). This function returns the end time of the most
 * recent complete batch so the rest of the script can use
 * the return value to limit the prediction data query.
 */
const findRecentCompleteTimestamp = async (lastProcessed) => {
  const result = await Trip.findOne().sort('-timestamp');

  if (result) {
    const { timestamp } = result;
    const roundedTimestamp = timestamp - timestamp % DEFAULT_TIME_RANGE;

    let maxAllowedTimestmp = (lastProcessed + MAX_TIME_RANGE);
    maxAllowedTimestmp = maxAllowedTimestmp - maxAllowedTimestmp % DEFAULT_TIME_RANGE;

    return Math.min(roundedTimestamp, maxAllowedTimestmp);
  }

  return 0;
};

/**
 * This function iterates through trips and populates `nextStopTags`,
 * an array of stop tags representing an ordered list of the subsequent
 * stops for this trip. This array value is calculated using the
 * `predictions` data from the trip. `nextStopTags` will help determine
 * which stop a vehicle is coming from for a specific trip at a specific
 * time (see `populatePreviousStops` for more detail)
 * @param {*} lastProcessed
 * @param {*} maxTimestamp
 * @param {*} routeTag
 */
const populateNextStopTags = async (lastProcessed, maxTimestamp, routeTag) => {
  const unprocessedTrips = await Trip.find({
    'timestamp': {
      '$gte': lastProcessed,
      '$lt': maxTimestamp
    },
    'routeTag': routeTag,
    'nextStopTags': {
      '$exists': false
    }
  });

  let count = 1;
  for (const unprocessedTrip of unprocessedTrips) {
    const predictions = unprocessedTrip.get('predictions');

    let nextStopTags = _.chain(Object.values(predictions))
      .sortBy(({seconds}) => parseInt(seconds))
      .map('stopTag')
      .value();

    unprocessedTrip.set('nextStopTags', nextStopTags);
    await unprocessedTrip.save();

    console.log(`${count++} of ${unprocessedTrips.length} saved!`);
  }
};

/**
 * This function calculates which stop (ie. `previousStopTag`) a vehicle
 * is coming from for each specific trip at a specific timestamp by looking
 * at the historical data for a specific trip. This information will help
 * determine the road path this eventual traffic data will map to.
 *
 * This step is necessary because the route info provided by NextBus/TTC
 * is incomplete and it was impossible to determine the list of stops a
 * trip goes through for many instances (eg. 504 Westbound route information
 * was mostly missing). This also helps in the cases where there might be a
 * sudden route change (eg. diversion, short turn) where it is only possible
 * to determine the paths a vehicle takes by looking at real data.
 * @param {*} lastProcessed the lower bound of the timestamp for the query
 * @param {*} maxTimestamp the upper bound of the timestamp for the query
 * @param {*} routeTag the route whose trips to populate
 */
const populatePreviousStops = async (lastProcessed, maxTimestamp, routeTag) => {
  const tripTags = await Trip.distinct('tripTag', {
    'timestamp': {
      '$gte': lastProcessed,
      '$lt': maxTimestamp
    },
    'routeTag': routeTag,
    'nextStopTags': {
      '$exists': true
    },
    'previousStopTag': {
      '$exists': false
    }
  });

  const pipeline = [{
    '$match': {
      'tripTag': {
        '$in': tripTags
      },
      'timestamp': {
        '$lt': maxTimestamp
      },
    }
  }, {
    '$sort': {
      'timestamp': 1
    }
  }, {
    '$group': {
      '_id': '$tripTag',
      'trips': {
        '$push': '$$ROOT'
      }
    }
  }, {
    '$project': {
      'tripTag': '$_id',
      'trips': '$trips'
    }
  }];

  let count = 1;
  const cursor = await Trip.aggregate(pipeline).allowDiskUse(true);
  for (const result of cursor) {
    const last = {
      nextStopTags: [],
      previousStopTag: '',
      timestamp: 0
    };

    for (const trip of result.trips) {
      let timestamp = trip.timestamp;
      let nextStopTags = trip.nextStopTags || [];
      let previousStopTag = last.previousStopTag;

      if (last.nextStopTags.length !== 0 && (last.nextStopTags[0] != nextStopTags[0])) {
        const previousStopTagIndex = last.nextStopTags.indexOf(nextStopTags[0]);
        if (previousStopTagIndex > 0) {
          previousStopTag = last.nextStopTags[previousStopTagIndex - 1];
        }
      }

      // A 'trip' has been assumed to be the journey a vehicle takes to go between
      // two terminal stations. However, it has been observed not to be the case
      // and serveral common scenarios have been found to contradict this definition:
      // - Sudden scheduling change: A vehicle might jump to a distant stop in the
      // direction that is either same or opposite from the current direction. This
      // is most likely due to sudden route diversion, short-turns, or re-assignment
      // of the vehicle schedule.
      // - Rolling tripTag: A tripTag might stay the same after the vehicle has reached
      // the terminal station and is going back in the opposite direction.
      //
      // To fix these unexpected behaviour, a few checks are implemented to detect the
      // scenarios above. If so, assume the particular segment of the trip does not
      // have a previous stop (effectily starting a new "sub-trip")

      // Scenario 1:
      // When there is a sudden scheduling change, the trip tends to disappear from
      // all predictions for an extended period of time. It is reasonable to assume
      // if the trip disappeared for more than the polling interval (DEFAULT_TIME_RANGE)
      // of the script, it most likely has had a scheduling change.
      const hasDisappeared = (timestamp - last.timestamp > DEFAULT_TIME_RANGE);

      // Scenario 2:
      // A trip sometimes can loop back (eg. the next stops go from [10, 11, 12] to
      // [8, 9, 10]). We can check if the first of the next stops suddenly
      // go back in the queue.
      let isLoopedBack = false;
      const lastNextStopTag = last.nextStopTags[0] || '';
      const lastNextStopTagCurrentIndex = nextStopTags.indexOf(lastNextStopTag);
      if (lastNextStopTagCurrentIndex > 0) {
        isLoopedBack = true
      }

      if (hasDisappeared || isLoopedBack) {
        previousStopTag = '';
      }

      await Trip.findByIdAndUpdate(mongoose.Types.ObjectId(trip._id), {
        previousStopTag
      });

      last.nextStopTags = nextStopTags;
      last.previousStopTag = previousStopTag;
      last.timestamp = timestamp;
    }

    console.log(`[populatePreviousStops] ${count++} of ${cursor.length} trips saved!`);
  }
};


// TODO: find a way to avoid/reduce `allowDiskUse`
const findRecentTripIntervals = async (lastProcessed, maxTimestamp, routeTag) => {
  const pipeline = [{
    '$match': {
      'timestamp': {
        '$gte': lastProcessed,
        '$lt': maxTimestamp
      },
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
      },
      'lastTimestamp': {
        '$max': '$timestamp'
      }
    }
  }, {
    '$project': {
      'interval': '$_id.interval',
      'trips': '$trips',
      'lastTimestamp': '$lastTimestamp'
    }
  }];

  const tripIntervals = [];
  const cursor = await Trip.aggregate(pipeline).allowDiskUse(true);
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
  const { tripTag, routeTag, routeTitle, dirTag, branch, timestamp, previousStopTag, nextStopTags } = trip;
  const predictions = Object.keys(trip.predictions).map((key) => {
    const prediction = trip.predictions[key];
    const seconds = parseInt(prediction.seconds);

    return {
      ...prediction,
      seconds,
      tripTag,
      routeTag,
      routeTitle,
      dirTag,
      branch,
      timestamp,
      interval,
      previousStopTag,
      nextStopTags
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
const computeTrafficByStop = (stops) => {
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
      const { tripTag, dirTag, previousStopTag, nextStopTags } = prediction;
      const isTripAtStop = (nextStopTags)? stop.stopTag === nextStopTags[0] : false;

      const previousTiming = previousTimingMap[tripTag];
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
          stopTripMap[previousStopTag] = stopTripMap[previousStopTag] || {
            diff: 0,
            count: 0,
            timestamp: prediction.timestamp,
            interval: prediction.interval,
            directions: {}  // theoretically only trip-direction is a 1-to-1 mapping, but setting this to array to observe all possible values
          };

          stopTripMap[previousStopTag].diff += change.diff;
          stopTripMap[previousStopTag].count++;

          stopTripMap[previousStopTag].directions[dirTag] = stopTripMap[previousStopTag].directions[dirTag] || 0;
          stopTripMap[previousStopTag].directions[dirTag]++;

          stopTripMap[previousStopTag].hasMultipleDirections = Object.keys(stopTripMap[previousStopTag].directions).length > 1;
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

const convertPredictions = async (routeTag) => {
  if (!routeTag) {
    return;
  }
  const lastProcessed = await SystemSetting.findLastProcessed();
  const maxTimestamp = await findRecentCompleteTimestamp(lastProcessed);

  await populateNextStopTags(lastProcessed, maxTimestamp, routeTag);
  await populatePreviousStops(lastProcessed, maxTimestamp, routeTag);

  const tripIntervals = await findRecentTripIntervals(lastProcessed, maxTimestamp, routeTag);
  const trafficGroups = [];
  for (const { interval, trips } of tripIntervals) {
    const predictions = flattenTripsToPredictions(trips, interval);
    const predictionsByStop = groupPredictionsByStops(predictions);

    const traffic = computeTrafficByStop(predictionsByStop);

    trafficGroups.push(traffic);
  }

  return {
    trafficGroups,
    maxTimestamp
  };
}

module.exports = convertPredictions;
