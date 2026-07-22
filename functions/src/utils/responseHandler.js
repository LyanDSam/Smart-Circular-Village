/**
 * Standardized Response Formatter for SCV Cloud Functions REST API.
 */

const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, error = 'An error occurred', statusCode = 400, errorCode = 'BAD_REQUEST', details = null) => {
  const payload = {
    success: false,
    error,
    code: errorCode,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
