import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-100 dark:bg-rose-950/80',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/80',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'primary':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-950/80',
          btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className={`w-14 h-14 ${style.iconBg} rounded-2xl mx-auto flex items-center justify-center shadow-inner`}>
            {style.icon}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-10 flex-1 border-slate-200 dark:border-slate-800"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs h-10 flex-1 font-bold shadow-xs ${style.btnClass}`}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
