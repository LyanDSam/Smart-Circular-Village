# Smart Circular Village (SCV) — Project Context & System Architecture

**Document Version:** 4.0.0  
**Status:** Official Technical Architecture Reference (ESP32 Synchronized & Control-Centered)  
**Last Updated:** July 2026  

---

## 1. Executive Summary & Project Overview

**Smart Circular Village (SCV)** is an Internet of Things (IoT)-based web platform designed to digitalize, automate, and optimize organic and inorganic waste management at the village level.

The platform integrates two core subsystems:
1. **Digital Waste Bank (Smart Collection Station)**: Automated weighing (Load Cell) and citizen identification via physical RFID cards with point-based rewards.
2. **Smart Compost Bin Monitoring System**: Real-time telemetry monitoring (Temperature, Humidity, Soil Moisture, Methane Gas, Leachate Water Level) and actuator controls (Aeration Fan & Irrigation Water Pump) via ESP32 microcontrollers.

---

## 2. High-Level System Architecture

```
                  ┌─────────────────────────────────────┐
                  │    React Single Page App (SPA)      │
                  │   (Vite + Tailwind + Shadcn UI)     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       Firebase Authentication       │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Cloud Functions REST API       │
                  └──────────┬──────────────────┬───────┘
                             │                  │
                             ▼                  ▼
              ┌────────────────────────┐  ┌─────────────────────────────┐
              │     Cloud Firestore    │  │ Firebase Realtime Database  │
              │    (Business Data)     │  │  (Control & Signal Layer)   │
              └────────────────────────┘  └──────────────┬──────────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │    ESP32 Devices    │
                                              └─────────────────────┘
```

---

## 3. Dual Database Architecture Strategy

The Smart Circular Village platform employs a strict **Dual Database Architecture** where the Web Platform serves as the **Command & Control Center** over ESP32 hardware via Firebase Realtime Database.

```
                         ┌─────────────────────────────────────┐
                         │      Smart Circular Village         │
                         └──────────────────┬──────────────────┘
                                            │
             ┌──────────────────────────────┴──────────────────────────────┐
             ▼                                                             ▼
 ┌───────────────────────────────┐                             ┌───────────────────────────────┐
 │        Cloud Firestore        │                             │  Firebase Realtime Database   │
 ├───────────────────────────────┤                             ├───────────────────────────────┤
 │ • Permanent Business Data     │                             │ • Realtime IoT Control Node   │
 │ • users                       │                             │ • devices/{deviceId}/lastSeen │
 │ • devices (Metadata ONLY)     │                             │ • devices/{deviceId}/config   │
 │ • transactions (Finalized)    │                             │ • devices/{deviceId}/telemetry│
 │ • rewards                     │                             │ • devices/{deviceId}/relay    │
 │ • reward_redemptions          │                             │ • devices/{deviceId}/alerts   │
 │ • settings                    │                             │ • pending_transactions        │
 │ • notifications               │                             │ • Instant WebSocket Sync      │
 └───────────────────────────────┘                             └───────────────────────────────┘
```

---

## 4. Realtime Database (RTDB) Unified Schema & Control Layer

### A. Per-Device Tree (`devices/{deviceId}`)

```json
{
  "devices": {
    "SCV-COLL-001": {
      "lastSeen": 1784729150,
      "config": {
        "mode": "collection",          // "collection" | "pairing" | "maintenance"
        "heartbeatInterval": 10,       // Seconds
        "firmwareVersion": "1.0.0",
        "calibrationFactor": 420,
        "autoUpload": false
      },
      "telemetry": {
        "lastRfidUid": "8A3F1C90",
        "lastWeightGram": 4520,
        "updatedAt": 1784729150
      }
    },
    "SCV-COMP-001": {
      "lastSeen": 1784729100,
      "config": {
        "mode": "collection",
        "heartbeatInterval": 10,
        "firmwareVersion": "1.0.0",
        "calibrationFactor": 1.0,
        "autoUpload": true
      },
      "telemetry": {
        "compostTemperature": 48.5,
        "airTemperature": 29.1,
        "airHumidity": 65.0,
        "soilMoisture": 42.0,
        "gas": 120,
        "waterLevel": "Normal",
        "updatedAt": 1784729100
      },
      "relay": {
        "fan": false,
        "pump": false,
        "mode": "auto"
      },
      "alerts": {
        "highTemperature": false,
        "lowMoisture": false,
        "gasWarning": false,
        "waterOverflow": false
      }
    }
  }
}
```

