const mockGetPaths = jest.fn();
jest.mock('../services/Path', () => {
  return {
    getPaths: mockGetPaths
  }
});

const request = require('supertest');
const app = require('../app');

describe('Test the `/paths` path', () => {
  const successReturnValue = {paths: []};

  beforeEach(() => {
    mockGetPaths.mockReset();
    mockGetPaths.mockResolvedValue(successReturnValue);
  });

  test('It should respond to the GET method', async () => {
    const response = await request(app).get(`/paths`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(successReturnValue);
  });
  test('It should make appropriate service call', async () => {
    await request(app).get(`/paths`);

    expect(mockGetPaths).toHaveBeenCalledTimes(1);
  });
  test('It should relay error messages from the service call', async () => {
    mockGetPaths.mockReset();
    mockGetPaths.mockRejectedValue(new Error('Internal Error'));

    const response = await request(app).get(`/paths`);

    expect(mockGetPaths).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: 'Internal Error'
    });
  });
});
