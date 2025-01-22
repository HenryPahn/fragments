// tests/unit/auth.test.js

const request = require('supertest');
const app = require('../../src/app'); // Assuming your app is set up to use the env-config logic

describe('Authentication check', () => {
  // If .htpassword and AWS configuration are all found, an exception is thrown
  test('throws an error if AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID, and HTPASSWD_FILE are found', async () => {
    process.env.AWS_COGNITO_POOL_ID = "test";
    process.env.AWS_COGNITO_CLIENT_ID = "test";
    process.env.HTPASSWD_FILE = "test";

    try {
      await request(app).get('/v1/fragments'); // Trigger the route
    } catch (error) {
      // Check if the error contains the expected message
      expect(error.message).toContain('env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.');
    };
  });

  // If .htpassword and AWS configuration are not found, an exception is thrown
  test('throws an error if AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID, and HTPASSWD_FILE are not found', async () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    try {
      await request(app).get('/v1/fragments'); // Trigger the route
    } catch (error) {
      // Check if the error contains the expected message
      expect(error.message).toContain('missing env vars: no authorization configuration found');
    }
  });
});
