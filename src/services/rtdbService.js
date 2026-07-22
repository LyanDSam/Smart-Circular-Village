import { ref, onValue, onChildAdded, remove, update, runTransaction, off } from 'firebase/database';
import { rtdb } from '@/firebase/rtdb';

export const rtdbService = {
  /**
   * Listen to whole `/pending_transactions` node in real-time.
   */
  listenPendingTransactions(onUpdateCallback) {
    const pendingRef = ref(rtdb, 'pending_transactions');

    const unsubscribe = onValue(
      pendingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const pendingList = Object.entries(rawData).map(([id, val]) => ({
            transactionId: id,
            ...val,
          }));
          onUpdateCallback(pendingList);
        } else {
          onUpdateCallback([]);
        }
      },
      (error) => {
        console.warn('RTDB pending_transactions listener notice:', error);
        onUpdateCallback([]);
      }
    );

    return unsubscribe;
  },

  /**
   * Listen to newly added child nodes in `/pending_transactions` using onChildAdded().
   * Invokes callback only for items with status == "waiting_confirmation" or "pending".
   */
  listenNewPendingTransactions(onNewChildCallback) {
    const pendingRef = ref(rtdb, 'pending_transactions');

    const listener = onChildAdded(
      pendingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const item = {
            transactionId: snapshot.key,
            ...snapshot.val(),
          };
          const status = (item.status || '').toLowerCase();
          if (status === 'waiting_confirmation' || status === 'pending') {
            onNewChildCallback(item);
          }
        }
      },
      (error) => {
        console.warn('RTDB onChildAdded listener error:', error);
      }
    );

    // Unsubscribe helper
    return () => {
      off(pendingRef, 'child_added', listener);
    };
  },

  /**
   * Concurrency Lock: Acquire lock on pending transaction by atomically mutating status
   * waiting_confirmation -> processing using RTDB runTransaction().
   * Returns true if lock was successfully acquired, false if already processing or completed.
   */
  async acquirePendingTransactionLock(transactionId) {
    if (!transactionId) return false;

    try {
      const statusRef = ref(rtdb, `pending_transactions/${transactionId}/status`);
      const result = await runTransaction(statusRef, (currentStatus) => {
        const norm = (currentStatus || '').toLowerCase();
        if (norm === 'waiting_confirmation' || norm === 'pending' || !currentStatus) {
          return 'processing';
        }
        // Abort runTransaction if status is already processing or completed
        return;
      });

      return result.committed;
    } catch (err) {
      console.error(`Error acquiring RTDB lock for transaction ${transactionId}:`, err);
      return false;
    }
  },

  /**
   * Set pending transaction status and extra fields directly in RTDB.
   */
  async setPendingTransactionStatus(transactionId, status = 'processing', extraPayload = {}) {
    if (!transactionId) return;
    try {
      const txRef = ref(rtdb, `pending_transactions/${transactionId}`);
      await update(txRef, { status, ...extraPayload });
    } catch (err) {
      console.warn('Error updating pending transaction status in RTDB:', err);
    }
  },

  /**
   * Alias for updatePendingTransactionStatus.
   */
  async updatePendingTransactionStatus(transactionId, status, extraFields = {}) {
    return this.setPendingTransactionStatus(transactionId, status, extraFields);
  },

  /**
   * Cancel pending transaction in RTDB queue:
   * Sets status='cancelled' and cancelReason, then deletes record from active queue.
   */
  async cancelPendingTransaction(transactionId, reason = 'Unknown RFID') {
    if (!transactionId) return;
    try {
      const txRef = ref(rtdb, `pending_transactions/${transactionId}`);
      await update(txRef, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: Math.floor(Date.now() / 1000),
      });
      // Delete record from RTDB after marking cancelled
      await remove(txRef);
    } catch (err) {
      console.warn('Error cancelling pending transaction in RTDB:', err);
    }
  },

  /**
   * Delete processed pending transaction from RTDB queue.
   */
  async deletePendingTransaction(transactionId) {
    if (!transactionId) return;
    try {
      const txRef = ref(rtdb, `pending_transactions/${transactionId}`);
      await remove(txRef);
    } catch (err) {
      console.warn('Error deleting pending transaction from RTDB:', err);
    }
  },

  /**
   * Listen to live telemetry & heartbeat of a specific device from RTDB (`devices/{deviceId}`).
   */
  listenDeviceTelemetry(deviceId, onUpdateCallback) {
    if (!deviceId) return () => {};
    const devRef = ref(rtdb, `devices/${deviceId}`);
    const unsubscribe = onValue(
      devRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdateCallback(snapshot.val());
        } else {
          onUpdateCallback(null);
        }
      },
      (error) => {
        console.warn(`RTDB device telemetry listener notice for ${deviceId}:`, error);
        onUpdateCallback(null);
      }
    );
    return unsubscribe;
  },

  /**
   * Listen to live status & telemetry of all devices from RTDB (`devices`).
   */
  listenAllDevices(onUpdateCallback) {
    const devicesRef = ref(rtdb, 'devices');
    const unsubscribe = onValue(
      devicesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdateCallback(snapshot.val());
        } else {
          onUpdateCallback({});
        }
      },
      (error) => {
        console.warn('RTDB all devices listener notice:', error);
        onUpdateCallback({});
      }
    );
    return unsubscribe;
  },
};
