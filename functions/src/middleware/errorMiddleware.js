const { sendError } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * Global Express Error Handling Middleware.
 */
const errorMiddleware = (err, req, res, next) => {
  logger.error('Unhandled API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, statusCode, errorCode);
};

module.exports = {
  errorMiddleware,
};
