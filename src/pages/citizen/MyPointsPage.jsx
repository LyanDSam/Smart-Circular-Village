import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';

export const MyPointsPage = () => {
  const { userProfile } = useAuth();
  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Poin Saya" description="Lihat total poin reward dan riwayat perolehan." icon={Award} />
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardContent className="p-8 text-center space-y-3">
          <div className="text-5xl font-extrabold text-emerald-700 dark:text-emerald-400">{(userProfile?.points || 0).toLocaleString()}</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total poin reward Anda saat ini</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Poin dapat ditukarkan dengan reward yang tersedia di Bank Sampah Desa.</p>
        </CardContent>
      </Card>
    </div>
  );
};
