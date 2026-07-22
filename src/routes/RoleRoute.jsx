import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
