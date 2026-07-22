import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import {
  Award,
  CreditCard,
  History,
  TrendingUp,
  Leaf,
  ShieldCheck,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { userProfile } = useAuth();

  const memberPoints = userProfile?.points || 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Header */}
      <PageHeader
        title={`Selamat datang, ${userProfile?.fullName || 'Warga'}!`}
        description="Kelola setoran sampah, pantau poin reward, dan lihat riwayat transaksi Anda."
        icon={Leaf}
      >
        <div className="flex items-center gap-2">
          <RoleBadge role="citizen" />
          <StatusBadge status={userProfile?.status} />
        </div>
      </PageHeader>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Points */}
        <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Poin</span>
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">{memberPoints.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Poin reward terkumpul</p>
          </CardContent>
        </Card>

        {/* Member ID */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member ID</span>
              <div className="p-2 bg-slate-800 dark:bg-slate-700 rounded-xl text-white shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">{userProfile?.memberId || 'N/A'}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">RFID: {userProfile?.rfidUid || 'Belum ditautkan'}</p>
          </CardContent>
        </Card>

        {/* Total Deposits */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Setoran</span>
              <div className="p-2 bg-blue-500 rounded-xl text-white shadow-xs">
                <History className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">0</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transaksi bulan ini</p>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tren Bulan Ini</span>
              <div className="p-2 bg-amber-500 rounded-xl text-white shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              0%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Belum ada aktivitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Points Chart */}
        <SectionCard
          title="Perolehan Poin Bulanan"
          description="Poin reward dari setoran sampah setiap bulan"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full flex items-center justify-center pt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada riwayat perolehan poin.</p>
          </div>
        </SectionCard>

        {/* Member Digital Identity Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Kartu Keanggotaan Warga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 w-full text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">MEMBER ID</span>
              <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{userProfile?.memberId || 'N/A'}</div>
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{userProfile?.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile?.email}</p>
            </div>
            {userProfile?.rfidUid ? (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>RFID: {userProfile.rfidUid}</span>
              </div>
            ) : (
              <div className="text-xs italic text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                RFID Belum Ditautkan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Recent Transactions & Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Setoran Terakhir" description="Riwayat deposit sampah terbaru Anda">
          <div className="py-6">
            <EmptyState title="Belum Ada Setoran" description="Setoran sampah yang Anda lakukan akan tercatat di sini." />
          </div>
        </SectionCard>

        <SectionCard title="Reward Tersedia" description="Tukarkan poin Anda dengan reward berikut">
          <div className="py-6">
            <EmptyState title="Belum Ada Reward" description="Katalog reward belum tersedia." />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
