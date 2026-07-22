import React from 'react';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Award } from 'lucide-react';

export const RewardPreview = ({ rewards = [], onRedeem, userPoints = 0 }) => {
  if (!rewards.length) {
    return (
      <SectionCard title="Reward Tersedia" description="Tukarkan poin Anda dengan reward menarik">
        <div className="py-6">
          <EmptyState title="Belum Ada Reward" description="Katalog reward belum tersedia saat ini." />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Reward Tersedia" description="Tukarkan poin reward Anda dari bank sampah">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((rwd) => {
          const isAffordable = userPoints >= rwd.pointsCost;
          return (
            <Card key={rwd.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Stok: {rwd.stock}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{rwd.name}</h4>
                  <div className="flex items-center gap-1 mt-1 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    <Award className="w-4 h-4" />
                    <span>{rwd.pointsCost.toLocaleString()} Poin</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!isAffordable || rwd.stock <= 0}
                  className="w-full text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  onClick={() => onRedeem && onRedeem(rwd)}
                >
                  {rwd.stock <= 0 ? 'Stok Habis' : isAffordable ? 'Tukarkan Poin' : 'Poin Kurang'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionCard>
  );
};
