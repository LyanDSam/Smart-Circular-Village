import React from 'react';
import { cn } from '@/utils/cn';

const badgeVariants = {
  default: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  outline: 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
  success: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  warning: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  destructive: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
  info: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  purple: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

export const Badge = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
};
