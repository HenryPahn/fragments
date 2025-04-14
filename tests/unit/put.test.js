// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
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
  test('unauthenticated requests are denied', () => request(app).put(`/v1/fragments/${fragment.id}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => request(app).put(`/v1/fragments/${fragment.id}`).auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the authenticated user forgot to pass content-type 
  test('missing content-type', async () => {
    await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .expect(500)
  });

  // If the authenticated user forgot to pass data 
  test('missing data', async () => {
    await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send()
      .expect(400)
  });

  // If the authenticated user update the non-exist blog 
  test('update non-exist blog id', async () => {
    await request(app)
      .put(`/v1/fragments/1234`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send()
      .expect(404)
  });

  // If the authenticated user provides 
  test('the Content-Type of the request does not match the existing fragment type', async () => {
    await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send()
      .expect(400)
  });

  // If the authenticated user edit a blog object
  test('authenticated user sends request to POST /fragments', async () => {
    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is updated data')

    expect(res.body.status).toEqual('ok');
    expect(res.body.fragment.type).toEqual('text/plain');
    expect(res.body.fragment.size).toBe(20);
  });
});
