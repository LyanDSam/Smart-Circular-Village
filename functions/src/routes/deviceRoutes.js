const express = require('express');
const router = express.Router();

const deviceApiService = require('../services/deviceApiService');
const { deviceAuthMiddleware } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const {
  heartbeatSchema,
  telemetrySchema,
  pendingTransactionSchema,
  deviceLogSchema,
} = require('../schemas/deviceApiSchemas');

// Require Device Auth for ALL endpoints in this router
router.use(deviceAuthMiddleware);

/**
 * POST /api/device/heartbeat
 * Update device heartbeat lastSeen timestamp in RTDB.
 */
router.post('/heartbeat', validateBody(heartbeatSchema), async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    const result = await deviceApiService.processHeartbeat(deviceId);
    return sendSuccess(res, 'Heartbeat berhasil diperbarui', result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/device/telemetry
 * Validate & record live sensor telemetry payload into RTDB.
 */
router.post('/telemetry', validateBody(telemetrySchema), async (req, res, next) => {
  try {
    const { deviceId, telemetry } = req.body;
    const result = await deviceApiService.processTelemetry(deviceId, telemetry);
    return sendSuccess(res, 'Telemetry berhasil dicatat di Realtime Database', result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/device/pending-transaction
 * Push RFID & Load Cell weight data to RTDB pending_transactions queue.
 */
router.post('/pending-transaction', validateBody(pendingTransactionSchema), async (req, res, next) => {
  try {
    const { deviceId, rfidUid, weightGram } = req.body;
    const result = await deviceApiService.processPendingTransaction(deviceId, rfidUid, weightGram);
    return sendSuccess(res, 'Transaksi pending berhasil dikirim ke antrean RTDB', result, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/device/config
 * Retrieve device configuration mode and parameters.
 */
router.get('/config', async (req, res, next) => {
  try {
    // req.device attached by authMiddleware
    const deviceId = req.device.deviceId;
    const deviceType = req.device.deviceType || req.device.type || 'compost';

    const result = await deviceApiService.getDeviceConfig(deviceId, deviceType);
    return sendSuccess(res, 'Konfigurasi perangkat berhasil diambil', result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/device/log
 * Optional firmware debug/error log submission.
 */
router.post('/log', validateBody(deviceLogSchema), async (req, res, next) => {
  try {
    const { deviceId, level, message, details } = req.body;
    const result = await deviceApiService.processLog(deviceId, level, message, details);
    return sendSuccess(res, 'Log firmware berhasil dicatat', result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
