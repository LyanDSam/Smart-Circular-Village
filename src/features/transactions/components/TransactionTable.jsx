import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Award, ExternalLink, User } from 'lucide-react';
import { pointService, WASTE_CATEGORIES } from '@/services/pointService';

export const TransactionTable = ({
  transactions = [],
  showCitizen = true,
  onViewDetail,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">ID Transaksi</th>
              {showCitizen && <th className="py-3.5 px-4">Warga</th>}
              <th className="py-3.5 px-4">Kategori Sampah</th>
              <th className="py-3.5 px-4">Berat (Kg)</th>
              <th className="py-3.5 px-4">Poin Diperoleh</th>
              <th className="py-3.5 px-4">Waktu Setor</th>
              <th className="py-3.5 px-4 text-right">Aksi / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {transactions.map((tx) => {
              const catObj = WASTE_CATEGORIES.find(
                (c) => c.key.toLowerCase() === (tx.wasteType || '').toLowerCase()
              );
              const badgeClass = catObj?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200';
              const weightKg = tx.weightKg ? `${tx.weightKg} Kg` : pointService.formatWeightKg(tx.weightGram || 0);

              return (
                <tr key={tx.transactionId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Transaction ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{tx.transactionId}</span>
                  </td>

                  {/* Citizen Name & ID */}
                  {showCitizen && (
                    <td className="py-3.5 px-4 font-medium">
                      <div>{tx.memberName || 'Warga SCV'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.memberId || tx.rfidUid}</div>
                    </td>
                  )}

                  {/* Category Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                      {tx.wasteType || 'Organic'}
                    </span>
                  </td>

                  {/* Weight */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {weightKg}
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      +{tx.pointEarned?.toLocaleString() || 0} Pts
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {tx.createdAt ? new Date(tx.createdAt?.toDate ? tx.createdAt.toDate() : tx.createdAt).toLocaleString('id-ID') : 'N/A'}
                  </td>

                  {/* Status & Detail */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">
                        Selesai
                      </Badge>
                      {onViewDetail && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail(tx)}
                          className="h-7 px-2 text-slate-500 hover:text-emerald-600"
                          title="Detail Transaksi"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
