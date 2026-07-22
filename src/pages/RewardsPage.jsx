import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { rewardService } from '@/services/rewardService';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Gift,
  Plus,
  Trash2,
  Edit,
  XCircle,
  Package,
  RefreshCw,
  ShoppingBag,
  Check,
  Search,
  Filter,
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
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal / Form state for Authorized CRUD (Officer & Admin)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsRequired: 500,
    stock: 10,
    isActive: true,
  });

  const canManage = role === 'officer' || role === 'admin';
  const isCitizen = role === 'citizen';

  const fetchData = async () => {
    setLoading(true);
    try {
      const rewardList = await rewardService.getRewards({ activeOnly: !canManage });
      setRewards(rewardList);

      if (isCitizen) {
        const citizenReds = await rewardService.getCitizenRedemptions(userProfile?.uid || user?.uid);
        setRedemptions(citizenReds);
      } else {
        const allReds = await rewardService.getAllRedemptions();
        setRedemptions(allReds);
      }
    } catch (err) {
      console.error('Error fetching rewards data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, userProfile]);

  // Authorized CRUD handlers
  const handleOpenForm = (reward = null) => {
    if (!canManage) return;
    if (reward) {
      setEditingReward(reward);
      setFormData({
        title: reward.title,
        description: reward.description || '',
        pointsRequired: reward.pointsRequired,
        stock: reward.stock,
        isActive: reward.isActive !== false,
      });
    } else {
      setEditingReward(null);
      setFormData({
        title: '',
        description: '',
        pointsRequired: 500,
        stock: 10,
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveReward = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setActionLoading(true);
    try {
      if (editingReward) {
        await rewardService.updateReward(editingReward.id, formData);
      } else {
        await rewardService.createReward(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!canManage) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus item reward ini?')) return;
    setActionLoading(true);
    try {
      await rewardService.deleteReward(rewardId);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (rewardId, currentStatus) => {
    if (!canManage) return;
    try {
      await rewardService.toggleRewardStatus(rewardId, currentStatus);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Citizen Redeem handler
  const handleRedeem = async (reward) => {
    if (!window.confirm(`Tukarkan "${reward.title}" dengan ${reward.pointsRequired} poin?`)) return;
    setActionLoading(true);
    try {
      await rewardService.redeemReward(
        userProfile?.uid || user?.uid,
        userProfile?.fullName || 'Citizen',
        reward.id
      );
      alert(`Permohonan penukaran "${reward.title}" berhasil diajukan!`);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Officer / Admin Redemption Status Update handler
  const handleUpdateRedemptionStatus = async (redemptionId, newStatus) => {
    if (!canManage) return;
    setActionLoading(true);
    try {
      await rewardService.updateRedemptionStatus(
        redemptionId,
        newStatus,
        userProfile?.uid || user?.uid || 'operator'
      );
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter rewards by search query & status
  const filteredRewards = rewards.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && r.isActive !== false) ||
      (filterStatus === 'inactive' && r.isActive === false);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingState message={t('loadingRewardsData')} />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title={canManage ? t('rewardsTitleAdmin') : t('rewardsTitleCitizen')}
        description={canManage ? t('rewardsDescAdmin') : t('rewardsDescCitizen')}
        icon={Gift}
      >
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              onClick={() => handleOpenForm()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addReward')}</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs h-9 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('refresh')}</span>
          </Button>
        </div>
      </PageHeader>

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
            {t('rewardCatalogTab')} ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'redemptions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('redemptionHistoryTab')} ({redemptions.length})
          </button>
        </div>

        {canManage && (
          <Badge variant="outline" className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 gap-1 hidden sm:flex">
            <Check className="w-3 h-3" />
            {t('userAccess')} ({role.toUpperCase()})
          </Badge>
        )}
      </div>

      {/* ─── TAB 1: REWARD CATALOG ─── */}
      {activeTab === 'catalog' && (
        <>
          {/* Form Modal / Card for Authorized Roles */}
          {isFormOpen && canManage && (
            <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{editingReward ? t('editReward') : t('addReward')}</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} className="text-xs">
                    {t('cancel')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveReward} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t('rewardName')} *</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Minyak Goreng 1L"
                      className="bg-white dark:bg-slate-950 text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t('pointsRequired')} *</label>
                    <Input
                      type="number"
                      required
                      min={1}
                      value={formData.pointsRequired}
                      onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                      className="bg-white dark:bg-slate-950 text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t('stockAmount')} *</label>
                    <Input
                      type="number"
                      required
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="bg-white dark:bg-slate-950 text-xs h-9"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t('descriptionLabel')}</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="..."
                      className="bg-white dark:bg-slate-950 text-xs h-9"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold">{t('activeStatusLabel')}</span>
                    </label>

                    <Button type="submit" disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      {actionLoading ? t('saving') : editingReward ? t('edit') : t('saveReward')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {canManage && (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
            )}
          </div>

          {filteredRewards.length === 0 ? (
            <EmptyState
              title={t('noRewardsTitle')}
              description={canManage ? t('noRewardsDescAdmin') : t('noRewardsDescCitizen')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map((r) => (
                <Card
                  key={r.id}
                  className={`border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all ${
                    !r.isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-950' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                        <Gift className="w-5 h-5" />
                      </div>
                      <Badge className="bg-emerald-600 text-white font-extrabold text-xs">
                        {r.pointsRequired} pts
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{r.description || '...'}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className={`font-semibold ${r.stock > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 dark:text-red-400 font-bold'}`}>
                        {t('stockLabel')}: {r.stock} {t('items')}
                      </span>
                      {!r.isActive && <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">{t('inactive')}</Badge>}
                    </div>

                    {/* Actions based on Permissions */}
                    <div className="pt-2">
                      {isCitizen && (
                        <Button
                          onClick={() => handleRedeem(r)}
                          disabled={actionLoading || r.stock <= 0 || (userProfile?.points || 0) < r.pointsRequired}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {r.stock <= 0
                              ? t('outOfStock')
                              : (userProfile?.points || 0) < r.pointsRequired
                              ? t('insufficientPoints')
                              : t('redeemPoints')}
                          </span>
                        </Button>
                      )}

                      {canManage && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleOpenForm(r)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> {t('edit')}
                          </Button>
                          <Button
                            onClick={() => handleToggleStatus(r.id, r.isActive !== false)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {r.isActive !== false ? t('deactivate') : t('activate')}
                          </Button>
                          <Button
                            onClick={() => handleDeleteReward(r.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: REDEMPTION HISTORY & PROCESSING ─── */}
      {activeTab === 'redemptions' && (
        <SectionCard
          title={canManage ? t('redemptionQueueTitle') : t('redemptionHistoryTitle')}
          description={canManage ? t('redemptionQueueDesc') : t('redemptionHistoryDesc')}
        >
          {redemptions.length === 0 ? (
            <EmptyState title={t('noRedemptionsTitle')} description={t('noRedemptionsDesc')} />
          ) : (
            <div className="space-y-3 pt-3">
              {redemptions.map((red) => (
                <div
                  key={red.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{red.rewardTitle}</span>
                      <RedemptionStatusBadge status={red.status} t={t} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('applicant')}: <span className="font-semibold text-slate-800 dark:text-slate-200">{red.userName}</span> • {red.pointsUsed} pts
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">ID: {red.id}</p>
                  </div>

                  {/* Actions for Authorized Roles */}
                  {canManage && (
                    <div className="flex items-center gap-2">
                      {red.status === 'requested' && (
                        <>
                          <Button
                            onClick={() => handleUpdateRedemptionStatus(red.id, 'approved')}
                            disabled={actionLoading}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> {t('approve')}
                          </Button>
                          <Button
                            onClick={() => handleUpdateRedemptionStatus(red.id, 'rejected')}
                            disabled={actionLoading}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> {t('reject')}
                          </Button>
                        </>
                      )}

                      {red.status === 'approved' && (
                        <Button
                          onClick={() => handleUpdateRedemptionStatus(red.id, 'collected')}
                          disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1"
                        >
                          <Package className="w-3.5 h-3.5" /> {t('markCollected')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

const RedemptionStatusBadge = ({ status, t }) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">{t ? t('approved') : 'Approved'}</Badge>;
    case 'collected':
      return <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]">Collected</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 text-[10px]">{t ? t('rejected') : 'Rejected'}</Badge>;
    case 'requested':
    default:
      return <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px]">{t ? t('pending') : 'Pending'}</Badge>;
  }
};
