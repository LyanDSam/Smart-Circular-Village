import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { deviceService } from '@/services/deviceService';
import { transactionService } from '@/services/transactionService';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { WasteChart } from '@/components/dashboard/WasteChart';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Users,
  Clock,
  Cpu,
  Sprout,
  FileSpreadsheet,
  UserCheck,
  UserPlus,
  Settings,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    pendingCount: 0,
    activeCitizens: 0,
    activeOfficers: 0,
    rejectedCount: 0,
  });
  const [deviceStats, setDeviceStats] = useState({
    totalCount: 0,
    onlineCount: 0,
    offlineCount: 0,
    compostBinsCount: 0,
    stationsCount: 0,
  });
  const [txStats, setTxStats] = useState({
    totalTransactions: 0,
    totalWasteKg: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const uStats = await userService.getUserStats();
        setUserStats(uStats);

        const dStats = await deviceService.getDeviceStats();
        setDeviceStats(dStats);

        const tStats = await transactionService.getTransactionStats();
        setTxStats(tStats);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      }
    };
    fetchAdminStats();
  }, []);

  const adminActions = [
    { label: 'Verifikasi Warga Pending', path: '/admin/users/pending', icon: UserCheck },
    { label: 'Tambah Petugas Baru', path: '/admin/officers', icon: UserPlus },
    { label: 'Kelola Perangkat IoT', path: '/devices', icon: Cpu },
    { label: 'Pengaturan Sistem', path: '/settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Panel Administrator — ${userProfile?.fullName || 'Admin'}`}
        description="Pusat kendali utama Smart Circular Village (SCV)."
        icon={ShieldAlert}
      >
        <Badge variant="default" className="text-xs px-3 py-1 bg-emerald-600">
          Super Admin
        </Badge>
      </PageHeader>

      {/* 1. System Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <MetricCard
          title="Total Pengguna"
          value={userStats.totalUsers}
          subtext={`${userStats.activeCitizens} Warga • ${userStats.activeOfficers} Petugas`}
          icon={Users}
          color="emerald"
        />

        {/* Pending Verification */}
        <MetricCard
          title="Verifikasi Pending"
          value={userStats.pendingCount}
          subtext="Menunggu penautan RFID"
          icon={Clock}
          color="amber"
          trend={userStats.pendingCount > 0 ? `${userStats.pendingCount} Perlu Tindakan` : 'Bersih'}
          trendType={userStats.pendingCount > 0 ? 'negative' : 'positive'}
        />

        {/* Device Summary */}
        <MetricCard
          title="Perangkat IoT"
          value={`${deviceStats.totalCount} Perangkat`}
          subtext={`${deviceStats.onlineCount} Online • ${deviceStats.offlineCount} Offline`}
          icon={Cpu}
          color="blue"
        />

        {/* Compost Monitoring Summary */}
        <MetricCard
          title="Sampah Terkumpul"
          value={`${txStats.totalWasteKg} Kg`}
          subtext="Total sampah terolah"
          icon={Sprout}
          color="purple"
        />

        {/* Reports Summary */}
        <MetricCard
          title="Total Audit"
          value={`${txStats.totalTransactions} Record`}
          subtext="Transaksi di Firestore"
          icon={FileSpreadsheet}
          color="slate"
        />
      </div>

      {/* 2. Middle Row: Waste Chart & Compost / Device Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WasteChart
            title="Tren Pengumpulan Sampah Desa"
            description="Perbandingan bulanan sampah organik vs anorganik"
          />
        </div>

        <div className="space-y-6">
          <QuickActionCard title="Tindakan Cepat Admin" actions={adminActions} />

          <SectionCard title="Ringkasan Perangkat IoT" description="Status konektivitas realtime">
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Station Penimbangan</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{deviceStats.stationsCount} Perangkat</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Bak Kompos Pintar</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{deviceStats.compostBinsCount} Perangkat</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Status Perangkat Online</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  {deviceStats.onlineCount} Online
                </Badge>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
