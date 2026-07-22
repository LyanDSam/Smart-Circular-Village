import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Scale,
  Sprout,
  BarChart3,
} from 'lucide-react';

export const GovernmentDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome */}
      <PageHeader
        title={`Dashboard Pemerintah Desa`}
        description="Ringkasan statistik pengelolaan sampah dan partisipasi warga Smart Circular Village."
        icon={Building2}
      >
        <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs font-bold px-3 py-1">
          Government (Read-Only)
        </Badge>
      </PageHeader>

      {/* Village Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Warga</span>
              <div className="p-2 bg-blue-500 rounded-xl text-white"><Users className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">0</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Warga terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sampah Terkumpul</span>
              <div className="p-2 bg-emerald-500 rounded-xl text-white"><Scale className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">0 kg</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">0% bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kompos Dihasilkan</span>
              <div className="p-2 bg-green-600 rounded-xl text-white"><Sprout className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">0 kg</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Siap distribusi pertanian</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Partisipasi Warga</span>
              <div className="p-2 bg-amber-500 rounded-xl text-white"><BarChart3 className="w-5 h-5" /></div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">0%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dari total warga terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Tren Pengumpulan Sampah Bulanan"
          description="Volume organik vs anorganik per bulan (kg)"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full flex items-center justify-center pt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada statistik pengumpulan sampah desa.</p>
          </div>
        </SectionCard>

        <SectionCard title="Komposisi Sampah" description="Persentase jenis sampah terkumpul">
          <div className="h-64 w-full flex items-center justify-center pt-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada data komposisi sampah.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
