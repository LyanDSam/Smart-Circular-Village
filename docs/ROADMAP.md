# Smart Circular Village (SCV) — Development Roadmap

**Document Version:** 1.0.0  
**Status:** Official Project Schedule  
**Last Updated:** July 2026  

---

## 📅 Development Roadmap & Sprint Execution Order

```
[Sprint 1] Project Foundation ──> [Sprint 2] Auth & Registration ──> [Sprint 3] User Management
                                                                               │
                                                                               ▼
[Sprint 5] Waste Transactions ──< [Sprint 4] Device Management ──< [Sprint 3.1] Bug Fixes & Stabilization
          │
          ▼
[Sprint 6] Smart Compost Monitoring ──> [Sprint 7] Analytics & Reports
```

---

### Sprint 1: Project Foundation (Completed)
- React + Vite SPA foundation, Tailwind CSS & Shadcn UI design system.
- Feature-based modular folder structure setup.
- App Layout, Navigation Sidebar, Header, Breadcrumbs.
- Dependency audit fixes and package overrides.

### Sprint 2: Authentication & Registration (Completed)
- Firebase Authentication (Email & Password).
- Citizen Self-Registration with React Hook Form & Zod schema validation.
- Auto-generation of SCV Member ID (`SCV-26-XXXXXX`) and SVG QR Code.
- Status Verification pages (`/verification-pending` and `/rejected`).
- Auth Context & `useAuth()` custom hook.

### Sprint 3: Admin Verification & User Management (Completed)
- Responsive User Management Table (`/admin/users`) with search, role filter, status filter, and pagination.
- Dedicated Pending Approval Queue (`/admin/users/pending`).
- Single Citizen Profile Detail View (`/admin/users/:uid`).
- RFID Card UID assignment with uniqueness validation.
- Admin Approval & Rejection modals.
- Soft delete functionality (`isDeleted: true`).

### Sprint 3.1: Bug Fixes & Stabilization (In Progress)
- **Fix approval flow**: Ensure instant reactive UI updates upon admin approval.
- **Fix AuthContext refresh**: Enhance `refreshProfile()` state persistence and local store synchronization.
- **Add realtime profile synchronization**: Keep user profile updated across tab navigation.
- **Improve route guards**: Refine `ProtectedRoute`, `StatusRoute`, and `RoleRoute` edge case handling.

### Sprint 4: Device Management (Upcoming)
- Register ESP32 microcontrollers in Firestore `devices` collection.
- Generate and manage secure Device API Keys.
- Track device metadata (Location, Hardware Type, MAC Address, Firmware Version).
- Monitor Device Online / Offline connection status.

### Sprint 5: Waste Transactions (Upcoming)
- RFID Card tap verification logic.
- Load Cell weight scale data ingestion interface.
- Automatic point calculation rules (Organic vs Inorganic waste).
- Waste transaction logging and receipt history in Firestore (`transactions`).

### Sprint 6: Smart Compost Monitoring (Upcoming)
- Integration with Firebase Realtime Database for live IoT sensor feeds.
- Real-time sensor monitoring (Temperature, Ambient Humidity, Soil Moisture, Methane Gas, Water Level).
- Actuator Relay Controls (Aeration Fan & Irrigation Water Pump).
- Auto vs Manual operation mode toggles.

### Sprint 7: Analytics & Reports (Upcoming)
- Village waste collection analytics with customizable date filters.
- Scheduled Cloud Functions for archiving telemetry into Firestore.
- PDF & Excel report export features for government auditing.
