import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, CreditCard, AlertCircle, Loader2, X } from 'lucide-react';
import { userService } from '@/services/userService';

export const ApproveDialog = ({ isOpen, onClose, user, onApproved }) => {
  const [rfidUid, setRfidUid] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setRfidUid(user.rfidUid || '');
      setRole(user.role === 'pending' ? 'citizen' : user.role || 'citizen');
      setError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rfidUid.trim()) {
      setError('RFID card UID must be assigned before activation.');
      return;
    }

    setIsSubmitting(true);

    try {
      await userService.approveUser(user.uid, rfidUid, role);
      onApproved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md p-6 relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Setujui Pendaftaran Akun</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Member: {user.fullName} ({user.memberId})</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* RFID Assignment Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Penetapan UID Kartu RFID <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Contoh: 04A91B2F</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                value={rfidUid}
                onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                placeholder="Masukkan RFID UID misal: 04A91B2F"
                className="pl-9 font-mono uppercase font-bold"
                required
              />
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              * Kartu RFID wajib ditugaskan sebelum akun diaktifkan.
            </p>
          </div>

          {/* Assign Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Role Aktif</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="citizen">Citizen (Warga)</option>
              <option value="officer">Officer (Petugas Bank Sampah)</option>
              <option value="government">Government (Pemerintah)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengaktifkan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui & Aktifkan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
