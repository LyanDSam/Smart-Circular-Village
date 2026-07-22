import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RoleBadge } from '@/features/users/components/StatusBadge';
import { transactionService } from '@/services/transactionService';
import { userService } from '@/services/userService';
import {
  Scale,
  ArrowLeftRight,
  UserCheck,
  Leaf,
  Recycle,
  PlusCircle,
  BarChart3,
  Gift,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalWasteKg: 0,
    organicWasteKg: 0,
    inorganicWasteKg: 0,
  });
  const [userStats, setUserStats] = useState({ pendingCount: 0 });
  const [recentTxs, setRecentTxs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLiveOfficerData() {
      setIsLoading(true);
      try {
        const txStats = await transactionService.getTransactionStats();
        setStats(txStats);

        const uStats = await userService.getUserStats();
        setUserStats(uStats);

        const { transactions } = await transactionService.getTransactions({ pageSize: 5 });
        setRecentTxs(transactions);
      } catch (err) {
        console.warn('Error loading officer dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveOfficerData();
  }, []);

  const officerActions = [
    { label: 'Input Transaksi Sampah', path: '/transactions', icon: PlusCircle },
    { label: 'Verifikasi Warga Baru', path: '/admin/users/pending', icon: UserCheck },
    { label: 'Proses Penukaran Reward', path: '/rewards', icon: Gift },
    { label: 'Lihat Laporan Operasional', path: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Dashboard Petugas — ${userProfile?.fullName || 'Petugas'}`}
        description="Monitoring transaksi harian dan verifikasi pendaftaran warga di pos pengumpulan."
        icon={Scale}
      >
        <RoleBadge role="officer" />
      </PageHeader>

      {/* 1. Metric Cards for Officer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Transactions */}
        <MetricCard
          title="Total Transaksi Audit"
          value={`${stats.totalTransactions} Transaksi`}
          subtext="Setoran sampah tercatat di Firestore"
          icon={ArrowLeftRight}
          color="emerald"
        />

        {/* Pending Citizen Verification */}
        <MetricCard
          title="Verifikasi Warga Pending"
          value={`${userStats.pendingCount} Warga`}
          subtext="Menunggu penautan RFID & persetujuan"
          icon={UserCheck}
          color="amber"
          trend={userStats.pendingCount > 0 ? 'Perlu Tindakan' : 'Selesai'}
          trendType={userStats.pendingCount > 0 ? 'negative' : 'positive'}
        />

        {/* Organic Waste Collected */}
        <MetricCard
          title="Sampah Organik Terkumpul"
          value={`${stats.organicWasteKg} kg`}
          subtext="Terkumpul di pos pengumpulan"
          icon={Leaf}
          color="emerald"
        />

        {/* Inorganic Waste Collected */}
        <MetricCard
          title="Sampah Anorganik Terkumpul"
          value={`${stats.inorganicWasteKg} kg`}
          subtext="Plastik, kertas, dan logam"
          icon={Recycle}
          color="blue"
        />
      </div>

      {/* 2. Middle Row: Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={recentTxs}
            title="Transaksi Terbaru"
            description="Daftar setoran sampah warga terkini di Pos Pengumpulan"
            showMember={true}
          />
        </div>

        <div className="space-y-6">
          <QuickActionCard title="Aksi Cepat Petugas" actions={officerActions} />
        </div>
      </div>
    </div>
  );
};
