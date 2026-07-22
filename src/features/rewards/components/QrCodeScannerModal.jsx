import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { QrCode, Camera, Search, X, AlertCircle } from 'lucide-react';

export const QrCodeScannerModal = ({ isOpen, onClose, onScanned }) => {
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError('');
    const cleanId = manualId.trim().toUpperCase();
    if (!cleanId) {
      setError('Masukkan Redemption ID yang valid (misal SCV-RWD-4B82A9)');
      return;
    }
    onScanned(cleanId);
    setManualId('');
    onClose();
  };

  const handleSimulateScan = () => {
    // Standard quick camera simulation scanner
    setIsSimulatingCamera(true);
    setTimeout(() => {
      setIsSimulatingCamera(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Scan Voucher Penukaran</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan QR Code voucher atau masukkan ID manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Simulated Webcam Viewfinder */}
          <Card className="border-2 border-dashed border-emerald-500/50 dark:border-emerald-500/40 bg-slate-950 text-white p-6 text-center rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[180px]">
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
            <Camera className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
            <p className="text-xs font-semibold text-emerald-300">Webcam Scanner Siap</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1">
              Arahkan kamera ke QR Code Voucher milik warga
            </p>

            <Button
              onClick={handleSimulateScan}
              size="sm"
              variant="outline"
              disabled={isSimulatingCamera}
              className="mt-3 text-xs bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-bold"
            >
              {isSimulatingCamera ? 'Mendemodifikasi Scan...' : 'Gunakan Kamera HP / Laptop'}
            </Button>
          </Card>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Atau Masukkan Redemption ID Manual:
            </label>
            <div className="flex gap-2">
              <Input
                value={manualId}
                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                placeholder="misal: SCV-RWD-4B82A9"
                className="font-mono uppercase font-bold text-xs h-10"
              />
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shrink-0 h-10 gap-1.5">
                <Search className="w-4 h-4" />
                <span>Cari Voucher</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
