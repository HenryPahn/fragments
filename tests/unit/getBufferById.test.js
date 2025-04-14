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

  test('convert html fragment to txt', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hello</h1><p>This is a test</p>');

    const htmlFragment = createRes.body.fragment;

    const convertRes = await request(app)
      .get(`/v1/fragments/${htmlFragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(convertRes.status).toBe(200);
  });

  test('converts Markdown fragment to .html', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Welcome\nThis is a *test*.');

    const mdFragment = createRes.body.fragment;

    const convertRes = await request(app)
      .get(`/v1/fragments/${mdFragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(convertRes.status).toBe(200);
  });

  test('converts CSV fragment to .json', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/csv')
      .send('name,age\nAlice,30\nBob,25');

    const csvFragment = createRes.body.fragment;

    const convertRes = await request(app)
      .get(`/v1/fragments/${csvFragment.id}.json`)
      .auth('user1@email.com', 'password1');

    expect(convertRes.status).toBe(200);
    expect(convertRes.headers['content-type']).toMatch(/application\/json/);

    const result = JSON.parse(convertRes.text);

    expect(result.length).toBe(2);
  });

  test('converts JSON fragment to .yaml', async () => {
    const jsonObject = {
      name: 'Alice',
      age: 30,
      address: {
        city: 'Wonderland',
        zip: '12345',
      },
    };

    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(jsonObject));

    const jsonFragment = createRes.body.fragment;

    const convertRes = await request(app)
      .get(`/v1/fragments/${jsonFragment.id}.yaml`)
      .auth('user1@email.com', 'password1');

    expect(convertRes.status).toBe(200);
  });
});
