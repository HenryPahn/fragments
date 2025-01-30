// src/routes/api/get.js 

// Functions return successful responses 
const { createSuccessResponse, createErrorResponse } = require('../../response')

const { Fragment } = require('../../model/fragment')

const logger = require('../../logger')

/**
 * Creates a new fragment for the current user.
 */
module.exports = (req, res) => {
  // Check if the current npm script is 'dev' or 'debug'
  const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

  // if user is debugging, print all environment variables to check if any is missing	  
  if (isDebugging) {
    logger.debug(`User token: ${req.user}`);
    logger.debug(`Description: ${req.body}`);
  }
  
  // logger.debug(req.user);
  // const fragment = new Fragment();

  const mess = "Creating";

  const successResponse = createSuccessResponse({
    status: mess,
  })

  res.status(200).json(successResponse);
};

