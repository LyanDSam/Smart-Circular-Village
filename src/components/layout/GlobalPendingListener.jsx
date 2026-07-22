import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  usePendingTransactions,
  ConfirmTransactionModal,
  UnknownRfidModal,
} from '@/features/transactions';
import { transactionService } from '@/services/transactionService';

export const GlobalPendingListener = () => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ONLY run for officers. Administrators must NOT receive transaction popups.
  const isOfficer = userProfile?.role === 'officer';

  // Do not render duplicate modals if currently on /transactions page
  const isOnTransactionsPage =
    location.pathname.startsWith('/transactions') ||
    location.pathname.startsWith('/officer/transactions');

  const enableAutoModal = isOfficer && !isOnTransactionsPage;

  const {
    activePending,
    unknownRfidPending,
    citizenMap,
    closeConfirmationModal,
    closeUnknownRfidModal,
    handleResumeAfterRfidLinked,
  } = usePendingTransactions({ autoOpenModal: enableAutoModal });

  if (!isOfficer || isOnTransactionsPage) {
    return null;
  }

  const activeRfid = activePending
    ? String(activePending.rfidUid || activePending.uid || '').replace(/\s+/g, '').toUpperCase()
    : '';
  const matchedCitizen = activeRfid ? citizenMap[activeRfid] : null;

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
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
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
