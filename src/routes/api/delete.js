const { createSuccessResponse, createErrorResponse } = require('../../response')
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment')

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const id = req.params.id;

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.debug(`Request to DELETE /fragments/:id:
    - User token: ${req.user}
    - Fragment id: ${req.params.id}`);
    }

    await Fragment.byId(ownerId, id);

    const deleteFragment = await Fragment.delete(ownerId, id);

    res.status(200).json(createSuccessResponse(deleteFragment));
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'unable to process request';

    const errorMessage = createErrorResponse(status, message)

    res.status(status).json(errorMessage);
  }
};
