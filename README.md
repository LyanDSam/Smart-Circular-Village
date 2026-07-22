# 🍃 Smart Circular Village (SCV) — System Architecture & Documentation

**Document Version:** `v4.0.0`  
**Status:** Official Technical Architecture Reference (ESP32 Synchronized & Control-Centered)  
**Last Updated:** July 2026  
**Repository:** `https://github.com/LyanDSam/Smart-Circular-Village.git`  

---

## 📋 1. Executive Summary & Project Overview

**Smart Circular Village (SCV)** is an Internet of Things (IoT)-based web platform designed to digitalize, automate, and optimize organic and inorganic waste management at the village level.

The platform integrates two core subsystems:
1. **Digital Waste Bank (Smart Collection Station)**: Automated weighing (Load Cell HX711) and citizen identification via physical RFID cards (MFRC522) with point-based rewards.
2. **Smart Compost Bin Monitoring System**: Real-time telemetry monitoring (Temperature, Air Humidity, Soil Moisture, Methane Gas, Leachate Water Level) and actuator controls (Aeration Fan & Irrigation Water Pump) via ESP32 microcontrollers.

---

## 🏗️ 2. Dual Database Architecture

SCV implements a **Dual Database Architecture** using Firebase to separate persistent business data from transient high-speed IoT live states.

```
                  ┌─────────────────────────────────────────┐
                  │          ESP32 Microcontroller          │
                  └────────────────────┬────────────────────┘
                                       │ (REST API / Bearer API Key)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Firebase Cloud Functions (Node.js)    │
                  └───────┬─────────────────────────┬───────┘
                          │                         │
                          ▼                         ▼
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│   Firebase Realtime Database      │    │         Cloud Firestore           │
│              (RTDB)               │    │       (Persistent Database)       │
├───────────────────────────────────┤    ├───────────────────────────────────┤
│ • /pending_transactions           │    │ • users (Citizen & Points Data)   │
│ • /devices/{deviceId}/telemetry   │    │ • transactions (Audit Log)        │
│ • /devices/{deviceId}/lastSeen    │    │ • devices (Device Metadata)       │
│ • /devices/{deviceId}/relay       │    │ • rewards & reward_redemptions    │
└─────────────────┬─────────────────┘    │ • audit_logs (RFID Audit Trail)   │
                  │                      └─────────────────┬─────────────────┘
                  │ (WebSocket onValue)                    │ (Indexed Queries)
                  └────────────────────┬───────────────────┘
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      React Web Application (Vite)       │
                  └─────────────────────────────────────────┘
```

### Database Responsibilities
- **Cloud Firestore**: Audited data, strict security rules, structured indexed queries, and long-term persistence (`users`, `transactions`, `devices`, `rewards`, `reward_redemptions`, `settings`, `audit_logs`).
- **Firebase Realtime Database (RTDB)**: Live IoT state updated continuously in sub-seconds (`devices/{deviceId}/telemetry`, `devices/{deviceId}/lastSeen`, `pending_transactions`).
- **Firebase Cloud Functions (`/api/device/*`)**: Express & Zod-validated REST API middleware for secure ESP32 authentication using *Bearer API Key*.

---

## 👥 3. Role-Based Access Control (RBAC)

The system grants access across 4 distinct roles:

| Role | Identifier | Permissions & Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | Full system control, IoT Device Management, Officer Management, Pending Citizen Verification, Point Rules & System Configuration. |
| **Petugas Station** | `officer` | Confirming live RFID weighing transactions, resolving Unknown RFID cards, local citizen verification, and processing reward redemptions. |
| **Warga Penyetor** | `citizen` | Viewing point balance, Citizen Digital QR Card, Personal Waste Deposit History, and Reward Redemption Catalog. |
| **Pemerintah Desa**| `government` | Read-only access to Environmental Impact Analytics, village total waste tonnage statistics, and points distribution audits. |

---

## 🔄 4. Core Modules & System Workflows

### A. Realtime Waste Transaction Workflow

$$\text{Tap RFID Card} \longrightarrow \text{ESP32} \longrightarrow \text{RTDB pending\_transactions} \longrightarrow \text{React Realtime Listener} \longrightarrow \text{Confirm Modal} \longrightarrow \text{Firestore writeBatch}$$

1. **RFID Tap & Weighing**: Citizen taps RFID card at the station. ESP32 reads UID and load cell weight, then sends payload to Cloud Functions `/api/device/pending-transaction`.
2. **Push to RTDB**: Payload enters RTDB `/pending_transactions/{txId}` with status `"waiting_confirmation"`.
3. **React Realtime Listener**: Transactions page/dashboard listens via WebSocket `onValue`.
4. **Indexed Citizen Lookup**: Instant query in Firestore using `where("rfidUid", "==", cleanRfid)`.
5. **Unknown RFID Resolution Flow**:
   - If RFID is **unregistered**, the dedicated **Unknown RFID Dialog** pops up.
   - Officer choices:
     - **Link RFID to Citizen**: Search verified citizen (Member ID/Name/Phone), assign `rfidUid`, log audit entry to Firestore `audit_logs`, then automatically reopen the normal confirmation modal.
     - **Scan Again**: Dismiss popup without modifying RTDB queue.
     - **Cancel Transaction**: Update RTDB status to `"cancelled"` with `cancelReason: "Unknown RFID"`, then remove from queue.
