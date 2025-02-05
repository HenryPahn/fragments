// src/routes/api/get.js

// Functions return successful responses 
const { createSuccessResponse } = require('../../response')
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment')

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // Check if the current npm script is 'dev' or 'debug'
  const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

  // if user is debugging, print all environment variables to check if any is missing	  
  if (isDebugging) {
    logger.debug(`Request to GET /fragments:
- User token: ${req.user}
- Expand: ${req.query.expand}`);
  }

  const fragments = await Fragment.byUser(req.user, req.query.expand);

  const successResponse = createSuccessResponse({
    fragments: fragments,
  })

  res.status(200).json(successResponse);
};
