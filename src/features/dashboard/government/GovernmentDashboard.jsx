import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WasteChart } from '@/components/dashboard/WasteChart';
import { SectionCard } from '@/components/common/SectionCard';
import { RoleBadge } from '@/features/users/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Recycle,
  Sprout,
  Users,
  FileSpreadsheet,
  Eye,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { MOCK_WASTE_SUMMARY } from '@/constants/mockDashboardData';

export const GovernmentDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Dashboard Pemerintah — ${userProfile?.fullName || 'Perwakilan Dinas / Desa'}`}
        description="Ringkasan eksekutif statistik pengelolaan sampah, produksi kompos, dan partisipasi warga desa."
        icon={Building2}
      >
        <div className="flex items-center gap-2">
          <RoleBadge role="government" />
          <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300">
            <Eye className="w-3.5 h-3.5 mr-1" />
            Mode Read-Only
          </Badge>
        </div>
      </PageHeader>

      {/* 1. Metric Cards for Government (Read-Only Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Waste Statistics */}
        <MetricCard
          title="Statistik Sampah Bulan Ini"
          value={`${MOCK_WASTE_SUMMARY.monthlyTotalKg} kg`}
          subtext="Total sampah terkumpul di desa"
          icon={Recycle}
          color="emerald"
          trend="+12.4% vs bulan lalu"
          trendType="positive"
        />

        {/* Compost Production */}
        <MetricCard
          title="Produksi Kompos Organik"
          value={`${MOCK_WASTE_SUMMARY.compostProducedKg} kg`}
          subtext="Hasil pengolahan smart compost bin"
          icon={Sprout}
          color="purple"
          trend="4 Bin Aktif"
          trendType="neutral"
        />

        {/* Citizen Participation */}
        <MetricCard
          title="Partisipasi Warga"
          value={`${MOCK_WASTE_SUMMARY.activeParticipants} Warga`}
          subtext="Kepala keluarga aktif menyetor"
          icon={Users}
          color="blue"
          trend="85% Tingkat Keaktifan"
          trendType="positive"
        />

        {/* System Reports */}
        <MetricCard
          title="Laporan Terintegrasi"
          value="4 Dokumen"
          subtext="Laporan emisi & circular economy"
          icon={FileSpreadsheet}
          color="slate"
        />
      </div>

      {/* 2. Main Analytics & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WasteChart
            title="Grafik Akumulasi Sampah Desa (Kg)"
            description="Monitoring bulanan pengumpulan sampah organik vs anorganik untuk kebijakan desa"
          />
        </div>

        <div className="space-y-6">
          <SectionCard title="Ringkasan Eksekutif Circular Economy" description="Indikator Kinerja Utama (KPI)">
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  <span>Tingkat Daur Ulang Sampah</span>
                  <span className="font-bold">78.5%</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '78.5%' }} />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-300">
                  <span>Pengurangan Sampah ke TPA</span>
                  <span className="font-bold">62.0%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '62.0%' }} />
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-900 dark:text-purple-300">
                  <span>Konversi Kompos Siap Pakai</span>
                  <span className="font-bold">210 kg / Bulan</span>
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                  Didistribusikan untuk kebun ketahanan pangan desa.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
