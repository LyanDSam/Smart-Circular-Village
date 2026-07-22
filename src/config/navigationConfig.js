import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Cpu,
  Sprout,
  BarChart3,
  Settings,
  Award,
  History,
  Gift,
  QrCode,
  UserCircle,
  Bell,
  ShieldCheck,
  Building2,
} from 'lucide-react';

/**
 * Sprint 3.2 — Reusable Navigation Configuration by Role
 *
 * Citizen Menu:
 * - Dashboard
 * - My Points
 * - Deposit History
 * - Rewards
 * - My QR Card
 * - Profile
 * - Notifications
 *
 * Officer Menu:
 * - Dashboard
 * - Transactions
 * - Citizen Verification
 * - Rewards
 * - Reports
 *
 * Admin Menu:
 * - Dashboard
 * - Users
 * - Officers
 * - Devices
 * - Transactions
 * - Compost Monitoring
 * - Reports
 * - Settings
 *
 * Government Menu:
 * - Dashboard
 * - Statistics
 * - Reports
 */

export const CITIZEN_NAV = [
  { title: 'Dashboard', key: 'navDashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Poin Saya', key: 'navMyPoints', path: '/my-points', icon: Award },
  { title: 'Riwayat Setoran', key: 'navDepositHistory', path: '/deposit-history', icon: History },
  { title: 'Katalog Reward', key: 'navRewards', path: '/rewards', icon: Gift },
  { title: 'Kartu QR Saya', key: 'navMyQR', path: '/my-qr', icon: QrCode },
  { title: 'Profil Saya', key: 'navProfile', path: '/profile', icon: UserCircle },
  { title: 'Notifikasi', key: 'navNotifications', path: '/notifications', icon: Bell },
];

export const OFFICER_NAV = [
  { title: 'Dashboard', key: 'navDashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Transaksi', key: 'navTransactions', path: '/transactions', icon: ArrowLeftRight },
  { title: 'Verifikasi Warga', key: 'navCitizenVerification', path: '/admin/users/pending', icon: Users },
  { title: 'Katalog Reward', key: 'navRewards', path: '/rewards', icon: Gift },
  { title: 'Laporan', key: 'navReports', path: '/reports', icon: BarChart3 },
];

export const ADMIN_NAV = [
  { title: 'Dashboard', key: 'navDashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Pengguna', key: 'navUsers', path: '/admin/users', icon: Users },
  { title: 'Petugas', key: 'navOfficers', path: '/admin/officers', icon: ShieldCheck },
  { title: 'Perangkat IoT', key: 'navDevices', path: '/devices', icon: Cpu },
  { title: 'Transaksi', key: 'navTransactions', path: '/transactions', icon: ArrowLeftRight },
  { title: 'Kompos Pintar', key: 'navCompost', path: '/compost', icon: Sprout },
  { title: 'Laporan', key: 'navReports', path: '/reports', icon: BarChart3 },
  { title: 'Pengaturan', key: 'navSettings', path: '/settings', icon: Settings },
];

export const GOVERNMENT_NAV = [
  { title: 'Dashboard', key: 'navDashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Statistik Desa', key: 'navStatistics', path: '/statistics', icon: Building2 },
  { title: 'Status Perangkat', key: 'navDevices', path: '/devices', icon: Cpu },
  { title: 'Laporan', key: 'navReports', path: '/reports', icon: BarChart3 },
];

/**
 * Returns navigation item list based on authenticated user role.
 */
export const getNavItemsByRole = (role) => {
  switch (role) {
    case 'admin':
      return ADMIN_NAV;
    case 'officer':
      return OFFICER_NAV;
    case 'citizen':
      return CITIZEN_NAV;
    case 'government':
      return GOVERNMENT_NAV;
    default:
      return [];
  }
};
