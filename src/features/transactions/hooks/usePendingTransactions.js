import { useState, useEffect, useCallback, useRef } from 'react';
import { rtdbService } from '@/services/rtdbService';
import { userService } from '@/services/userService';
import { deviceService } from '@/services/deviceService';
import { postService } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';

export const usePendingTransactions = ({ autoOpenModal = false } = {}) => {
  const { userProfile } = useAuth();
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

  const userProfileRef = useRef(userProfile);
  userProfileRef.current = userProfile;

  const userRole = userProfile?.role;
  const isAdmin = userRole === 'admin';
  const isOfficer = userRole === 'officer';
  const officerPostId = userProfile?.postId;
  const officerDeviceId = (
    userProfile?.assignedDeviceId ||
    userProfile?.deviceId ||
    ''
  ).trim().toUpperCase();

  // Subscribe to RTDB pending_transactions in real time via onValue (runs when user role, post, or device assignment changes)
  useEffect(() => {
    setIsLoading(true);

    // 1. Citizens and non-authorized roles do not access pending transactions queue
    if (!isOfficer && !isAdmin) {
      setPendingList([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribeFn = null;

    const setupListener = async () => {
      // Build set of allowed device IDs for Officers based on their assigned Posko (postId) and assignedDeviceId
      const allowedDevices = new Set();
      if (officerDeviceId) {
        allowedDevices.add(officerDeviceId);
      }

      if (isOfficer && officerPostId) {
        try {
          const post = await postService.getPostById(officerPostId);
          if (post && Array.isArray(post.deviceIds)) {
            post.deviceIds.forEach((id) => allowedDevices.add(String(id).trim().toUpperCase()));
          }
        } catch (err) {
          console.warn('Notice loading officer post devices:', err);
        }
      }

      if (!isMounted) return;

      unsubscribeFn = rtdbService.listenPendingTransactions(async (items) => {
        if (!isMounted) return;

        // 2. Filter active pending items: Posko & Device Matching
        const activeItems = items.filter((item) => {
          const status = (item.status || '').toLowerCase();
          const isWaiting =
            !status || status === 'waiting_confirmation' || status === 'pending' || status === 'processing';

          const txDeviceId = (item.deviceId || item.device || '').trim().toUpperCase();

          // Admins see all RTDB queue items. Officers see ONLY items from devices belonging to their assigned Posko / assigned device ID.
          let matchesDevice = false;
          if (isAdmin) {
            matchesDevice = true;
          } else if (isOfficer) {
            if (allowedDevices.size > 0) {
              matchesDevice = allowedDevices.has(txDeviceId);
            } else if (officerDeviceId) {
              matchesDevice = txDeviceId === officerDeviceId;
            } else {
              // Officer has no Posko or Device assigned -> cannot process transactions
              matchesDevice = false;
            }
          }

          return isWaiting && matchesDevice;
        });

        // Update local state immediately with filtered items
        setPendingList(activeItems);
        setIsLoading(false);

        if (activeItems.length === 0) return;

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

        if (!isMounted) return;
        setCitizenMap((prev) => ({ ...prev, ...newMap }));

        // Auto-open modal for Officers if activeItems has items for assigned device/Posko
        if (isOfficer && autoOpenModalRef.current && activeItems.length > 0) {
          const latestUnconfirmed = activeItems.find((i) => {
            const st = (i.status || '').toLowerCase();
            return (!st || st === 'waiting_confirmation' || st === 'pending') && !dismissedSetRef.current.has(i.transactionId);
          });

          if (latestUnconfirmed && !activePendingRef.current && !unknownRfidPendingRef.current) {
            const cleanRfid = String(latestUnconfirmed.rfidUid || latestUnconfirmed.uid || '').replace(/\s+/g, '').toUpperCase();
            if (newMap[cleanRfid] || citizenMap[cleanRfid]) {
              console.log('[RTDB Sync] Auto-opening Confirmation Modal for Officer:', latestUnconfirmed.transactionId);
              setActivePending(latestUnconfirmed);
            } else {
              console.log('[RTDB Sync] Auto-opening Unknown RFID Modal for Officer:', latestUnconfirmed.transactionId);
              setUnknownRfidPending(latestUnconfirmed);
            }
          }
        }
      });
    };

    setupListener();

    return () => {
      isMounted = false;
      if (typeof unsubscribeFn === 'function') unsubscribeFn();
    };
  }, [userRole, officerPostId, officerDeviceId]);

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
