// src/server.js

// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);

    // Check if the current npm script is 'dev' or 'debug'
    const isDebugging = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'debug';

    // if user is debugging, print all environment variables to check if any is missing	  
    if (isDebugging) {
      logger.info(`Mandatory Environment Variables: 
- LOG_LEVEL: ${process.env.LOG_LEVEL}
- PORT: ${process.env.PORT}
- AWS_COGNITO_POOL_ID: ${process.env.AWS_COGNITO_POOL_ID}
- AWS_COGNITO_CLIENT_ID: ${process.env.AWS_COGNITO_CLIENT_ID}`);
    }
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
