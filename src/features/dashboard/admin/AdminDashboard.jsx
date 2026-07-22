import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
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
  ArrowRight,
} from 'lucide-react';
import { MOCK_COMPOST_SUMMARY } from '@/constants/mockDashboardData';

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    pendingCount: 0,
    activeCitizens: 0,
    activeOfficers: 0,
    rejectedCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await userService.getUserStats();
        setUserStats(stats);
      } catch (err) {
        console.error('Error fetching admin user stats:', err);
      }
    };
    fetchStats();
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
          title="Ringkasan Perangkat"
          value="4 Terhubung"
          subtext="3 Stand Station • 1 Compost Bin"
          icon={Cpu}
          color="blue"
        />

        {/* Compost Monitoring Summary */}
        <MetricCard
          title="Ringkasan Kompos"
          value={`${MOCK_COMPOST_SUMMARY.activeBins}/${MOCK_COMPOST_SUMMARY.totalBins} Bins`}
          subtext={`Suhu rata-rata: ${MOCK_COMPOST_SUMMARY.avgTemperature}°C`}
          icon={Sprout}
          color="purple"
        />

        {/* Reports Summary */}
        <MetricCard
          title="Ringkasan Laporan"
          value="12 Laporan"
          subtext="Performa desa bulan ini"
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

          <SectionCard title="Ringkasan Status Kompos Pintar" description="Sensor IoT live">
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Suhu Rata-rata</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{MOCK_COMPOST_SUMMARY.avgTemperature} °C</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Kelembaban Soil</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{MOCK_COMPOST_SUMMARY.avgHumidity} %</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Kadar Gas Metana</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{MOCK_COMPOST_SUMMARY.avgMethane} PPM</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Air Lindi (Leachate)</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  {MOCK_COMPOST_SUMMARY.leachateStatus}
                </Badge>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
