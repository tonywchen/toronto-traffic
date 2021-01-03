const mockFindOne = jest.fn();
const mockAggregate = jest.fn();

jest.mock('../models/traffic/PathStatus', () => {
  return {
    findOne: mockFindOne,
    aggregate: mockAggregate
  };
});

const TrafficService = require('./Traffic');

describe('Test the Traffic Service', () => {
  describe('Test Traffic.searchBetween method', () => {
    const validTimeRange = {
      startTimestamp: 1606798800000, // 2020-12-01 05:00:00 UTC
      endTimestamp: 1606885200000 // 2020-12-02 05:00:00 UTC
    };
    const negativeTimeRange = {
      startTimestamp: 1606798800000, // 2020-12-01 05:00:00 UTC
      endTimestamp: 1606798799000 // 2020-12-01 04:59:59 UTC
    };
    const tooLargeTimeRange = {
      startTimestamp: 1606798800000, // 2020-12-01 05:00:00 UTC
      endTimestamp: 1606885201000 // 2020-12-02 05:00:01 UTC
    };
    const firstPathStatus = {
      timestamp: 1606798500000
    };
    const lastPathStatus = {
      timestamp: 1606885500000
    };

    beforeEach(() => {
      mockFindOne.mockReset();

      mockAggregate.mockReset();
      mockAggregate.mockResolvedValue([{
        timestamp: 1606798800000,
        interval: 1606798800000,
        data: []
      }]);

      jest.spyOn(TrafficService, 'getFirstPathStatus').mockResolvedValue(firstPathStatus);
      jest.spyOn(TrafficService, 'getLastPathStatus').mockResolvedValue(lastPathStatus);
    });

    it('should successfully return properly formatted result when inputs are valid', async () => {
      const { startTimestamp, endTimestamp } = validTimeRange;

      const result = await TrafficService.searchBetween(startTimestamp, endTimestamp);

      expect(mockAggregate).toHaveBeenCalledTimes(1);
      expect(TrafficService.getFirstPathStatus).toHaveBeenCalledTimes(1);
      expect(TrafficService.getLastPathStatus).toHaveBeenCalledTimes(1);

      expect(result.startTimestamp).toEqual(startTimestamp);
      expect(result.endTimestamp).toEqual(endTimestamp);
      expect(result.results[0].timestamp).toEqual(1606798800000);
      expect(result.results[0].interval).toEqual(1606798800000);
      expect(result.results[0].data).toEqual([]);
      expect(result.first).toEqual(1606798500000);
      expect(result.last).toEqual(1606885500000);
    });
    it('should throw an error if `from` input is after `to` input', async () => {
      const { startTimestamp, endTimestamp } = negativeTimeRange;

      expect(TrafficService.searchBetween(startTimestamp, endTimestamp))
        .rejects
        .toEqual(new Error('Please ensure `startTimestamp` value is not larger than `endTimestamp` value'));
    });
    it('should throw an error if `from` and `to` range is too big', async () => {
      const { startTimestamp, endTimestamp } = tooLargeTimeRange;

      expect(TrafficService.searchBetween(startTimestamp, endTimestamp))
        .rejects
        .toEqual(new Error('Please specify a time range shorter than a day'));
    });
  });
});