6. **Atomic `writeBatch` Execution**:
   - Concurrency lock: Update RTDB status from `waiting_confirmation` $\rightarrow$ `processing`.
   - Write new transaction document in Firestore `transactions/{txId}`.
   - Atomically increment citizen points (`users.points += pointEarned`) and waste mass (`users.totalWasteGram += weightGram`).
   - Remove pending item from RTDB `/pending_transactions/{txId}`.

---

### B. Point Calculation Rules (`pointService.js`)

| Waste Category | Points / 100 Grams | Points / 1 Kg | Example (2.5 Kg) |
| :--- | :---: | :---: | :---: |
| **Organic** (Food Waste, Leaves) | 1 Pts | 10 Pts | +25 Pts |
| **Plastic** (Bottles, Cups, Containers) | 2 Pts | 20 Pts | +50 Pts |
| **Paper** (Paper, Cardboard, Newspaper) | 1 Pts | 10 Pts | +25 Pts |
| **Glass** (Glass, Glass Bottles) | 2 Pts | 20 Pts | +50 Pts |
| **Metal** (Metal, Iron, Cans) | 5 Pts | 50 Pts | +125 Pts |
| **Other / Residue** | 0 Pts | 0 Pts | 0 Pts |

---

### C. Smart Compost Telemetry & Actuator Control

- **Live Sensor Telemetry**: Compost Temp (°C), Air Temp (°C), Air Humidity (%), Soil Moisture (%), Methane Gas (PPM), and Leachate Water Level (*Normal/Overflow*).
- **Relay Actuator Control**: Manual/Auto toggles for **Aeration Fan** and **Irrigation Pump** syncing live state to RTDB `/devices/{deviceId}/relay`.

---

## 🛠️ 5. Technology Stack

### Frontend (Website Dashboard)
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS & Vanilla Custom CSS Tokens
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Waste Tonnage & Telemetry Graphs)
- **UI Components**: Shadcn UI patterns (Badge, Card, Modal Dialog, Toast Alerts)

### Backend Cloud & Middleware
- **Cloud Platform**: Firebase Cloud Functions (Node.js 18 Runtime)
- **API Framework**: Express.js Router
- **Data Validation**: Zod Schemas (`deviceApiSchemas.js`)

### Database Layer
- **Persistent DB**: Cloud Firestore
- **Live IoT Queue DB**: Firebase Realtime Database (RTDB)

### Hardware Sub-system (ESP32 Firmware)
- **Microcontroller**: ESP32 DevKit V1
- **Sensors**: RFID MFRC522, Load Cell + HX711 Amplifier, DS18B20 Temp, MQ-4 Methane Gas.
- **Actuators**: 2-Channel Relay Module (Fan & Water Pump).

---

## 📁 6. Project Directory Structure

```text
Smart-Circular-Village/
├── docs/                             # Documentation & API Specifications
│   ├── PROJECT_CONTEXT.md            # System Context Documentation v4.0.0
│   └── ESP32_API_SPECIFICATION.md    # ESP32 REST API Guide
├── functions/                        # Firebase Cloud Functions (Backend REST API)
│   ├── src/
│   │   ├── config/firebase.js        # Admin SDK Singleton
│   │   ├── middleware/               # Auth (Bearer API Key) & Validation Middleware
│   │   ├── routes/deviceRoutes.js    # Express Router /api/device/*
│   │   ├── schemas/                  # Zod Payload Schemas
│   │   └── services/deviceApiService.js # IoT Service RTDB Processor
│   └── package.json
├── scripts/
│   └── inspectDatabase.js            # Live Database Inspector (npm run db:inspect)
├── src/                              # React Frontend Source Code
│   ├── components/                   # Reusable UI Components (MetricCard, Table, Modal)
│   ├── features/
│   │   ├── auth/                     # Authentication & Context
│   │   ├── dashboard/                # Role-Based Dashboards (Admin, Officer, Citizen)
│   │   ├── devices/                  # IoT Device Management
│   │   ├── transactions/             # Waste Transaction Module & Unknown RFID Modals
│   │   └── users/                    # User & Verification Management
│   ├── firebase/                     # Client SDK Initializers (Firestore & RTDB)
│   ├── hooks/                        # Custom Hooks (useAuth, usePendingTransactions, etc.)
│   ├── pages/                        # Page Routing Hubs
│   ├── routes/                       # AppRoutes, ProtectedRoute, RoleRoute
│   └── services/                     # Business Logic Services
│       ├── deviceService.js          # Live Firestore Devices
│       ├── pointService.js           # Point Calculation Engine
│       ├── rewardService.js          # Firestore Catalog & Redemptions
│       ├── rtdbService.js            # WebSocket RTDB Listener
│       ├── transactionService.js     # Atomic writeBatch Transactions
│       └── userService.js            # Indexed Firestore User Queries & Audit Trail
├── firestore.rules                   # Firestore Security Rules
├── firebase.json                     # Emulator & Cloud Deployment Settings
└── package.json
```
