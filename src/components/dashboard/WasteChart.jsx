import React from 'react';
import { SectionCard } from '@/components/common/SectionCard';

export const WasteChart = ({
  title = 'Statistik Pengumpulan Sampah',
  description = 'Perbandingan volume sampah organik vs anorganik (Kg)',
  data = [
    { month: 'Jan', organic: 120, inorganic: 85 },
    { month: 'Feb', organic: 145, inorganic: 90 },
    { month: 'Mar', organic: 160, inorganic: 110 },
    { month: 'Apr', organic: 190, inorganic: 130 },
    { month: 'Mei', organic: 210, inorganic: 140 },
    { month: 'Jun', organic: 250, inorganic: 165 },
    { month: 'Jul', organic: 285, inorganic: 190 },
  ],
}) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.organic, d.inorganic]), 300);

  return (
    <SectionCard title={title} description={description}>
      <div className="pt-4 space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Organik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300">Anorganik</span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {data.map((item, idx) => {
            const orgHeight = (item.organic / maxVal) * 100;
            const inorgHeight = (item.inorganic / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${orgHeight}%` }}
                    className="w-full max-w-[16px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t-sm transition-all relative"
                    title={`Organik ${item.month}: ${item.organic} kg`}
                  />
                  <div
                    style={{ height: `${inorgHeight}%` }}
                    className="w-full max-w-[16px] bg-blue-500 group-hover:bg-blue-600 rounded-t-sm transition-all relative"
                    title={`Anorganik ${item.month}: ${item.inorganic} kg`}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.month}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
          <span>0 kg</span>
          <span>{Math.round(maxVal / 2)} kg</span>
          <span>{maxVal} kg</span>
        </div>
      </div>
    </SectionCard>
  );
};
