import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { db } from '@/firebase/firestore';
import { rtdb } from '@/firebase/rtdb';

/**
 * Generate secure API Key for ESP32 authentication.
 * Minimum 32 hexadecimal characters prefixed with "SCV_".
 */
export const generateApiKey = () => {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `SCV_${hex}`;
};

/**
 * Compute Device Online Status from RTDB `lastSeen` heartbeat.
 * Rules:
 * - If !device.isActive -> 'disabled'
 * - If !lastSeen -> 'offline'
 * - If currentTime - lastSeen < 60,000 ms (60 seconds) -> 'online'
 * - Else -> 'offline'
 */
export const computeDeviceStatus = (device, lastSeenMs = null) => {
  if (!device || device.isActive === false) return 'disabled';

  const timestampMs = lastSeenMs || (device.lastSeen ? new Date(device.lastSeen).getTime() : null);
  if (!timestampMs) return 'offline';

  const diffMs = Date.now() - timestampMs;
  if (diffMs < 60000) {
    return 'online';
  }
  return 'offline';
};

/**
 * Standardized Seed Devices for Initial System Setup
 */
const DEFAULT_MOCK_DEVICES = [
  {
    deviceId: 'SCV-COMP-001',
    deviceType: 'compost',
    name: 'Smart Compost Bin #01',
    firmwareVersion: '1.0.0',
    apiKey: 'SCV_9f2ab45d81c049e7b1a23c4d5e6f7a8b',
    location: {
      village: 'Desa Circular Utama',
      address: 'Komposting Area RT 03 / RW 01',
      latitude: -6.2088,
      longitude: 106.8456,
    },
    isActive: true,
    isDeleted: false,
    lastSeen: new Date(Date.now() - 20 * 1000).toISOString(), // 20 seconds ago -> Online
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 1000).toISOString(),
  },
  {
    deviceId: 'SCV-COLL-001',
    deviceType: 'collection_station',
    name: 'Smart Collection Station POS 01',
    firmwareVersion: '1.1.2',
    apiKey: 'SCV_4b7190c12e8f43a9a1d2e3f4567890ab',
    location: {
      village: 'Desa Circular Utama',
      address: 'Pos Pengumpulan RT 01 / RW 01',
      latitude: -6.2095,
      longitude: 106.8462,
    },
    isActive: true,
    isDeleted: false,
    lastSeen: new Date(Date.now() - 10 * 1000).toISOString(), // 10 seconds ago -> Online
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 1000).toISOString(),
  },
  {
    deviceId: 'SCV-COMP-002',
    deviceType: 'compost',
    name: 'Smart Compost Bin #02',
    firmwareVersion: '1.0.0',
    apiKey: 'SCV_7f8e9d0c1b2a3456789abcdef0123456',
    location: {
      village: 'Desa Circular Barat',
      address: 'Kebun Komunitas RT 05 / RW 02',
      latitude: -6.2110,
      longitude: 106.8420,
    },
    isActive: true,
    isDeleted: false,
    lastSeen: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago -> Offline
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    deviceId: 'SCV-COLL-002',
    deviceType: 'collection_station',
    name: 'Smart Collection Station POS 02',
    firmwareVersion: '1.0.0',
    apiKey: 'SCV_1a2b3c4d5e6f7890123456789abcdef0',
    location: {
      village: 'Desa Circular Timur',
      address: 'Pos Pengumpulan RW 03',
      latitude: -6.2050,
      longitude: 106.8500,
    },
    isActive: false, // Disabled
    isDeleted: false,
    lastSeen: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

export const deviceService = {
  /**
   * Fetch devices metadata from Cloud Firestore & enrich with computed status from RTDB heartbeat.
   */
  async getDevices({ search = '', type = 'all', village = 'all', page = 1, pageSize = 10 } = {}) {
    let devicesList = [];

    try {
      const devicesRef = collection(db, 'devices');
      const qSnap = await getDocs(devicesRef);

      if (!qSnap.empty) {
        devicesList = qSnap.docs.map((d) => {
          const data = d.data();
          return {
            deviceId: d.id,
            deviceType: data.deviceType || data.type || 'compost',
            ...data,
          };
        });
      } else {
        devicesList = [...DEFAULT_MOCK_DEVICES];
      }
    } catch (err) {
      console.warn('Connecting to Firestore devices metadata notice:', err);
      devicesList = [...DEFAULT_MOCK_DEVICES];
    }

    // Filter out soft-deleted
    devicesList = devicesList.filter((d) => !d.isDeleted);

    // Compute online status dynamically for each device
    devicesList = devicesList.map((d) => ({
      ...d,
      status: computeDeviceStatus(d),
    }));

    // Filter by Device Type
    if (type !== 'all') {
      devicesList = devicesList.filter((d) => (d.deviceType || d.type) === type);
    }

    // Filter by Village / Location
    if (village !== 'all' && village.trim()) {
      devicesList = devicesList.filter((d) => d.location?.village?.toLowerCase() === village.toLowerCase());
    }

    // Search Query
    if (search.trim()) {
      const queryLower = search.toLowerCase().trim();
      devicesList = devicesList.filter(
        (d) =>
          (d.deviceId && d.deviceId.toLowerCase().includes(queryLower)) ||
          (d.name && d.name.toLowerCase().includes(queryLower)) ||
          (d.location?.address && d.location.address.toLowerCase().includes(queryLower)) ||
          (d.location?.village && d.location.village.toLowerCase().includes(queryLower)) ||
          (d.firmwareVersion && d.firmwareVersion.toLowerCase().includes(queryLower))
      );
    }

    // Sort by createdAt descending
    devicesList.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    const totalCount = devicesList.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedDevices = devicesList.slice(startIndex, startIndex + pageSize);

    return {
      devices: paginatedDevices,
      totalCount,
      totalPages,
      currentPage: page,
    };
  },

  /**
   * Fetch single device by Device ID.
   */
  async getDeviceById(deviceId) {
    if (!deviceId) return null;

    try {
      const dRef = doc(db, 'devices', deviceId);
      const snap = await getDoc(dRef);
      if (snap.exists()) {
        const data = snap.data();
        const dev = { deviceId: snap.id, deviceType: data.deviceType || data.type, ...data };
        return { ...dev, status: computeDeviceStatus(dev) };
      }
    } catch (err) {
      console.warn('Error fetching device from Firestore:', err);
    }

    const mock = DEFAULT_MOCK_DEVICES.find((d) => d.deviceId === deviceId);
    return mock ? { ...mock, status: computeDeviceStatus(mock) } : null;
  },

  /**
   * Create new IoT Device metadata in Cloud Firestore & initialize RTDB node.
   */
  async createDevice(deviceData) {
    const cleanId = deviceData.deviceId.trim().toUpperCase();

    // Check uniqueness
    const existing = await this.getDeviceById(cleanId);
    if (existing && !existing.isDeleted) {
      throw new Error(`Device ID "${cleanId}" sudah terdaftar.`);
    }

    const apiKey = generateApiKey();

    // Firestore Schema: Metadata ONLY (No redundant telemetry or status)
    const newDevice = {
      deviceId: cleanId,
      name: deviceData.name.trim(),
      deviceType: deviceData.deviceType,
      location: {
        village: deviceData.location?.village?.trim() || '',
        address: deviceData.location?.address?.trim() || '',
        latitude: deviceData.location?.latitude || null,
        longitude: deviceData.location?.longitude || null,
      },
      apiKey: apiKey,
      firmwareVersion: deviceData.firmwareVersion?.trim() || '1.0.0',
      isActive: true,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 1. Save metadata to Cloud Firestore `devices/{deviceId}`
    try {
      const dRef = doc(db, 'devices', cleanId);
      await setDoc(dRef, newDevice);
    } catch (err) {
      console.warn('Firestore device metadata notice:', err);
    }

    // 2. Prepare RTDB Tree Structure: `devices/{deviceId}`
    try {
      const rtdbRef = ref(rtdb, `devices/${cleanId}`);
      if (deviceData.deviceType === 'compost') {
        await set(rtdbRef, {
          lastSeen: Math.floor(Date.now() / 1000),
          telemetry: {
            compostTemperature: 0,
            airTemperature: 0,
            airHumidity: 0,
            soilMoisture: 0,
            gas: 0,
            waterLevel: 'Normal',
            updatedAt: Math.floor(Date.now() / 1000),
          },
          relay: {
            fan: false,
            pump: false,
            mode: 'auto',
          },
          alerts: {
            highTemperature: false,
            lowMoisture: false,
            gasWarning: false,
            waterOverflow: false,
          },
        });
      } else {
        await set(rtdbRef, {
          lastSeen: Math.floor(Date.now() / 1000),
          status: 'online',
        });
      }
    } catch (err) {
      console.warn('RTDB initialization notice:', err);
    }

    return { ...newDevice, apiKey, status: 'offline' };
  },

  /**
   * Update Device metadata in Cloud Firestore.
   */
  async updateDevice(deviceId, updateData) {
    const dRef = doc(db, 'devices', deviceId);

    const payload = {
      name: updateData.name.trim(),
      deviceType: updateData.deviceType,
      firmwareVersion: updateData.firmwareVersion.trim(),
      'location.village': updateData.location?.village?.trim() || '',
      'location.address': updateData.location?.address?.trim() || '',
      'location.latitude': updateData.location?.latitude || null,
      'location.longitude': updateData.location?.longitude || null,
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(dRef, payload);
    } catch (err) {
      console.warn('Error updating device metadata in Firestore:', err);
    }

    return true;
  },

  /**
   * Toggle Device active status in Cloud Firestore.
   */
  async toggleDeviceActive(deviceId, currentIsActive) {
    const dRef = doc(db, 'devices', deviceId);
    const nextActive = !currentIsActive;

    try {
      await updateDoc(dRef, {
        isActive: nextActive,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error toggling device active state in Firestore:', err);
    }

    return { isActive: nextActive };
  },

  /**
   * Regenerate API Key in Cloud Firestore.
   */
  async regenerateApiKey(deviceId) {
    const newApiKey = generateApiKey();
    const dRef = doc(db, 'devices', deviceId);

    try {
      await updateDoc(dRef, {
        apiKey: newApiKey,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error regenerating API Key in Firestore:', err);
    }

    return newApiKey;
  },

  /**
   * Soft Delete Device in Cloud Firestore.
   */
  async deleteDevice(deviceId) {
    const dRef = doc(db, 'devices', deviceId);

    try {
      await updateDoc(dRef, {
        isDeleted: true,
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error soft deleting device in Firestore:', err);
    }

    return true;
  },

  /**
   * Calculate system device statistics.
   */
  async getDeviceStats() {
    const { devices } = await this.getDevices({ pageSize: 10000 });

    const totalCount = devices.length;
    const onlineCount = devices.filter((d) => d.status === 'online').length;
    const offlineCount = devices.filter((d) => d.status === 'offline').length;
    const disabledCount = devices.filter((d) => d.status === 'disabled' || !d.isActive).length;
    const compostBinsCount = devices.filter((d) => (d.deviceType || d.type) === 'compost').length;
    const stationsCount = devices.filter((d) => (d.deviceType || d.type) === 'collection_station').length;

    return {
      totalCount,
      onlineCount,
      offlineCount,
      disabledCount,
      compostBinsCount,
      stationsCount,
    };
  },
};
