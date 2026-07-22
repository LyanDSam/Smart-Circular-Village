import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = ({
  title = 'No data available',
  description = 'There are no records to display at this moment.',
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 my-4">
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm" variant="default">
          {actionText}
        </Button>
      )}
    </div>
  );
};