### B. Pending Transactions Queue (`pending_transactions/{transactionId}`)

```json
{
  "pending_transactions": {
    "TX_PENDING_001": {
      "transactionId": "TX_PENDING_001",
      "deviceId": "SCV-COLL-001",
      "rfidUid": "8A3F1C90",
      "weightGram": 4520,
      "timestamp": 1784729150,
      "status": "waiting_confirmation"  // "waiting_confirmation" | "processing" | "completed" | "cancelled"
    }
  }
}
```

---

## 5. Workflows & Command-and-Control Protocols

### A. Automatic RFID Pairing Workflow (No Firmware Re-flashing)

```
[Citizen Register on Web] ──> Status: pending
                                 │
                                 ▼
[Admin opens /admin/users/pending] ──> Clicks "Pair RFID"
                                 │
                                 ▼
[Web] ──> Writes `devices/SCV-COLL-001/config/mode = "pairing"` via RTDB
                                 │
                                 ▼
[ESP32 Listener] ──> Detects mode change ──> Enters PAIRING Mode (OLED displays "Ready to Pair")
                                 │
                                 ▼
[Admin/Petugas] ──> Taps RFID Card on ESP32 Reader
                                 │
                                 ▼
[ESP32] ──> Sends UID (e.g. `8A3F1C90`) to RTDB `/devices/SCV-COLL-001/telemetry/lastRfidUid`
                                 │
                                 ▼
[Web Realtime Listener] ──> Receives `8A3F1C90` ──> Displays Confirmation Popup Modal
                                 │
                                 ▼
[Admin clicks "Hubungkan"] ──> Updates Firestore `users/{uid}.rfidUid = "8A3F1C90"` & `status = "active"`
                                 │
                                 ▼
[Web Restore Mode] ──> Writes `devices/SCV-COLL-001/config/mode = "collection"` back to RTDB
```

### B. Collection & Weighing Workflow

```
[Tap RFID at Collection Station] ──> ESP32 reads UID (`8A3F1C90`) & Weight (`4520` gram)
                                         │
                                         ▼
[ESP32] ──> Pushes record to RTDB `/pending_transactions/{txId}`
            • deviceId: "SCV-COLL-001"
            • rfidUid: "8A3F1C90"
            • weightGram: 4520
            • status: "waiting_confirmation"
                                         │
                                         ▼
[Admin/Officer Dashboard] ──> RTDB Listener detects new `waiting_confirmation` transaction
                                         │
                                         ▼
[Popup Modal Opens] ──> Displays Citizen Name, Weight (converted: 4.52 Kg), Category Select dropdown
                                         │
                                         ▼
[Officer Selects Category & Clicks "Save"] ──> Executes Firestore Transaction Batch:
            ├─ 1. Sets transaction status in RTDB = "processing" (Lock against concurrency)
            ├─ 2. Calculates Points (e.g., 4.52 kg x 100 pts/kg = 452 pts)
            ├─ 3. Writes permanent record to Firestore `transactions/{txId}`
            ├─ 4. Atomically increments Citizen points balance in Firestore `users/{uid}`
            │
            ▼
[Cleanup] ──> Deletes record from RTDB `/pending_transactions/{txId}`
```

---

## 6. System Conventions & Rules

1. **Weight Integer Format**: ESP32 sends weight strictly as an integer in grams (`"weightGram": 4520`). Conversion to Kg (`4.52 Kg`) is performed by the Web Platform.
2. **RFID UID Standardized Format**: Uppercase hexadecimal string without spaces (e.g. `8A3F1C90`). Checked for global uniqueness before account activation.
3. **Heartbeat & Status Calculation**: ESP32 updates `lastSeen` every 10 seconds. Web platform computes online status:
   `status = !isActive ? 'disabled' : (now - lastSeen < 60000ms ? 'online' : 'offline')`.
4. **Device ID Naming**:
   - Collection Station: `SCV-COLL-001`, `SCV-COLL-002`, ...
   - Compost Bin: `SCV-COMP-001`, `SCV-COMP-002`, ...

---

## 7. User Roles & Permission Matrix

| Feature / Page | Guest | Citizen (Pending) | Citizen (Active) | Officer | Government | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/login` & `/register` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/verification-pending` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/transactions` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/compost` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/reports` | ❌ | ❌ | ❌ | ❌ | ✅ (Read) | ✅ |
| `/devices` | ❌ | ❌ | ❌ | ❌ | ✅ (Read-Only) | ✅ (Full Control) |
| `/admin/users` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/settings` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
