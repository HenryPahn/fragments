# tests 

## Unit tests 

- Function contains the whole tests:

```sh 
describe('Describe the test', () => {});
```

- Function is triggered before any function in the test: 

```sh 
beforeEach(() => {});
```

- Function for a case in test: 

```sh 
test('describe the case', async () => {
  const data = ...;               // Example data
  const result = ...;             // Data trieved from function
  expect(result).toBe(undefined); // The result should be undefined 
  expect(result).toEqual(data);   // The result should be the same as the example data 
  expect(Array.isArray(results)).toBe(true); // The result should be an array 
  expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]); // The result should be equal to the provided array. 

  // if the function has a case throwing an exception, use toThrow()
  expect(async () => await db.get()).rejects.toThrow();
});
```

- Function for a case testing app routes: 

```sh 
const request = require('supertest');
const app = require('../../src/app');

...

describe('Error-handling middlewares', () => {
  // If the requested resource can't be found, it should return 404
  test('unfounded resources are denied', () => request(app).get('/unknown').expect(404));

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

});

```


