import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

/**
 * userService — Firestore-only user management operations.
 *
 * All reads and writes go directly to Cloud Firestore `users` collection.
 * No localStorage fallback. Firestore is the single source of truth.
 */
export const userService = {
  /**
   * Fetch all users with filtering, searching, and pagination.
   */
  async getUsers({ search = '', role = 'all', status = 'all', page = 1, pageSize = 10 } = {}) {
    let usersList = [];

    try {
      const usersRef = collection(db, 'users');
      const qSnap = await getDocs(usersRef);
      usersList = qSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching Firestore users:', err);
      throw new Error('Failed to fetch users from Firestore.');
    }

    // Filter soft-deleted
    usersList = usersList.filter((u) => !u.isDeleted);

    // Apply Search
    if (search.trim()) {
      const queryLower = search.toLowerCase().trim();
      usersList = usersList.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(queryLower)) ||
          (u.email && u.email.toLowerCase().includes(queryLower)) ||
          (u.memberId && u.memberId.toLowerCase().includes(queryLower)) ||
          (u.rfidUid && u.rfidUid.toLowerCase().includes(queryLower))
      );
    }

    // Apply Role Filter
    if (role !== 'all') {
      usersList = usersList.filter((u) => u.role === role);
    }

    // Apply Status Filter
    if (status !== 'all') {
      usersList = usersList.filter((u) => u.status === status);
    }

    // Sort by createdAt descending
    usersList.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Pagination
    const totalCount = usersList.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = usersList.slice(startIndex, startIndex + pageSize);

    return {
      users: paginatedUsers,
      totalCount,
      totalPages,
      currentPage: page,
    };
  },

  /**
   * Get pending verification users only.
   */
  async getPendingUsers() {
    return this.getUsers({ status: 'pending', pageSize: 100 });
  },

  /**
   * Get single user by UID from Firestore.
   */
  async getUserById(uid) {
    if (!uid) return null;

    try {
      const uRef = doc(db, 'users', uid);
      const snap = await getDoc(uRef);
      if (snap.exists()) {
        return { uid: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.error('Error getting user by ID:', err);
    }

    return null;
  },

  /**
   * Validate RFID Uniqueness across all users in Firestore.
   */
  async isRfidUnique(rfidUid, currentUid = null) {
    if (!rfidUid) return true;
    const cleanRfid = rfidUid.trim().toUpperCase();

    const { users } = await this.getUsers({ pageSize: 10000 });
    const existing = users.find(
      (u) => u.rfidUid && u.rfidUid.toUpperCase() === cleanRfid && u.uid !== currentUid
    );
    return !existing;
  },

  /**
   * Assign or update RFID card UID in Firestore.
   */
  async assignRfid(uid, rfidUid) {
    if (!rfidUid || !rfidUid.trim()) {
      throw new Error('RFID card UID cannot be empty.');
    }
    const cleanRfid = rfidUid.trim().toUpperCase();

    const isUnique = await this.isRfidUnique(cleanRfid, uid);
    if (!isUnique) {
      throw new Error(`RFID card UID "${cleanRfid}" is already assigned to another user.`);
    }

    const uRef = doc(db, 'users', uid);
    await updateDoc(uRef, {
      rfidUid: cleanRfid,
      updatedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Approve User Registration in Firestore.
   * Sets status=active, role=assignedRole, rfidUid=finalRfid.
   */
  async approveUser(uid, assignedRfid = null, assignedRole = 'citizen') {
    const user = await this.getUserById(uid);
    if (!user) throw new Error('User not found.');

    const finalRfid = assignedRfid ? assignedRfid.trim().toUpperCase() : user.rfidUid;

    if (!finalRfid) {
      throw new Error('RFID card must be assigned before account activation.');
    }

    const isUnique = await this.isRfidUnique(finalRfid, uid);
    if (!isUnique) {
      throw new Error(`RFID card UID "${finalRfid}" is already assigned to another user.`);
    }

    const uRef = doc(db, 'users', uid);
    await updateDoc(uRef, {
      status: 'active',
      role: assignedRole,
      rfidUid: finalRfid,
      updatedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Reject User Registration in Firestore.
   */
  async rejectUser(uid, rejectionReason = '') {
    const uRef = doc(db, 'users', uid);
    await updateDoc(uRef, {
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      updatedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Update User Information in Firestore (Full Name, Phone, Address).
   */
  async updateUser(uid, { fullName, phone, address }) {
    const uRef = doc(db, 'users', uid);
    await updateDoc(uRef, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      updatedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Soft Delete User in Firestore.
   */
  async softDeleteUser(uid) {
    const uRef = doc(db, 'users', uid);
    await updateDoc(uRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });

    return true;
  },

  /**
   * Calculate User Management Dashboard Metrics from Firestore.
   */
  async getUserStats() {
    const { users } = await this.getUsers({ pageSize: 10000 });

    const totalUsers = users.length;
    const pendingCount = users.filter((u) => u.status === 'pending').length;
    const activeCitizens = users.filter((u) => u.status === 'active' && u.role === 'citizen').length;
    const activeOfficers = users.filter((u) => u.status === 'active' && u.role === 'officer').length;
    const rejectedCount = users.filter((u) => u.status === 'rejected').length;

    return {
      totalUsers,
      pendingCount,
      activeCitizens,
      activeOfficers,
      rejectedCount,
    };
  },
};
