// tests/unit/app.test.js 

const request = require('supertest'); 

const app = require('../../src/app'); 

describe('Error-handling middlewares', () => {
  // If the requested resource can't be found, it should return 404
  test('unfounded resources are denied', () => request(app).get('/unknown').expect(404));

});
