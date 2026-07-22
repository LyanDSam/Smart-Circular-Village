import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Leaf } from 'lucide-react';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg mb-4 animate-bounce">
          <Leaf className="w-8 h-8" />
        </div>
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying Authentication & Access...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
