import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceService, computeDeviceStatus } from '@/services/deviceService';
import { rtdbService } from '@/services/rtdbService';

export const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    onlineCount: 0,
    offlineCount: 0,
    maintenanceCount: 0,
    disabledCount: 0,
    compostBinsCount: 0,
    stationsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const rtdbMapRef = useRef({});

  // Helper to recalculate device stats dynamically from current device array
  const recalculateStats = useCallback((deviceList) => {
    const totalCount = deviceList.length;
    const pendingCount = deviceList.filter((d) => d.approvalStatus === 'pending' || d.status === 'pending').length;
    const onlineCount = deviceList.filter((d) => d.status === 'online').length;
    const offlineCount = deviceList.filter((d) => d.status === 'offline').length;
    const disabledCount = deviceList.filter((d) => d.status === 'disabled' || d.isActive === false).length;
    const warningCount = deviceList.filter((d) => d.status === 'warning' || d.status === 'error').length;
    const compostBinsCount = deviceList.filter((d) => (d.deviceType || d.type) === 'compost').length;
    const stationsCount = deviceList.filter((d) => (d.deviceType || d.type) === 'collection_station').length;

    setStats({
      totalCount,
      pendingCount,
      onlineCount,
      offlineCount,
      disabledCount,
      warningCount,
      compostBinsCount,
      stationsCount,
    });
  }, []);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deviceService.getDevices({
        search,
        type,
        status,
        page,
        pageSize: 12,
      });

      // Enrich initial devices list with current RTDB state if available
      const enrichedDevices = res.devices.map((d) => {
        const liveNode = rtdbMapRef.current[d.deviceId];
        const computedStatus = computeDeviceStatus(d, liveNode);
        return {
          ...d,
          status: computedStatus,
        };
      });

      setDevices(enrichedDevices);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      recalculateStats(enrichedDevices);
    } catch (err) {
      console.error('Error in useDevices hook:', err);
      setError('Gagal memuat daftar perangkat IoT.');
    } finally {
      setIsLoading(false);
    }
  }, [search, type, status, page, recalculateStats]);

  useEffect(() => {
    fetchDevices();

    // 1. Subscribe to RTDB live device state updates (heartbeat / telemetry / alerts)
    const unsubscribeRtdb = rtdbService.listenAllDevices((rtdbData) => {
      rtdbMapRef.current = rtdbData || {};

      setDevices((prevDevices) => {
        const updated = prevDevices.map((d) => {
          const liveNode = rtdbData ? rtdbData[d.deviceId] : null;
          const liveStatus = computeDeviceStatus(d, liveNode);
          const rawLastSeen = liveNode?.lastSeen;
          const lastSeenMs =
            typeof rawLastSeen === 'number'
              ? rawLastSeen * (rawLastSeen < 1e11 ? 1000 : 1)
              : null;

          return {
            ...d,
            lastSeen: lastSeenMs ? new Date(lastSeenMs).toISOString() : d.lastSeen,
            status: liveStatus,
            telemetry: liveNode?.telemetry || d.telemetry,
            alerts: liveNode?.alerts || d.alerts,
          };
        });

        recalculateStats(updated);
        return updated;
      });
    });

    // 2. Periodic Ticker (every 10s) to evaluate 60-second heartbeat timeouts
    const timer = setInterval(() => {
      setDevices((prevDevices) => {
        let changed = false;
        const updated = prevDevices.map((d) => {
          const liveNode = rtdbMapRef.current[d.deviceId];
          const newStatus = computeDeviceStatus(d, liveNode);
          if (newStatus !== d.status) {
            changed = true;
            return { ...d, status: newStatus };
          }
          return d;
        });

        if (changed) {
          recalculateStats(updated);
          return updated;
        }
        return prevDevices;
      });
    }, 10000);

    return () => {
      if (typeof unsubscribeRtdb === 'function') unsubscribeRtdb();
      clearInterval(timer);
    };
  }, [fetchDevices, recalculateStats]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setStatus('all');
    setPage(1);
  };

  const createDevice = async (deviceData) => {
    const created = await deviceService.createDevice(deviceData);
    await fetchDevices();
    return created;
  };

  const updateDevice = async (deviceId, updateData) => {
    const updated = await deviceService.updateDevice(deviceId, updateData);
    await fetchDevices();
    return updated;
  };

  const toggleActive = async (deviceId, currentIsActive) => {
    const res = await deviceService.toggleDeviceActive(deviceId, currentIsActive);
    await fetchDevices();
    return res;
  };

  const regenerateApiKey = async (deviceId) => {
    const newKey = await deviceService.regenerateApiKey(deviceId);
    await fetchDevices();
    return newKey;
  };

  const pingDevice = async (deviceId, userName) => {
    return await deviceService.pingDevice(deviceId, userName);
  };

  const approveDevice = async (deviceId, adminUser) => {
    const res = await deviceService.approveDevice(deviceId, adminUser);
    await fetchDevices();
    return res;
  };

  const rejectDevice = async (deviceId, adminUser, reason) => {
    const res = await deviceService.rejectDevice(deviceId, adminUser, reason);
    await fetchDevices();
    return res;
  };

  const deleteDevice = async (deviceId) => {
    const res = await deviceService.deleteDevice(deviceId);
    await fetchDevices();
    return res;
  };

  return {
    devices,
    stats,
    isLoading,
    error,
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    page,
    setPage,
    totalPages,
    totalCount,
    handleResetFilters,
    fetchDevices,
    createDevice,
    updateDevice,
    approveDevice,
    rejectDevice,
    toggleActive,
    regenerateApiKey,
    pingDevice,
    deleteDevice,
  };
};
