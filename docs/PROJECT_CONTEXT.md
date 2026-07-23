# PROJECT_CONTEXT.md

# Smart Circular Village (SCV)

Version: 2.0
Status: Active Development
Last Updated: July 2026

---

# 1. Overview

Smart Circular Village (SCV) is a web-based platform that digitizes village waste management through the integration of IoT devices and cloud services.

The project focuses on two major systems:

1. Digital Waste Bank
2. Smart Compost Monitoring

The website is responsible for managing users, devices, transactions, rewards, reports, and realtime monitoring.

IoT firmware is developed separately.

---

# 2. Main Goals

SCV aims to:

- Digitalize village waste collection.
- Improve transparency.
- Increase citizen participation.
- Implement a reward point system.
- Monitor compost production in realtime.
- Produce operational reports.

---

# 3. System Scope

This repository ONLY contains the web application.

The web application is responsible for:

- Authentication
- Authorization
- User Management
- Device Management
- Waste Transactions
- Reward System
- Dashboard
- Reports
- Monitoring

Firmware development is outside this repository.

---

# 4. Technology Stack

Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Shadcn UI

Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database
- Firebase Storage

---

# 5. Firebase Responsibilities

SCV intentionally uses TWO Firebase databases.

## Cloud Firestore

Firestore stores business data.

Examples:

- users
- devices
- transactions
- rewards
- reward_redemptions

Firestore is the system of record.

---

## Firebase Realtime Database

Realtime Database stores live IoT data.

Examples:

- pending_transactions
- telemetry
- heartbeat

RTDB should NEVER become the permanent transaction database.

Once a transaction is confirmed, it is moved into Firestore.

---

# 6. User Roles

## Administrator

Responsibilities:

- Manage users
- Manage officers
- Manage devices
- Manage rewards
- View reports
- Configure the system

Administrator does NOT process waste transactions.

Administrator must NEVER receive transaction popup notifications.

---

## Officer

Responsibilities:

- Process waste transactions.
- Confirm RFID transactions.
- Manage reward redemption.
- View assigned device activity.

Each Officer is assigned to exactly ONE active Device.

---

## Citizen

Responsibilities:

- Register account.
- View profile.
- View point balance.
- View transaction history.
- Redeem rewards.

Citizens never access admin pages.

---

# 7. Device Concept

Each ESP32 represents ONE physical collection station.

Each device has a unique Device ID.

Example:

SCV-09009

Device IDs are permanent.

The Device ID is the primary identifier for realtime transactions.

---

# 8. Device Assignment

Each Officer is assigned to ONE Device.

Example:

Officer Samuel

↓

Assigned Device

↓

SCV-09009

When the assignment changes, future transactions immediately follow the new assignment.

No database redesign is required.

---

# 9. Waste Transaction Flow

Citizen

↓

RFID Card

↓

ESP32

↓

Realtime Database

↓

Officer Website

↓

Confirmation Popup

↓

Firestore Transaction

↓

User Points Updated

↓

Pending Transaction Removed

---

# 10. Unknown RFID

If an RFID card is not registered:

The system must display:

Unknown RFID Card

The Officer can:

- Retry scanning
- Remove the pending transaction

The Officer must NOT create transactions for unknown RFID cards.

---

# 11. Reward Flow

Citizen selects a reward.

↓

Redemption request created.

↓

QR Code generated.

↓

Citizen visits Waste Bank.

↓

Officer scans QR Code or enters Redemption ID.

↓

Reward confirmed.

↓

Points deducted.

↓

Reward stock updated.

QR Codes are used ONLY for reward redemption.

RFID is used ONLY for waste transactions.

---

# 12. Device Approval

New devices require Administrator approval.

Approval lifecycle:

Pending

↓

Approved

↓

Operational

Rejected devices cannot be assigned to Officers.

Approval is a business process.

Realtime heartbeat must never change approval status.

---

# 13. Connection Status

Connection status is independent from approval status.

Examples:

Online

Offline

Maintenance

Warning

Error

Connection status is calculated from RTDB heartbeat.

It must never overwrite business approval status.

---

# 14. Database Rules

Firestore stores permanent records.

Realtime Database stores temporary realtime data.

Never duplicate the same business data across both databases.

---

# 15. Architecture Rules

The AI Agent MUST NOT:

- redesign Firestore without approval
- redesign RTDB without approval
- rename collections without approval
- introduce new collections unless requested
- modify firmware assumptions
- replace RTDB with Firestore
- replace Firestore with RTDB

Always preserve existing architecture.

---

# 16. Development Principles

Every implementation must:

- be modular
- be reusable
- use feature-based architecture
- avoid duplicated logic
- avoid duplicated Firebase queries
- avoid unnecessary re-renders
- keep services independent from UI

---

# 17. Before Any Implementation

Before implementing a new feature, the AI Agent MUST:

1. Read this PROJECT_CONTEXT.md.
2. Inspect the existing code.
3. Inspect the current Firestore structure.
4. Inspect the current Realtime Database structure.
5. Reuse existing services whenever possible.
6. Avoid assumptions about database schema.

If the actual database differs from documentation, the Agent must report the difference before changing code.

---

# 18. Source of Truth

This document is the primary architectural reference for the Smart Circular Village project.

The Agent must follow this document unless explicitly instructed otherwise by the project owner.