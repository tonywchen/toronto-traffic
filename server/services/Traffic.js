const PathStatus = require('../models/traffic/PathStatus');

const ROUND_DOWN = 0;
const ROUND_UP = 1;
const MINUTE_IN_MILLISECONDS = 60 * 1000;
const roundToNearestMinute = (timestamp, rounding=ROUND_DOWN) => {
  if (rounding === ROUND_UP) {
    timestamp += MINUTE_IN_MILLISECONDS;
  }

  const roundedTimestamp = timestamp - timestamp % MINUTE_IN_MILLISECONDS;
  return roundedTimestamp;
}

class TrafficService {
  constructor() {

  }

  async findRecent(interval = 60) {
    const mostRecentPathStatus = await PathStatus.findOne().sort('-timestamp');
    if (!mostRecentPathStatus) {
      return [];
    }

    const mostRecentTimestamp = mostRecentPathStatus.timestamp;
    const roundedTimestamp = roundToNearestMinute(mostRecentTimestamp, ROUND_UP);


    const pathStatusPipeline = [{
      '$match': {
        timestamp: {
          '$gte': roundedTimestamp - interval * MINUTE_IN_MILLISECONDS,
          '$lt': roundedTimestamp
        }
      },
    }, {
      '$group': {
        '_id': {
          'timestamp': '$timestamp',
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
        'timestamp': '$_id.timestamp',
        'interval': '$_id.interval',
        'data': '$data'
      }
    }];

    const recentPathStatuses = await PathStatus.aggregate(pathStatusPipeline);
    return recentPathStatuses;
  }
}

module.exports = TrafficService;
