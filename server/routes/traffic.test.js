const moment = require('moment');

const mockSearchBetween = jest.fn();
jest.mock('../services/Traffic', () => {
  return {
    searchBetween: mockSearchBetween
  }
});

const request = require('supertest');
const app = require('../app');

describe('Test the `/traffic` path', () => {
  const successReturnValue = {results: []};

  beforeEach(() => {
    mockSearchBetween.mockReset();
    mockSearchBetween.mockResolvedValue(successReturnValue);
  });

  test('It should respond to the GET method when no dates are specified', async () => {
    const response = await request(app).get(`/traffic`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(successReturnValue);
  });

  test('It should make appropriate service call when given valid dates', async () => {
    const startDate = '2020-12-15';
    const endDate = '2020-12-16';
    const params = `startDate=${startDate}&endDate=${endDate}`;

    await request(app).get(`/traffic?${params}`);

    const startTimestamp = moment(startDate).valueOf();
    const endTimestamp = moment(endDate).valueOf();

    expect(mockSearchBetween).toHaveBeenCalledTimes(1);
    expect(mockSearchBetween).toHaveBeenCalledWith(startTimestamp, endTimestamp);
  });

  test('It should relay error messages from the service call when given valid dates', async () => {
    mockSearchBetween.mockReset();
    mockSearchBetween.mockRejectedValue(new Error('Internal Error'));

    const startDate = '2020-12-15';
    const endDate = '2020-12-16';
    const params = `startDate=${startDate}&endDate=${endDate}`;

    const response = await request(app).get(`/traffic?${params}`);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: 'Internal Error'
    });
  });

  test('It should throw an error when given invalid dates', async () => {
    const startDate = '2020-13-15';
    const endDate = '2020-13-16';
    const params = `startDate=${startDate}&endDate=${endDate}`;

    const response = await request(app).get(`/traffic?${params}`);

    expect(mockSearchBetween).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: 'Invalid dates are given'
    });
  });

  test('It should throw an error when given an invalid date range', async () => {
    const startDate = '2020-12-17';
    const endDate = '2020-12-16';
    const params = `startDate=${startDate}&endDate=${endDate}`;

    const response = await request(app).get(`/traffic?${params}`);

    expect(mockSearchBetween).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: '"startDate" must not be larger than "endDate"'
    });
  });
});
