import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-4">
      <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
};
