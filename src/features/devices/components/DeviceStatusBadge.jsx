import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Wrench, Ban, HelpCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export const DeviceStatusBadge = ({ status = 'unknown', className = '' }) => {
  const statusConfig = {
    online: {
      label: 'Online',
      variant: 'outline',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: Wifi,
    },
    offline: {
      label: 'Offline',
      variant: 'outline',
      classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: WifiOff,
    },
    warning: {
      label: 'Peringatan',
      variant: 'outline',
      classes: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
    },
    error: {
      label: 'Error',
      variant: 'outline',
      classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
      icon: AlertCircle,
    },
    maintenance: {
      label: 'Pemeliharaan',
      variant: 'outline',
      classes: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: Wrench,
    },
    disabled: {
      label: 'Non-Aktif',
      variant: 'outline',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      icon: Ban,
    },
    unknown: {
      label: 'Tidak Diketahui',
      variant: 'outline',
      classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      icon: HelpCircle,
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.unknown;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`text-xs font-semibold px-2.5 py-0.5 inline-flex items-center gap-1 ${config.classes} ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};
