# Smart Circular Village (SCV) - Project Progress Tracking

**Version:** 1.9.0  
**Status:** Comprehensive Dark Mode Implementation & UI Stabilization Complete  
**Last Updated:** July 2026  

---

## 📌 Executive Summary

Smart Circular Village (SCV) adalah platform digital berbasis Internet of Things (IoT) yang mengintegrasikan **Bank Sampah Digital** (berbasis RFID & Load Cell) dan **Smart Compost Bin Monitoring** (berbasis sensor suhu, kelembapan, gas, dan kontrol aktuator ESP32).

---

## 🚀 Completed Sprints & Progress

### Sprint 1: Project Foundation (Completed)
- React + Vite, Tailwind CSS, Shadcn UI base, Lucide icons, Recharts, React Router DOM, TanStack Query.
- Built modular feature-based folder structure.
- Developed Admin Dashboard Layout & Page Placeholders.
- Resolved security vulnerabilities via `package.json` overrides.

### Sprint 2: Authentication & Registration System (Completed)
- Firebase Authentication (Email/Password) & Cloud Firestore (`users` collection).
- Citizen Self-Registration with React Hook Form & Zod schema.
- Auto-generation of unique SCV Member ID (`SCV-26-XXXXXX`) and SVG QR Code.
- Status verification routes (`/verification-pending` & `/rejected`).

### Sprint 3 (Revised): Admin Verification & User Management Stabilization (Completed)
- [x] **Realtime Authentication Synchronization**: Replaced static one-time profile fetching with Firestore `onSnapshot(doc(db, 'users', uid))` realtime snapshot listener.
- [x] **Reactive Approval Flow**: Approval by administrator automatically updates user `status: "active"`, `role: "citizen"`, `rfidUid`, and `updatedAt` in Firestore.
- [x] **Automatic Status Redirection**: Realtime redirect for pending users to `/dashboard` upon approval.
- [x] **Realtime Navbar Profile**: Navbar reflects latest user details.
- [x] **Bootstrap Admin Script**: `scripts/bootstrapAdmin.js` (`npm run bootstrap:admin`).

### Dedicated Officers Management & Comprehensive Dark Mode (Completed)
- [x] **Dedicated Officer View (`OfficersPage.jsx`)**: Created specialized page for Officer management (`/admin/officers` & `/officers`).
- [x] **Strict Role Filtering**: Queries and displays **only** users with `role === 'officer'`.
- [x] **Officer Metrics Dashboard**: Real-time display of Total Officers, Active Officers, and Pending Officer Verifications.
- [x] **Project-Wide Dark Mode Parity**: Applied comprehensive `dark:` utility modifiers across all UI components (`Button`, `Input`, `Badge`, `Table`, `Dialogs`), Dashboard pages (`Admin`, `Citizen`, `Officer`, `Government`), Management modules (`UsersPage`, `OfficersPage`, `PendingUsersPage`, `UserDetailPage`, `RewardsPage`, `TransactionsPage`, `SmartCompostPage`, `SettingsPage`), and Citizen pages (`MyPointsPage`, `MyQRPage`, `ProfilePage`).

---

## 📄 Firestore Collections Summary

- `users/{uid}`: Profiles, member IDs, status (`pending`, `active`, `rejected`), roles (`admin`, `officer`, `citizen`, `government`), assigned `rfidUid`, `points`.
- `rewards/{rewardId}`: Reward items (`title`, `description`, `pointsRequired`, `stock`, `isActive`).
- `reward_redemptions/{redemptionId}`: Redemption logs (`userId`, `userName`, `rewardId`, `rewardTitle`, `pointsUsed`, `status`, `requestedAt`, `processedBy`, `processedAt`).
- `settings/system`: Platform rules (`pointRules`, `compostRules`).

---

## 🎯 Next Steps (Sprint 4 Roadmap)

1. **Sprint 4: Device Management**:
   - Register ESP32 microcontrollers in Firestore `devices` collection.
   - Device status monitoring (online/offline, last ping, MAC address).
   - API Key generation & Device metadata management.
