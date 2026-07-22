import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { pointService } from './pointService';
import { rtdbService } from './rtdbService';
import { userService } from './userService';

export const transactionService = {
  /**
   * Confirm pending RFID transaction from RTDB:
   * 1. Concurrency Lock: Acquire lock via RTDB runTransaction() (waiting_confirmation -> processing).
   * 2. Direct Firestore query: where("rfidUid", "==", cleanRfid).
   * 3. Calculate points using pointService.
   * 4. Atomic Firestore writeBatch(): Write transaction & increment user points and totalWasteGram.
   * 5. Delete pending transaction from RTDB queue.
   */
  async confirmTransaction({ pendingTx, wasteType, officerUser, citizenUser = null }) {
    if (!pendingTx || !pendingTx.transactionId) {
      throw new Error('Data transaksi pending tidak valid.');
    }

    const transactionId = pendingTx.transactionId;
    const deviceId = pendingTx.deviceId || pendingTx.device || 'SCV-COLL-001';
    const rawRfid = pendingTx.rfidUid || pendingTx.uid || '';
    const cleanRfid = String(rawRfid || '').replace(/\s+/g, '').toUpperCase();
    const weightGram = pendingTx.weightGram ?? pendingTx.weight ?? 0;

    // Step 1: Concurrency Lock via RTDB runTransaction()
    const lockAcquired = await rtdbService.acquirePendingTransactionLock(transactionId);
    if (!lockAcquired) {
      throw new Error('Transaksi ini sedang atau telah diproses oleh petugas lain.');
    }

    try {
      // Step 2: Direct Indexed Firestore Query for Citizen
      let targetCitizen = citizenUser;
      if (!targetCitizen && cleanRfid) {
        targetCitizen = await userService.getUserByRfidUid(cleanRfid);
      }

      if (!targetCitizen) {
        // Revert status lock if citizen lookup failed
        await rtdbService.setPendingTransactionStatus(transactionId, 'waiting_confirmation');
        throw new Error(`Kartu RFID "${cleanRfid}" (Unknown RFID) belum terhubung dengan akun warga terverifikasi.`);
      }

      // Step 3: Calculate Points
      const pointEarned = pointService.calculatePoints(wasteType, weightGram);
      const weightKg = parseFloat((weightGram / 1000).toFixed(2));
      const formattedDate = new Date().toISOString();
      const finalTxId = `TX-${Date.now()}`;

      const finalTransactionData = {
        transactionId: finalTxId,
        userId: targetCitizen.uid || targetCitizen.id,
        memberId: targetCitizen.memberId || 'SCV-26-XXXXXX',
        memberName: targetCitizen.fullName || 'Warga SCV',
        rfidUid: cleanRfid,
        deviceId: deviceId,
        wasteType: wasteType || 'Organic',
        weightGram: weightGram,
        weightKg: weightKg,
        pointEarned: pointEarned,
        officerId: officerUser?.uid || officerUser?.id || 'system_officer',
        officerName: officerUser?.fullName || officerUser?.email || 'Petugas Station',
        status: 'completed',
        createdAt: serverTimestamp(),
      };

      // Step 4: Atomic Firestore writeBatch()
      const batch = writeBatch(db);

      // (A) Set Transaction document
      const txDocRef = doc(db, 'transactions', finalTxId);
      batch.set(txDocRef, finalTransactionData);

      // (B) Update User points & totalWasteGram atomically
      if (targetCitizen.uid) {
        const userDocRef = doc(db, 'users', targetCitizen.uid);
        batch.update(userDocRef, {
          points: increment(pointEarned),
          totalWasteGram: increment(weightGram),
          totalWaste: increment(weightGram),
          updatedAt: serverTimestamp(),
        });
      }

      // Execute single atomic commit
      await batch.commit();

      // Step 5: Delete Pending Transaction from RTDB
      await rtdbService.deletePendingTransaction(transactionId);

      return {
        ...finalTransactionData,
        createdAt: formattedDate,
      };
    } catch (err) {
      console.error('Error confirming waste transaction in batch:', err);
      throw err;
    }
  },

  /**
   * Cancel pending transaction with confirmation and reason (e.g. Unknown RFID).
   * Updates RTDB status to 'cancelled' with cancelReason, then removes item from active queue.
   */
  async cancelPendingTransaction({ transactionId, reason = 'Unknown RFID', officerId = null }) {
    if (!transactionId) return false;
    try {
      await rtdbService.cancelPendingTransaction(transactionId, reason);
      return true;
    } catch (err) {
      console.error('Error cancelling pending transaction:', err);
      throw err;
    }
  },

  /**
   * Resume pending transaction after RFID has been successfully linked to a citizen.
   */
  async resumePendingTransaction({ pendingTx, citizenUser }) {
    if (!pendingTx || !citizenUser) return null;
    return {
      pendingTx,
      citizenUser,
    };
  },

  /**
   * Fetch transaction audit log directly from Cloud Firestore transactions collection.
   */
  async getTransactions({ search = '', wasteType = 'all', citizenId = null, officerId = null, page = 1, pageSize = 10 } = {}) {
    let txList = [];

    try {
      const txRef = collection(db, 'transactions');
      const qSnap = await getDocs(txRef);

      if (!qSnap.empty) {
        txList = qSnap.docs.map((d) => ({ transactionId: d.id, ...d.data() }));
      }
    } catch (err) {
      console.error('Error reading Firestore transactions collection:', err);
      txList = [];
    }

    // Filter by Waste Category
    if (wasteType !== 'all') {
      txList = txList.filter(
        (t) => (t.wasteType || '').toLowerCase() === wasteType.toLowerCase()
      );
    }

    // Filter by Citizen ID / Member ID
    if (citizenId) {
      txList = txList.filter(
        (t) => t.userId === citizenId || t.memberId === citizenId
      );
    }

    // Filter by Officer ID
    if (officerId) {
      txList = txList.filter((t) => t.officerId === officerId);
    }

    // Search Query
    if (search.trim()) {
      const queryLower = search.toLowerCase().trim();
      txList = txList.filter(
        (t) =>
          (t.transactionId && t.transactionId.toLowerCase().includes(queryLower)) ||
          (t.memberName && t.memberName.toLowerCase().includes(queryLower)) ||
          (t.memberId && t.memberId.toLowerCase().includes(queryLower)) ||
          (t.rfidUid && t.rfidUid.toLowerCase().includes(queryLower)) ||
          (t.deviceId && t.deviceId.toLowerCase().includes(queryLower))
      );
    }

    // Sort by createdAt descending
    txList.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    const totalCount = txList.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedTx = txList.slice(startIndex, startIndex + pageSize);

    return {
      transactions: paginatedTx,
      totalCount,
      totalPages,
      currentPage: page,
    };
  },

  /**
   * Fetch deposit history for a specific citizen.
   */
  async getCitizenTransactions(userId, pageSize = 20) {
    if (!userId) return [];
    const res = await this.getTransactions({ citizenId: userId, pageSize });
    return res.transactions;
  },

  /**
   * Calculate Waste Bank Dashboard Statistics directly from Firestore data.
   */
  async getTransactionStats() {
    const { transactions } = await this.getTransactions({ pageSize: 10000 });

    const totalTransactions = transactions.length;
    let totalWasteKg = 0;
    let organicWasteKg = 0;
    let inorganicWasteKg = 0;
    let totalPointsIssued = 0;

    transactions.forEach((tx) => {
      const kg = tx.weightKg || (tx.weightGram ? tx.weightGram / 1000 : 0);
      totalWasteKg += kg;
      totalPointsIssued += tx.pointEarned || 0;

      if ((tx.wasteType || '').toLowerCase().includes('organic')) {
        organicWasteKg += kg;
      } else {
        inorganicWasteKg += kg;
      }
    });

    return {
      totalTransactions,
      totalWasteKg: parseFloat(totalWasteKg.toFixed(2)),
      organicWasteKg: parseFloat(organicWasteKg.toFixed(2)),
      inorganicWasteKg: parseFloat(inorganicWasteKg.toFixed(2)),
      totalPointsIssued,
    };
  },
};
