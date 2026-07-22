import React from 'react';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Bell, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const NotificationPanel = ({ notifications = [], title = 'Notifikasi & Info', description = 'Pemberitahuan terbaru aktivitas Anda' }) => {
  if (!notifications.length) {
    return (
      <SectionCard title={title} description={description}>
        <div className="py-6">
          <EmptyState title="Tidak Ada Notifikasi" description="Belum ada notifikasi baru untuk Anda saat ini." />
        </div>
      </SectionCard>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
  };

  return (
    <SectionCard title={title} description={description}>
      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
              item.read
                ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
            }`}
          >
            <div className="mt-0.5">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</h5>
                <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};
