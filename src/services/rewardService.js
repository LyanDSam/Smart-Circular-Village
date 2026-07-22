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
   * Confirm redemption request via Atomic WriteBatch.
   * Performs:
   * 1. Update `reward_redemptions/{redemptionId}` status -> 'completed', completedAt, officerId
   * 2. Decrease `users/{userId}.points` using increment(-pointsRequired)
   * 3. Decrease `rewards/{rewardId}.stock` using increment(-1)
   */
  async confirmRedemption(redemptionId, officerId) {
    if (!redemptionId) throw new Error('Redemption ID required.');

    const redRef = doc(db, 'reward_redemptions', redemptionId);
    const redSnap = await getDoc(redRef);
    if (!redSnap.exists()) throw new Error(`Voucher penukaran "${redemptionId}" tidak ditemukan.`);

    const redemption = redSnap.data();
    if (redemption.status === 'completed') {
      throw new Error(`Penukaran "${redemptionId}" sudah pernah dikonfirmasi sebelumnya.`);
    }
    if (redemption.status === 'rejected') {
      throw new Error(`Penukaran "${redemptionId}" telah ditolak dan tidak dapat dikonfirmasi.`);
    }

    // Verify current user points
    const userRef = doc(db, 'users', redemption.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Data akun warga penyetor tidak ditemukan.');
    const userPoints = userSnap.data().points || 0;
    if (userPoints < redemption.pointsRequired) {
      throw new Error(`Poin warga (${userPoints}) tidak mencukupi untuk penukaran ini (${redemption.pointsRequired} poin).`);
    }

    // Verify reward stock
    const rewardRef = doc(db, 'rewards', redemption.rewardId);
    const rewardSnap = await getDoc(rewardRef);
    if (!rewardSnap.exists()) throw new Error('Data reward item tidak ditemukan.');
    const currentStock = rewardSnap.data().stock || 0;
    if (currentStock <= 0) {
      throw new Error('Stok reward item ini telah habis.');
    }

    // Atomic WriteBatch execution
    const batch = writeBatch(db);

    // 1. Update redemption status to completed
    batch.update(redRef, {
      status: 'completed',
      officerId: officerId || 'officer',
      completedAt: serverTimestamp(),
    });

    // 2. Deduct points from user
    batch.update(userRef, {
      points: increment(-Number(redemption.pointsRequired)),
      updatedAt: serverTimestamp(),
    });

    // 3. Deduct 1 stock from reward item
    batch.update(rewardRef, {
      stock: increment(-1),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return true;
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
