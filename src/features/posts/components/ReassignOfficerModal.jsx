import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { postService } from '@/services/postService';
import {
  X,
  ShieldCheck,
  Building2,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const ReassignOfficerModal = ({
  isOpen = false,
  onClose,
  onReassigned,
  posts = [],
}) => {
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [selectedTargetPostId, setSelectedTargetPostId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setIsLoading(true);
    setSelectedOfficerId('');
    setSelectedTargetPostId('');

    // Fetch all officers
    postService
      .getAvailableOfficers(null)
      .then((offs) => {
        setOfficers(offs);
      })
      .catch((err) => {
        console.error('Error fetching officers for reassignment:', err);
        setErrorMessage('Gagal memuat daftar petugas.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedOfficerId) {
      setErrorMessage('Pilih petugas yang akan dipindahkan tugasnya.');
      return;
    }

    setIsSubmitting(true);
    try {
      await postService.reassignOfficer({
        officerId: selectedOfficerId,
        targetPostId: selectedTargetPostId || '',
      });
      onReassigned();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memindahkan penugasan petugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOfficer = officers.find((o) => o.uid === selectedOfficerId);
  const currentAssignedPost = posts.find((p) => p.postId === selectedOfficer?.postId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Pindahkan Penugasan Petugas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Select Officer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Petugas <span className="text-rose-500">*</span>
            </label>
            {isLoading ? (
              <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat petugas...</span>
              </div>
            ) : (
              <select
                required
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Petugas --</option>
                {officers.map((off) => (
                  <option key={off.uid} value={off.uid}>
                    {off.fullName || off.email} ({off.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Current Post Info */}
          {selectedOfficer && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-500 block">Posko Saat Ini:</span>
              {currentAssignedPost ? (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentAssignedPost.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentAssignedPost.village || 'Aktif'}
                  </Badge>
                </div>
              ) : (
                <span className="text-amber-600 font-semibold">
                  Belum Ditugaskan ke Posko Mana pun
                </span>
              )}
            </div>
          )}

          {/* Target Post Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pindahkan Ke Posko Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTargetPostId}
              onChange={(e) => setSelectedTargetPostId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Bebaskan Penugasan (Tanpa Posko) --</option>
              {posts.map((post) => (
                <option key={post.postId} value={post.postId}>
                  {post.name} ({post.village || 'Desa Utama'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Petugas akan secara otomatis hanya menerima transaksi real-time dari posko baru ini.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedOfficerId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memindahkan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pindahkan Penugasan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
