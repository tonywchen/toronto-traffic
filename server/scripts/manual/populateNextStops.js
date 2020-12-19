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
  const lastProcessed = 0;
  const maxTimestamp = await findRecentCompleteTimestamp(lastProcessed);

  const fromDateString = moment(lastProcessed).format();
  const toDateString = moment(maxTimestamp).format();
  console.log(`Processing trips between ${fromDateString} - ${toDateString}`);

  await populateNextStopTags(lastProcessed, maxTimestamp, routeTag);

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

    return roundedTimestamp;
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
  const query = Trip.find({
    'timestamp': {
      '$gte': lastProcessed,
      '$lt': maxTimestamp
    },
    'routeTag': routeTag,
    'nextStopTags': {
      '$exists': false
    }
  });

  let count = 0;
  const cursor = query.cursor();

  let unprocessedTrip = await cursor.next();
  while (unprocessedTrip != null) {
    const predictions = unprocessedTrip.get('predictions');

    let nextStopTags = _.chain(Object.values(predictions))
      .sortBy(({seconds}) => parseInt(seconds))
      .map('stopTag')
      .value();

    unprocessedTrip.set('nextStopTags', nextStopTags);
    await unprocessedTrip.save();

    console.log(`[populateNextStopTags] ${count++} saved!`);

    unprocessedTrip = await cursor.next();
  }
};

(async () => {
  await convertPredictions(504);
})();
