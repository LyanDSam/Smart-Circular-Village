import React from 'react';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Award } from 'lucide-react';

export const RecentTransactions = ({
  transactions = [],
  title = 'Transaksi Terakhir',
  description = 'Riwayat penimbangan dan setoran sampah terbaru',
  isCompact = false,
  showMember = true,
  onViewAll,
}) => {
  if (!transactions.length) {
    return (
      <SectionCard title={title} description={description}>
        <div className="py-6">
          <EmptyState
            title="Belum Ada Transaksi"
            description="Belum ada catatan transaksi setoran sampah yang tersedia."
          />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={title} description={description}>
      <div className="overflow-x-auto -mx-6 -mb-6">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6">ID Transaksi</th>
              {showMember && <th className="py-3 px-4">Warga</th>}
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Berat (Kg)</th>
              <th className="py-3 px-4">Poin</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {transactions.slice(0, isCompact ? 5 : 10).map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{tx.id}</span>
                </td>
                {showMember && (
                  <td className="py-3.5 px-4 font-medium">
                    <div>{tx.memberName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.memberId}</div>
                  </td>
                )}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      tx.category?.toLowerCase().includes('organik') && !tx.category?.toLowerCase().includes('anorganik')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {tx.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                  {tx.weightKg} kg
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    +{tx.pointsEarned}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400 text-[11px]">{tx.timestamp}</td>
                <td className="py-3.5 px-6 text-right">
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                    Selesai
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
