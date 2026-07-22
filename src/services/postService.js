import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { deviceService } from './deviceService';
import { userService } from './userService';

export const postService = {
  /**
   * Fetch all active non-deleted collection posts from Firestore.
   */
  async getPosts({ search = '', page = 1, pageSize = 10 } = {}) {
    let postsList = [];

    try {
      const postsRef = collection(db, 'posts');
      const qSnap = await getDocs(postsRef);

      if (!qSnap.empty) {
        postsList = qSnap.docs.map((d) => ({
          postId: d.id,
          ...d.data(),
        }));
      }
    } catch (err) {
      console.error('Error fetching posts from Firestore:', err);
      postsList = [];
    }

    // Filter out soft-deleted posts
    postsList = postsList.filter((p) => !p.isDeleted);

    // Search query filter
    if (search.trim()) {
      const queryLower = search.toLowerCase().trim();
      postsList = postsList.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(queryLower)) ||
          (p.address && p.address.toLowerCase().includes(queryLower)) ||
          (p.village && p.village.toLowerCase().includes(queryLower)) ||
          (p.description && p.description.toLowerCase().includes(queryLower))
      );
    }

    // Sort by createdAt descending
    postsList.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    const totalCount = postsList.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedPosts = postsList.slice(startIndex, startIndex + pageSize);

    return {
      posts: paginatedPosts,
      totalCount,
      totalPages,
      currentPage: page,
    };
  },

  /**
   * Fetch single Post document by ID.
   */
  async getPostById(postId) {
    if (!postId) return null;
    try {
      const pRef = doc(db, 'posts', postId);
      const snap = await getDoc(pRef);
      if (snap.exists()) {
        return { postId: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.error(`Error fetching post ${postId}:`, err);
    }
    return null;
  },

  /**
   * Fetch devices available for assignment (unassigned or belonging to specific postId).
   */
  async getAvailableDevices(currentPostId = null) {
    const { devices } = await deviceService.getDevices({ pageSize: 10000 });
    return devices.filter(
      (d) => !d.postId || d.postId === currentPostId
    );
  },

  /**
   * Fetch Officers available for assignment (role === 'officer', unassigned or belonging to currentPostId).
   */
  async getAvailableOfficers(currentPostId = null) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      let officers = [];
      if (!snap.empty) {
        officers = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.role === 'officer' && (!u.postId || u.postId === currentPostId));
      }
      return officers;
    } catch (err) {
      console.error('Error fetching available officers:', err);
      return [];
    }
  },

  /**
   * Create new Collection Post document in Firestore & update assigned device & officer documents.
   */
  async createPost(postData) {
    const name = postData.name?.trim();
    if (!name) throw new Error('Nama Posko Pengumpulan wajib diisi.');

    const deviceIds = Array.isArray(postData.deviceIds) ? postData.deviceIds : [];
    const officerIds = Array.isArray(postData.officerIds) ? postData.officerIds : [];

    if (deviceIds.length === 0) {
      throw new Error('Posko Pengumpulan wajib memiliki minimal 1 perangkat IoT terpasang.');
    }

    const postId = `POST-${Date.now()}`;
    const batch = writeBatch(db);

    const newPost = {
      postId,
      name,
      address: postData.address?.trim() || '',
      village: postData.village?.trim() || '',
      description: postData.description?.trim() || '',
      deviceIds,
      officerIds,
      isActive: postData.isActive !== false,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 1. Write Post document
    const postRef = doc(db, 'posts', postId);
    batch.set(postRef, newPost);

    // 2. Update device.postId for all assigned devices
    deviceIds.forEach((devId) => {
      const devRef = doc(db, 'devices', devId);
      batch.update(devRef, {
        postId: postId,
        updatedAt: serverTimestamp(),
      });
    });

    // 3. Update user.postId for all assigned officers
    officerIds.forEach((offId) => {
      const userRef = doc(db, 'users', offId);
      batch.update(userRef, {
        postId: postId,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return { postId, ...newPost };
  },

  /**
   * Update existing Collection Post & adjust device/officer assignments.
   */
  async updatePost(postId, postData) {
    if (!postId) throw new Error('ID Posko tidak valid.');

    const existingPost = await this.getPostById(postId);
    if (!existingPost) throw new Error('Posko tidak ditemukan.');

    const newDeviceIds = Array.isArray(postData.deviceIds) ? postData.deviceIds : [];
    const newOfficerIds = Array.isArray(postData.officerIds) ? postData.officerIds : [];

    if (newDeviceIds.length === 0) {
      throw new Error('Posko Pengumpulan wajib memiliki minimal 1 perangkat IoT terpasang.');
    }

    const oldDeviceIds = existingPost.deviceIds || [];
    const oldOfficerIds = existingPost.officerIds || [];

    const batch = writeBatch(db);

    // 1. Update Post document
    const postRef = doc(db, 'posts', postId);
    batch.update(postRef, {
      name: postData.name?.trim() || existingPost.name,
      address: postData.address?.trim() || '',
      village: postData.village?.trim() || '',
      description: postData.description?.trim() || '',
      deviceIds: newDeviceIds,
      officerIds: newOfficerIds,
      isActive: postData.isActive !== false,
      updatedAt: serverTimestamp(),
    });

    // 2. Unassign devices no longer in newDeviceIds
    const unassignedDevices = oldDeviceIds.filter((id) => !newDeviceIds.includes(id));
    unassignedDevices.forEach((devId) => {
      const devRef = doc(db, 'devices', devId);
      batch.update(devRef, { postId: '', updatedAt: serverTimestamp() });
    });

    // 3. Assign newly added devices
    newDeviceIds.forEach((devId) => {
      const devRef = doc(db, 'devices', devId);
      batch.update(devRef, { postId: postId, updatedAt: serverTimestamp() });
    });

    // 4. Unassign officers no longer in newOfficerIds
    const unassignedOfficers = oldOfficerIds.filter((id) => !newOfficerIds.includes(id));
    unassignedOfficers.forEach((offId) => {
      const userRef = doc(db, 'users', offId);
      batch.update(userRef, { postId: '', updatedAt: serverTimestamp() });
    });

    // 5. Assign newly added officers
    newOfficerIds.forEach((offId) => {
      const userRef = doc(db, 'users', offId);
      batch.update(userRef, { postId: postId, updatedAt: serverTimestamp() });
    });

    await batch.commit();
    return true;
  },

  /**
   * Reassign an Officer from their current post to a target post.
   */
  async reassignOfficer({ officerId, targetPostId }) {
    if (!officerId) throw new Error('ID Petugas tidak valid.');

    const userRef = doc(db, 'users', officerId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Petugas tidak ditemukan.');

    const officerData = userSnap.data();
    const currentPostId = officerData.postId;

    const batch = writeBatch(db);

    // 1. Remove officerId from current post's officerIds array if assigned
    if (currentPostId && currentPostId !== targetPostId) {
      const currentPost = await this.getPostById(currentPostId);
      if (currentPost) {
        const updatedOfficerIds = (currentPost.officerIds || []).filter((id) => id !== officerId);
        const cpRef = doc(db, 'posts', currentPostId);
        batch.update(cpRef, {
          officerIds: updatedOfficerIds,
          updatedAt: serverTimestamp(),
        });
      }
    }

    // 2. Add officerId to target post's officerIds array if targetPostId is valid
    if (targetPostId) {
      const targetPost = await this.getPostById(targetPostId);
      if (targetPost) {
        const existingIds = targetPost.officerIds || [];
        if (!existingIds.includes(officerId)) {
          const tpRef = doc(db, 'posts', targetPostId);
          batch.update(tpRef, {
            officerIds: [...existingIds, officerId],
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    // 3. Update officer's user document
    batch.update(userRef, {
      postId: targetPostId || '',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return true;
  },

  /**
   * Soft delete a Collection Post and unassign its devices & officers.
   */
  async deletePost(postId) {
    if (!postId) throw new Error('ID Posko tidak valid.');

    const post = await this.getPostById(postId);
    if (!post) return false;

    const batch = writeBatch(db);

    // 1. Soft delete post
    const postRef = doc(db, 'posts', postId);
    batch.update(postRef, {
      isDeleted: true,
      isActive: false,
      updatedAt: serverTimestamp(),
    });

    // 2. Unassign devices
    (post.deviceIds || []).forEach((devId) => {
      const devRef = doc(db, 'devices', devId);
      batch.update(devRef, { postId: '', updatedAt: serverTimestamp() });
    });

    // 3. Unassign officers
    (post.officerIds || []).forEach((offId) => {
      const userRef = doc(db, 'users', offId);
      batch.update(userRef, { postId: '', updatedAt: serverTimestamp() });
    });

    await batch.commit();
    return true;
  },
};
