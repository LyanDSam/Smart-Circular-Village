import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftRight,
  Scale,
  Clock,
  Award,
  Sprout,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome */}
      <PageHeader
        title={`Selamat bertugas, ${userProfile?.fullName || 'Petugas'}!`}
        description="Panel operasional Bank Sampah — kelola transaksi, setoran warga, reward, dan monitoring Smart Compost."
        icon={Scale}
      >
        <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs font-bold px-3 py-1">
          Officer
        </Badge>
      </PageHeader>

      {/* Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">Transaksi Hari Ini</span>
              <div className="p-2 bg-blue-600 rounded-xl text-white"><ArrowLeftRight className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-blue-900 dark:text-blue-200">0</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Deposit diterima hari ini</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Berat Hari Ini</span>
              <div className="p-2 bg-emerald-600 rounded-xl text-white"><Scale className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">0 kg</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Total terkumpul</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Warga Pending</span>
              <div className="p-2 bg-amber-500 rounded-xl text-white"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-900 dark:text-amber-200">0</div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Menunggu verifikasi</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">Poin Didistribusikan</span>
              <div className="p-2 bg-purple-500 rounded-xl text-white"><Award className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-purple-900 dark:text-purple-200">0</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Poin hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Smart Compost Live Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Koleksi Sampah Bulanan (Kg)"
          description="Tren organik vs anorganik"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full flex items-center justify-center pt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada data pengumpulan sampah.</p>
          </div>
        </SectionCard>

        {/* Smart Compost Bin Monitoring for Officers */}
        <SectionCard title="Smart Compost Bin #01" description="Monitoring Telemetri Live & Kontrol">
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suhu Kompos</span>
              </div>
              <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500">-- °C</span>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kelembapan</span>
              </div>
              <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500">-- %</span>
            </div>

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gas Metana</span>
              </div>
              <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500">-- PPM</span>
            </div>

            <div className="p-3 bg-slate-900 dark:bg-slate-950 rounded-xl flex justify-between items-center text-xs text-white border border-slate-800">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Aerasi Otomatis</span>
              </div>
              <Badge className="bg-slate-700 dark:bg-slate-800 text-slate-300 font-mono text-[10px]">STANDBY</Badge>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Transactions */}
      <SectionCard title="Transaksi Terakhir" description="Deposit warga terbaru">
        <div className="py-6">
          <EmptyState title="Belum Ada Transaksi" description="Transaksi deposit sampah warga akan muncul di sini." />
        </div>
      </SectionCard>
    </div>
  );
};
