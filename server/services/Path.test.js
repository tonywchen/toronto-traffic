const mockPathFind = jest.fn();
jest.mock('../models/traffic/Path', () => {
  return {
    find: mockPathFind
  };
});

const mockPathStatusAggregate = jest.fn();
jest.mock('../models/traffic/PathStatus', () => {
  return {
    aggregate: mockPathStatusAggregate
  };
});

const mockStopFind = jest.fn();
jest.mock('../models/nextbus/Stop', () => {
  return {
    find: mockStopFind
  };
});

const Path = require('../models/traffic/Path');
const PathService = require('./Path');

describe('Test the Path Service', () => {
  describe('Test Path.getPaths method', () => {
    const successResolvedValue = [{
      from: 'test-100',
      to: 'test-200',
      legs: [[0, 0], [0.5, 0.5], [1, 1]],
      version: '2.0',
      valid: true
    }, {
      from: 'test-101',
      to: 'test-201',
      legs: [[1.0, 1.0], [1.5, 1.5], [2, 2]],
      version: '2.0',
      valid: true
    }];

    beforeEach(() => {
      mockPathFind.mockReset();
      mockPathFind.mockResolvedValue(successResolvedValue);
    });

    it('should call the correct Schema and method', async () => {
      await PathService.getPaths();

      expect(mockPathFind).toHaveBeenCalledTimes(1);
    });
    it('should successfully return properly formatted results', async () => {
      const result = await PathService.getPaths();

      const expectedPaths = successResolvedValue.map(({from, to, legs}) => {
        return { from, to, legs };
      });

      expect(result.paths.length).toEqual(2);
      expect(result).toEqual({
        paths: expectedPaths
      });
    });
    it('should successfully return empty results', async () => {
      mockPathFind.mockResolvedValue([]);

      const result = await PathService.getPaths();
      expect(result.paths.length).toEqual(0);
    });
    it('should properly throw an error when an error occurs during database request', () => {
      mockPathFind.mockReset();
      mockPathFind.mockRejectedValue(new Error('Invalid query'));

      expect(PathService.getPaths()).rejects.toEqual(new Error('Invalid query'));
    });
  });

  describe('Test Path.getPathStops method', () => {
    const successResolvedValue = [{
      tag: '100',
      title: 'Stop 100'
    }, {
      tag: '200',
      title: 'Stop 200'
    }];

    beforeEach(() => {
      mockStopFind.mockReset();
      mockStopFind.mockResolvedValue(successResolvedValue);
    });

    it('should return empty result if neither `from` or `to` stops are specified', async () => {
      mockStopFind.mockResolvedValue([]);

      const result = await PathService.getPathStops();

      expect(result).toEqual({});
    });
    it('should return partial result if only `from` is specified', async () => {
      const result = await PathService.getPathStops('100');

      expect(result).toEqual({
        fromStop: {
          tag: '100',
          title: 'Stop 100'
        }
      });
    });
    it('should return partial result if only `to` is specified', async () => {
      const result = await PathService.getPathStops(null, '200');

      expect(result).toEqual({
        toStop: {
          tag: '200',
          title: 'Stop 200'
        }
      });
    });
    it('should return partial result if `from` is specified but not found', async () => {
      const result = await PathService.getPathStops('101', '200');

      expect(result).toEqual({
        toStop: {
          tag: '200',
          title: 'Stop 200'
        }
      });
    });
    it('should return partial result if `to` is specified but not found', async () => {
      const result = await PathService.getPathStops('100', '201');

      expect(result).toEqual({
        fromStop: {
          tag: '100',
          title: 'Stop 100'
        }
      });
    });
    it('should return full result if `from` and `to` are both specified and found', async () => {
      const result = await PathService.getPathStops('100', '200');

      expect(result).toEqual({
        fromStop: {
          tag: '100',
          title: 'Stop 100'
        },
        toStop: {
          tag: '200',
          title: 'Stop 200'
        }
      });
    })
  });

  describe('Test Path.getPathStatusesOfDate', () => {
    beforeEach(() => {
      const successResolvedValue = [{
        timestamp: new Date('2020-12-01T12:00:00.000-05:00').valueOf(),
        weight: 4,
        score: 60,
        average: 15
      }, {
        timestamp: new Date('2020-12-01T12:05:00.000-05:00').valueOf(),
        weight: 3,
        score: 30,
        average: 10
      }];

      mockPathStatusAggregate.mockReset();
      mockPathStatusAggregate.mockResolvedValue(successResolvedValue);
    });

    it('should properly format pathStatuses result', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathStatusesOfDate(from, to, date);

      expect(result.pathStatuses).toHaveLength(2);
      expect(result.pathStatuses[0].average).toEqual(15);
      expect(result.pathStatuses[1].average).toEqual(10);
    });
    it('should return query timestamp range', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathStatusesOfDate(from, to, date);

      const expectedStartTimestamp = new Date('2020-12-01T00:00:00.000-05:00').valueOf();
      const expectedEndTimestamp = new Date('2020-12-02T00:00:00.000-05:00').valueOf();

      expect(result).toHaveProperty('timestampRange');
      expect(result.timestampRange.start).toEqual(expectedStartTimestamp);
      expect(result.timestampRange.end).toEqual(expectedEndTimestamp);
    });
  });

  describe('Test Path.getPathStatusTrend', () => {
    beforeEach(() => {
      const successResolvedValue = [{
        weight: 10,
        score: -50,
        average: -5
      }];

      mockPathStatusAggregate.mockReset();
      mockPathStatusAggregate.mockResolvedValue(successResolvedValue);
    });

    it('should return properly formatted result', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathStatusTrend(from, to, date);

      expect(result).toHaveProperty('average');
      expect(result).toHaveProperty('unit');
      expect(result).toHaveProperty('timestampRange');
      expect(result).toHaveProperty('timestampRange.start');
      expect(result).toHaveProperty('timestampRange.end');
    });
    it('should return properly formatted average value', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathStatusTrend(from, to, date);

      expect(result.average).toEqual(-5);
    });
    it('should return correct duration unit and timestamp range when no input unit is specified', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathStatusTrend(from, to, date);

      const expectedStartTimestamp = new Date('2020-11-01T00:00:00.000-04:00').valueOf(); // It's EDT timezone in Toronto on Nov 1, 2020
      const expectedEndTimestamp = new Date('2020-12-01T00:00:00.000-05:00').valueOf();

      expect(result.unit).toEqual('months');
      expect(result.timestampRange.start).toEqual(expectedStartTimestamp);
      expect(result.timestampRange.end).toEqual(expectedEndTimestamp);
    });
    it('should return correct duration unit and timestamp range when an input unit of `days` is specified', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();
      const unit = 'days';

      const result = await PathService.getPathStatusTrend(from, to, date, unit);

      const expectedStartTimestamp = new Date('2020-11-30T00:00:00.000-05:00').valueOf();
      const expectedEndTimestamp = new Date('2020-12-01T00:00:00.000-05:00').valueOf();

      expect(result.unit).toEqual('days');
      expect(result.timestampRange.start).toEqual(expectedStartTimestamp);
      expect(result.timestampRange.end).toEqual(expectedEndTimestamp);
    });
    it('should return correct duration unit and timestamp range when an input unit of `weeks` is specified', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();
      const unit = 'weeks';

      const result = await PathService.getPathStatusTrend(from, to, date, unit);

      const expectedStartTimestamp = new Date('2020-11-24T00:00:00.000-05:00').valueOf();
      const expectedEndTimestamp = new Date('2020-12-01T00:00:00.000-05:00').valueOf();

      expect(result.unit).toEqual('weeks');
      expect(result.timestampRange.start).toEqual(expectedStartTimestamp);
      expect(result.timestampRange.end).toEqual(expectedEndTimestamp);
    });
  });

  describe('Test Path.getPathDetail', () => {
    beforeEach(() => {
      mockStopFind.mockReset();
      mockPathStatusAggregate.mockReset();

      mockStopFind.mockResolvedValue([{
        timestamp: new Date('2020-12-01T12:00:00.000-05:00').valueOf(),
        weight: 4,
        score: 60,
        average: 15
      }, {
        timestamp: new Date('2020-12-01T12:05:00.000-05:00').valueOf(),
        weight: 3,
        score: 30,
        average: 10
      }]);
      mockPathStatusAggregate.mockResolvedValue([{
        weight: 10,
        score: -50,
        average: -5
      }]);
    });

    it('should return properly formatted result', async () => {
      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      const result = await PathService.getPathDetail(from, to, date);

      expect(result).toHaveProperty('fromStop');
      expect(result).toHaveProperty('toStop');
      expect(result).toHaveProperty('daily');
      expect(result).toHaveProperty('trend');
    });

    it('should dispatch additional calls to gather detail data for the result', async () => {
      jest.spyOn(PathService, 'getPathStops');
      jest.spyOn(PathService, 'getPathStatusesOfDate');
      jest.spyOn(PathService, 'getPathStatusTrend');

      const from = '100';
      const to = '200';
      const date = new Date('2020-12-01T12:00:00.000-05:00').valueOf();

      await PathService.getPathDetail(from, to, date);

      expect(PathService.getPathStops).toHaveBeenCalledTimes(1);
      expect(PathService.getPathStatusesOfDate).toHaveBeenCalledTimes(1);
      expect(PathService.getPathStatusTrend).toHaveBeenCalledTimes(1);
    });
  });
});
