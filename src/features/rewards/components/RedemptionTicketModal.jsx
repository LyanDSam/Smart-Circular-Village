import React from 'react';
import { VoucherQRCode } from './VoucherQRCode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const RedemptionTicketModal = ({ isOpen, onClose, redemption }) => {
  if (!isOpen || !redemption) return null;

  const isPending = redemption.status === 'pending';
  const isCompleted = redemption.status === 'completed';
  const isRejected = redemption.status === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-1">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Voucher Penukaran Reward
          </h3>
          <div className="flex items-center justify-center gap-2">
            {isPending && (
              <Badge variant="warning" className="gap-1 text-xs px-3 py-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Menunggu Konfirmasi Petugas</span>
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="success" className="gap-1 text-xs px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesai & Diambil</span>
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="gap-1 text-xs px-3 py-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Ditolak</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Voucher QR Code */}
          <VoucherQRCode value={redemption.redemptionId} size={180} />

          {/* Reward Info Details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Reward:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{redemption.rewardName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Poin Dibutuhkan:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {redemption.pointsRequired} Poin
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Waktu Pemesanan:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(redemption.createdAt?.seconds ? redemption.createdAt.seconds * 1000 : redemption.createdAt || Date.now()).toLocaleString('id-ID')}
              </span>
            </div>

            {redemption.officerId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  Petugas Verifikator:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {redemption.officerId}
                </span>
              </div>
            )}

            {isRejected && redemption.rejectionReason && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-[11px]">
                <strong className="block">Alasan Penolakan:</strong>
                {redemption.rejectionReason}
              </div>
            )}
          </div>

          {/* Citizen Guidance Notice */}
          {isPending && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Tunjukkan QR Code / Redemption ID ini kepada petugas di Pos Bank Sampah untuk mengambil barang reward Anda.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <Button onClick={onClose} variant="outline" className="w-full text-xs h-10 font-bold">
            Tutup Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};
