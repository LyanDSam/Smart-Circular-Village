import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/firebase/auth';
import { db } from '@/firebase/firestore';

/**
 * authService — Firebase-only authentication & profile management.
 *
 * Authentication session is managed exclusively by Firebase Auth.
 * User profile is stored exclusively in Cloud Firestore `users/{uid}`.
 * No localStorage is used for auth state, profile, role, or permissions.
 */
export const authService = {
  /**
   * Generate a unique SCV Member ID.
   * Format: SCV-YY-XXXXXX (e.g. SCV-26-482910)
   */
  generateMemberId() {
    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    return `SCV-${yearSuffix}-${randomSeq}`;
  },

  /**
   * Register a new citizen account.
   * Creates Firebase Auth user, then writes Firestore profile document.
   */
  async register({ fullName, email, password, phone, address }) {
    if (!fullName || !email || !password || !phone || !address) {
      throw new Error('All registration fields are required.');
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const memberId = this.generateMemberId();

      const userDocData = {
        uid: user.uid,
        memberId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        address: address.trim(),
        role: 'pending',
        status: 'pending',
        points: 0,
        rfidUid: null,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userDocData);

      return { user, profile: { ...userDocData } };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Sign in with email and password.
   * Profile is loaded reactively via onSnapshot in subscribeToAuthChanges.
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      return { user: userCredential.user };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  /**
   * Sign out the current user.
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * One-time fetch of user profile from Firestore.
   * Used by refreshProfile() as a manual fallback.
   */
  async getUserProfile(uid) {
    if (!uid) return null;

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { uid: userSnap.id, ...userSnap.data() };
      }
    } catch (err) {
      console.error('Error fetching Firestore user profile:', err);
    }

    return null;
  },

  /**
   * Subscribe to auth state changes AND realtime Firestore profile updates.
   *
   * Flow:
   *   onAuthStateChanged(auth) → user detected
   *     → onSnapshot(doc(db, 'users', uid)) → profile synced in real-time
   *
   * When an admin changes role/status/rfid/points in Firestore,
   * the logged-in user's AuthContext updates automatically.
   *
   * @param {Function} callback - (authUser, profileData) => void
   * @returns {Function} unsubscribe - call to clean up all listeners
   */
  subscribeToAuthChanges(callback) {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous profile listener when auth state changes
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        // Attach Firestore onSnapshot() listener to users/{uid}
        const userRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const profileData = { uid: docSnap.id, ...docSnap.data() };
              callback(user, profileData);
            } else {
              // Auth exists but Firestore doc not yet created (race condition during registration)
              callback(user, null);
            }
          },
          (error) => {
            console.error('Realtime user profile snapshot error:', error);
            callback(user, null);
          }
        );
      } else {
        // User is signed out
        callback(null, null);
      }
    });

    // Return combined cleanup function
    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  },

  /**
   * Map Firebase Auth error codes to user-friendly messages.
   */
  handleAuthError(error) {
    const code = error.code;
    switch (code) {
      case 'auth/email-already-in-use':
        return new Error('This email address is already registered. Please sign in instead.');
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please use at least 6 characters.');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new Error('Invalid email or password.');
      case 'auth/user-disabled':
        return new Error('This account has been disabled by an administrator.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your internet connection.');
      default:
        return new Error(error.message || 'Authentication operation failed.');
    }
  },
};
