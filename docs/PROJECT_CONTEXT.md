# Smart Circular Village (SCV) — Project Context & System Architecture

**Document Version:** 3.0.0  
**Status:** Official Technical Architecture Reference  
**Last Updated:** July 2026  

---

## 1. Executive Summary & Project Overview

**Smart Circular Village (SCV)** is an Internet of Things (IoT)-based web platform designed to digitalize, automate, and optimize organic and inorganic waste management at the village level.

The platform integrates two core subsystems:
1. **Digital Waste Bank (Smart Collection Station)**: Automated weighing (Load Cell) and citizen identification via RFID cards and QR Codes with point-based rewards.
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
              │    (Business Data)     │  │  (Live Telemetry & Signals) │
              └────────────────────────┘  └──────────────┬──────────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │    ESP32 Devices    │
                                              └─────────────────────┘
```

### Layer Responsibilities

1. **Frontend Layer (React SPA)**: Responsive web user interfaces for Admins, Officers, Citizens, and Government Representatives.
2. **Identity Layer (Firebase Auth)**: Secure email/password authentication and persistent session management.
3. **API & Logic Layer (Cloud Functions)**: RESTful middleware for device authentication, business rules validation, transaction processing, and telemetry archiving.
4. **Business Data Store (Cloud Firestore)**: Persistent document store serving as the **single source of truth** for structured business entity data.
5. **Telemetry Data Store (Firebase Realtime Database)**: High-speed key-value store holding transient live IoT state (`devices/{deviceId}`) and active queue (`pending_transactions`).
6. **Hardware Layer (ESP32 Microcontrollers)**: Edge IoT devices reading sensor values, processing RFID taps, weighing deposits, and driving relay actuators.

---

## 3. Technology Stack

### Frontend
- **Framework**: React (ES6+) with Vite
- **UI & Styling**: Vanilla CSS, Tailwind CSS, Shadcn UI base components
- **Routing**: React Router DOM (v6)
- **State & Query Management**: TanStack Query (v5) & React Context API
- **Form & Validation**: React Hook Form & Zod
- **Icons & Data Visualization**: Lucide React & Recharts
- **QR Code Rendering**: Pure React SVG QR Code Generator

### Backend & Infrastructure (Firebase Suite)
- **Authentication**: Firebase Authentication (Email & Password)
- **Database (Business Data)**: Cloud Firestore
- **Database (Live IoT State)**: Firebase Realtime Database
- **Serverless API**: Cloud Functions (Node.js)
- **Object Storage**: Firebase Storage (User photos, export documents)
- **Web Hosting**: Firebase Hosting

### Hardware & IoT
- **Microcontroller**: ESP32 Dual-Core 240MHz
- **Communication Protocols**: HTTP/REST, JSON over WiFi / MQTT
- **Sensors**: RFID Reader (RC522), Load Cell (HX711), Temperature (DS18B20), Ambient Humidity (DHT22), Gas (MQ-135), Soil Moisture, Leachate Water Level
- **Actuators**: 5V/12V Relay modules (Aeration Fan, Water Pump)

---

## 4. Dual Database Architecture Strategy

The Smart Circular Village platform employs a strict **Dual Database Architecture** to decouple persistent business domain records from rapid IoT sensor telemetry.

```
                          ┌──────────────────────────┐
                          │   System Data Store      │
                          └────────────┬─────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────────┐
