const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Path = require('../../models/traffic/Path');

const mockPaths = require('./fetchPaths.data');

describe('Test Path insert and mock data setup', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });
  });

  afterEach(async () => {
    await Path.deleteMany()
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should insert mock data into Path collection', async () => {
    await Path.insertMany(mockPaths.paths);

    const insertedPaths = await Path.find({});

    expect(insertedPaths.length).toEqual(4);

    expect(insertedPaths[0].from).toEqual('valid-100');
    expect(insertedPaths[0].to).toEqual('valid-200');
    expect(insertedPaths[0].legs.toObject()).toEqual([[0, 0], [1, 1]]);
    expect(insertedPaths[0].version).toEqual('2.0');

    expect(insertedPaths[1].from).toEqual('valid-101');
    expect(insertedPaths[1].to).toEqual('valid-201');
    expect(insertedPaths[1].legs.toObject()).toEqual([[1, 1], [2, 2]]);
    expect(insertedPaths[1].version).toEqual('2.0');

    expect(insertedPaths[2].from).toEqual('valid-102');
    expect(insertedPaths[2].to).toEqual('valid-202');
    expect(insertedPaths[2].legs.toObject()).toEqual([[2, 2], [3, 3]]);
    expect(insertedPaths[2].version).toEqual('2.0');

    expect(insertedPaths[3].from).toEqual('invalid-103');
    expect(insertedPaths[3].to).toEqual('invalid-203');
    expect(insertedPaths[3].legs.toObject()).toEqual([[3, 3], [4, 4]]);
    expect(insertedPaths[3].version).toEqual('1.0');
  });
});

describe('Test fetching paths from `/paths`', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true
    });
  });

  beforeEach(async () => {
    await Path.insertMany(mockPaths.paths);
  });

  afterEach(async () => {
    await Path.deleteMany()
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fetch all valid paths from `/paths` request ', async () => {
    const { statusCode, body } = await request(app).get(`/paths`);
    const { paths } = body;

    expect(statusCode).toEqual(200);

    expect(paths.length).toEqual(3);

    expect(paths[0].from).toEqual('valid-100');
    expect(paths[0].to).toEqual('valid-200');
    expect(paths[0].legs).toEqual([[0, 0], [1, 1]]);

    expect(paths[1].from).toEqual('valid-101');
    expect(paths[1].to).toEqual('valid-201');
    expect(paths[1].legs).toEqual([[1, 1], [2, 2]]);

    expect(paths[2].from).toEqual('valid-102');
    expect(paths[2].to).toEqual('valid-202');
    expect(paths[2].legs).toEqual([[2, 2], [3, 3]]);
  });
});
