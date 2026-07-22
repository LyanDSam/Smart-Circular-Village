import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardService } from '@/services/rewardService';
import { PageHeader } from '@/components/common/PageHeader';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { Ticket, Gift, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const MyRedemptionsPage = () => {
  const { userProfile, user } = useAuth();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const fetchCitizenRedemptions = async () => {
    setLoading(true);
    try {
      const list = await rewardService.getCitizenRedemptions(userProfile?.uid || user?.uid);
      setRedemptions(list);
    } catch (err) {
      console.error('Error fetching citizen redemptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenRedemptions();
  }, [userProfile?.uid]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title="Voucher Penukaran Saya"
        description="Daftar voucher klaim reward bank sampah Anda. Klik voucher untuk menampilkan QR Code kepada petugas station."
        icon={Gift}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCitizenRedemptions}
          className="text-xs h-9 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </PageHeader>

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
            const isPending = red.status === 'pending';
            const isCompleted = red.status === 'completed';
            const isRejected = red.status === 'rejected';

            return (
              <Card
                key={redId}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl">
                      <Gift className="w-6 h-6" />
                    </div>
                    {isPending && (
                      <Badge variant="warning" className="gap-1 text-[10px]">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Pending</span>
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="success" className="gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <XCircle className="w-3 h-3" />
                        <span>Ditolak</span>
                      </Badge>
                    )}
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 gap-1.5 font-bold shadow-xs"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Tampilkan Voucher QR</span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <RedemptionTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        redemption={selectedRedemption}
      />
    </div>
  );
};
