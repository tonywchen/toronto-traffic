const mockGetPaths = jest.fn();
const mockGetPathDetail = jest.fn();
jest.mock('../services/Path', () => {
  return {
    getPaths: mockGetPaths,
    getPathDetail: mockGetPathDetail
  }
});

const request = require('supertest');
const app = require('../app');

describe('Test the `/paths` endpoint', () => {
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

describe('Test the `/paths/:from/to/:to` endpoint', () => {
  const successReturnValue = {paths: {}};

  beforeEach(() => {
    mockGetPathDetail.mockReset();
    mockGetPathDetail.mockResolvedValue(successReturnValue);
  });

  test('It should respond to the GET method', async () => {
    const response = await request(app).get(`/paths/100/to/200`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(successReturnValue);
  });
  test('It should make appropriate service call if no date query is specified', async () => {
    await request(app).get(`/paths/100/to/200`);

    expect(mockGetPathDetail).toHaveBeenCalledTimes(1);
    expect(mockGetPathDetail).toHaveBeenCalledWith('100', '200', undefined);
  });
  test('It should make appropriate service call if a date query is specified', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    await request(app).get(`/paths/100/to/200?date=${date}`);

    expect(mockGetPathDetail).toHaveBeenCalledTimes(1);
    expect(mockGetPathDetail).toHaveBeenCalledWith('100', '200', '2020-12-01T12:00:00.000-05:00');
  });
  test('It should relay error messages from the service call', async () => {
    mockGetPathDetail.mockReset();
    mockGetPathDetail.mockRejectedValue(new Error('Internal Error'));

    const response = await request(app).get(`/paths/100/to/200`);

    expect(mockGetPathDetail).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: 'Internal Error'
    });
  });
});
