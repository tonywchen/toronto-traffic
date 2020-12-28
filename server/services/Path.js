const moment = require('moment-timezone');

const Stop = require('../models/nextbus/Stop');
const PathStatus = require('../models/traffic/PathStatus');

const timezone = 'America/Toronto';

class PathService {
  constructor() {

  }

  async getPathDetail(from, to, date) {
    const { fromStop, toStop } = await this.getPathStops(from, to);
    const dailyPathStatuses = await this.getPathStatusesOfDate(from, to, date);
    const trend = await this.getPathStatusTrend(from, to, date);

    return {
      fromStop,
      toStop,
      daily: dailyPathStatuses,
      trend: trend
    };
  }

  async getPathStops (from, to) {
    const pathStops = await Stop.find({
      'tag': {
        '$in': [from, to]
      }
    });

    const fromStop = pathStops.find(stop => stop.tag === from);
    const toStop = pathStops.find(stop => stop.tag === to);

    const result = {};

    if (fromStop) {
      result.fromStop = {
        tag: fromStop.tag,
        title: fromStop.title
      }
    }

    if (toStop) {
      result.toStop = {
        tag: toStop.tag,
        title: toStop.title
      }
    }

    return result;
  }

  async getPathStatusesOfDate (from, to, date) {
    const startTimestamp = moment.tz(date, timezone).startOf('day').valueOf();
    const endTimestamp = moment.tz(date, timezone).startOf('day').add(1, 'days').valueOf();

    const pathStatusPipeline = [{
      '$match': {
        timestamp: {
          '$gte': startTimestamp,
          '$lt': endTimestamp
        },
        'path.valid': true,
        'path.from': from,
        'path.to': to
      },
    }, {
      '$group': {
        '_id': {
          'interval': '$interval'
        },
        'weight': {
          '$sum': '$weight'
        },
        'score': {
          '$sum': '$score'
        }
      }
    }, {
      '$project': {
        '_id': 0,
        'timestamp': '$_id.interval',
        'weight': '$weight',
        'score': '$score',
        'average': {
          '$divide': ['$score', '$weight']
        }
      }
    }, {
      '$sort': {
        'timestamp': 1
      }
    }];

    const pathStatuses = await PathStatus.aggregate(pathStatusPipeline);

    return pathStatuses;
  };

  async getPathStatusTrend (from, to, date, unit = 'months') {
    const startTimestamp = moment.tz(date, timezone).startOf('day').subtract(1, unit).valueOf();
    const endTimestamp = moment.tz(date, timezone).startOf('day').add(1, 'days').valueOf();

    const pathStatusPipeline = [{
      '$match': {
        timestamp: {
          '$gte': startTimestamp,
          '$lt': endTimestamp
        },
        'path.valid': true,
        'path.from': from,
        'path.to': to
      },
    }, {
      '$group': {
        '_id': {},
        'weight': {
          '$sum': '$weight'
        },
        'score': {
          '$sum': '$score'
        }
      }
    }, {
      '$project': {
        '_id': '$_id',
        'weight': '$weight',
        'score': '$score',
        'average': {
          '$divide': ['$score', '$weight']
        }
      }
    }];
    const [pathStatusTrend] = await PathStatus.aggregate(pathStatusPipeline);

    return {
      average: pathStatusTrend.average,
      unit: unit,
      dateTimeRange: {
        start: startTimestamp,
        end: endTimestamp
      }
    };
  };
}

module.exports = PathService;
