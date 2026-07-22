import { useState, useEffect, useCallback, useRef } from 'react';
import { rtdbService } from '@/services/rtdbService';
import { userService } from '@/services/userService';

export const usePendingTransactions = ({ autoOpenModal = false } = {}) => {
  const [pendingList, setPendingList] = useState([]);
  const [activePending, setActivePending] = useState(null);
  const [unknownRfidPending, setUnknownRfidPending] = useState(null);
  const [citizenMap, setCitizenMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Track transaction IDs that user explicitly closed/dismissed
  const dismissedSetRef = useRef(new Set());

  // Subscribe to RTDB pending_transactions in real time via onValue
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = rtdbService.listenPendingTransactions(async (items) => {
      // Filter waiting_confirmation or pending items
      const activeItems = items.filter(
        (item) => item.status === 'waiting_confirmation' || item.status === 'pending' || item.status === 'processing'
      );

      setPendingList(activeItems);
      setIsLoading(false);

      // Perform direct indexed Firestore queries: where("rfidUid", "==", rfidUid)
      const newMap = {};
      await Promise.all(
        activeItems.map(async (item) => {
          const rawRfid = item.rfidUid || item.uid || '';
          if (rawRfid) {
            const cleanRfid = String(rawRfid).replace(/\s+/g, '').toUpperCase();
            try {
              const citizen = await userService.getUserByRfidUid(cleanRfid);
              if (citizen) {
                newMap[cleanRfid] = citizen;
              }
            } catch (err) {
              console.warn(`Error querying user for RFID ${cleanRfid}:`, err);
            }
          }
        })
      );

      setCitizenMap(newMap);

      // Auto-open modal only if autoOpenModal === true AND transaction was not dismissed by user
      if (autoOpenModal && activeItems.length > 0) {
        const latestUnconfirmed = activeItems.find(
          (i) =>
            (i.status === 'waiting_confirmation' || i.status === 'pending') &&
            !dismissedSetRef.current.has(i.transactionId)
        );

        if (latestUnconfirmed && !activePending && !unknownRfidPending) {
          const cleanRfid = String(latestUnconfirmed.rfidUid || latestUnconfirmed.uid || '').replace(/\s+/g, '').toUpperCase();
          if (newMap[cleanRfid]) {
            setActivePending(latestUnconfirmed);
          } else {
            setUnknownRfidPending(latestUnconfirmed);
          }
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [autoOpenModal, activePending, unknownRfidPending]);

  const openConfirmationModal = useCallback((item) => {
    const rawRfid = item.rfidUid || item.uid || '';
    const cleanRfid = String(rawRfid).replace(/\s+/g, '').toUpperCase();
    const matchedCitizen = citizenMap[cleanRfid];

    if (matchedCitizen) {
      setActivePending(item);
      setUnknownRfidPending(null);
    } else {
      setUnknownRfidPending(item);
      setActivePending(null);
    }
  }, [citizenMap]);

  const closeConfirmationModal = useCallback(() => {
    setActivePending((current) => {
      if (current && current.transactionId) {
        dismissedSetRef.current.add(current.transactionId);
      }
      return null;
    });
  }, []);

  const closeUnknownRfidModal = useCallback(() => {
    setUnknownRfidPending((current) => {
      if (current && current.transactionId) {
        dismissedSetRef.current.add(current.transactionId);
      }
      return null;
    });
  }, []);

  const handleResumeAfterRfidLinked = useCallback(({ pendingTx, citizenUser }) => {
    if (!pendingTx || !citizenUser) return;
    const cleanRfid = String(citizenUser.rfidUid || '').replace(/\s+/g, '').toUpperCase();

    // Update local map immediately
    setCitizenMap((prev) => ({
      ...prev,
      [cleanRfid]: citizenUser,
    }));

    // Switch from Unknown RFID modal directly to normal Confirmation Modal
    setUnknownRfidPending(null);
    setActivePending(pendingTx);
  }, []);

  return {
    pendingList,
    activePending,
    unknownRfidPending,
    citizenMap,
    isLoading,
    openConfirmationModal,
    closeConfirmationModal,
    closeUnknownRfidModal,
    handleResumeAfterRfidLinked,
  };
};
