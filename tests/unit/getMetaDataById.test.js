// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  let fragment;

  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')

    fragment = res.body.fragment;
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/32423423/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => request(app).get('/v1/fragments/234234234/info').auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the authenticated user find an none-existed fragment
  test('fragment with the given id is not existed', async () => request(app).get('/v1/fragments/234234234/info').auth('user1@email.com', 'password1').expect(404) );

  // If the authenticated user find an existed fragment
  test('fragment with the given id is existed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toEqual(200); 
    expect(res.body.status).toEqual('ok');
    expect(res.body.fragment).toEqual(fragment);
  })
});
