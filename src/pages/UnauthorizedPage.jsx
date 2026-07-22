import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const UnauthorizedPage = () => {
  const { userProfile, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center font-sans">
      <div className="p-4 bg-red-50 rounded-full text-red-600 mb-4 border border-red-200">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
        Error 403 • Access Denied
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Unauthorized Access</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Your current account (<span className="font-semibold text-slate-800">{userProfile?.name || 'User'}</span>) with role <span className="font-semibold capitalize text-emerald-700">[{role || 'guest'}]</span> does not have permission to view this section.
      </p>

      <div className="mt-6 flex items-center space-x-3">
        <Link to="/dashboard">
          <Button variant="default" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
