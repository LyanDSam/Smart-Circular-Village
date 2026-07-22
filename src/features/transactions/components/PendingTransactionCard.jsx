import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { pointService } from '@/services/pointService';

export const PendingTransactionCard = ({ pendingItem, citizen = null, onConfirm }) => {
  const rawRfid = pendingItem.rfidUid || pendingItem.uid || '';
  const cleanRfid = String(rawRfid || '').replace(/\s+/g, '').toUpperCase();

  const rawWeight = pendingItem.weightGram ?? pendingItem.weight ?? 0;
  const weightKg = pointService.formatWeightKg(rawWeight);
  const deviceId = pendingItem.deviceId || pendingItem.device || 'SCV-COLL-001';

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent border-amber-300 dark:border-amber-900/60 shadow-md relative overflow-hidden font-sans">
      <CardContent className="p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs animate-pulse">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Penimbangan Baru (RTDB Station)
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Pos {deviceId}
              </h4>
            </div>
          </div>

          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-semibold animate-pulse">
            Menunggu Konfirmasi
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs">
          {/* Citizen / RFID */}
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold block">Warga Penyetor</span>
            {citizen ? (
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{citizen.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{citizen.memberId || 'SCV-26-000101'}</div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>RFID: {cleanRfid || '01020304'} (Belum Linked)</span>
              </div>
            )}
          </div>

          {/* Weight */}
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold block">Berat Timbangan</span>
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {weightKg} <span className="text-xs font-normal text-slate-500">({rawWeight}g)</span>
            </div>
          </div>

          {/* Time */}
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold block">Waktu Tap</span>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{pendingItem.timestamp ? new Date(pendingItem.timestamp * 1000).toLocaleTimeString() : 'Baru saja'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => onConfirm(pendingItem)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm rounded-xl px-4 py-2"
          >
            <span>Proses Transaksi Penimbangan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
