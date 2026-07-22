import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '@/services/deviceService';

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

      setDevices(res.devices);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);

      const deviceStats = await deviceService.getDeviceStats();
      setStats(deviceStats);
    } catch (err) {
      console.error('Error in useDevices hook:', err);
      setError('Gagal memuat daftar perangkat IoT.');
    } finally {
      setIsLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

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

  const deleteDevice = async (deviceId) => {
    await deviceService.deleteDevice(deviceId);
    await fetchDevices();
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
    toggleActive,
    regenerateApiKey,
    deleteDevice,
  };
};
