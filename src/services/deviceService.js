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
 * Compute Device Online Status from RTDB `lastSeen` heartbeat & live alerts.
 * Rules:
 * - If !device.isActive || device.isDeleted -> 'disabled'
 * - If currentTime - lastSeen >= 60,000 ms (60 seconds) or !lastSeen -> 'offline'
 * - If online (< 60s) AND liveRtdbNode/device has error alerts -> 'error'
 * - If online (< 60s) AND liveRtdbNode/device has warning alerts -> 'warning'
 * - If status === 'maintenance' -> 'maintenance'
 * - Else -> 'online'
 */
export const computeDeviceStatus = (device, liveRtdbNode = null) => {
  if (!device || device.isActive === false || device.isDeleted) return 'disabled';
  if (device.status === 'maintenance' || liveRtdbNode?.status === 'maintenance') return 'maintenance';

  const rtdbStatus = (
    typeof liveRtdbNode === 'object' && liveRtdbNode?.status
      ? liveRtdbNode.status
      : device.status || ''
  ).toLowerCase();

  const alerts = liveRtdbNode?.alerts || device.alerts;
  const rawLastSeen =
    typeof liveRtdbNode === 'number'
      ? liveRtdbNode
      : liveRtdbNode?.lastSeen ?? device.lastSeen;

  let isOnline = false;

  if (typeof rawLastSeen === 'number') {
    // If rawLastSeen is a small number (e.g. 32, 94 seconds uptime from ESP32 boot without NTP)
    if (rawLastSeen < 1000000) {
      isOnline = rtdbStatus === 'online' || Boolean(liveRtdbNode);
    } else {
      // Standard Unix epoch timestamp
      const timestampMs = rawLastSeen * (rawLastSeen < 1e11 ? 1000 : 1);
      const diffMs = Date.now() - timestampMs;
      isOnline = diffMs < 60000 && diffMs >= -300000;
    }
  } else if (rawLastSeen) {
    const timestampMs = new Date(rawLastSeen).getTime();
    if (!isNaN(timestampMs)) {
      const diffMs = Date.now() - timestampMs;
      isOnline = diffMs < 60000 && diffMs >= -300000;
    }
  } else if (rtdbStatus === 'online') {
    isOnline = true;
  }

  if (!isOnline) return 'offline';

  // Check alert flags when device is actively connected
  if (alerts?.hasError || rtdbStatus === 'error') {
    return 'error';
  }
  if (
    alerts?.highTemperature ||
    alerts?.lowMoisture ||
    alerts?.gasWarning ||
    alerts?.waterOverflow ||
    rtdbStatus === 'warning'
  ) {
    return 'warning';
  }

  return 'online';
};

export const deviceService = {
  computeDeviceStatus,

  /**
   * Automatically generate next sequential Device ID based on type.
   * e.g., SCV-COLL-001, SCV-COLL-002 or SCV-COMP-001, SCV-COMP-002
   */
  async generateNextDeviceId(deviceType = 'collection_station') {
    const prefix = deviceType === 'collection_station' ? 'SCV-COLL' : 'SCV-COMP';
    try {
      const devicesRef = collection(db, 'devices');
      const snap = await getDocs(devicesRef);
      let maxNum = 0;
      if (!snap.empty) {
        snap.docs.forEach((d) => {
          const id = d.id;
          if (id.startsWith(prefix)) {
            const parts = id.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }
      const nextNum = String(maxNum + 1).padStart(3, '0');
      return `${prefix}-${nextNum}`;
    } catch (err) {
      const randomNum = String(Math.floor(Math.random() * 899) + 100);
      return `${prefix}-${randomNum}`;
    }
  },
  /**
   * Fetch devices metadata directly from Cloud Firestore & enrich with computed status from RTDB heartbeat.
   * STRICTLY NO DUMMY FALLBACK DATA.
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
      }
    } catch (err) {
      console.error('Error reading devices metadata from Firestore:', err);
      devicesList = [];
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
   * Fetch single device by Device ID directly from Firestore & RTDB.
   */
  async getDeviceById(deviceId) {
    if (!deviceId) return null;

    try {
      const dRef = doc(db, 'devices', deviceId);
      const snap = await getDoc(dRef);
      if (snap.exists()) {
        const data = snap.data();
        let rtdbData = null;
        try {
          rtdbData = await rtdbService.getDevice(deviceId);
        } catch (e) {
          // ignore RTDB read errors
        }

        const dev = {
          deviceId: snap.id,
          deviceType: data.deviceType || data.type,
          ...data,
          ...(rtdbData || {}),
        };

        return { ...dev, status: computeDeviceStatus(dev, rtdbData) };
      }
    } catch (err) {
      console.error('Error fetching device from Firestore:', err);
    }

    return null;
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
    const dRef = doc(db, 'devices', cleanId);
    await setDoc(dRef, newDevice);

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

    await updateDoc(dRef, payload);
    return true;
  },

  /**
   * Toggle Device active status in Cloud Firestore.
   */
  async toggleDeviceActive(deviceId, currentIsActive) {
    const dRef = doc(db, 'devices', deviceId);
    const nextActive = !currentIsActive;

    await updateDoc(dRef, {
      isActive: nextActive,
      updatedAt: serverTimestamp(),
    });

    return { isActive: nextActive };
  },

  /**
   * Regenerate API Key in Cloud Firestore.
   */
  async regenerateApiKey(deviceId) {
    const newApiKey = generateApiKey();
    const dRef = doc(db, 'devices', deviceId);

    await updateDoc(dRef, {
      apiKey: newApiKey,
      updatedAt: serverTimestamp(),
    });

    return newApiKey;
  },

  /**
   * Send Ping signal to physical ESP32 device via RTDB node `devices/{deviceId}/commands/ping`.
   * Triggers physical buzzer / locator LED on hardware.
   */
  async pingDevice(deviceId, userName = 'Admin') {
    if (!deviceId) throw new Error('Device ID tidak valid.');

    const pingRef = ref(rtdb, `devices/${deviceId}/commands/ping`);
    const payload = {
      active: true,
      timestamp: Math.floor(Date.now() / 1000),
      requestedBy: userName,
      durationSeconds: 3,
    };

    await set(pingRef, payload);
    return payload;
  },

  /**
   * Soft Delete Device in Cloud Firestore.
   */
  async deleteDevice(deviceId) {
    const dRef = doc(db, 'devices', deviceId);

    await updateDoc(dRef, {
      isDeleted: true,
      isActive: false,
      updatedAt: serverTimestamp(),
    });

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
