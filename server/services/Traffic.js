const _ = require('lodash');

const Path = require('../models/traffic/Path');
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
    return [];
  }

  const mostRecentTimestamp = mostRecentPathStatus.timestamp;
  const roundedTimestamp = roundToNearestMinute(mostRecentTimestamp, ROUND_UP);

  from = roundedTimestamp - 60 * MINUTE_IN_MILLISECONDS;
  to = roundedTimestamp;

  return { from, to };
}

const validateTimeRange = (from, to) => {
  if (to - from > MAX_TIME_RANGE) {
    throw new Error('Please specify a time range shorter than a day');
  }
};

const TrafficService = {
  searchBetween: async (from, to) => {
    if (!from || !to) {
      const defaultTimeRange = await getDefaultTimeRange();
      from = defaultTimeRange.from;
      to = defaultTimeRange.to;
    }

    validateTimeRange(from, to);

    const pathStatusPipeline = [{
      '$match': {
        timestamp: {
          '$gte': from,
          '$lt': to
        },
        'path.valid': true
      },
    }, {
      '$group': {
        '_id': {
          // 'timestamp': '$timestamp',
          'interval': '$interval'
        },
        'data': {
          '$push': {
            'path': {
              'from': '$path.from',
              'to': '$path.to',
              'legs': '$path.legs'
            },
            'weight': '$weight',
            'score': '$score',
            'average': {
              '$divide': ['$score', '$weight']
            }
          }
        }
      }
    }, {
      '$project': {
        '_id': 0,
        // 'timestamp': '$_id.timestamp',
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
      from: from,
      to: to,
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