│        Cloud Firestore        │     │    Firebase Realtime Database     │
├───────────────────────────────┤     ├───────────────────────────────────┤
│ • Permanent Business Data     │     │ • Transient Live Telemetry        │
│ • users                       │     │ • devices/{deviceId}/lastSeen     │
│ • devices (Metadata ONLY)     │     │ • devices/{deviceId}/telemetry    │
│ • transactions (Final)        │     │ • devices/{deviceId}/relay        │
│ • rewards                     │     │ • devices/{deviceId}/alerts       │
│ • reward_redemptions          │     │ • pending_transactions            │
│ • settings                    │     │ • Instant WebSocket Sync          │
│ • notifications               │     │ • NO historical telemetry logs    │
└───────────────────────────────┘     └───────────────────────────────────┘
```

### Cloud Firestore Responsibility
Cloud Firestore is the **single source of truth** for all persistent business entities:
- **`users`**: User profile, auth roles (`admin`, `officer`, `citizen`, `government`), SCV Member IDs, assigned RFID UID.
- **`devices`**: Device static metadata ONLY (`deviceId`, `deviceType`, `name`, `firmwareVersion`, `apiKey`, `location`, `isActive`, timestamps). **Firestore MUST NOT store live telemetry or static online status.**
- **`transactions`**: Audited completed waste deposit records.
- **`rewards` & `reward_redemptions`**: Point catalog and redemption history.
- **`settings` & `notifications`**: System parameters and user notification feeds.

### Firebase Realtime Database (RTDB) Responsibility
Firebase Realtime Database is dedicated exclusively to **transient live IoT state and temporary signal queues**:
- **Live Device Telemetry**: `devices/{deviceId}/telemetry` (compost temperature, air temp/humidity, soil moisture, methane gas, water level).
- **Device Heartbeat**: `devices/{deviceId}/lastSeen` (Unix timestamp).
- **Actuator Relay State**: `devices/{deviceId}/relay` (`fan`, `pump`, `mode`).
- **Active Alerts**: `devices/{deviceId}/alerts` (`highTemperature`, `lowMoisture`, `gasWarning`, `waterOverflow`).
- **Pending Transactions Queue**: `pending_transactions/{transactionId}` (`deviceId`, `rfidUid`, `weightGram`, `timestamp`, `status`).

---

## 5. Device Architecture & Naming Conventions

### A. Device ID Naming Convention
All IoT devices must follow a strict, standardized ID naming convention:
- **Smart Collection Station**: `SCV-COLL-001`, `SCV-COLL-002`, `SCV-COLL-003`, ...
- **Smart Compost Bin**: `SCV-COMP-001`, `SCV-COMP-002`, `SCV-COMP-003`, ...

Inconsistent IDs (such as `SCV01`, `ESP001`, `device1`) are strictly forbidden.

### B. ESP32 Firmware Responsibility Boundary
Every ESP32 microcontroller firmware holds only two hardcoded identifiers:
- `const DEVICE_ID`
- `const API_KEY`

The ESP32 firmware sends **only**:
- `deviceId`
- `telemetry` payload
- `relay` state confirmation
- `lastSeen` heartbeat

Device metadata (such as `name`, `village`, `address`, `firmwareVersion`) is loaded dynamically from Cloud Firestore.

### C. Computed Device Online Status Rule
Device online/offline status is **NOT saved as a redundant field in Firestore**.
Status is computed dynamically at runtime from the `lastSeen` timestamp in RTDB:

```javascript
if (!device.isActive) {
  status = "disabled";
} else if (currentTime - device.lastSeen < 60000) { // 60 seconds threshold
  status = "online";
} else {
  status = "offline";
}
```

This prevents state duplication and sync conflicts between Firestore and Realtime Database.

---

## 6. System Data Flows & Pending Transactions

### A. Digital Waste Transaction Flow (Pending Queue -> Firestore)
```
[Citizen] ──> Taps RFID Card at Collection Station (SCV-COLL-001)
                     │
                     ▼
[ESP32] ──> Writes record to RTDB `/pending_transactions/{txId}`
            • deviceId = "SCV-COLL-001"
            • rfidUid = "8A3F1C90"
            • weightGram = 4500
            • status = "pending"
                     │
                     ▼
[Web App / Cloud Function] ──> Processes pending transaction:
            ├─ 1. Look up `rfidUid` in Firestore `users`
            ├─ 2. Calculate point earnings (Organic vs Inorganic)
            ├─ 3. Save finalized record to Firestore `transactions`
            ├─ 4. Update Citizen point balance in Firestore `users`
            │
            ▼
[Cleanup] ──> Remove `/pending_transactions/{txId}` from RTDB
```

### B. Live Sensor Telemetry Flow
```
[ESP32 Smart Compost] (SCV-COMP-001) ──> Pushes readings every 5-10s
                                            │
                                            ▼
                  Push payload to RTDB `/devices/SCV-COMP-001/telemetry`
                  Update heartbeat timestamp RTDB `/devices/SCV-COMP-001/lastSeen`
                                            │
                                            ▼
                  React SPA Dashboard Live WebSocket Listener
                  (Computes Online Status & Updates Dashboard Widgets Instantly)
```

### C. Actuator Relay Control Flow
```
[Web Dashboard Operator] ──> Toggles Aeration Fan / Irrigation Pump
                                            │
                                            ▼
                  Write command to RTDB `/devices/SCV-COMP-001/relay`
                  • fan = true | false
                  • pump = true | false
                                            │
                                            ▼
                  ESP32 RTDB Listener Detects State Change
                  ──> Drives Relay Pins ON / OFF
```

---

## 7. User Roles & Permission Matrix

| Feature / Page | Guest | Citizen (Pending) | Citizen (Active) | Officer | Government | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/login` & `/register` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/verification-pending` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/rejected` | ❌ | ❌ (If Rejected) | ❌ | ❌ | ❌ | ❌ |
| `/dashboard` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/transactions` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/compost` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/reports` | ❌ | ❌ | ❌ | ❌ | ✅ (Read) | ✅ |
| `/devices` | ❌ | ❌ | ❌ | ❌ | ✅ (Read-Only) | ✅ (Full CRUD) |
| `/admin/users` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/settings` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. Engineering Principles

1. **Strict Decoupling of Business Data & Live Telemetry**: Cloud Firestore is for permanent domain entity records; Firebase Realtime Database is for transient live IoT state and signal queues.
2. **Zero Redundant State**: Online status is computed on-the-fly from RTDB `lastSeen` heartbeat.
3. **Standardized Naming Conventions**: `SCV-COLL-xxx` for Collection Stations, `SCV-COMP-xxx` for Compost Bins.
4. **Security & Role Verification**: Require authentication and strict role guard checks (`ProtectedRoute`, `StatusRoute`, `RoleRoute`) on every sensitive route.
5. **Soft Delete Policy**: Use `isDeleted: true` on domain records to preserve auditability.
