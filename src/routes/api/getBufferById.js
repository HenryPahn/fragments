// src/routes/api/getBufferById.js 

// Functions return successful responses 
const { createErrorResponse } = require('../../response')
const { Fragment } = require('../../model/fragment')
const logger = require('../../logger')

/**
 * Creates a new fragment for the current user.
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    const fragmentData = await fragment.getData(); 

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.debug(`Request to GET /fragments/:id :
- User token: ${req.user}
- Fragment id: ${req.params.id}
- Valid conversion extensions: ${fragment.formats}
- Fragment Data: ${fragmentData}
- Extension: ${req.params.ext}`);
    }
    
    if (req.params.ext && !fragment.formats.find(ext => ext === req.params.ext)) {
      throw { message: `${fragment.type} coudn't be converted to ${req.params.ext}`, status: 415 };
    }

    if(req.params.ext === 'txt') {
      res.status(200).send(fragmentData);
    } else {
      res.status(200).send(fragmentData);
    }
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'unable to process request';

    const errorMessage = createErrorResponse(status, message)

    if (status === 404) {
      logger.error({ err }, `Invalid Fragment Id`);
    }

    res.status(status).json(errorMessage);
  }
};

