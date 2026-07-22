import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pointService } from '@/services/pointService';
import { CitizenSelectorModal } from './CitizenSelectorModal';
import {
  X,
  AlertTriangle,
  CreditCard,
  Cpu,
  Scale,
  Clock,
  Link2,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const UnknownRfidModal = ({
  isOpen = false,
  onClose,
  pendingItem = null,
  officerUser = null,
  onRfidLinkedAndResume,
  onCancelTransaction,
}) => {
  const [showCitizenSelector, setShowCitizenSelector] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawRfid = pendingItem?.rfidUid || pendingItem?.uid || '';
  const cleanRfid = useMemo(
    () => String(rawRfid || '').replace(/\s+/g, '').toUpperCase(),
    [rawRfid]
  );

  const weightGram = pendingItem?.weightGram ?? pendingItem?.weight ?? 0;
  const weightKg = useMemo(() => pointService.formatWeightKg(weightGram), [weightGram]);
  const deviceId = pendingItem?.deviceId || pendingItem?.device || 'SCV-COLL-001';

  const formattedTime = useMemo(() => {
    if (!pendingItem?.timestamp) return new Date().toLocaleString('id-ID');
    const ms = pendingItem.timestamp > 100000000000 ? pendingItem.timestamp : pendingItem.timestamp * 1000;
    return new Date(ms).toLocaleString('id-ID');
  }, [pendingItem?.timestamp]);

  if (!isOpen || !pendingItem) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await onCancelTransaction(pendingItem.transactionId, 'Unknown RFID');
      setShowCancelConfirm(false);
      onClose();
    } catch (err) {
      console.error('Error cancelling transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRfidSuccessfullyLinked = (citizen) => {
    setShowCitizenSelector(false);
    onRfidLinkedAndResume({
      pendingTx: pendingItem,
      citizenUser: citizen,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-rose-950 bg-rose-50/60 dark:bg-rose-950/40">
            <div className="flex items-center space-x-2.5 text-rose-800 dark:text-rose-200">
              <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Unknown RFID Card</h3>
                <span className="text-[10px] font-medium text-rose-600 dark:text-rose-300 block">
                  Kartu RFID Belum Terdaftar
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Description Warning Box */}
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Kartu RFID ini belum terikat dengan akun warga terverifikasi.
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 leading-relaxed pl-5">
                Transaksi setoran sampah tidak dapat dikonfirmasi atau diterbitkan poin sampai RFID ditautkan ke akun warga.
              </p>
            </div>

            {/* Transaction Data Snapshot Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {/* RFID UID */}
              <div className="col-span-2 flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  RFID UID:
                </span>
                <Badge className="font-mono text-xs bg-amber-500 text-white px-2.5 py-0.5">
                  {cleanRfid}
                </Badge>
              </div>

              {/* Device ID */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Pos Station</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  <span>{deviceId}</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Berat Timbangan</span>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-0.5 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{weightKg}</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Waktu Tap:
                </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formattedTime}</span>
              </div>
            </div>

            {/* Cancel Confirmation Prompt View */}
            {showCancelConfirm ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-300 dark:border-rose-900 space-y-3 text-xs">
                <h4 className="font-bold text-rose-900 dark:text-rose-100 flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Batalkan Transaksi Penimbangan Ini?
                </h4>
                <p className="text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
                  Status transaksi di Realtime Database akan diubah menjadi <strong className="font-mono">cancelled</strong> dengan alasan <strong className="font-mono">Unknown RFID</strong>, lalu dihapus dari antrean aktif.
                </p>
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isSubmitting}
                    className="text-xs h-8"
                  >
                    Kembali
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirmCancel}
                    disabled={isSubmitting}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Membatalkan...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Ya, Batalkan Transaksi</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Main 3 Actions */
              <div className="space-y-2 pt-2">
                {/* 1. Primary Button: Link RFID to Existing Citizen */}
                <Button
                  type="button"
                  onClick={() => setShowCitizenSelector(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl py-2.5 shadow-sm"
                >
                  <Link2 className="w-4 h-4" />
                  <span>1. Tautkan RFID ke Warga Terdaftar</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  {/* 2. Secondary Button: Scan Again / Dismiss */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="text-xs font-semibold border-slate-200 dark:border-slate-800 rounded-xl gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>2. Scan Lagi / Tutup</span>
                  </Button>

                  {/* 3. Danger Button: Cancel Transaction */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>3. Batalkan Transaksi</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Citizen Selector Sub-Modal */}
      {showCitizenSelector && (
        <CitizenSelectorModal
          isOpen={showCitizenSelector}
          onClose={() => setShowCitizenSelector(false)}
          onRfidLinked={handleRfidSuccessfullyLinked}
          rfidUidToLink={cleanRfid}
          officerUser={officerUser}
        />
      )}
    </>
  );
};
