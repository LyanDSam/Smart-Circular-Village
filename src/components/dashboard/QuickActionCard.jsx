import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const QuickActionCard = ({ title = 'Akses Cepat', actions = [], className }) => {
  const navigate = useNavigate();

  if (!actions.length) return null;

  return (
    <Card className={cn('bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Button
              key={idx}
              variant={action.variant || 'outline'}
              className="w-full justify-start space-x-3 py-5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
              onClick={() => action.onClick ? action.onClick() : action.path && navigate(action.path)}
            >
              {Icon && <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              <span className="truncate">{action.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
