# Smart Circular Village (SCV) — Database Design & Schema Reference

**Document Version:** 1.1.0  
**Status:** Official Technical Reference  
**Last Updated:** July 2026  

---

## 1. Dual Database Architecture Overview

The Smart Circular Village platform separates structured business data from high-frequency IoT device telemetry using two complementary databases:

1. **Cloud Firestore**: Primary relational/document store for permanent business records.
2. **Firebase Realtime Database (RTDB)**: Low-latency key-value store holding live IoT device telemetry and active control states.

---

## 2. Cloud Firestore Schema (Business Data)

### Collection: `users`
**Document ID:** `{uid}` (Firebase Auth UID)

```json
{
  "uid": "aB3kL9mZ0021",
  "memberId": "SCV-26-000001",
  "fullName": "Samuel Budi",
  "email": "samuel@example.com",
  "phone": "081234567890",
  "address": "RT 02 / RW 01 Desa Cerdas",
  "role": "citizen",
  "status": "active",
  "points": 840,
  "rfidUid": "04A91B2F",
  "rejectionReason": null,
  "isDeleted": false,
  "createdAt": "2026-07-21T10:00:00.000Z",
  "updatedAt": "2026-07-21T11:30:00.000Z"
}
```

### Collection: `rewards` (Waste Bank Officer Managed)
**Document ID:** `{rewardId}`

```json
{
  "rewardId": "RWD-9001",
  "title": "Minyak Goreng 1 Liter",
  "description": "Minyak goreng kelapa kemasan 1 liter",
  "pointsRequired": 800,
  "stock": 15,
  "isActive": true,
  "createdAt": "2026-07-21T10:00:00.000Z",
  "updatedAt": "2026-07-21T10:00:00.000Z"
}
```

### Collection: `reward_redemptions`
**Document ID:** `{redemptionId}`

```json
{
  "redemptionId": "RED-5001",
  "userId": "aB3kL9mZ0021",
  "userName": "Samuel Budi",
  "rewardId": "RWD-9001",
  "rewardTitle": "Minyak Goreng 1 Liter",
  "pointsUsed": 800,
  "status": "requested",
  "requestedAt": "2026-07-21T11:00:00.000Z",
  "processedBy": "officer-uid-01",
  "processedAt": "2026-07-21T11:15:00.000Z"
}
```

*Status options:* `"requested"`, `"approved"`, `"rejected"`, `"collected"`

### Collection: `transactions`
**Document ID:** `{transactionId}`

```json
{
  "transactionId": "TX-9041",
  "citizenUid": "aB3kL9mZ0021",
  "citizenName": "Samuel Budi",
  "memberId": "SCV-26-000001",
  "rfidUid": "04A91B2F",
  "stationId": "CS-ESP32-01",
  "wasteCategory": "organic",
  "weightKg": 4.5,
  "pointsEarned": 450,
  "operatorUid": "officer-uid-01",
  "createdAt": "2026-07-21T09:30:00.000Z"
}
```

### Collection: `devices`
**Document ID:** `{deviceId}`

```json
{
  "deviceId": "ESP32-CS-01",
  "name": "Collection Station RW 01",
  "type": "collection_station",
  "location": "Pos RW 01 Desa Cerdas",
  "apiKey": "scv_dev_key_992014",
  "status": "online",
  "macAddress": "24:6F:28:AB:C1:10",
  "firmwareVersion": "v1.2.0",
  "lastPing": "2026-07-21T11:45:00.000Z",
  "isDeleted": false,
  "createdAt": "2026-07-01T00:00:00.000Z"
}
```

### Collection: `compostBatches`
**Document ID:** `{batchId}`

```json
{
  "batchId": "BATCH-2026-04",
  "binId": "ESP32-CB-01",
  "startDate": "2026-07-01T00:00:00.000Z",
  "expectedHarvestDate": "2026-07-28T00:00:00.000Z",
  "totalInputWeightKg": 350,
  "outputCompostKg": 140,
  "qualityGrade": "A",
  "status": "in_progress",
  "createdAt": "2026-07-01T00:00:00.000Z"
}
```

### Collection: `settings`
**Document ID:** `system`

```json
{
  "pointRules": {
    "organic": 10,
    "plastic": 15,
    "paper": 12,
    "metal": 20,
    "glass": 18
  },
  "compostRules": {
    "minTemperature": 30,
    "maxTemperature": 45,
    "minHumidity": 55,
    "maxHumidity": 75
  },
  "updatedAt": "2026-07-21T00:00:00.000Z"
}
```

---

## 3. Firebase Realtime Database Schema (Live IoT Telemetry)

Realtime Database holds **only transient live telemetry states** pushed by ESP32 microcontrollers.

### Root Node: `/devices/{deviceId}`

```json
{
  "ESP32-CB-01": {
    "telemetry": {
      "temperature": 54.2,
      "ambientHumidity": 62.5,
      "soilMoisture": 55.0,
      "methaneGasPpm": 120,
      "waterLevelPercent": 35,
      "lastUpdated": 1784638920000
    },
    "controls": {
      "aerationFan": true,
      "waterPump": false,
      "mode": "auto"
    },
    "status": {
      "online": true,
      "rssi": -65,
      "activeAlerts": ["temperature_optimal"]
    }
  }
}
```

---

## 4. Architectural Guidelines & Archiving Strategy

1. **No Historical Telemetry in RTDB**: Realtime Database must be kept small by maintaining only the latest device reading.
2. **Periodic Telemetry Archiving**:
   - A scheduled **Cloud Function** (runs hourly/daily) samples telemetry data from RTDB and appends condensed historical data points into Firestore `telemetryLogs` for long-term analytics.
3. **Data Security**:
   - Firestore security rules validate roles (`request.auth.token.role`).
   - Reward creation & modification is strictly restricted to Waste Bank Officers (`isOfficer()`).
