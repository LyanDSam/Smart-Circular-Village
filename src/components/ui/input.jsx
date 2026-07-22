import React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 ring-offset-white dark:ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
