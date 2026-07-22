import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/common/LoadingState';

export const StatusRoute = () => {
  const { user, status, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Verifying account status..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account Status Redirection Logic
  if (status === 'pending') {
    if (location.pathname !== '/verification-pending') {
      return <Navigate to="/verification-pending" replace />;
    }
  } else if (status === 'rejected') {
    if (location.pathname !== '/rejected') {
      return <Navigate to="/rejected" replace />;
    }
  } else if (status === 'active') {
    // If user is active but currently on verification or rejected status pages, redirect to dashboard
    if (location.pathname === '/verification-pending' || location.pathname === '/rejected') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
