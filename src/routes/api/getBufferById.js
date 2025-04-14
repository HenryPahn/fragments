// src/routes/api/getBufferById.js 

const { createErrorResponse } = require('../../response')
const { Fragment, extensions } = require('../../model/fragment')
const logger = require('../../logger')
const { convertToTxt, convertToHtml, convertToJSON, convertToYAML, convertToPNG, convertToJPEG, convertToWEBP, convertToAVIF, convertToGIF } = require('../../converter')

/**
 * Creates a new fragment for the current user.
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.debug(`Request to GET /fragments/:id :
- User token: ${req.user}
- Fragment id: ${req.params.id}
- Valid conversion extensions: ${fragment.formats}
- Fragment Type: ${fragment.type}
- Extension: ${req.params.ext}`);
    }

    if (req.params.ext && !fragment.formats.find(ext => ext === req.params.ext)) {
      throw { message: `${fragment.type} coudn't be converted to ${req.params.ext}`, status: 415 };
    }

    let fragmentData = await fragment.getData();

    if(req.params.ext) {
      res.setHeader("Content-Type", extensions[req.params.ext]);
    } else {
      res.setHeader("Content-Type", fragment.type);
    }

    if (req.params.ext == "txt") {
      // Set the Location header
      fragmentData = await convertToTxt(fragment.type, fragmentData);
    } 
    if (req.params.ext == "html") {
      fragmentData = await convertToHtml(fragment.type, fragmentData);
    } 
    if (req.params.ext == "json") {
      fragmentData = await convertToJSON(fragment.type, fragmentData);
    } 
    if (req.params.ext == "yaml" || req.params.ext == "yml") {
      fragmentData = await convertToYAML(fragment.type, fragmentData);
    } 
    if (req.params.ext == "png") {
      fragmentData = await convertToPNG(fragment.type, fragmentData);
    } 
    if (req.params.ext == "jpg") {
      fragmentData = await convertToJPEG(fragment.type, fragmentData);
    } 
    if (req.params.ext == "webp") {
      fragmentData = await convertToWEBP(fragment.type, fragmentData);
    } 
    if (req.params.ext == "avif") {
      fragmentData = await convertToAVIF(fragment.type, fragmentData);
    } 
    if (req.params.ext == "gif") {
      fragmentData = await convertToGIF(fragment.type, fragmentData);
    } 

    res.status(200).send(fragmentData);
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

