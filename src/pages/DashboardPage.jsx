import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  AdminDashboard,
  OfficerDashboard,
  CitizenDashboard,
  GovernmentDashboard,
} from '@/features/dashboard';

/**
 * DashboardPage — Dynamic Role-Based Dashboard Router.
 *
 * Directs the authenticated user to their role-specific dashboard:
 *   - citizen    → Personal info ONLY (points, QR, RFID, deposit history preview, rewards, notifications)
 *   - officer    → Operational metrics (today's transactions, pending verification, waste collected, recent transactions)
 *   - admin      → Full system control (total users, pending verification, device summary, compost summary, reports)
 *   - government → Executive read-only view (waste stats, compost production, citizen participation, reports)
 */
export const DashboardPage = () => {
  const { role } = useAuth();

  switch (role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'officer':
      return <OfficerDashboard />;
    case 'government':
      return <GovernmentDashboard />;
    case 'admin':
    default:
      return <AdminDashboard />;
  }
};
