import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import {
  DeviceHeader,
  DeviceFilters,
  DeviceCard,
  DeviceTable,
  DeviceForm,
  DeviceDetailModal,
  useDevices,
} from '@/features/devices';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const DevicesPage = () => {
  const { role, userProfile } = useAuth();
  const { playChime } = useClientSettings();
  const canManage = role === 'admin';
  const isGovernment = role === 'government';

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text: '' }

  // Custom Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Konfirmasi',
    variant: 'danger',
    onConfirm: () => {},
  });

  const {
    devices,
    stats,
    isLoading,
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
    createDevice,
    updateDevice,
    toggleActive,
    regenerateApiKey,
    pingDevice,
    deleteDevice,
  } = useDevices();

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingDevice(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (device) => {
    setEditingDevice(device);
    setFormModalOpen(true);
  };

  const handleOpenDetail = (device) => {
    setSelectedDevice(device);
    setDetailModalOpen(true);
  };

  const handlePingDevice = async (device) => {
    try {
      playChime();
      await pingDevice(device.deviceId, userProfile?.fullName || 'Admin');
      showToast(`🔔 Sinyal Ping dikirim ke "${device.name}" (${device.deviceId})! Buzzer/LED ESP32 akan berbunyi.`);
    } catch (err) {
      showToast(err.message || 'Gagal mengirim sinyal ping.', 'error');
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.deviceId, formData);
        showToast(`Perangkat "${formData.name}" berhasil diperbarui.`);
      } else {
        const created = await createDevice(formData);
        showToast(`Perangkat "${created.name}" berhasil didaftarkan dengan API Key baru.`);
      }
      setFormModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data perangkat.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (device) => {
    try {
      const res = await toggleActive(device.deviceId, device.isActive);
      showToast(
        `Perangkat ${device.deviceId} sekarang ${res.isActive ? 'Diaktifkan (Offline)' : 'Dinonaktifkan'}.`
      );
    } catch (err) {
      showToast('Gagal mengubah status aktif perangkat.', 'error');
    }
  };

  const promptRegenerateKey = (device) => {
    setConfirmDialog({
      isOpen: true,
      title: `Regenerasi API Key "${device.name}"?`,
      description: `Apakah Anda yakin ingin meregenerasi API Key untuk ${device.deviceId}? API Key lama tidak akan bisa digunakan oleh firmware ESP32 lagi.`,
      confirmText: 'Ya, Regenerasi API Key',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await regenerateApiKey(device.deviceId);
          showToast(`API Key baru berhasil dibuat untuk ${device.deviceId}!`);
        } catch (err) {
          showToast('Gagal meregenerasi API Key.', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const promptDeleteDevice = (device) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Perangkat "${device.name}"?`,
      description: `Apakah Anda yakin ingin menghapus perangkat ${device.deviceId} dari sistem?`,
      confirmText: 'Ya, Hapus Perangkat',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteDevice(device.deviceId);
          showToast(`Perangkat ${device.deviceId} berhasil dihapus.`);
        } catch (err) {
          showToast('Gagal menghapus perangkat.', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Read-Only Notice for Government */}
      {isGovernment && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Pemerintah (Read-Only): Anda dapat memantau daftar dan status perangkat tanpa hak mengubah data.</span>
          </div>
          <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-900">
            Read-Only
          </Badge>
        </div>
      )}

      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-900'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header & Stats */}
      <DeviceHeader
        stats={stats}
        canManage={canManage}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* Filters Bar */}
      <DeviceFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        status={status}
        onStatusChange={setStatus}
        onResetFilters={handleResetFilters}
      />

      {/* Content State */}
      {isLoading ? (
        <LoadingState message="Memuat daftar perangkat IoT..." />
      ) : devices.length === 0 ? (
        <EmptyState
          title="Tidak Ada Perangkat IoT"
          description="Tidak ditemukan perangkat IoT ESP32 yang sesuai dengan kriteria pencarian Anda."
          actionText={canManage ? 'Daftarkan Perangkat Baru' : null}
          onAction={canManage ? handleOpenCreate : null}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.deviceId}
              device={device}
              canManage={canManage}
              onViewDetail={handleOpenDetail}
              onEdit={handleOpenEdit}
              onRegenerateKey={promptRegenerateKey}
              onToggleActive={handleToggleActive}
              onPing={handlePingDevice}
              onDelete={promptDeleteDevice}
            />
          ))}
        </div>
      ) : (
        <DeviceTable
          devices={devices}
          canManage={canManage}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
          onRegenerateKey={promptRegenerateKey}
          onToggleActive={handleToggleActive}
          onPing={handlePingDevice}
          onDelete={promptDeleteDevice}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Menampilkan <strong className="text-slate-900 dark:text-slate-100">{devices.length}</strong> dari <strong className="text-slate-900 dark:text-slate-100">{totalCount}</strong> perangkat
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Sebelum
            </Button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2 text-xs"
            >
              Lanjut <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <DeviceForm
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDevice}
        isSubmitting={isSubmitting}
      />

      <DeviceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        device={selectedDevice}
        onPing={handlePingDevice}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </div>
  );
};
