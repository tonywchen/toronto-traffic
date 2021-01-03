const _ = require('lodash');

const PathStatus = require('../models/traffic/PathStatus');
const PathRoute = require('../models/traffic/PathRoute');

const ROUND_DOWN = 0;
const ROUND_UP = 1;
const MINUTE_IN_MILLISECONDS = 60 * 1000;
const MAX_TIME_RANGE = 24 * 60 * MINUTE_IN_MILLISECONDS;

const roundToNearestMinute = (timestamp, rounding=ROUND_DOWN) => {
  if (rounding === ROUND_UP) {
    timestamp += MINUTE_IN_MILLISECONDS;
  }

  const roundedTimestamp = timestamp - timestamp % MINUTE_IN_MILLISECONDS;
  return roundedTimestamp;
}

const getDefaultTimeRange = async () => {
  const mostRecentPathStatus = await PathStatus.findOne().sort('-timestamp');
  if (!mostRecentPathStatus) {
    return {};
  }

  const mostRecentTimestamp = mostRecentPathStatus.timestamp;
  const roundedTimestamp = roundToNearestMinute(mostRecentTimestamp, ROUND_UP);

  const start = roundedTimestamp - 60 * MINUTE_IN_MILLISECONDS;
  const end = roundedTimestamp;

  return { start, end };
}

const validateTimeRange = (startTimestamp, endTimestamp) => {
  if (endTimestamp < startTimestamp) {
    throw new Error('Please ensure `startTimestamp` value is not larger than `endTimestamp` value');
  }
  if (endTimestamp - startTimestamp > MAX_TIME_RANGE) {
    throw new Error('Please specify a time range shorter than a day');
  }
};

const TrafficService = {
  searchBetween: async (startTimestamp, endTimestamp) => {
    if (!startTimestamp || !endTimestamp) {
      const defaultTimeRange = await getDefaultTimeRange();
      startTimestamp = defaultTimeRange.start;
      endTimestamp = defaultTimeRange.end;
    }

    validateTimeRange(startTimestamp, endTimestamp);

    const pathStatusPipeline = [{
      '$match': {
        timestamp: {
          '$gte': startTimestamp,
          '$lt': endTimestamp
        },
        'path.valid': true
      },
    }, {
      '$group': {
        '_id': {
          'interval': '$interval',
          'from': '$path.from',
          'to': '$path.to'
        },
        'legs': {'$first': '$legs'},
        'weight': {'$sum': '$weight'},
        'score': {'$sum': '$score'},
      }
    }, {
      '$sort': { // this sort mostly helps with more predictable testing data
        '_id.from': 1,
        '_id.to': 1
      }
    }, {
      '$project': {
        '_id': '$_id',
        'legs': '$legs',
        'weight': '$weight',
        'score': '$score',
        'average': {
          '$divide': ['$score', '$weight']
        },
      }
    }, {
      '$group': {
        '_id': {
          'interval': '$_id.interval',
        },
        'data': {
          '$push': {
            'path': {
              'from': '$_id.from',
              'to': '$_id.to',
              'legs': '$legs',
            },
            'weight': '$weight',
            'score': '$score',
            'average': '$average'
          }
        }
      }
    }, {
      '$project': {
        '_id': 0,
        'timestamp': '$_id.interval',
        'interval': '$_id.interval',
        'data': '$data'
      }
    }, {
      '$sort': {
        'timestamp': 1
      }
    }];

    const recentPathStatuses = await PathStatus.aggregate(pathStatusPipeline);
    const firstPathStatus = await TrafficService.getFirstPathStatus();
    const lastPathStatus = await TrafficService.getLastPathStatus();

    return {
      startTimestamp,
      endTimestamp,
      results: recentPathStatuses,
      first: firstPathStatus.timestamp || 0,
      last: lastPathStatus.timestamp || 0
    };
  },

  getFirstPathStatus: async () => {
    const firstPathStatus = await PathStatus.findOne({}).sort({timestamp: 1});

    return firstPathStatus;
  },

  getLastPathStatus: async () => {
    const lastPathStatus = await PathStatus.findOne({}).sort({timestamp: -1});

    return lastPathStatus;
  },

  checkPathAgainstPathRoute: async (from, to, routeTag) => {
    const exists = await PathRoute.exists({routeTag});
    if (!exists) {
      return true;
    }

    const pathRouteDocs = await PathRoute.find({
      routeTag,
      'stops.tag': {
        '$all': [from, to]
      }
    });

    for (const pathRouteDoc of pathRouteDocs) {
      const stops = pathRouteDoc.get('stops');
      const fromIndex = _.findIndex(stops, {tag: from});
      const toIndex = _.findIndex(stops, {tag: to});

      if (fromIndex > toIndex) {
        continue;
      }

      const numStopsBetween = toIndex - fromIndex;
      const totalDuration = _.chain(stops)
        .slice(fromIndex + 1, toIndex + 1)
        .sumBy('duration')
        .value();

      // re-evaluate the restrictions in the future
      if (totalDuration < 5 * 60 && numStopsBetween < 3) {
        return true;
      }
    }

    return false;
  }
};

module.exports = TrafficService;
