const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const SystemSetting = require('../../models/SystemSetting');
const Trip = require('../../models/nextbus/Trip');

const DEFAULT_TIME_RANGE = 5 * 60 * 1000; // 5 minutes interval
const MAX_TIME_RANGE = 24 * 60 * 60 * 1000; // limit script to process only at most 24 hours of data at a time


mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const convertPredictions = async (routeTag, from, to) => {
  const lastProcessed = 0; // await SystemSetting.findLastProcessed();
  const maxTimestamp = await findRecentCompleteTimestamp(lastProcessed);

  const fromDateString = moment(lastProcessed).format();
  const toDateString = moment(maxTimestamp).format();
  console.log(`Processing trips between ${fromDateString} - ${toDateString}`);

  await populatePreviousStops(lastProcessed, maxTimestamp, routeTag);

  console.log(`Finished processing trips between ${fromDateString} - ${toDateString}`);
};

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

    return roundedTimestamp;
  }

  return 0;
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

  let count = 1;
  for (const tripTag of tripTags) {
    const trips = await Trip.find({
      tripTag
    }, null , {
      sort: { timestamp: 1 }
    }).lean();

    const last = {
      nextStopTags: [],
      previousStopTag: '',
      timestamp: 0
    };

    for (const trip of trips) {
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

    console.log(`${count++} of ${tripTags.length} tripTags processed`);
  }
};

(async () => {
  await convertPredictions(504);
})();
