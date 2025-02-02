// src/routes/api/get.js

// Functions return successful responses 
const { createSuccessResponse } = require('../../response')

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const fragments = []

  const successResponse = createSuccessResponse({
    fragments: fragments,
  })

  res.status(200).json(successResponse);
};
