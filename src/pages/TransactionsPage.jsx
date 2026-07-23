import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  PendingTransactionCard,
  ConfirmTransactionModal,
  UnknownRfidModal,
  TransactionTable,
  TransactionFilters,
  TransactionDetailModal,
  usePendingTransactions,
  useTransactions,
} from '@/features/transactions';
import { transactionService } from '@/services/transactionService';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftRight,
  Scale,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react';

export const TransactionsPage = () => {
  const { userProfile } = useAuth();
  const isOfficer = userProfile?.role === 'officer';

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // RTDB Pending Queue Hook
  const {
    pendingList,
    activePending,
    unknownRfidPending,
    citizenMap,
    isLoading: pendingLoading,
    openConfirmationModal,
    closeConfirmationModal,
    closeUnknownRfidModal,
    handleResumeAfterRfidLinked,
  } = usePendingTransactions({ autoOpenModal: false });

  // Firestore Audit History Hook
  const {
    transactions,
    stats,
    isLoading: historyLoading,
    search,
    setSearch,
    wasteType,
    setWasteType,
    page,
    setPage,
    totalPages,
    totalCount,
    handleResetFilters,
    fetchTransactions,
  } = useTransactions();

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConfirmSubmit = async ({ pendingTx, wasteType: chosenCategory, citizenUser }) => {
    setIsSubmitting(true);
    try {
      const result = await transactionService.confirmTransaction({
        pendingTx,
        wasteType: chosenCategory,
        officerUser: userProfile,
        citizenUser,
      });

      showToast(
        `Transaksi setoran "${result.memberName}" (${result.weightKg} Kg ${result.wasteType}) berhasil dikonfirmasi! +${result.pointEarned} Pts.`
      );
      closeConfirmationModal();
      await fetchTransactions();
    } catch (err) {
      showToast(err.message || 'Gagal mengonfirmasi transaksi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPendingTransaction = async (transactionId, reason) => {
    try {
      await transactionService.cancelPendingTransaction({
        transactionId,
        reason,
        officerId: userProfile?.uid,
      });
      showToast(`Transaksi penimbangan "${transactionId}" telah dibatalkan (${reason}).`, 'error');
    } catch (err) {
      showToast(err.message || 'Gagal membatalkan transaksi.', 'error');
    }
  };

  const handleRfidLinkedResume = ({ pendingTx, citizenUser }) => {
    showToast(`Kartu RFID berhasil ditautkan ke akun "${citizenUser.fullName}"! Re-opening transaksi...`);
    handleResumeAfterRfidLinked({ pendingTx, citizenUser });
  };

  const handleOpenDetail = (tx) => {
    setSelectedTx(tx);
    setDetailModalOpen(true);
  };

  const handleExportCsv = () => {
    if (!transactions.length) return;
    const headers = ['ID Transaksi', 'Member ID', 'Nama Warga', 'Kategori', 'Berat (Kg)', 'Poin', 'Petugas', 'Waktu'];
    const rows = transactions.map((t) => [
      t.transactionId,
      t.memberId || '',
      t.memberName || '',
      t.wasteType || '',
      t.weightKg || (t.weightGram ? t.weightGram / 1000 : 0),
      t.pointEarned || 0,
      t.officerName || '',
      t.createdAt ? new Date(t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt).toLocaleString('id-ID') : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scv_waste_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan CSV transaksi berhasil diunduh.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-900'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Manajemen Transaksi Bank Sampah"
        description="Verifikasi setoran timbangan RFID realtime dan audit riwayat transaksi warga."
        icon={ArrowLeftRight}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </Button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Antrean Transaksi"
          value={`${pendingList.length} Penimbangan`}
          subtext="RTDB Realtime Queue"
          icon={Clock}
          color="amber"
          trend={pendingList.length > 0 ? `${pendingList.length} Antrean` : 'Bersih'}
          trendType={pendingList.length > 0 ? 'negative' : 'positive'}
        />
        <MetricCard
          title="Total Sampah Terkumpul"
          value={`${stats.totalWasteKg || 0} Kg`}
          subtext={`${stats.organicWasteKg || 0} kg Organik • ${stats.inorganicWasteKg || 0} kg Anorganik`}
          icon={Scale}
          color="emerald"
        />
        <MetricCard
          title="Total Poin Diterbitkan"
          value={`${(stats.totalPointsIssued || 0).toLocaleString()} Pts`}
          subtext="Saldo warga terupdate"
          icon={Award}
          color="purple"
        />
        <MetricCard
          title="Total Transaksi Audit"
          value={`${stats.totalTransactions || 0} Record`}
          subtext="Tercatat di Firestore"
          icon={ArrowLeftRight}
          color="blue"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('pending')}
          className="text-xs font-bold gap-2 rounded-xl"
        >
          <Zap className="w-4 h-4" />
          <span>Antrean RTDB Realtime ({pendingList.length})</span>
          {pendingList.length > 0 && (
            <Badge className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.2">NEW</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('history')}
          className="text-xs font-bold gap-2 rounded-xl"
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Transaksi Audit ({totalCount})</span>
        </Button>
      </div>

      {/* TAB 1: Realtime Pending Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingLoading ? (
            <LoadingState message="Mendengarkan antrean timbangan realtime di Realtime Database..." />
          ) : pendingList.length === 0 ? (
            <EmptyState
              title="Antrean Penimbangan Kosong"
              description="Belum ada transaksi tap kartu RFID dari Smart Collection Station di Realtime Database."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingList.map((item) => {
                const cleanRfid = String(item.rfidUid || item.uid || '').trim().toUpperCase();
                const matchedCitizen = citizenMap[cleanRfid] || null;
                return (
                  <PendingTransactionCard
                    key={item.transactionId}
                    pendingItem={item}
                    citizen={matchedCitizen}
                    onConfirm={openConfirmationModal}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Firestore Transaction Audit History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <TransactionFilters
            search={search}
            onSearchChange={setSearch}
            wasteType={wasteType}
            onWasteTypeChange={setWasteType}
            onResetFilters={handleResetFilters}
          />

          {historyLoading ? (
            <LoadingState message="Memuat riwayat transaksi dari Cloud Firestore..." />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="Tidak Ada Riwayat Transaksi"
              description="Tidak ditemukan catatan transaksi yang sesuai dengan filter pencarian Anda."
            />
          ) : (
            <TransactionTable
              transactions={transactions}
              showCitizen={true}
              onViewDetail={handleOpenDetail}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Menampilkan <strong className="text-slate-900 dark:text-slate-100">{transactions.length}</strong> dari <strong className="text-slate-900 dark:text-slate-100">{totalCount}</strong> transaksi
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2 text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Sebelum
                </Button>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Halaman {page} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2 text-xs"
                >
                  Lanjut <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Known Citizens (Officers ONLY) */}
      {isOfficer && activePending && (
        <ConfirmTransactionModal
          isOpen={Boolean(activePending)}
          onClose={closeConfirmationModal}
          onConfirm={handleConfirmSubmit}
          pendingItem={activePending}
          citizen={citizenMap[String(activePending.rfidUid || activePending.uid || '').replace(/\s+/g, '').toUpperCase()] || null}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Unknown RFID Dedicated Modal (Officers ONLY) */}
      {isOfficer && unknownRfidPending && (
        <UnknownRfidModal
          isOpen={Boolean(unknownRfidPending)}
          onClose={closeUnknownRfidModal}
          pendingItem={unknownRfidPending}
          officerUser={userProfile}
          onRfidLinkedAndResume={handleRfidLinkedResume}
          onCancelTransaction={handleCancelPendingTransaction}
        />
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};
