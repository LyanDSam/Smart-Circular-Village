import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center font-sans">
      <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 border border-amber-200">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page you are looking for does not exist or has been moved in the Smart Circular Village platform.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="default" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
