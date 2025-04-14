// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  let fragment;

  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Fragment to delete');

    fragment = res.body.fragment;
  });

  // Deleting a fragment with valid credentials
  test('authenticated user can delete a fragment', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.body.status).toEqual('ok');
  });

  // Trying to delete without authentication
  test('unauthenticated delete requests are denied', async () => {
    await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .expect(401);
  });

  // Trying to delete with wrong credentials
  test('delete with incorrect credentials is denied', async () => {
    await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('wrong@email.com', 'wrongpassword')
      .expect(401);
  });

  // Trying to delete a non-existent fragment
  test('deleting a non-existent fragment returns error', async () => {
    const res = await request(app)
      .delete('/v1/fragments/nonexistent-id')
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
