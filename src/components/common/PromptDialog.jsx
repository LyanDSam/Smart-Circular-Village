import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X } from 'lucide-react';

export const PromptDialog = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Input Alasan / Catatan',
  description = 'Silakan masukkan keterangan tambahan:',
  placeholder = 'Ketik keterangan di sini...',
  initialValue = '',
  confirmText = 'Kirim',
  cancelText = 'Batal',
  isLoading = false,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>

            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="text-xs h-10 font-medium"
              autoFocus
              required
            />
          </div>

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
              type="submit"
              disabled={isLoading}
              className="text-xs h-10 flex-1 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              {isLoading ? 'Memproses...' : confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
