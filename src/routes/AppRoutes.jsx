import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Auth Pages (Public)
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

// Status Pages (Authenticated, any status)
import { VerificationPendingPage } from '@/pages/VerificationPendingPage';
import { RejectedPage } from '@/pages/RejectedPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Role-based Shared Dashboard Router
import { DashboardPage } from '@/pages/DashboardPage';

// Pages
import { RewardsPage } from '@/pages/RewardsPage';
import { SettingsPage } from '@/pages/SettingsPage';

// Citizen-only Pages
import { MyPointsPage } from '@/pages/citizen/MyPointsPage';
import { DepositHistoryPage } from '@/pages/citizen/DepositHistoryPage';
import { MyQRPage } from '@/pages/citizen/MyQRPage';
import { ProfilePage } from '@/pages/citizen/ProfilePage';

// Management & Verification Pages
import { UsersPage } from '@/pages/UsersPage';
import { OfficersPage } from '@/pages/OfficersPage';
import { PendingUsersPage } from '@/pages/PendingUsersPage';
import { UserDetailPage } from '@/pages/UserDetailPage';

// Operations, IoT, Reports Pages
import { TransactionsPage } from '@/pages/TransactionsPage';
import { DevicesPage } from '@/pages/DevicesPage';
import { SmartCompostPage } from '@/pages/SmartCompostPage';
import { ReportsPage } from '@/pages/ReportsPage';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { StatusRoute } from './StatusRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Status Pages */}
      <Route element={<ProtectedRoute />}>
        <Route path="/verification-pending" element={<VerificationPendingPage />} />
        <Route path="/rejected" element={<RejectedPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Protected Active Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StatusRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Dashboard Router — Available to ALL active roles */}
            <Route element={<RoleRoute allowedRoles={['admin', 'officer', 'citizen', 'government']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Citizen-Only Routes */}
            <Route element={<RoleRoute allowedRoles={['citizen']} />}>
              <Route path="/my-points" element={<MyPointsPage />} />
              <Route path="/deposit-history" element={<DepositHistoryPage />} />
              <Route path="/my-qr" element={<MyQRPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Rewards — Citizen, Officer, Admin */}
            <Route element={<RoleRoute allowedRoles={['citizen', 'officer', 'admin']} />}>
              <Route path="/rewards" element={<RewardsPage />} />
            </Route>

            {/* Notifications — Citizen, Admin */}
            <Route element={<RoleRoute allowedRoles={['citizen', 'admin']} />}>
              <Route path="/notifications" element={<div className="p-8 text-center text-sm text-slate-400">Notifikasi — Segera Hadir</div>} />
            </Route>

            {/* Officer & Admin Shared Routes */}
            <Route element={<RoleRoute allowedRoles={['officer', 'admin']} />}>
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/collection-station" element={<div className="p-8 text-center text-sm text-slate-400">Pos Pengumpulan — Segera Hadir</div>} />
              <Route path="/compost" element={<SmartCompostPage />} />
              <Route path="/admin/users/pending" element={<PendingUsersPage />} />
              <Route path="/citizens" element={<UsersPage />} />
            </Route>

            {/* Reports — Officer, Government (Read-Only), Admin */}
            <Route element={<RoleRoute allowedRoles={['officer', 'government', 'admin']} />}>
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/*" element={<ReportsPage />} />
            </Route>

            {/* Government & Admin Statistics */}
            <Route element={<RoleRoute allowedRoles={['government', 'admin']} />}>
              <Route path="/statistics" element={<ReportsPage />} />
            </Route>

            {/* Devices — Admin (Full CRUD) & Government (Read-Only) */}
            <Route element={<RoleRoute allowedRoles={['admin', 'government']} />}>
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/devices/*" element={<DevicesPage />} />
            </Route>

            {/* Admin-Only Routes */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/:uid" element={<UserDetailPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/*" element={<UsersPage />} />
              <Route path="/admin/officers" element={<OfficersPage />} />
              <Route path="/officers" element={<OfficersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
              <Route path="/admin/*" element={<UsersPage />} />
            </Route>

          </Route>
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
