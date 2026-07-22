import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'emerald', // 'emerald' | 'blue' | 'amber' | 'purple' | 'slate'
  className,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      value: 'text-emerald-900 dark:text-emerald-100',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      value: 'text-blue-900 dark:text-blue-100',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/60 dark:border-amber-900/40',
      value: 'text-amber-900 dark:text-amber-100',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/60 dark:border-purple-900/40',
      value: 'text-purple-900 dark:text-purple-100',
    },
    slate: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-800',
      value: 'text-slate-900 dark:text-slate-100',
    },
  };

  const currentTheme = colorStyles[color] || colorStyles.slate;

  return (
    <Card className={cn('bg-white dark:bg-slate-900 shadow-xs border transition-all duration-200 hover:shadow-md', currentTheme.border, className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={cn('p-2.5 rounded-xl shadow-xs shrink-0', currentTheme.bg)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className={cn('text-2xl font-extrabold tracking-tight', currentTheme.value)}>
            {value}
          </div>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                trendType === 'positive' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
                trendType === 'negative' && 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                trendType === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {trend}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
