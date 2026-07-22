const { rtdb } = require('../config/firebase');
const { logDeviceEvent, logDeviceError } = require('../utils/logger');

exportService = {
  /**
   * Process Heartbeat signal from ESP32.
   * Updates RTDB `/devices/{deviceId}/lastSeen` with current Unix timestamp.
   */
  async processHeartbeat(deviceId) {
    const timestampMs = Date.now();
    const timestampSec = Math.floor(timestampMs / 1000);

    const deviceRef = rtdb.ref(`devices/${deviceId}`);
    await deviceRef.child('lastSeen').set(timestampSec);

    logDeviceEvent('HEARTBEAT', deviceId, `Heartbeat timestamp updated: ${timestampSec}`);

    return {
      deviceId,
      lastSeen: timestampSec,
      timestampIso: new Date(timestampMs).toISOString(),
    };
  },

  /**
   * Process Live Telemetry payload from ESP32.
   * Updates RTDB `/devices/{deviceId}/telemetry` and `lastSeen`.
   */
  async processTelemetry(deviceId, telemetryData) {
    const timestampSec = Math.floor(Date.now() / 1000);

    const telemetryRef = rtdb.ref(`devices/${deviceId}/telemetry`);
    const heartbeatRef = rtdb.ref(`devices/${deviceId}/lastSeen`);

    const payload = {
      ...telemetryData,
      updatedAt: timestampSec,
    };

    await telemetryRef.update(payload);
    await heartbeatRef.set(timestampSec);

    logDeviceEvent('TELEMETRY', deviceId, 'Telemetry data updated', { keys: Object.keys(telemetryData) });

    return {
      deviceId,
      telemetry: payload,
    };
  },

  /**
   * Process Pending Transaction (RFID Tap + Load Cell Weight Integer Gram).
   * Pushes new transaction record to RTDB `/pending_transactions/{txId}` with status `waiting_confirmation`.
   */
  async processPendingTransaction(deviceId, rfidUid, weightGram) {
    const timestampSec = Math.floor(Date.now() / 1000);
    const txId = `TX_PENDING_${timestampSec}_${Math.floor(Math.random() * 1000)}`;

    const pendingRef = rtdb.ref(`pending_transactions/${txId}`);

    const txRecord = {
      transactionId: txId,
      deviceId,
      rfidUid,
      weightGram,
      timestamp: timestampSec,
      status: 'waiting_confirmation',
    };

    await pendingRef.set(txRecord);

    // Also update telemetry node for station
    const stationRef = rtdb.ref(`devices/${deviceId}/telemetry`);
    await stationRef.update({
      lastRfidUid: rfidUid,
      lastWeightGram: weightGram,
      updatedAt: timestampSec,
    });

    logDeviceEvent('PENDING_TRANSACTION', deviceId, `Pending transaction created (${weightGram}g, RFID: ${rfidUid})`, {
      transactionId: txId,
      rfidUid,
      weightGram,
    });

    return txRecord;
  },

  /**
   * Retrieve Device Configuration from RTDB `/devices/{deviceId}/config`.
   */
  async getDeviceConfig(deviceId, deviceType = 'compost') {
    const configRef = rtdb.ref(`devices/${deviceId}/config`);
    const snapshot = await configRef.once('value');

    let configData = snapshot.val();

    if (!configData) {
      // Default initial configuration fallback
      configData = {
        mode: 'collection',
        heartbeatInterval: 10,
        firmwareVersion: '1.0.0',
        calibrationFactor: 420,
        autoUpload: deviceType === 'compost',
      };
      await configRef.set(configData);
    }

    logDeviceEvent('GET_CONFIG', deviceId, `Config retrieved: mode=${configData.mode}`);

    return {
      deviceId,
      config: configData,
    };
  },

  /**
   * Process Firmware Debug Log from ESP32.
   */
  async processLog(deviceId, level, message, details = null) {
    if (level === 'error') {
      logDeviceError(deviceId, message, details);
    } else {
      logDeviceEvent('FIRMWARE_LOG', deviceId, `[${level.toUpperCase()}] ${message}`, { details });
    }

    return {
      deviceId,
      logged: true,
    };
  },
};

module.exports = exportService;
