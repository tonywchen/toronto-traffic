const PathStatus = require('../models/traffic/PathStatus');

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

class TrafficService {
  constructor() {

  }

  async searchBetween(from, to) {
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
        }
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
    return {
      from: from,
      to: to,
      results: recentPathStatuses
    };
  }
}

module.exports = TrafficService;
