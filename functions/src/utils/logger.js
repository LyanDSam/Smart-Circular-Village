const logger = require('firebase-functions/logger');

/**
 * Structured Firebase Logger Wrapper for SCV IoT Events.
 */
const logDeviceEvent = (eventType, deviceId, message, extra = {}) => {
  logger.info(`[IoT Event: ${eventType}] Device: ${deviceId} — ${message}`, {
    eventType,
    deviceId,
    timestamp: new Date().toISOString(),
    ...extra,
  });
};

const logDeviceAuthFailure = (deviceId, reason, reqIp) => {
  logger.warn(`[IoT Auth Failure] Device: ${deviceId || 'Unknown'} — Reason: ${reason} (IP: ${reqIp})`, {
    eventType: 'AUTH_FAILURE',
    deviceId,
    reason,
    reqIp,
    timestamp: new Date().toISOString(),
  });
};

const logDeviceError = (deviceId, message, errorDetails) => {
  logger.error(`[IoT Device Error] Device: ${deviceId} — ${message}`, {
    eventType: 'DEVICE_ERROR',
    deviceId,
    errorDetails,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logDeviceEvent,
  logDeviceAuthFailure,
  logDeviceError,
  logger,
};
