import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RoleBadge } from '@/features/users/components/StatusBadge';
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
import { MOCK_TRANSACTIONS, MOCK_WASTE_SUMMARY } from '@/constants/mockDashboardData';

export const OfficerDashboard = () => {
  const { userProfile } = useAuth();

  const officerActions = [
    { label: 'Input Transaksi Sampah', path: '/transactions', icon: PlusCircle },
    { label: 'Verifikasi Warga Baru', path: '/admin/users/pending', icon: UserCheck },
    { label: 'Proses Penukaran Reward', path: '/rewards', icon: Gift },
    { label: 'Lihat Laporan Operational', path: '/reports', icon: BarChart3 },
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
          title="Transaksi Hari Ini"
          value={`${MOCK_WASTE_SUMMARY.todayTransactionsCount} Transaksi`}
          subtext="Setoran sampah tercatat hari ini"
          icon={ArrowLeftRight}
          color="emerald"
        />

        {/* Pending Citizen Verification */}
        <MetricCard
          title="Verifikasi Warga Pending"
          value={`${MOCK_WASTE_SUMMARY.pendingVerifications} Warga`}
          subtext="Menunggu penautan rfid & kelengkapan"
          icon={UserCheck}
          color="amber"
          trend={MOCK_WASTE_SUMMARY.pendingVerifications > 0 ? 'Perlu Tindakan' : 'Selesai'}
          trendType={MOCK_WASTE_SUMMARY.pendingVerifications > 0 ? 'negative' : 'positive'}
        />

        {/* Organic Waste Collected */}
        <MetricCard
          title="Sampah Organik Terkumpul"
          value={`${MOCK_WASTE_SUMMARY.todayOrganicKg} kg`}
          subtext="Terkumpul hari ini di pos"
          icon={Leaf}
          color="emerald"
        />

        {/* Inorganic Waste Collected */}
        <MetricCard
          title="Sampah Anorganik Terkumpul"
          value={`${MOCK_WASTE_SUMMARY.todayInorganicKg} kg`}
          subtext="Plastik, kertas, dan logam"
          icon={Recycle}
          color="blue"
        />
      </div>

      {/* 2. Middle Row: Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={MOCK_TRANSACTIONS}
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
