import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { History } from 'lucide-react';

export const DepositHistoryPage = () => {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Riwayat Setoran" description="Semua deposit sampah yang telah Anda lakukan." icon={History} />
      <EmptyState
        title="Belum Ada Setoran"
        description="Riwayat deposit sampah Anda akan muncul di sini setelah melakukan setoran di Bank Sampah."
      />
    </div>
  );
};
