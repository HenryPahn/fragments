// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the authenticated user forgot to pass content-type 
  test('missing content-type', async () =>  {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .expect(500)
  });

  // If the authenticated user passed unsupported content-type 
  test('unsupported content-type', async () =>  {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/unsupported-type')
      .expect(415)
  });

  // If the authenticated user forgot to pass data 
  test('missing data', async () =>  {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send()
      .expect(400)
  });

  // If the authenticated user passed all correct data 
  test('authenticated user sends request to POST /fragments', async () =>  {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')

    expect(res.body.status).toEqual('ok');
    expect(res.body.fragment.type).toEqual('text/plain');
    expect(res.body.fragment.size).toBe(18);
  });
});
