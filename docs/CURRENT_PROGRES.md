# Smart Circular Village (SCV) - Project Progress Tracking

**Version:** 1.0.0  
**Status:** Sprint 1 Completed  
**Last Updated:** July 2026  

---

## 📌 Executive Summary

Smart Circular Village (SCV) adalah platform digital berbasis Internet of Things (IoT) yang mengintegrasikan **Bank Sampah Digital** (berbasis RFID & Load Cell) dan **Smart Compost Bin Monitoring** (berbasis sensor suhu, kelembapan, gas, dan kontrol aktuator ESP32).

---

## 🚀 Completed Sprints

### Sprint 1: Project Foundation (Completed)

#### 1. Tech Stack & Environment Setup
- [x] Initialized Vite + React (JavaScript ES6+) application setup.
- [x] Configured Tailwind CSS & Shadcn UI design system with SCV Green primary palette (`#16a34a`).
- [x] Integrated `clsx` & `tailwind-merge` (`cn` utility) for dynamic styling.
- [x] Configured React Router DOM (v6), TanStack Query (v5), Lucide React icons, and Recharts.
- [x] Resolved security audit vulnerabilities (`esbuild`, `undici`) via `package.json` dependency updates and npm overrides.

#### 2. Project Architecture & Folder Structure
- [x] Implemented Feature-Based Modular Architecture:
  ```
  src/
  ├── assets/
  ├── components/
  │   ├── common/      (PageHeader, Breadcrumb, DashboardCard, SectionCard, EmptyState, LoadingState)
  │   ├── layout/      (Sidebar, Navbar)
  │   └── ui/          (badge, button, card, input, table)
  ├── constants/       (mockData.js, navigation.js)
  ├── features/        (auth, dashboard, users, transactions, devices, compost, reports, settings)
  ├── firebase/        (config.js, auth.js, firestore.js, storage.js)
  ├── hooks/
  ├── layouts/         (DashboardLayout.jsx)
  ├── pages/           (DashboardPage, DevicesPage, LoginPage, NotFoundPage, ReportsPage, SettingsPage, SmartCompostPage, TransactionsPage, UsersPage)
  ├── routes/          (AppRoutes.jsx)
  ├── services/
  └── utils/           (cn.js)
  ```

#### 3. Routing & Pages Created
- [x] **`/`**: Root redirect to `/dashboard`.
- [x] **`/login`**: Standalone sign-in page UI (`LoginPage`).
- [x] **`/dashboard`**: Main Admin Dashboard (`DashboardPage`) featuring:
  - 6 Key Metric Cards (Total Users, Total Waste, Total Organic Waste, Device Status, Compost Produced, Total Points).
  - Monthly Waste Collection Bar Chart (Recharts).
  - Real-time Smart Compost Sensor telemetry widget.
  - Recent Waste Transactions table.
  - System Activity Log.
- [x] **`/users`**: Citizen & Officer Management table (`UsersPage`).
- [x] **`/transactions`**: Digital Waste Bank transaction records (`TransactionsPage`).
- [x] **`/devices`**: ESP32 Collection Station & Smart Compost Bin status monitor (`DevicesPage`).
- [x] **`/compost`**: Smart Compost Bin telemetry & relay actuator controls (`SmartCompostPage`).
- [x] **`/reports`**: Village government audit & PDF export interface (`ReportsPage`).
- [x] **`/settings`**: Point calculation rates & IoT alert threshold configurations (`SettingsPage`).
- [x] **`*`**: Custom 404 Catch-All page (`NotFoundPage`).

#### 4. Responsive Layout & Component Design System
- [x] Responsive `DashboardLayout` with mobile drawer backdrop and collapsible sidebar.
- [x] Top `Navbar` with search, live system online indicator, notification bell, and user profile badge.
- [x] `Sidebar` navigation with active route highlighting using Lucide icons.
- [x] Dynamic `Breadcrumb` and `PageHeader` components across all sub-pages.

#### 5. Backend & Firebase Placeholders
- [x] Structured placeholder configuration files in `src/firebase/`:
  - `config.js`
  - `auth.js`
  - `firestore.js`
  - `storage.js`

---

## 🎯 Next Steps (Sprint 2 Roadmap)

1. **Authentication Integration**
   - Connect `LoginPage` to Firebase Authentication (`signInWithEmailAndPassword`, `onAuthStateChanged`).
   - Implement `ProtectedRoute` wrapper for admin layout.
2. **Firestore Data Services**
   - Implement Firestore service layer for reading/writing citizen records, RFID cards, and waste transactions.
   - Replace mock data with TanStack Query hooks connected to Firestore live listeners.
3. **Form Handling & Validation**
   - Add Zod schemas and React Hook Form validation for adding users, registering devices, and manual transaction logging.
4. **IoT REST API Middleware**
   - Implement API service endpoints for ESP32 devices to post sensor telemetry and fetch relay trigger states.
