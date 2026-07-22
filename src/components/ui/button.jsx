import React from 'react';
import { cn } from '@/utils/cn';

const buttonVariants = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  lg: 'h-12 px-6 text-base rounded-xl',
  icon: 'h-10 w-10 p-2 flex items-center justify-center rounded-lg',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, disabled, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg cursor-pointer',
          buttonVariants[variant] || buttonVariants.default,
          buttonSizes[size] || buttonSizes.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
