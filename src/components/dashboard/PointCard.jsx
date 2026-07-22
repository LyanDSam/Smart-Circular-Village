import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, CreditCard } from 'lucide-react';

export const PointCard = ({ points = 0, memberId = 'N/A', rfidUid = null }) => {
  return (
    <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">
              Total Poin Saya
            </span>
            <div className="text-4xl font-extrabold mt-1 tracking-tight">
              {points.toLocaleString()}
              <span className="text-sm font-medium text-emerald-200 ml-1.5">PTS</span>
            </div>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white shadow-inner">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-500/50 flex flex-wrap items-center justify-between text-xs font-mono text-emerald-100 gap-2">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-200" />
            <span>ID: {memberId}</span>
          </div>
          {rfidUid ? (
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-2.5 py-1 rounded-full text-[11px]">
              <span>RFID: {rfidUid}</span>
            </div>
          ) : (
            <span className="text-[11px] text-emerald-200/80 italic">RFID belum ditautkan</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
