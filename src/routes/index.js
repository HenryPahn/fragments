// src/routes/index.js

const express = require('express');
const { hostname } = require('os');

// version and author from package.json
const { version, author } = require('../../package.json');

// Our authentication middleware
const { authenticate } = require('../auth');

// Functions return successful responses 
const { createSuccessResponse } = require('../response')

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  const data = {
    author, 
    // Use your own GitHub URL for this!
    githubUrl: 'https://github.com/HenryPahn/fragments',
    version,
    // Include the host name in the response
    hostname: hostname(),
  }

  const successResponse = createSuccessResponse({
    ...data
  })

  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(successResponse);
});

module.exports = router;
