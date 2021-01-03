const { iteratee } = require("lodash");

const request = require('supertest');
const app = require('../app');

describe('Test the root path', () => {
  test('It should response the GET method', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
  test('It should respond with a message', async () => {
    const response = await request(app).get('/');
    expect(response.body.message).toEqual('Hello World!!!');
  })
});
