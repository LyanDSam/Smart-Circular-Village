const { db } = require('../config/firebase');
const { sendError } = require('../utils/responseHandler');
const { logDeviceAuthFailure } = require('../utils/logger');

/**
 * Authentication Middleware for ESP32 Microcontrollers.
 *
 * Extracts API Key from:
 * 1. Header `Authorization: Bearer <API_KEY>`
 * 2. Header `X-Device-API-Key: <API_KEY>`
 *
 * Validates API Key against Cloud Firestore `devices` metadata collection.
 * Rejects unknown devices (401/404) or inactive devices (403).
 */
const deviceAuthMiddleware = async (req, res, next) => {
  let apiKey = null;

  // Extract from Authorization header (Bearer token)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7).trim();
  }

  // Fallback: Extract from X-Device-API-Key header
  if (!apiKey && req.headers['x-device-api-key']) {
    apiKey = req.headers['x-device-api-key'].trim();
  }

  if (!apiKey) {
    logDeviceAuthFailure(null, 'Missing Authorization Header or API Key', req.ip);
    return sendError(res, 'Otentikasi gagal: API Key tidak ditemukan pada header request', 401, 'UNAUTHORIZED');
  }

  try {
    // Query Firestore `devices` collection for matching API Key
    const devicesRef = db.collection('devices');
    const snapshot = await devicesRef.where('apiKey', '==', apiKey).where('isDeleted', '==', false).limit(1).get();

    if (snapshot.empty) {
      logDeviceAuthFailure(null, 'Invalid API Key', req.ip);
      return sendError(res, 'Otentikasi gagal: API Key tidak valid atau perangkat tidak terdaftar', 401, 'UNAUTHORIZED');
    }

    const deviceDoc = snapshot.docs[0];
    const deviceData = { deviceId: deviceDoc.id, ...deviceDoc.data() };

    // Check if device is active
    if (deviceData.isActive === false) {
      logDeviceAuthFailure(deviceData.deviceId, 'Device is disabled/inactive', req.ip);
      return sendError(
        res,
        `Perangkat "${deviceData.deviceId}" sedang dalam status non-aktif. Akses ditolak.`,
        403,
        'FORBIDDEN_DEVICE_INACTIVE'
      );
    }

    // Attach validated device object to request
    req.device = deviceData;
    next();
  } catch (err) {
    logDeviceAuthFailure(null, `Database query error: ${err.message}`, req.ip);
    return sendError(res, 'Internal error during device authentication', 500, 'INTERNAL_AUTH_ERROR');
  }
};

module.exports = {
  deviceAuthMiddleware,
};
