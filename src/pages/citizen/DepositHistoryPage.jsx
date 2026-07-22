import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions, TransactionTable, TransactionDetailModal } from '@/features/transactions';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PointCard } from '@/components/dashboard/PointCard';
import { History, Award } from 'lucide-react';

export const DepositHistoryPage = () => {
  const { userProfile } = useAuth();
  const userId = userProfile?.uid;

  const [selectedTx, setSelectedTx] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { transactions, isLoading } = useTransactions({ citizenId: userId });

  const handleOpenDetail = (tx) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Riwayat Setoran Sampah Saya"
        description="Daftar lengkap deposit sampah dan perolehan poin reward Anda di Bank Sampah SCV."
        icon={History}
      />

      {/* Point Card Summary */}
      <PointCard
        points={userProfile?.points || 0}
        memberId={userProfile?.memberId || 'SCV-26-000101'}
        rfidUid={userProfile?.rfidUid || null}
      />

      {/* Transaction List */}
      {isLoading ? (
        <LoadingState message="Memuat riwayat deposit sampah Anda..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Belum Ada Riwayat Setoran"
          description="Setoran sampah yang Anda lakukan di Pos Pengumpulan akan otomatis tercatat di sini."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Catatan Setoran ({transactions.length})
            </h4>
          </div>
          <TransactionTable
            transactions={transactions}
            showCitizen={false}
            onViewDetail={handleOpenDetail}
          />
        </div>
      )}

      {/* Detail Modal */}
      <TransactionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
