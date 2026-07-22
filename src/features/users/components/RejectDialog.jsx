import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { userService } from '@/services/userService';

export const RejectDialog = ({ isOpen, onClose, user, onRejected }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await userService.rejectUser(user.uid, reason);
      onRejected();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject user registration.');
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

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tolak Pendaftaran Pengguna</h3>
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

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menolak pendaftaran ini? Status pengguna akan diubah menjadi <span className="font-semibold text-red-600 dark:text-red-400">rejected</span>.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Alasan Penolakan (Opsional)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Alamat tidak sesuai atau bukti domisili tidak valid."
              className="w-full p-3 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menolak...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Konfirmasi Penolakan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
