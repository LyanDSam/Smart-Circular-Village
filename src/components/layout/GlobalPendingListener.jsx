import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { Button } from '@/components/ui/button';
import { Scale, X, CheckCircle2 } from 'lucide-react';
import {
  usePendingTransactions,
  ConfirmTransactionModal,
  UnknownRfidModal,
} from '@/features/transactions';
import { transactionService } from '@/services/transactionService';

const OfficerPendingListenerInner = ({ userProfile }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeToastItem, setActiveToastItem] = useState(null);
  const { playChime } = useClientSettings();

  const isInitialMountRef = useRef(true);
  const knownTxIdsRef = useRef(new Set());

  const {
    pendingList,
    activePending,
    unknownRfidPending,
    citizenMap,
    openConfirmationModal,
    closeConfirmationModal,
    closeUnknownRfidModal,
    handleResumeAfterRfidLinked,
  } = usePendingTransactions({ autoOpenModal: false });

  const activeRfid = activePending
    ? String(activePending.rfidUid || activePending.uid || '').replace(/\s+/g, '').toUpperCase()
    : '';
  const matchedCitizen = activeRfid ? citizenMap[activeRfid] : null;

  // Track pendingList: ONLY trigger activeToastItem & playChime for BRAND NEW transactions that enter IN REAL-TIME after mount!
  useEffect(() => {
    if (pendingList.length === 0) return;

    if (isInitialMountRef.current) {
      // First snapshot on web page load: record existing IDs without popping up toast
      pendingList.forEach((item) => {
        if (item.transactionId) knownTxIdsRef.current.add(item.transactionId);
      });
      isInitialMountRef.current = false;
      return;
    }

    // Subsequent snapshots: find brand new transaction that wasn't in knownTxIdsRef
    const newArrival = pendingList.find(
      (item) => item.transactionId && !knownTxIdsRef.current.has(item.transactionId)
    );

    if (newArrival) {
      knownTxIdsRef.current.add(newArrival.transactionId);
      setActiveToastItem(newArrival);
      playChime();
    }
  }, [pendingList]);

  const handleConfirm = async ({ pendingTx, wasteType, citizenUser }) => {
    setIsSubmitting(true);
    try {
      const result = await transactionService.confirmTransaction({
        pendingTx,
        wasteType,
        officerUser: userProfile,
        citizenUser,
      });

      setToastMessage(
        `Setoran "${result.memberName}" (${result.weightKg} Kg) Berhasil Dikonfirmasi!`
      );
      setTimeout(() => setToastMessage(null), 4000);
      closeConfirmationModal();
    } catch (err) {
      console.error('Error confirming transaction in GlobalListener:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPending = async (transactionId, reason) => {
    try {
      await transactionService.cancelPendingTransaction({ transactionId, reason });
      closeUnknownRfidModal();
      closeConfirmationModal();
    } catch (err) {
      console.error('Error cancelling pending transaction:', err);
    }
  };

  return (
    <>
      {/* Toast message after confirming transaction */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Mini Toast Notification Banner for NEW IoT Transactions (Appears ONLY on real-time new arrival) */}
      {activeToastItem && !activePending && !unknownRfidPending && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-md">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-emerald-400">Transaksi Setoran Baru!</span>
              <button
                onClick={() => setActiveToastItem(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-800 transition-colors"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Berat: <strong>{((activeToastItem.weightGram || activeToastItem.weight || 0) / 1000).toFixed(2)} Kg</strong> (RFID: {activeToastItem.rfidUid || 'N/A'})
            </p>
            <Button
              onClick={() => {
                openConfirmationModal(activeToastItem);
                setActiveToastItem(null);
              }}
              size="sm"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Proses Konfirmasi</span>
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmTransactionModal
        isOpen={Boolean(activePending)}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirm}
        pendingItem={activePending}
        citizen={matchedCitizen}
        isSubmitting={isSubmitting}
      />

      {/* Unknown RFID Modal */}
      <UnknownRfidModal
        isOpen={Boolean(unknownRfidPending)}
        onClose={closeUnknownRfidModal}
        pendingItem={unknownRfidPending}
        onRfidLinked={({ citizenUser }) => {
          if (unknownRfidPending && citizenUser) {
            handleResumeAfterRfidLinked({
              pendingTx: unknownRfidPending,
              citizenUser,
            });
          }
        }}
        onCancelTransaction={(txId) =>
          handleCancelPending(txId, 'Transaksi dibatalkan petugas (Kartu RFID Tidak Dikenal)')
        }
      />
    </>
  );
};

export const GlobalPendingListener = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  // ONLY run for officers. Administrators and citizens must NOT execute listeners or receive popups.
  const isOfficer = userProfile?.role === 'officer';

  // Do not render duplicate modals if currently on /transactions or /officer/transactions page
  const isOnTransactionsPage =
    location.pathname.startsWith('/transactions') ||
    location.pathname.startsWith('/officer/transactions');

  if (!isOfficer || isOnTransactionsPage) {
    return null;
  }

  return <OfficerPendingListenerInner userProfile={userProfile} />;
};
