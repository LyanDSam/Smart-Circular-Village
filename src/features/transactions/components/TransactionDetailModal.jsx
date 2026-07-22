import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pointService, WASTE_CATEGORIES } from '@/services/pointService';
import {
  X,
  ArrowLeftRight,
  User,
  Scale,
  Award,
  Calendar,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const TransactionDetailModal = ({ isOpen = false, onClose, transaction = null }) => {
  if (!isOpen || !transaction) return null;

  const catObj = WASTE_CATEGORIES.find(
    (c) => c.key.toLowerCase() === (transaction.wasteType || '').toLowerCase()
  );
  const badgeClass = catObj?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200';
  const weightKg = transaction.weightKg ? `${transaction.weightKg} Kg` : pointService.formatWeightKg(transaction.weightGram || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Detail Transaksi Setoran</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Header Highlight Card */}
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 font-mono block">
                {transaction.transactionId}
              </span>
              <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 font-mono mt-0.5">
                +{transaction.pointEarned?.toLocaleString() || 0} Pts
              </div>
            </div>
            <Badge variant="outline" className={`text-xs px-3 py-1 font-bold ${badgeClass}`}>
              {transaction.wasteType || 'Organic'}
            </Badge>
          </div>

          {/* Details List */}
          <div className="space-y-3 pt-1 text-xs">
            {/* Citizen Details */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Warga Penyetor
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{transaction.memberName || 'Warga SCV'}</div>
              <div className="text-slate-500 font-mono text-[11px]">Member ID: {transaction.memberId || 'SCV-26-000101'}</div>
              <div className="text-slate-400 font-mono text-[11px]">RFID UID: {transaction.rfidUid}</div>
            </div>

            {/* Weight & Station Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-blue-600" /> Berat Sampah
                </span>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-mono mt-0.5">{weightKg}</div>
                <div className="text-[11px] text-slate-400">({transaction.weightGram || 0} gram)</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" /> Perangkat Station
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-0.5 font-mono">{transaction.deviceId || 'SCV-COLL-001'}</div>
                <div className="text-[11px] text-slate-400">Smart Collection Station</div>
              </div>
            </div>

            {/* Officer & Audit Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Petugas Verifikator
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200">{transaction.officerName || 'Petugas Pos'}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  {transaction.createdAt
                    ? new Date(transaction.createdAt?.toDate ? transaction.createdAt.toDate() : transaction.createdAt).toLocaleString('id-ID')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
