import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { rewardService } from '@/services/rewardService';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { RewardFormModal } from '@/features/rewards/components/RewardFormModal';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';
import {
  Gift,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  ShoppingBag,
  Search,
  Filter,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const RewardsPage = () => {
  const { role, userProfile, user } = useAuth();
  const { t } = useClientSettings();
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'redemptions'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Redemption Search & Status Filter state
  const [redemptionSearch, setRedemptionSearch] = useState('');
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'rejected'

  // Modals & Feedback
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Konfirmasi',
    variant: 'primary',
    onConfirm: () => {},
  });

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const canManage = role === 'officer' || role === 'admin';
  const isCitizen = role === 'citizen';
  const userPoints = userProfile?.points ?? 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      const rewardList = await rewardService.getRewards({ activeOnly: !canManage });
      setRewards(rewardList);
    } catch (err) {
      console.error('Error fetching rewards data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, userProfile?.uid]);

  // Real-time listener for Redemptions List
  useEffect(() => {
    const uid = userProfile?.uid || user?.uid;
    if (!uid) return;

    let unsub = () => {};
    if (isCitizen) {
      unsub = rewardService.listenToCitizenRedemptions(uid, (list) => {
        setRedemptions(list);
      });
    } else {
      unsub = rewardService.listenToAllRedemptions((list) => {
        setRedemptions(list);
      });
    }

    return () => unsub();
  }, [isCitizen, userProfile?.uid, user?.uid]);

  // Handle Create/Update Reward Form Submit
  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingReward) {
        await rewardService.updateReward(editingReward.rewardId || editingReward.id, formData);
        showToast(`Item reward "${formData.name}" berhasil diperbarui.`);
      } else {
        await rewardService.createReward(formData);
        showToast(`Item reward baru "${formData.name}" berhasil ditambahkan!`);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan reward.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (reward) => {
    setEditingReward(reward);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingReward(null);
    setIsFormOpen(true);
  };

  // Custom Confirm Delete Reward
  const promptDeleteReward = (rewardId, name) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Reward "${name}"?`,
      description: 'Apakah Anda yakin ingin menghapus item reward ini dari katalog?',
      confirmText: 'Ya, Hapus Reward',
      variant: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await rewardService.deleteReward(rewardId);
          showToast(`Reward "${name}" berhasil dihapus.`);
          fetchData();
        } catch (err) {
          showToast(err.message || 'Gagal menghapus reward.', 'error');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleStatus = async (rewardId, currentStatus) => {
    try {
      await rewardService.toggleRewardStatus(rewardId, currentStatus);
      showToast(`Status reward berhasil diubah menjadi ${!currentStatus ? 'Aktif' : 'Non-Aktif'}.`);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status reward.', 'error');
    }
  };

  // Custom Confirm Citizen Redeem Request
  const promptRedeem = (reward) => {
    if (userPoints < Number(reward.pointsRequired)) {
      showToast(`Poin Anda (${userPoints}) tidak cukup untuk menukar ${reward.name} (${reward.pointsRequired} poin).`, 'error');
      return;
    }
    if (Number(reward.stock) <= 0) {
      showToast('Stok barang ini sedang habis.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Tukarkan "${reward.name}"?`,
      description: `Konfirmasi permohonan penukaran reward dengan ${reward.pointsRequired} poin. Voucher QR Code akan langsung diterbitkan.`,
      confirmText: 'Ya, Tukarkan Poin',
      variant: 'primary',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const redemption = await rewardService.requestRedemption(
            userProfile?.uid || user?.uid,
            userProfile,
            reward.rewardId || reward.id
          );
          showToast(`Permohonan penukaran "${reward.name}" berhasil diajukan! Voucher QR Code siap diproses petugas.`);
          setSelectedRedemption(redemption);
          setTicketModalOpen(true);
          fetchData();
        } catch (err) {
          showToast(err.message || 'Gagal mengajukan penukaran.', 'error');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filter rewards
  const filteredRewards = rewards.filter((r) => {
    const titleMatch = (r.name || r.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = filterCategory === 'all' || (r.category || 'embako').toLowerCase() === filterCategory.toLowerCase();
    return (titleMatch || descMatch) && catMatch;
  });

  // Sort and Filter Redemptions: Pending always at top, sorted by time descending
  const filteredAndSortedRedemptions = redemptions
    .filter((red) => {
      const redId = (red.redemptionId || red.id || '').toLowerCase();
      const rewardName = (red.rewardName || red.rewardTitle || '').toLowerCase();
      const userName = (red.userName || '').toLowerCase();
      const query = redemptionSearch.toLowerCase().trim();

      const matchesSearch = !query || redId.includes(query) || rewardName.includes(query) || userName.includes(query);

      const st = (red.status || '').toLowerCase();
      let matchesStatus = true;
      if (redemptionStatusFilter === 'pending') {
        matchesStatus = st === 'pending' || st === 'awaiting_confirmation' || st === 'citizen_confirmed';
      } else if (redemptionStatusFilter === 'completed') {
        matchesStatus = st === 'completed' || st === 'approved' || st === 'collected';
      } else if (redemptionStatusFilter === 'rejected') {
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

  if (loading) {
    return <LoadingState message="Memuat katalog reward..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title={canManage ? 'Kelola Katalog Reward' : 'Katalog Reward Bank Sampah'}
        description={
          canManage
            ? 'Kelola barang reward, atur poin required, jumlah stok, dan pantau klaim voucher warga.'
            : `Tukarkan poin setoran sampah Anda (${userPoints.toLocaleString()} Pts) dengan berbagai barang reward bermanfaat.`
        }
        icon={Gift}
      >
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              onClick={handleOpenCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9 font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Reward</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs h-9 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

      {/* Toast Feedback */}
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

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Katalog Barang ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'redemptions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isCitizen ? `Voucher Penukaran Saya (${redemptions.length})` : `Semua Voucher (${redemptions.length})`}
          </button>
        </div>
      </div>

      {/* ─── TAB 1: REWARD CATALOG ─── */}
      {activeTab === 'catalog' && (
        <>
          {/* Search & Category Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari barang reward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-hidden"
              >
                <option value="all">Semua Kategori</option>
                <option value="embako">Sembako & Pangan</option>
                <option value="peralatan">Peralatan Rumah Tangga</option>
                <option value="voucher">Voucher Listrik</option>
                <option value="pupuk">Pupuk Organik SCV</option>
              </select>
            </div>
          </div>

          {filteredRewards.length === 0 ? (
            <EmptyState
              title="Tidak Ada Reward"
              description={canManage ? 'Belum ada barang reward yang didaftarkan. Klik tombol di bawah untuk menambah barang pertama.' : 'Katalog reward sedang kosong.'}
              actionText={canManage ? 'Tambah Reward Baru' : null}
              onAction={canManage ? handleOpenCreate : null}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((r) => {
                const requiredPts = Number(r.pointsRequired || 0);
                const stockAmt = Number(r.stock || 0);
                const isOutOfStock = stockAmt <= 0;
                const isInsufficientPoints = isCitizen && userPoints < requiredPts;
                const isDisabledRedeem = isOutOfStock || isInsufficientPoints || !r.isActive;

                return (
                  <Card
                    key={r.rewardId || r.id}
                    className={`border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden transition-all ${
                      !r.isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-950' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Reward Image / Icon */}
                      <div className="h-40 w-full bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 relative">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <Gift className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <Badge className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-xs shadow-md">
                          {requiredPts.toLocaleString()} PTS
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                            {r.name || r.title}
                          </h3>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                            {r.category || 'embako'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {r.description || 'Barang reward resmi Bank Sampah SCV.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className={`font-semibold ${stockAmt > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 font-bold'}`}>
                          Stok: {stockAmt} Item
                        </span>
                        {!r.isActive && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                            Non-Aktif
                          </Badge>
                        )}
                      </div>

                      {/* Redeem Action for Citizen */}
                      {isCitizen && (
                        <Button
                          onClick={() => promptRedeem(r)}
                          disabled={actionLoading || isDisabledRedeem}
                          className={`w-full text-xs h-10 gap-1.5 font-bold ${
                            isDisabledRedeem
                              ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {isOutOfStock
                              ? 'Stok Habis'
                              : isInsufficientPoints
                              ? `Poin Kurang (${userPoints}/${requiredPts})`
                              : 'Tukarkan Poin'}
                          </span>
                        </Button>
                      )}

                      {/* Manage Actions for Officer/Admin */}
                      {canManage && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            onClick={() => handleOpenEdit(r)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-9 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            onClick={() => handleToggleStatus(r.rewardId || r.id, r.isActive !== false)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-9 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {r.isActive !== false ? 'Matikan' : 'Aktifkan'}
                          </Button>
                          <Button
                            onClick={() => promptDeleteReward(r.rewardId || r.id, r.name || r.title)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-9 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: REDEMPTION VOUCHERS LIST ─── */}
      {activeTab === 'redemptions' && (
        <SectionCard
          title={isCitizen ? 'Voucher Penukaran Saya' : 'Daftar Semua Voucher Penukaran'}
          description="Voucher penukaran yang dibuat warga. Tunjukkan Voucher QR Code kepada petugas untuk verifikasi."
        >
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari ID Voucher / nama / reward..."
                value={redemptionSearch}
                onChange={(e) => setRedemptionSearch(e.target.value)}
                className="pl-9 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRedemptionStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  redemptionStatusFilter === 'all'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Semua ({redemptions.length})
              </button>
              <button
                onClick={() => setRedemptionStatusFilter('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  redemptionStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setRedemptionStatusFilter('completed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  redemptionStatusFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Selesai
              </button>
              <button
                onClick={() => setRedemptionStatusFilter('rejected')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                  redemptionStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                Ditolak
              </button>
            </div>
          </div>

          {filteredAndSortedRedemptions.length === 0 ? (
            <EmptyState title="Tidak Ada Voucher" description="Tidak ada data voucher penukaran yang sesuai dengan filter atau pencarian Anda." />
          ) : (
            <div className="space-y-3 pt-1">
              {filteredAndSortedRedemptions.map((red) => {
                const st = (red.status || '').toLowerCase();
                const isPending = st === 'pending' || st === 'awaiting_confirmation' || st === 'citizen_confirmed';

                return (
                  <div
                    key={red.redemptionId || red.id}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                      isPending
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs ring-1 ring-amber-400/50'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {red.rewardName || red.rewardTitle}
                        </span>
                        <StatusBadge status={red.status} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pemohon: <span className="font-bold text-slate-800 dark:text-slate-200">{red.userName}</span> ({red.userMemberId || 'N/A'}) •{' '}
                        <span className="font-mono text-emerald-600 font-extrabold">{red.pointsRequired || red.pointsUsed} Pts</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Redemption ID: <strong className="text-slate-700 dark:text-slate-300">{red.redemptionId || red.id}</strong> •{' '}
                        <span>
                          {new Date(red.createdAt?.seconds ? red.createdAt.seconds * 1000 : red.createdAt || Date.now()).toLocaleString('id-ID')}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedRedemption(red);
                          setTicketModalOpen(true);
                        }}
                        className={`text-xs h-9 gap-1.5 font-bold shadow-xs ${
                          isPending
                            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700'
                        }`}
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{isPending ? 'Proses Voucher QR' : 'Lihat Voucher QR'}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* Dialog Modals */}
      <RewardFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingReward}
        isSubmitting={actionLoading}
      />

      <RedemptionTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        redemption={selectedRedemption}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={actionLoading}
      />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'collected':
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
    case 'pending':
    default:
      return (
        <Badge variant="warning" className="gap-1 text-[10px]">
          <Clock className="w-3 h-3 animate-spin" />
          <span>Pending</span>
        </Badge>
      );
  }
};
