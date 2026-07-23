import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardService } from '@/services/rewardService';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { PageHeader } from '@/components/common/PageHeader';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
} from 'lucide-react';

export const MyRedemptionsPage = () => {
  const { userProfile, user } = useAuth();
  const { playChime } = useClientSettings();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Search & Status Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'rejected'

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

  // Sort and Filter Redemptions: Pending always at top, sorted by time descending
  const filteredAndSortedRedemptions = redemptions
    .filter((red) => {
      const redId = (red.redemptionId || red.id || '').toLowerCase();
      const rewardName = (red.rewardName || red.rewardTitle || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || redId.includes(query) || rewardName.includes(query);

      const st = (red.status || '').toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'pending') {
        matchesStatus = st === 'pending' || st === 'awaiting_confirmation' || st === 'citizen_confirmed';
      } else if (statusFilter === 'completed') {
        matchesStatus = st === 'completed' || st === 'approved' || st === 'collected';
      } else if (statusFilter === 'rejected') {
        matchesStatus = st === 'rejected';
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const isPendingA = ['pending', 'awaiting_confirmation', 'citizen_confirmed'].includes((a.status || '').toLowerCase());
      const isPendingB = ['pending', 'awaiting_confirmation', 'citizen_confirmed'].includes((b.status || '').toLowerCase());

      // Pending items ALWAYS go to the top
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;

      // Within same priority, sort by time descending (newest first)
      const getTime = (item) => {
        if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
        if (item.createdAt?.toDate) return item.createdAt.toDate().getTime();
        if (typeof item.createdAt === 'number') return item.createdAt;
        if (typeof item.createdAt === 'string') return new Date(item.createdAt).getTime();
        return 0;
      };

      return getTime(b) - getTime(a);
    });

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

      {/* Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Cari ID Voucher / nama reward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Semua ({redemptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Ditolak
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Memuat voucher penukaran Anda..." />
      ) : filteredAndSortedRedemptions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Voucher"
          description="Tidak ada voucher penukaran yang sesuai dengan filter atau pencarian Anda."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRedemptions.map((red) => {
            const redId = red.redemptionId || red.id;
            const isAwaitingConfirmation = red.status === 'awaiting_confirmation';
            const isPendingStatus = ['pending', 'awaiting_confirmation', 'citizen_confirmed'].includes((red.status || '').toLowerCase());

            return (
              <Card
                key={redId}
                className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isPendingStatus
                    ? 'ring-2 ring-amber-400 dark:ring-amber-600 bg-amber-50/20 dark:bg-amber-950/20'
                    : ''
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-2xl ${
                      isPendingStatus
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {isPendingStatus ? (
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
                        {new Date(red.createdAt?.seconds ? red.createdAt.seconds * 1000 : red.createdAt || Date.now()).toLocaleString('id-ID')}
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
                        : isPendingStatus
                        ? 'bg-amber-500 hover:bg-amber-600'
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
