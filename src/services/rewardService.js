import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  increment,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

/**
 * Helper to generate a unique SCV Redemption Voucher ID.
 * Format: SCV-RWD-XXXXXX (e.g. SCV-RWD-4B82A9)
 */
export const generateRedemptionId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomSeq = '';
  for (let i = 0; i < 6; i++) {
    randomSeq += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SCV-RWD-${randomSeq}`;
};

/**
 * rewardService — Complete Sprint 5 Reward Management & Redemption System.
 *
 * Collections:
 * 1. `rewards`
 *    - rewardId, name, description, imageUrl, pointsRequired, stock, category, isActive, isDeleted, createdAt, updatedAt
 * 2. `reward_redemptions`
 *    - redemptionId, userId, userName, userMemberId, rewardId, rewardName, rewardImageUrl, pointsRequired, status ('pending'|'completed'|'rejected'), officerId, rejectionReason, createdAt, completedAt
 */
export const rewardService = {
  // ─── REWARDS CATALOG MANAGEMENT (Officer & Admin) ───

  /**
   * Get all rewards from Firestore `rewards` collection.
   */
  async getRewards({ activeOnly = false } = {}) {
    try {
      const rewardsRef = collection(db, 'rewards');
      const qSnap = await getDocs(rewardsRef);
      let list = qSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.isDeleted !== true);

      if (activeOnly) {
        list = list.filter((r) => r.isActive !== false && Number(r.stock) > 0);
      }

      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching rewards:', err);
      return [];
    }
  },

  /**
   * Get single reward details by ID.
   */
  async getRewardById(rewardId) {
    if (!rewardId) return null;
    try {
      const ref = doc(db, 'rewards', rewardId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.error('Error fetching reward by ID:', err);
    }
    return null;
  },

  /**
   * Create a new reward item (Officer/Admin).
   */
  async createReward({ name, description, imageUrl, pointsRequired, stock, category = 'umum', isActive = true }) {
    const rewardName = (name || '').trim();
    if (!rewardName || !pointsRequired) {
      throw new Error('Nama reward dan jumlah poin yang dibutuhkan wajib diisi.');
    }

    const newDocRef = doc(collection(db, 'rewards'));
    const rewardData = {
      rewardId: newDocRef.id,
      name: rewardName,
      description: description ? description.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      pointsRequired: Number(pointsRequired),
      stock: Number(stock || 0),
      category: category ? category.trim().toLowerCase() : 'umum',
      isActive: Boolean(isActive),
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newDocRef, rewardData);
    return { id: newDocRef.id, ...rewardData };
  },

  /**
   * Update existing reward item.
   */
  async updateReward(rewardId, { name, description, imageUrl, pointsRequired, stock, category, isActive }) {
    const ref = doc(db, 'rewards', rewardId);
    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (pointsRequired !== undefined) updateData.pointsRequired = Number(pointsRequired);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (category !== undefined) updateData.category = category.trim().toLowerCase();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    await updateDoc(ref, updateData);
    return true;
  },

  /**
   * Soft delete reward item.
   */
  async deleteReward(rewardId) {
    const ref = doc(db, 'rewards', rewardId);
    await updateDoc(ref, {
      isDeleted: true,
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    return true;
  },

  /**
   * Toggle reward active status.
   */
  async toggleRewardStatus(rewardId, currentStatus) {
    const ref = doc(db, 'rewards', rewardId);
    await updateDoc(ref, {
      isActive: !currentStatus,
      updatedAt: serverTimestamp(),
    });
    return true;
  },

  // ─── REDEMPTION REQUEST & CONFIRMATION (Citizen & Officer) ───

  /**
   * Citizen requests a reward redemption.
   * NOTE: Points and stock are NOT deducted immediately upon request creation!
   */
  async requestRedemption(userId, userProfile, rewardId) {
    const reward = await this.getRewardById(rewardId);
    if (!reward) throw new Error('Reward tidak ditemukan.');
    if (!reward.isActive) throw new Error('Reward sedang dalam status non-aktif.');
    if (Number(reward.stock) <= 0) throw new Error('Stok reward telah habis.');

    const currentPoints = userProfile?.points || 0;
    if (currentPoints < Number(reward.pointsRequired)) {
      throw new Error(`Poin tidak mencukupi. Anda membutuhkan ${reward.pointsRequired} poin (Poin Anda: ${currentPoints}).`);
    }

    const redemptionId = generateRedemptionId();
    const redDocRef = doc(db, 'reward_redemptions', redemptionId);

    const redemptionData = {
      redemptionId,
      userId,
      userName: userProfile?.fullName || 'Warga SCV',
      userMemberId: userProfile?.memberId || 'N/A',
      rewardId,
      rewardName: reward.name || reward.title || 'Reward SCV',
      rewardImageUrl: reward.imageUrl || '',
      pointsRequired: Number(reward.pointsRequired),
      status: 'pending', // 'pending' | 'completed' | 'rejected'
      officerId: null,
      rejectionReason: null,
      createdAt: serverTimestamp(),
      completedAt: null,
    };

    await setDoc(redDocRef, redemptionData);
    return { id: redemptionId, ...redemptionData };
  },

  /**
   * Real-time listener for a single redemption document.
   */
  listenToRedemption(redemptionId, callback) {
    if (!redemptionId) return () => { };
    const ref = doc(db, 'reward_redemptions', redemptionId);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() });
        }
      },
      (err) => console.error('Redemption listener error:', err)
    );
  },

  /**
   * Real-time listener for all redemptions belonging to a citizen.
   * Used in MyRedemptionsPage so the card list auto-updates on status change.
   */
  listenToCitizenRedemptions(userId, callback) {
    if (!userId) return () => { };
    const ref = collection(db, 'reward_redemptions');
    const q = query(ref, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(list);
      },
      (err) => console.error('Citizen redemptions listener error:', err)
    );
  },

  /**
   * Real-time listener for all redemptions (Officer / Admin view).
   * Auto-updates the officer list when citizen confirms receipt.
   */
  listenToAllRedemptions(callback) {
    const ref = collection(db, 'reward_redemptions');
    return onSnapshot(
      ref,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(list);
      },
      (err) => console.error('All redemptions listener error:', err)
    );
  },

  /**
   * Officer scans QR & requests physical confirmation from Citizen.
   * Changes status -> 'awaiting_confirmation'.
   */
  async requestOfficerVerification(
    redemptionId,
    officerId,
    officerName = 'Petugas Station',
    proofImageUrl = null,
    postName = 'Posko SCV Utama',
    isAnonymous = false,
    officerRealName = null
  ) {
    if (!redemptionId) throw new Error('Redemption ID required.');
    const redRef = doc(db, 'reward_redemptions', redemptionId);
    const redSnap = await getDoc(redRef);
    if (!redSnap.exists()) throw new Error(`Voucher penukaran "${redemptionId}" tidak ditemukan.`);

    const data = redSnap.data();
    if (data.status === 'completed') throw new Error('Penukaran ini sudah selesai.');
    if (data.status === 'rejected') throw new Error('Penukaran ini telah ditolak.');

    // Public-facing name: 'Anonim' if anonymous mode is on, else officer's real name
    const publicName = isAnonymous ? 'Anonim' : (officerName || 'Petugas Station');

    const updatePayload = {
      status: 'awaiting_confirmation',
      officerId: officerId || 'officer',
      officerName: publicName,          // Shown publicly to citizen
      officerRealName: officerRealName || officerName || 'Petugas Station', // Always real, admin only
      officerIsAnonymous: Boolean(isAnonymous),
      postName: (postName || 'Posko SCV Utama').trim(),
      proofImageUrl: proofImageUrl || '',
      officerConfirmed: false, // Handshake step 2 button required from officer
      citizenConfirmed: false, // Handshake step 2 button required from citizen
      verificationRequestedAt: serverTimestamp(),
    };

    await updateDoc(redRef, updatePayload);
    return true;
  },

  /**
   * 2-Party Handshake: Execute confirmation for officer or citizen.
   * Atomic completion occurs ONLY when BOTH officerConfirmed and citizenConfirmed become true!
   */
  async confirmHandshakeParty(redemptionId, party = 'citizen', officerId = null) {
    if (!redemptionId) throw new Error('Redemption ID required.');
    const redRef = doc(db, 'reward_redemptions', redemptionId);
    const redSnap = await getDoc(redRef);
    if (!redSnap.exists()) throw new Error(`Voucher penukaran "${redemptionId}" tidak ditemukan.`);

    const redemption = redSnap.data();
    if (redemption.status === 'completed') return true;
    if (redemption.status === 'rejected') throw new Error('Voucher penukaran telah ditolak.');

    const isOfficer = party === 'officer';
    const isCitizen = party === 'citizen';

    const newOfficerConfirmed = isOfficer ? true : Boolean(redemption.officerConfirmed);
    const newCitizenConfirmed = isCitizen ? true : Boolean(redemption.citizenConfirmed);

    // If BOTH parties have now confirmed:
    if (newOfficerConfirmed && newCitizenConfirmed) {
      // Verify user points
      const userRef = doc(db, 'users', redemption.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('Data akun warga tidak ditemukan.');
      const userPoints = userSnap.data().points || 0;
      if (userPoints < redemption.pointsRequired) {
        throw new Error(`Poin warga (${userPoints}) tidak mencukupi (${redemption.pointsRequired} Pts).`);
      }

      // Verify reward stock
      const rewardRef = doc(db, 'rewards', redemption.rewardId);
      const rewardSnap = await getDoc(rewardRef);
      if (!rewardSnap.exists()) throw new Error('Data item reward tidak ditemukan.');
      const currentStock = rewardSnap.data().stock || 0;
      if (currentStock <= 0) {
        throw new Error('Stok barang reward ini telah habis.');
      }

      // Perform atomic WriteBatch confirmation
      const batch = writeBatch(db);

      batch.update(redRef, {
        status: 'completed',
        officerConfirmed: true,
        citizenConfirmed: true,
        officerId: officerId || redemption.officerId || 'officer',
        completedAt: serverTimestamp(),
        citizenConfirmedAt: isCitizen ? serverTimestamp() : (redemption.citizenConfirmedAt || serverTimestamp()),
        officerConfirmedAt: isOfficer ? serverTimestamp() : (redemption.officerConfirmedAt || serverTimestamp()),
      });

      batch.update(userRef, {
        points: increment(-Number(redemption.pointsRequired)),
        updatedAt: serverTimestamp(),
      });

      batch.update(rewardRef, {
        stock: increment(-1),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return { completed: true };
    } else {
      // Partial handshake: update party flags, maintain 'awaiting_confirmation'
      const updateData = {
        status: 'awaiting_confirmation',
      };
      if (isOfficer) {
        updateData.officerConfirmed = true;
        updateData.officerConfirmedAt = serverTimestamp();
        if (officerId) updateData.officerId = officerId;
      }
      if (isCitizen) {
        updateData.citizenConfirmed = true;
        updateData.citizenConfirmedAt = serverTimestamp();
      }

      await updateDoc(redRef, updateData);
      return { completed: false, officerConfirmed: newOfficerConfirmed, citizenConfirmed: newCitizenConfirmed };
    }
  },

  /**
   * Citizen confirms physical receipt of the reward item on their screen.
   */
  async confirmCitizenReceipt(redemptionId) {
    return this.confirmHandshakeParty(redemptionId, 'citizen');
  },

  /**
   * Officer confirms physical handoff of the reward item on their screen.
   */
  async confirmOfficerHandshake(redemptionId, officerId) {
    return this.confirmHandshakeParty(redemptionId, 'officer', officerId);
  },

  /**
   * Confirm redemption request via Atomic WriteBatch (Manual override).
   */
  async confirmRedemption(redemptionId, officerId) {
    return this.confirmHandshakeParty(redemptionId, 'officer', officerId);
  },

  /**
   * Reject redemption request.
   * Points and stock remain untouched because they were not deducted on pending creation.
   */
  async rejectRedemption(redemptionId, officerId, rejectionReason = '') {
    if (!redemptionId) throw new Error('Redemption ID required.');

    const redRef = doc(db, 'reward_redemptions', redemptionId);
    const redSnap = await getDoc(redRef);
    if (!redSnap.exists()) throw new Error(`Voucher penukaran "${redemptionId}" tidak ditemukan.`);

    const redemption = redSnap.data();
    if (redemption.status === 'completed') {
      throw new Error('Penukaran yang sudah selesai tidak dapat dibatalkan/ditolak.');
    }

    await updateDoc(redRef, {
      status: 'rejected',
      officerId: officerId || 'officer',
      rejectionReason: rejectionReason ? rejectionReason.trim() : 'Ditolak oleh petugas station.',
      completedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Fetch redemptions by User ID (Citizen View).
   */
  async getCitizenRedemptions(userId) {
    if (!userId) return [];
    try {
      const redRef = collection(db, 'reward_redemptions');
      const q = query(redRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching citizen redemptions:', err);
      return [];
    }
  },

  /**
   * Fetch all redemptions (Officer & Admin View).
   */
  async getAllRedemptions({ statusFilter = 'all' } = {}) {
    try {
      const redRef = collection(db, 'reward_redemptions');
      const snap = await getDocs(redRef);
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (statusFilter !== 'all') {
        list = list.filter((r) => r.status === statusFilter);
      }

      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching all redemptions:', err);
      return [];
    }
  },

  /**
   * Get redemption metrics for dashboard cards.
   */
  async getRedemptionStats() {
    try {
      const rewardsRef = collection(db, 'rewards');
      const rewardsSnap = await getDocs(rewardsRef);
      const activeRewardsCount = rewardsSnap.docs.filter((d) => d.data().isActive !== false && !d.data().isDeleted).length;

      const redRef = collection(db, 'reward_redemptions');
      const redSnap = await getDocs(redRef);
      const redemptions = redSnap.docs.map((d) => d.data());

      const pendingCount = redemptions.filter((r) => r.status === 'pending').length;

      const todayStr = new Date().toDateString();
      const completedTodayCount = redemptions.filter((r) => {
        if (r.status !== 'completed' || !r.completedAt) return false;
        const dateObj = r.completedAt.toDate ? r.completedAt.toDate() : new Date(r.completedAt);
        return dateObj.toDateString() === todayStr;
      }).length;

      const totalPointsRedeemed = redemptions
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + (Number(r.pointsRequired) || 0), 0);

      return {
        activeRewardsCount,
        pendingCount,
        completedTodayCount,
        totalPointsRedeemed,
      };
    } catch (err) {
      console.error('Error calculating redemption stats:', err);
      return {
        activeRewardsCount: 0,
        pendingCount: 0,
        completedTodayCount: 0,
        totalPointsRedeemed: 0,
      };
    }
  },
};
