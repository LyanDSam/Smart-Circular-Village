import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const DEFAULT_SETTINGS = {
  pointRules: {
    organic: 100,
    plastic: 150,
    paper: 120,
    metal: 200,
    glass: 180,
  },
  compostRules: {
    minTemperature: 40,
    maxTemperature: 65,
    minHumidity: 50,
    maxHumidity: 70,
  },
  updatedAt: new Date().toISOString(),
};

/**
 * settingsService — Firestore-only system settings management.
 * Document location: `settings/system`
 */
export const settingsService = {
  /**
   * Fetch system settings from Firestore `settings/system`.
   */
  async getSettings() {
    try {
      const sysRef = doc(db, 'settings', 'system');
      const snap = await getDoc(sysRef);
      if (snap.exists()) {
        return snap.data();
      } else {
        // Initialize default system settings if document does not exist
        await setDoc(sysRef, {
          ...DEFAULT_SETTINGS,
          updatedAt: serverTimestamp(),
        });
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      console.error('Error fetching Firestore system settings:', err);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Alias for getSettings
   */
  async getSystemSettings() {
    return this.getSettings();
  },

  /**
   * Update system settings in Firestore `settings/system`.
   */
  async updateSettings(newSettings) {
    try {
      const sysRef = doc(db, 'settings', 'system');
      await setDoc(
        sysRef,
        {
          ...newSettings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.error('Error updating Firestore system settings:', err);
      throw err;
    }
  },

  /**
   * Alias for updateSettings
   */
  async updateSystemSettings(newSettings) {
    return this.updateSettings(newSettings);
  },
};
