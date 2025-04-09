const { createSuccessResponse, createErrorResponse } = require('../../response')
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment')

const contentType = require('content-type');
const { listFragments } = require('../../model/data/aws');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const id = req.params.id;
    
    const foundFragment = await Fragment.byId(ownerId, id);

    // Parse content-type header 
    const fragmentType = contentType.parse(req).type;

    if (fragmentType != foundFragment.type) {
      throw { message: `Type of the request does not match the existing fragment's one, got content-type=${fragmentType} and fragment-type=${foundFragment.type}`, status: 400 };
    }

    const content = req.body; 

    if(!content || content.length === 0) {
      throw { message: `data are mandatory and not empty, got data=${content}`, status: 400 };
    }

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.debug(`Request to DELETE /fragments/:id:
    - User token: ${req.user}
    - Fragment id: ${req.params.id}`);
    }

    // Get data size
    const dataSize = Buffer.byteLength(req.body, "utf-8");

    foundFragment.size = dataSize;

    const data = Buffer.from(content);

    // set the data
    await foundFragment.setData(data);

    // store fragment object into DB
    await foundFragment.save();

    res.status(200).json(createSuccessResponse({ fragment: foundFragment }));
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'unable to process request';

    const errorMessage = createErrorResponse(status, message)

    res.status(status).json(errorMessage);
  }
};
