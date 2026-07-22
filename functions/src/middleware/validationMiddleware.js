const { sendError } = require('../utils/responseHandler');

/**
 * Validation Middleware using Zod.
 * Validates req.body (or req.query/req.params) against a given Zod schema.
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validasi payload request gagal', 400, 'VALIDATION_ERROR', formattedErrors);
      }
      return sendError(res, 'Format payload request tidak valid', 400, 'BAD_REQUEST');
    }
  };
};

module.exports = {
  validateBody,
};
