import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import { PointCard } from '@/components/dashboard/PointCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RewardPreview } from '@/components/dashboard/RewardPreview';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import {
  Leaf,
  CreditCard,
  History,
  Gift,
  QrCode,
  Bell,
  Award,
} from 'lucide-react';
import {
  MOCK_CITIZEN_TRANSACTIONS,
  MOCK_REWARDS_PREVIEW,
  MOCK_NOTIFICATIONS,
} from '@/constants/mockDashboardData';

export const CitizenDashboard = () => {
  const { userProfile } = useAuth();

  const citizenPoints = userProfile?.points || 1245; // Placeholder default points if profile not initialized

  const citizenActions = [
    { label: 'Kartu QR Saya', path: '/my-qr', icon: QrCode },
    { label: 'Riwayat Setoran Full', path: '/deposit-history', icon: History },
    { label: 'Katalog Reward', path: '/rewards', icon: Gift },
    { label: 'Notifikasi', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Welcome Header */}
      <PageHeader
        title={`Selamat datang, ${userProfile?.fullName || 'Warga'}!`}
        description="Ringkasan poin, kartu digital, riwayat setoran, dan reward pribadi Anda."
        icon={Leaf}
      >
        <div className="flex items-center gap-2">
          <RoleBadge role="citizen" />
          <StatusBadge status={userProfile?.status || 'active'} />
        </div>
      </PageHeader>

      {/* 2. Top Metric & Digital Identity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point Card */}
        <div className="lg:col-span-2 space-y-4">
          <PointCard
            points={citizenPoints}
            memberId={userProfile?.memberId || 'SCV-26-000101'}
            rfidUid={userProfile?.rfidUid || '8A:3F:1C:90'}
          />

          <QuickActionCard title="Menu Cepat Warga" actions={citizenActions} />
        </div>

        {/* Digital QR Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Kartu QR Digital Warga
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3 pt-0">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <QRCodeDisplay
                value={userProfile?.qrCode || userProfile?.memberId || 'SCV-26-000101'}
                size={140}
              />
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {userProfile?.fullName || 'Budi Santoso'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {userProfile?.memberId || 'SCV-26-000101'}
              </p>
            </div>
            {userProfile?.rfidUid && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>RFID: {userProfile.rfidUid}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Transaction History & Notifications Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={MOCK_CITIZEN_TRANSACTIONS}
            title="Setoran Terakhir & Riwayat"
            description="Preview riwayat setoran sampah pribadi Anda"
            showMember={false}
            isCompact={true}
          />
        </div>

        <div>
          <NotificationPanel
            notifications={MOCK_NOTIFICATIONS}
            title="Pemberitahuan Poin & Sistem"
            description="Notifikasi transaksi pribadi"
          />
        </div>
      </div>

      {/* 4. Reward Preview */}
      <RewardPreview
        rewards={MOCK_REWARDS_PREVIEW}
        userPoints={citizenPoints}
      />
    </div>
  );
};
