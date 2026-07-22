# ESP32 IoT API Specification & Backend Integration Guide

Document Version: 1.0.0  
Last Updated: 2026-07-22  
Project: Smart Circular Village (SCV)

---

## 1. Overview

Document ini berisi spesifikasi teknis lengkap dari REST API Cloud Functions dan Firebase Realtime Database (RTDB) yang dipanggil oleh firmware ESP32 untuk **Smart Collection Station**  dan **Smart Compost Bin**.

---

## 2. Authentication & Headers

Setiap HTTP Request dari ESP32 wajib menyertakan header otentikasi berikut:

```http
Authorization: Bearer <API_KEY_PERANGKAT>
Content-Type: application/json
```

> **Catatan API Key**: API Key diisi dengan `apiKey` unik perangkat yang didaftarkan oleh Admin/Petugas di website SCV (contoh: `SCV_4b7190c12e8f43a9a1d2e3f4567890ab`).

---

## 3. Endpoints Base URL

- **Production Cloud Functions**:
  `https://us-central1-smart-circular-village.cloudfunctions.net/api/api/device`

- **Local Emulator (Development)**:
  `http://<IP_LAPTOP_LOKAL>:5001/smart-circular-village/us-central1/api/api/device`

---

## 4. Endpoint Spesifikasi

### A. POST `/pending-transaction` — Kirim Transaksi Penimbangan Baru

Endpoint ini dipanggil oleh ESP32 Pos Pengumpulan ketika kartu RFID di-tap dan massa berat timbangan dari sensor HX711 sudah stabil.

#### **HTTP Request**:
```http
POST /api/device/pending-transaction HTTP/1.1
Host: us-central1-smart-circular-village.cloudfunctions.net
Authorization: Bearer SCV_4b7190c12e8f43a9a1d2e3f4567890ab
Content-Type: application/json
```

#### **Payload Request JSON**:
```json
{
  "deviceId": "SCV-COLL-001",
  "rfidUid": "01020304",
  "weightGram": 4520
}
```

#### **Aturan Validasi Schema Payload**:
| Field | Type | Rules & Format Example |
| :--- | :--- | :--- |
| `deviceId` | String | Must start with `SCV-COLL-` or `SCV-COMP-` followed by 3-4 digits (e.g. `"SCV-COLL-001"`) |
| `rfidUid` | String | 8–10 Hex characters uppercase without spaces (e.g. `"01020304"` or `"8A3F1C90"`) |
| `weightGram` | Integer | Positive integer value in **Grams** (e.g. `4520` for 4.52 kg) |

#### **Success Response JSON (201 Created)**:
```json
{
  "status": "success",
  "message": "Transaksi pending berhasil dikirim ke antrean RTDB",
  "data": {
    "transactionId": "TX_PENDING_1784701200_452",
    "deviceId": "SCV-COLL-001",
    "rfidUid": "01020304",
    "weightGram": 4520,
    "timestamp": 1784701200,
    "status": "waiting_confirmation"
  }
}
```

---

### B. POST `/heartbeat` — Heartbeat Sensor & Ping Status

Dipanggil secara berkala (misal setiap 10–30 detik) oleh ESP32 untuk mengabarkan bahwa koneksi perangkat dalam kondisi online.

#### **Payload Request JSON**:
```json
{
  "deviceId": "SCV-COLL-001"
}
```

#### **Success Response JSON (200 OK)**:
```json
{
  "status": "success",
  "message": "Heartbeat berhasil diperbarui",
  "data": {
    "deviceId": "SCV-COLL-001",
    "lastSeen": 1784701200,
    "timestampIso": "2026-07-22T13:40:00.000Z"
  }
}
```

---

### C. POST `/telemetry` — Live Telemetry Sensor

Dipanggil oleh Bak Kompos Pintar (*Smart Compost Bin*) untuk memperbarui data sensor suhu, kelembaban, dan gas.

#### **Payload Request JSON**:
```json
{
  "deviceId": "SCV-COMP-001",
  "telemetry": {
    "compostTemperature": 48.5,
    "airTemperature": 29.2,
    "airHumidity": 68.0,
    "soilMoisture": 62.4,
    "gas": 120,
    "waterLevel": "Normal"
  }
}
```

---

## 5. Implementasi Kode Backend Cloud Functions

### File: `functions/src/routes/deviceRoutes.js`

```javascript
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
 * Firmware debug/error log submission.
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
```

---

### File: `functions/src/services/deviceApiService.js`

```javascript
const { rtdb } = require('../config/firebase');
const { logDeviceEvent, logDeviceError } = require('../utils/logger');

const exportService = {
  /**
   * Process Heartbeat signal from ESP32.
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

    // Update telemetry node for station
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
```

---

## 6. Opsi Direct Write RTDB REST API (Alternatif Firmware Sederhana)

Jika ESP32 ingin menulis data penimbangan secara langsung ke Realtime Database tanpa melewati Cloud Functions HTTP REST API, ESP32 dapat mengeksekusi HTTP `PUT` request langsung ke URL RTDB berikut:

```http
PUT https://smart-circular-village-default-rtdb.firebaseio.com/pending_transactions/TX_PENDING_1784701200_123.json HTTP/1.1
Content-Type: application/json

{
  "transactionId": "TX_PENDING_1784701200_123",
  "deviceId": "SCV-COLL-001",
  "rfidUid": "01020304",
  "weightGram": 4520,
  "timestamp": 1784701200,
  "status": "waiting_confirmation"
}
```
