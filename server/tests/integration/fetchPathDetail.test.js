const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Stop = require('../../models/nextbus/Stop');
const PathStatus = require('../../models/traffic/PathStatus');

const mockPathStatuses = require('./fetchPathDetail.data');

describe('Test mock Path Status setup', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });
  });

  afterEach(async () => {
    await Stop.deleteMany()
    await PathStatus.deleteMany()
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should insert mock path statuses into PathStatus collection', async () => {
    await Stop.insertMany(mockPathStatuses.stops);

    const insertedStop = await Stop.find({});

    expect(insertedStop.length).toEqual(4);
  });

  it('should insert mock path statuses into PathStatus collection', async () => {
    await PathStatus.insertMany(mockPathStatuses.pathStatuses);

    const insertedPathStatuses = await PathStatus.find({});

    expect(insertedPathStatuses.length).toEqual(32);
  });
});

describe('Test fetching path detail from `/paths/:from/to/:to`', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });

    // We are testing a GET/read-only route so we should not expect
    // individual unit testings here change and affect each other's
    // source data
    await Stop.insertMany(mockPathStatuses.stops);
    await PathStatus.insertMany(mockPathStatuses.pathStatuses);
  });

  afterAll(async () => {
    await Stop.deleteMany();
    await PathStatus.deleteMany();
    await mongoose.connection.close();
  });

  it('should return properly formmated path detail', async () => {
    const { statusCode, body } = await request(app).get(`/paths/100/to/200`);

    expect(statusCode).toEqual(200);
    expect(body).toHaveProperty('fromStop');
    expect(body).toHaveProperty('fromStop.tag');
    expect(body).toHaveProperty('fromStop.title');
    expect(body).toHaveProperty('toStop');
    expect(body).toHaveProperty('toStop.tag');
    expect(body).toHaveProperty('toStop.title');
    expect(body).toHaveProperty('daily');
    expect(body).toHaveProperty('trend');
    expect(body).toHaveProperty('trend.average');
    expect(body).toHaveProperty('trend.unit');
    expect(body).toHaveProperty('trend.timestampRange');
    expect(body).toHaveProperty('trend.timestampRange.start');
    expect(body).toHaveProperty('trend.timestampRange.end');
  });
  it('should return correct path stops data', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/100/to/200?date=${date}`);

    expect(statusCode).toEqual(200);
    expect(body.fromStop).toEqual({
      tag: '100',
      title: 'Stop 100'
    });
    expect(body.toStop).toEqual({
      tag: '200',
      title: 'Stop 200'
    });
  });

  it('should return correct daily path summary', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/100/to/200?date=${date}`);

    expect(statusCode).toEqual(200);
    expect(body.daily.length).toEqual(2);
    expect(body.daily[0].timestamp).toEqual(new Date('2020-12-01T12:15:00.000-05:00').valueOf());
    expect(body.daily[0].weight).toEqual(10);
    expect(body.daily[0].score).toEqual(-40);
    expect(body.daily[0].average).toEqual(-4);

    expect(body.daily[1].timestamp).toEqual(new Date('2020-12-01T12:20:00.000-05:00').valueOf());
    expect(body.daily[1].weight).toEqual(3);
    expect(body.daily[1].score).toEqual(-30);
    expect(body.daily[1].average).toEqual(-10);
  });

  it('should return empty daily path summary for path with no data on the date', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/101/to/201?date=${date}`);

    expect(statusCode).toEqual(200);
    expect(body.daily.length).toEqual(0);
  });

  it('should return correct monthly trend for another given path and date', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/100/to/200?date=${date}`);

    const expectedWeight = 45;
    const expectedScore = 60;

    expect(statusCode).toEqual(200);
    expect(body.trend.average).toBeCloseTo(expectedScore / expectedWeight, 5);
    expect(body.trend.unit).toEqual('months');
    expect(body.trend.timestampRange.start).toEqual(new Date('2020-11-01T00:00:00.000-04:00').valueOf());
    expect(body.trend.timestampRange.end).toEqual(new Date('2020-12-01T00:00:00.000-05:00').valueOf());
  });

  it('should return correct monthly trend for a given path and date', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/101/to/201?date=${date}`);

    const expectedWeight = 45;
    const expectedScore = -90;

    expect(statusCode).toEqual(200);
    expect(body.trend.average).toBeCloseTo(expectedScore / expectedWeight, 5);
    expect(body.trend.unit).toEqual('months');
    expect(body.trend.timestampRange.start).toEqual(new Date('2020-11-01T00:00:00.000-04:00').valueOf());
    expect(body.trend.timestampRange.end).toEqual(new Date('2020-12-01T00:00:00.000-05:00').valueOf());
  });

  it('should return properly formatted empty result for a non-existent path ', async () => {
    const date = '2020-12-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/102/to/202?date=${date}`);

    expect(statusCode).toEqual(200);
    expect(body.fromStop).toBeUndefined();
    expect(body.toStop).toBeUndefined();
    expect(body.daily.length).toEqual(0);
    expect(body.trend.average).toEqual(null);
    expect(body.trend.unit).toEqual('months');
    expect(body.trend.timestampRange.start).toEqual(new Date('2020-11-01T00:00:00.000-04:00').valueOf());
    expect(body.trend.timestampRange.end).toEqual(new Date('2020-12-01T00:00:00.000-05:00').valueOf());
  });

  it('should return properly formatted empty result for an existent path but date with empty historical monthly data', async () => {
    const date = '2021-02-01T12:00:00.000-05:00';
    const { statusCode, body } = await request(app).get(`/paths/100/to/200?date=${date}`);

    expect(statusCode).toEqual(200);
    expect(body.fromStop).toBeDefined();
    expect(body.toStop).toBeDefined();
    expect(body.daily.length).toEqual(0);
    expect(body.trend.average).toEqual(null);
    expect(body.trend.unit).toEqual('months');
    expect(body.trend.timestampRange.start).toEqual(new Date('2021-01-01T00:00:00.000-05:00').valueOf());
    expect(body.trend.timestampRange.end).toEqual(new Date('2021-02-01T00:00:00.000-05:00').valueOf());
  });
});
