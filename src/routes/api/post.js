// src/routes/api/get.js 

// Functions return successful responses 
const { createSuccessResponse, createErrorResponse } = require('../../response')
const { Fragment } = require('../../model/fragment')
const logger = require('../../logger')

const contentType = require('content-type');
const { setDefaultHighWaterMark } = require('supertest/lib/test');

/**
 * Creates a new fragment for the current user.
 */
module.exports = async (req, res) => {
  try {
    // Parse content-type header 
    const fragmentType = contentType.parse(req).type;

    if (!fragmentType || !Fragment.isSupportedType(fragmentType)) {
      throw { message: `type are mandatory and must be supported, got type=${fragmentType}`, status: 415 };
    }

    const content = req.body; 

    if(!content || content.length === 0) {
      throw { message: `data are mandatory and not empty, got data=${content}`, status: 400 };
    }

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.debug(`Request to POST /fragments:
- User token: ${req.user}
- Description: ${req.body}
- Type: ${fragmentType}
- URL: ${req.headers.host}`);
    }

    // Get data size
    const dataSize = Buffer.byteLength(req.body, "utf-8");

    // create a new fragment object
    const fragment = new Fragment({ ownerId: req.user, type: fragmentType, size: dataSize });

    const data = Buffer.from(content);

    // set the data
    await fragment.setData(data);

    // store fragment object into DB
    await fragment.save();

    // Get the API base URL from environment or fallback to req.headers.host
    const apiBaseUrl = process.env.API_URL || `http://${req.headers.host}`;

    // Construct the Location URL
    const locationUrl = new URL(`/v1/fragments/${fragment.id}`, apiBaseUrl).href;

    // Set the Location header
    res.setHeader("Location", locationUrl);

    const successResponse = createSuccessResponse({
      fragment: fragment,
    })

    res.status(201).json(successResponse);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'unable to process request';

    const errorMessage = createErrorResponse(status, message)

    if (status === 415) {
      logger.error({ err }, `Unsupported type`);
    }

    if (status === 400) {
      logger.error({ err }, `Missing data`);
    }

    res.status(status).json(errorMessage);
  }
};

