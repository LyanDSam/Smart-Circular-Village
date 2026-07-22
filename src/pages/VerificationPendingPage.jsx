import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, LogOut, RefreshCw, Leaf, CheckCircle2 } from 'lucide-react';

export const VerificationPendingPage = () => {
  const { userProfile, status, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Automatic realtime redirect when admin approves or rejects the account
  useEffect(() => {
    if (status === 'active') {
      navigate('/dashboard', { replace: true });
    } else if (status === 'rejected') {
      navigate('/rejected', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 text-center z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-2">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-bold text-lg text-slate-900 block leading-tight">Smart Circular Village</span>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">SCV Platform</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold">
          <Clock className="w-4 h-4 animate-spin text-amber-600" />
          <span>Account Verification Pending</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Registration Received!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Welcome, <span className="font-semibold text-slate-800">{userProfile?.fullName || 'Citizen'}</span>. Your registration is awaiting administrator verification and RFID card assignment.
          </p>
        </div>

        {/* SVG QR Code Display */}
        <div className="py-2">
          <QRCodeDisplay value={userProfile?.qrCode || userProfile?.memberId || 'SCV-26-PENDING'} size={160} />
        </div>

        {/* Member Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">SCV Member ID:</span>
            <span className="font-mono font-extrabold text-emerald-700 text-sm">
              {userProfile?.memberId || 'SCV-26-000000'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Email:</span>
            <span className="font-semibold text-slate-800">{userProfile?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Phone:</span>
            <span className="font-semibold text-slate-800">{userProfile?.phone || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">RFID Card:</span>
            <span className="font-mono text-amber-600 font-semibold italic">Awaiting Assignment</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left flex items-start space-x-2 text-[11px] text-blue-800">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Please present your Member ID / QR Code to a village officer to collect your physical RFID card. Once approved, this page will update automatically.
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={refreshProfile}
            variant="outline"
            className="w-full text-xs gap-2 h-10 border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Verification Status</span>
          </Button>

          <Button
            onClick={logout}
            variant="ghost"
            className="w-full text-xs text-slate-500 hover:text-slate-800 gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
