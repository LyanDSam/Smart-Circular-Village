# Smart Circular Village (SCV) — Documentation & Project Changelog

**Document Version:** 1.0.0  
**Status:** Revision Log  

---

## [v2.0.0] - July 2026

### 🚀 Architecture Evolution
- **Dual Database Architecture**: Shifted system design from single Cloud Firestore storage to a hybrid **Cloud Firestore (Business Data) + Firebase Realtime Database (Live Telemetry)** architecture.
- **Structured Data Isolation**: Dedicated Cloud Firestore as the single source of truth for business data (Users, Auth Profiles, Transactions, Devices Metadata, Settings, Reports).
- **Transient Telemetry Isolation**: Dedicated Firebase Realtime Database exclusively for rapid, low-latency live IoT telemetry and actuator states.
- **Telemetry Archiving Plan**: Documented periodic archiving of telemetry snapshots into Firestore via scheduled Cloud Functions.

### 📚 Documentation Updates
- Updated `docs/PROJECT_CONTEXT.md` with updated system architecture diagram, layer responsibilities, engineering principles, and detailed data flow diagrams (User Registration, Transactions, Telemetry, Controls, Notifications).
- Created `docs/DATABASE.md` detailing Firestore collection schemas and Realtime Database JSON trees.
- Created `docs/ROADMAP.md` mapping Sprint 1 through Sprint 7 development execution order.
- Updated `docs/CURRENT_PROGRESS.md` to record completion of Sprint 1, Sprint 2, and Sprint 3.

---

## [v1.3.0] - July 2026
- **Sprint 3 Completed**: Admin Verification & User Management module. Added `/admin/users`, `/admin/users/pending`, `/admin/users/:uid`, RFID Card UID assignment, Approval/Rejection modals, soft delete, and live admin dashboard user statistics.

## [v1.2.0] - July 2026
- **Sprint 2 Completed**: Firebase Auth integration, Citizen self-registration with Zod validation, SCV Member ID generator (`SCV-26-XXXXXX`), SVG QR Code component, and verification pending/rejected status routes.

## [v1.0.0] - July 2026
- **Sprint 1 Completed**: React SPA foundation with Vite, Tailwind CSS, Shadcn UI base, React Router DOM, Lucide icons, Recharts, and audit vulnerability overrides.
