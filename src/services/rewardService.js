import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

/**
 * rewardService — Manage Reward Catalog and Reward Redemptions in Firestore.
 *
 * Collections:
 * 1. `rewards`
 *    - rewardId, title, description, pointsRequired, stock, isActive, createdAt, updatedAt
 * 2. `reward_redemptions`
 *    - redemptionId, userId, userName, rewardId, rewardTitle, pointsUsed, status ('requested'|'approved'|'rejected'|'collected'), requestedAt, processedBy, processedAt
 */
export const rewardService = {
  // ─── REWARDS MANAGEMENT (Officer Operations) ───

  /**
   * Get all rewards (Officer & Admin view all, Citizens view active only)
   */
  async getRewards({ activeOnly = false } = {}) {
    try {
      const rewardsRef = collection(db, 'rewards');
      const qSnap = await getDocs(rewardsRef);
      let list = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (activeOnly) {
        list = list.filter((r) => r.isActive !== false);
      }

      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching rewards:', err);
      return [];
    }
  },

  /**
   * Get single reward details by ID
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
   * Create a new reward item (Officer Only)
   */
  async createReward({ title, description, pointsRequired, stock, isActive = true }) {
    if (!title || !pointsRequired) {
      throw new Error('Reward title and points required are mandatory.');
    }

    const newDocRef = doc(collection(db, 'rewards'));
    const rewardData = {
      rewardId: newDocRef.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      pointsRequired: Number(pointsRequired),
      stock: Number(stock || 0),
      isActive: Boolean(isActive),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newDocRef, rewardData);
    return { id: newDocRef.id, ...rewardData };
  },

  /**
   * Update existing reward item (Officer Only)
   */
  async updateReward(rewardId, { title, description, pointsRequired, stock, isActive }) {
    const ref = doc(db, 'rewards', rewardId);
    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (pointsRequired !== undefined) updateData.pointsRequired = Number(pointsRequired);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    await updateDoc(ref, updateData);
    return true;
  },

  /**
   * Delete reward item (Officer Only)
   */
  async deleteReward(rewardId) {
    const ref = doc(db, 'rewards', rewardId);
    await deleteDoc(ref);
    return true;
  },

  /**
   * Toggle reward active status
   */
  async toggleRewardStatus(rewardId, currentStatus) {
    const ref = doc(db, 'rewards', rewardId);
    await updateDoc(ref, {
      isActive: !currentStatus,
      updatedAt: serverTimestamp(),
    });
    return true;
  },

  // ─── REDEMPTIONS MANAGEMENT (Citizen & Officer Operations) ───

  /**
   * Citizen requests a reward redemption
   */
  async redeemReward(userId, userName, rewardId) {
    const reward = await this.getRewardById(rewardId);
    if (!reward) throw new Error('Reward not found.');
    if (!reward.isActive) throw new Error('Reward is currently inactive.');
    if (reward.stock <= 0) throw new Error('Reward is out of stock.');

    // Fetch citizen user doc to verify points
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Citizen user not found.');

    const userProfile = userSnap.data();
    const currentPoints = userProfile.points || 0;

    if (currentPoints < reward.pointsRequired) {
      throw new Error(`Insufficient points. You need ${reward.pointsRequired} points but have ${currentPoints} points.`);
    }

    // Deduct points & reduce stock
    await updateDoc(userRef, {
      points: currentPoints - reward.pointsRequired,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'rewards', rewardId), {
      stock: reward.stock - 1,
      updatedAt: serverTimestamp(),
    });

    // Create redemption record in `reward_redemptions`
    const redemptionRef = doc(collection(db, 'reward_redemptions'));
    const redemptionData = {
      redemptionId: redemptionRef.id,
      userId,
      userName: userName || userProfile.fullName || 'Citizen',
      rewardId,
      rewardTitle: reward.title,
      pointsUsed: reward.pointsRequired,
      status: 'requested', // 'requested' | 'approved' | 'rejected' | 'collected'
      requestedAt: serverTimestamp(),
      processedBy: null,
      processedAt: null,
    };

    await setDoc(redemptionRef, redemptionData);
    return { id: redemptionRef.id, ...redemptionData };
  },

  /**
   * Fetch redemptions by User ID (Citizen View)
   */
  async getCitizenRedemptions(userId) {
    if (!userId) return [];
    try {
      const redRef = collection(db, 'reward_redemptions');
      const q = query(redRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching citizen redemptions:', err);
      return [];
    }
  },

  /**
   * Fetch all redemptions (Officer & Admin View)
   */
  async getAllRedemptions({ statusFilter = 'all' } = {}) {
    try {
      const redRef = collection(db, 'reward_redemptions');
      const snap = await getDocs(redRef);
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (statusFilter !== 'all') {
        list = list.filter((r) => r.status === statusFilter);
      }

      list.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
      return list;
    } catch (err) {
      console.error('Error fetching all redemptions:', err);
      return [];
    }
  },

  /**
   * Officer updates redemption status (Approve, Reject, Mark Collected)
   */
  async updateRedemptionStatus(redemptionId, newStatus, officerUid) {
    const validStatuses = ['approved', 'rejected', 'collected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid redemption status: ${newStatus}`);
    }

    const redRef = doc(db, 'reward_redemptions', redemptionId);
    const redSnap = await getDoc(redRef);
    if (!redSnap.exists()) throw new Error('Redemption record not found.');

    const redemption = redSnap.data();

    // If rejecting, refund points to citizen and restore stock
    if (newStatus === 'rejected' && redemption.status !== 'rejected') {
      const userRef = doc(db, 'users', redemption.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        await updateDoc(userRef, {
          points: currentPoints + redemption.pointsUsed,
          updatedAt: serverTimestamp(),
        });
      }

      const rewardRef = doc(db, 'rewards', redemption.rewardId);
      const rewardSnap = await getDoc(rewardRef);
      if (rewardSnap.exists()) {
        const currentStock = rewardSnap.data().stock || 0;
        await updateDoc(rewardRef, {
          stock: currentStock + 1,
          updatedAt: serverTimestamp(),
        });
      }
    }

    await updateDoc(redRef, {
      status: newStatus,
      processedBy: officerUid || 'officer',
      processedAt: serverTimestamp(),
    });

    return true;
  },
};
