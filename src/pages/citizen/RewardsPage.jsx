import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Gift } from 'lucide-react';

export const RewardsPage = () => {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Reward" description="Tukarkan poin Anda dengan berbagai hadiah yang tersedia." icon={Gift} />
      <EmptyState
        title="Segera Hadir"
        description="Katalog reward sedang disiapkan. Nantikan hadiah menarik dari program Smart Circular Village!"
      />
    </div>
  );
};
