import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import * as Icons from 'lucide-react';

const colorStyles = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-500 dark:bg-emerald-600',
    iconText: 'text-white',
    badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-500 dark:bg-blue-600',
    iconText: 'text-white',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    iconBg: 'bg-green-600',
    iconText: 'text-white',
    badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-500 dark:bg-amber-600',
    iconText: 'text-white',
    badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    iconBg: 'bg-purple-500 dark:bg-purple-600',
    iconText: 'text-white',
    badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  },
};

export const DashboardCard = ({
  title,
  value,
  subtext,
  change,
  changeType = 'positive',
  iconName = 'Activity',
  color = 'emerald',
}) => {
  const IconComponent = Icons[iconName] || Icons.Activity;
  const theme = colorStyles[color] || colorStyles.emerald;

  return (
    <Card className="relative overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className={cn('p-2.5 rounded-xl shadow-xs', theme.iconBg, theme.iconText)}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </div>
          {change && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                changeType === 'positive'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : changeType === 'negative'
                  ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              )}
            >
              {change}
            </span>
          )}
        </div>

        {subtext && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
