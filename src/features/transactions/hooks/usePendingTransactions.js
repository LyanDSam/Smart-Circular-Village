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

  // Keep refs of current modal state to prevent tearing down listener on modal state changes
  const activePendingRef = useRef(activePending);
  activePendingRef.current = activePending;

  const unknownRfidPendingRef = useRef(unknownRfidPending);
  unknownRfidPendingRef.current = unknownRfidPending;

  const autoOpenModalRef = useRef(autoOpenModal);
  autoOpenModalRef.current = autoOpenModal;

  // Subscribe to RTDB pending_transactions in real time via onValue (runs once on mount)
  useEffect(() => {
    setIsLoading(true);
    console.log('[RTDB Sync] Subscribing to /pending_transactions listener...');

    const unsubscribe = rtdbService.listenPendingTransactions(async (items) => {
      console.log('[RTDB Sync] Incoming pending_transactions snapshot received:', items);

      // Filter items: treat missing/undefined status as 'waiting_confirmation' by default
      const activeItems = items.filter((item) => {
        const status = (item.status || '').toLowerCase();
        return !status || status === 'waiting_confirmation' || status === 'pending' || status === 'processing';
      });

      // Update local state immediately for instant UI responsiveness
      setPendingList(activeItems);
      setIsLoading(false);

      // Perform direct indexed Firestore queries for RFID lookup
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
              console.warn(`[RTDB Sync] Error querying citizen user for RFID ${cleanRfid}:`, err);
            }
          }
        })
      );

      setCitizenMap((prev) => ({ ...prev, ...newMap }));

      // Auto-open modal if autoOpenModal is enabled and no modal is currently active
      if (autoOpenModalRef.current && activeItems.length > 0) {
        const latestUnconfirmed = activeItems.find((i) => {
          const st = (i.status || '').toLowerCase();
          return (!st || st === 'waiting_confirmation' || st === 'pending') && !dismissedSetRef.current.has(i.transactionId);
        });

        if (latestUnconfirmed && !activePendingRef.current && !unknownRfidPendingRef.current) {
          const cleanRfid = String(latestUnconfirmed.rfidUid || latestUnconfirmed.uid || '').replace(/\s+/g, '').toUpperCase();
          if (newMap[cleanRfid] || citizenMap[cleanRfid]) {
            console.log('[RTDB Sync] Auto-opening Confirmation Modal for:', latestUnconfirmed.transactionId);
            setActivePending(latestUnconfirmed);
          } else {
            console.log('[RTDB Sync] Auto-opening Unknown RFID Modal for:', latestUnconfirmed.transactionId);
            setUnknownRfidPending(latestUnconfirmed);
          }
        }
      }
    });

    return () => {
      console.log('[RTDB Sync] Unsubscribing from /pending_transactions listener.');
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

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
