const mockFind = jest.fn();
jest.mock('../models/traffic/Path', () => {
  return {
    find: mockFind
  }
});

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
      mockFind.mockReset();
      mockFind.mockResolvedValue(successResolvedValue);
    });

    it('should call the correct Schema and method', async () => {
      await PathService.getPaths();

      expect(mockFind).toHaveBeenCalledTimes(1);
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
      mockFind.mockResolvedValue([]);

      const result = await PathService.getPaths();
      expect(result.paths.length).toEqual(0);
    });
    it('should properly throw an error when an error occurs during database request', () => {
      mockFind.mockReset();
      mockFind.mockRejectedValue(new Error('Invalid query'));

      expect(PathService.getPaths()).rejects.toEqual(new Error('Invalid query'));
    });
  });
});
