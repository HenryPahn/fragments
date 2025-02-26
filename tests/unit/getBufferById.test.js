// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
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
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/32423423').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => request(app).get('/v1/fragments/234234234').auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the authenticated user find an none-existed fragment
  test('fragment with the given id is not existed', () => request(app).get('/v1/fragments/234234234').auth('user1@email.com', 'password1').expect(404))

  // If the authenticated user find an existed fragment
  test('fragment with the given id is existed', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toEqual(200)
    expect(res.text).toEqual('This is a fragment');
  })

  // If the authenticatedd user find an fragment converted into an invalid covertable type 
  test('convert an existed fragment into invalid covertable type', async () => {
    await request(app)
      .get(`/v1/fragments/${fragment.id}.invalidType`)
      .auth('user1@email.com', 'password1')
      .expect(415)
  })

  // If the authenticatedd user find an fragment converted into a covertable type 
  test('convert an existed fragment into invalid covertable type', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth('user1@email.com', 'password1')

    expect(res.status).toEqual(200)
    expect(res.text).toEqual("This is a fragment");
  })
});
