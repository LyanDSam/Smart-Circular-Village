import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardService } from '@/services/rewardService';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { PageHeader } from '@/components/common/PageHeader';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Ticket,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';

export const MyRedemptionsPage = () => {
  const { userProfile, user } = useAuth();
  const { playChime } = useClientSettings();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const uid = userProfile?.uid || user?.uid;

  // Real-time listener — automatically updates all cards when status changes in Firestore
  useEffect(() => {
    if (!uid) return;

    setLoading(true);

    const unsubscribe = rewardService.listenToCitizenRedemptions(uid, (list) => {
      setRedemptions((prev) => {
        // If any voucher changed from pending -> awaiting_confirmation, play a chime alert
        list.forEach((newItem) => {
          const oldItem = prev.find((p) => (p.redemptionId || p.id) === (newItem.redemptionId || newItem.id));
          if (
            oldItem &&
            oldItem.status !== newItem.status &&
            newItem.status === 'awaiting_confirmation'
          ) {
            playChime();
            // Auto-open the ticket modal for this voucher so citizen sees the confirmation prompt
            setSelectedRedemption(newItem);
            setTicketModalOpen(true);
          }
        });
        return list;
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Keep selectedRedemption in sync with live list so the modal always shows latest data
  useEffect(() => {
    if (!selectedRedemption) return;
    const redId = selectedRedemption.redemptionId || selectedRedemption.id;
    const updated = redemptions.find((r) => (r.redemptionId || r.id) === redId);
    if (updated) setSelectedRedemption(updated);
  }, [redemptions]);

  const getStatusBadge = (red) => {
    switch (red.status) {
      case 'pending':
        return (
          <Badge variant="warning" className="gap-1 text-[10px]">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Menunggu Petugas</span>
          </Badge>
        );
      case 'awaiting_confirmation':
        return (
          <Badge className="bg-amber-500 text-white gap-1 text-[10px] animate-pulse">
            <ShieldCheck className="w-3 h-3" />
            <span>Konfirmasi Diperlukan</span>
          </Badge>
        );
      case 'citizen_confirmed':
        return (
          <Badge className="bg-blue-600 text-white gap-1 text-[10px]">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Diproses Petugas</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="success" className="gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <XCircle className="w-3 h-3" />
            <span>Ditolak</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title="Voucher Penukaran Saya"
        description="Daftar voucher klaim reward bank sampah Anda. Klik voucher untuk menampilkan QR Code kepada petugas station."
        icon={Gift}
      />

      {/* Awaiting Confirmation Alert Banner */}
      {redemptions.some((r) => r.status === 'awaiting_confirmation') && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Konfirmasi Penerimaan Barang Diperlukan
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Petugas sedang menyerahkan barang reward Anda. Buka voucher dan konfirmasi penerimaan fisik barang.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState message="Memuat voucher penukaran Anda..." />
      ) : redemptions.length === 0 ? (
        <EmptyState
          title="Belum Ada Voucher Penukaran"
          description="Anda belum pernah menukarkan poin dengan reward. Silakan jelajahi Katalog Reward!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redemptions.map((red) => {
            const redId = red.redemptionId || red.id;
            const isAwaitingConfirmation = red.status === 'awaiting_confirmation';
            const isCitizenConfirmed = red.status === 'citizen_confirmed';

            return (
              <Card
                key={redId}
                className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isAwaitingConfirmation
                    ? 'ring-2 ring-amber-400 dark:ring-amber-600'
                    : ''
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-2xl ${
                      isAwaitingConfirmation
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {isAwaitingConfirmation ? (
                        <PackageCheck className="w-6 h-6" />
                      ) : (
                        <Gift className="w-6 h-6" />
                      )}
                    </div>
                    {getStatusBadge(red)}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {red.rewardName || red.rewardTitle}
                    </h3>
                    <p className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {red.pointsRequired || red.pointsUsed} Poin
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID Voucher:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{redId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tanggal:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(red.createdAt?.seconds ? red.createdAt.seconds * 1000 : red.createdAt || Date.now()).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedRedemption(red);
                      setTicketModalOpen(true);
                    }}
                    className={`w-full text-white text-xs h-10 gap-1.5 font-bold shadow-xs ${
                      isAwaitingConfirmation
                        ? 'bg-amber-600 hover:bg-amber-700 animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isAwaitingConfirmation ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Konfirmasi Penerimaan Barang</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>Tampilkan Voucher QR</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ticket Modal — contains real-time listener and dual-confirmation handshake */}
      <RedemptionTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        redemption={selectedRedemption}
      />
    </div>
  );
};
