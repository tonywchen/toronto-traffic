const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const PathStatus = require('../../models/traffic/PathStatus');

const mockPathStatuses = require('./fetchTraffic.data');

describe('Test mock Path Status setup', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });
  });

  afterEach(async () => {
    await PathStatus.deleteMany()
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should insert mock data into PathStatus collection', async () => {
    await PathStatus.insertMany(mockPathStatuses.pathStatuses);

    const insertedPathStatuses = await PathStatus.find({});

    expect(insertedPathStatuses.length).toEqual(18);
  });
});

describe('Test fetching traffic from `/traffic`', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });

    // We are testing a GET/read-only route so we should not expect
    // individual unit testings here change and affect each other's
    // source data
    await PathStatus.insertMany(mockPathStatuses.pathStatuses);
  });

  afterAll(async () => {
    await PathStatus.deleteMany()
    await mongoose.connection.close();
  });

  it('should return most recent datetime range with traffic if no date range input is given', async () => {
    const { statusCode, body } = await request(app).get(`/traffic`);
    const { startTimestamp, endTimestamp } = body;

    expect(statusCode).toEqual(200);

    const expectedEndTimestamp = new Date('2020-12-01T12:10:00.000-05:00').valueOf();
    const expectedStartTimestamp = expectedEndTimestamp - 60 * 60 * 1000;

    expect(startTimestamp).toEqual(expectedStartTimestamp);
    expect(endTimestamp).toEqual(expectedEndTimestamp);
  });
  it('should return most recent traffic if no date range input is given', async () => {
    const { statusCode, body } = await request(app).get(`/traffic`);
    const { results } = body;

    expect(statusCode).toEqual(200);
    expect(results.length).toEqual(2);
    expect(results[0].data.length).toEqual(2);
    expect(results[1].data.length).toEqual(2);
  });

  it('should return correct datetime range when there are traffic data between a given datetime range', async () => {
    const fromDate = '2020-12-01T12:00:00.000-05:00';
    const toDate = '2020-12-01T13:00:00.000-05:00';

    const { statusCode, body } = await request(app).get(`/traffic?fromDate=${fromDate}&toDate=${toDate}`);
    const { startTimestamp, endTimestamp } = body;

    expect(statusCode).toEqual(200);

    const expectedStartTimestamp = new Date(fromDate).valueOf();
    const expectedEndTimestamp = new Date(toDate).valueOf();

    expect(startTimestamp).toEqual(expectedStartTimestamp);
    expect(endTimestamp).toEqual(expectedEndTimestamp);
  });
  it('should fetch matching traffic when there are traffic data between a given datetime range', async () => {
    const fromDate = '2020-12-01T12:00:00.000-05:00';
    const toDate = '2020-12-01T13:00:00.000-05:00';

    const { statusCode, body } = await request(app).get(`/traffic?fromDate=${fromDate}&toDate=${toDate}`);
    const { results } = body;

    expect(statusCode).toEqual(200);

    expect(results.length).toEqual(2);
    expect(results[0].data.length).toEqual(2);
    expect(results[1].data.length).toEqual(2);

    const result_1200_100200 = results[0].data[0];
    const expected_1200_100200 = {
      path: { from: '100', to: '200' },
      score: -20,
      weight: 20,
      average: -1
    };
    expect(result_1200_100200).toMatchObject(expected_1200_100200);

    const result_1200_101201 = results[0].data[1];
    const expected_1200_101201 = {
      path: { from: '101', to: '201' },
      score: -30,
      weight: 15,
      average: -2
    };
    expect(result_1200_101201).toMatchObject(expected_1200_101201);

    const result_1205_100200 = results[1].data[0];
    const expected_1205_100200 = {
      path: { from: '100', to: '200' },
      score: 20,
      weight: 10,
      average: 2
    };
    expect(result_1205_100200).toMatchObject(expected_1205_100200);

    const result_1205_101201 = results[1].data[1];
    const expected_1205_101201 = {
      path: { from: '101', to: '201' },
      score: -45,
      weight: 15,
      average: -3
    };
    expect(result_1205_101201).toMatchObject(expected_1205_101201);
  });

  it('should fetch matching traffic when there are traffic data between a shorter given datetime range', async () => {
    const fromDate = '2020-12-01T12:00:00.000-05:00';
    const toDate = '2020-12-01T12:05:00.000-05:00';

    const { statusCode, body } = await request(app).get(`/traffic?fromDate=${fromDate}&toDate=${toDate}`);
    const { results } = body;

    expect(statusCode).toEqual(200);

    expect(results.length).toEqual(1);
    expect(results[0].data.length).toEqual(2);

    const result_1200_100200 = results[0].data[0];
    const expected_1200_100200 = {
      path: { from: '100', to: '200' },
      score: -20,
      weight: 20,
      average: -1
    };
    expect(result_1200_100200).toMatchObject(expected_1200_100200);

    const result_1200_101201 = results[0].data[1];
    const expected_1200_101201 = {
      path: { from: '101', to: '201' },
      score: -30,
      weight: 15,
      average: -2
    };
    expect(result_1200_101201).toMatchObject(expected_1200_101201);
  });

  it('should return correct datetime range when there are no traffic data between a given datetime range', async () => {
    const fromDate = '2020-12-02T12:00:00.000-05:00';
    const toDate = '2020-12-02T13:00:00.000-05:00';

    const { statusCode, body } = await request(app).get(`/traffic?fromDate=${fromDate}&toDate=${toDate}`);
    const { startTimestamp, endTimestamp } = body;

    expect(statusCode).toEqual(200);

    const expectedStartTimestamp = new Date(fromDate).valueOf();
    const expectedEndTimestamp = new Date(toDate).valueOf();

    expect(startTimestamp).toEqual(expectedStartTimestamp);
    expect(endTimestamp).toEqual(expectedEndTimestamp);
  });
  it('should fetch empty traffic when there are no traffic data between the given datetime range', async () => {
    const fromDate = '2020-12-02T12:00:00.000-05:00';
    const toDate = '2020-12-02T13:00:00.000-05:00';

    const { statusCode, body } = await request(app).get(`/traffic?fromDate=${fromDate}&toDate=${toDate}`);
    const { results } = body;

    expect(statusCode).toEqual(200);

    expect(results.length).toEqual(0);
  });
});
