import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { postService } from '@/services/postService';
import {
  X,
  Building2,
  MapPin,
  Cpu,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const PostFormModal = ({
  isOpen = false,
  onClose,
  onSaved,
  postToEdit = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    village: '',
    description: '',
    deviceIds: [],
    officerIds: [],
    isActive: true,
  });

  const [availableDevices, setAvailableDevices] = useState([]);
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = Boolean(postToEdit);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setIsLoadingOptions(true);

    const currentPostId = postToEdit?.postId || null;

    Promise.all([
      postService.getAvailableDevices(currentPostId),
      postService.getAvailableOfficers(currentPostId),
    ])
      .then(([devs, offs]) => {
        setAvailableDevices(devs);
        setAvailableOfficers(offs);

        if (postToEdit) {
          setFormData({
            name: postToEdit.name || '',
            address: postToEdit.address || '',
            village: postToEdit.village || '',
            description: postToEdit.description || '',
            deviceIds: postToEdit.deviceIds || [],
            officerIds: postToEdit.officerIds || [],
            isActive: postToEdit.isActive !== false,
          });
        } else {
          setFormData({
            name: '',
            address: '',
            village: '',
            description: '',
            deviceIds: [],
            officerIds: [],
            isActive: true,
          });
        }
      })
      .catch((err) => {
        console.error('Error loading options for post form:', err);
        setErrorMessage('Gagal memuat daftar perangkat dan petugas.');
      })
      .finally(() => {
        setIsLoadingOptions(false);
      });
  }, [isOpen, postToEdit]);

  if (!isOpen) return null;

  const handleDeviceToggle = (deviceId) => {
    setFormData((prev) => {
      const exists = prev.deviceIds.includes(deviceId);
      return {
        ...prev,
        deviceIds: exists
          ? prev.deviceIds.filter((id) => id !== deviceId)
          : [...prev.deviceIds, deviceId],
      };
    });
  };

  const handleOfficerToggle = (officerId) => {
    setFormData((prev) => {
      const exists = prev.officerIds.includes(officerId);
      return {
        ...prev,
        officerIds: exists
          ? prev.officerIds.filter((id) => id !== officerId)
          : [...prev.officerIds, officerId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Nama Posko Pengumpulan wajib diisi.');
      return;
    }

    if (formData.deviceIds.length === 0) {
      setErrorMessage('Posko Pengumpulan wajib terpasang minimal 1 Perangkat IoT.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await postService.updatePost(postToEdit.postId, formData);
      } else {
        await postService.createPost(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan data Posko.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">
              {isEdit ? 'Edit Posko Pengumpulan' : 'Tambah Posko Pengumpulan Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name & Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Posko <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Posko Stasiun 01 - Desa Utama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desa / Kelurahan
              </label>
              <input
                type="text"
                placeholder="misal: Desa Circular Utama"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Address & Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Posko
            </label>
            <input
              type="text"
              placeholder="misal: Jl. Melati No. 12, POS 5"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Deskripsi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan lokasi posko..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Device Assignment Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Perangkat IoT Terpasang <span className="text-rose-500">*</span>
              </label>
              <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800">
                {formData.deviceIds.length} Terpilih
              </Badge>
            </div>

            {isLoadingOptions ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat perangkat tersedia...</span>
              </div>
            ) : availableDevices.length === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
                Tidak ada perangkat IoT yang tersedia. Daftarkan perangkat di menu <b>Perangkat IoT</b> terlebih dahulu.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {availableDevices.map((dev) => {
                  const isSelected = formData.deviceIds.includes(dev.deviceId);
                  return (
                    <button
                      key={dev.deviceId}
                      type="button"
                      onClick={() => handleDeviceToggle(dev.deviceId)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                          {dev.name}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                          {dev.deviceId}
                        </span>
                      </div>
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[10px]">
                        {isSelected ? 'Terpasang' : 'Pilih'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Officer Assignment Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Petugas Bertugas di Posko Ini
              </label>
              <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800">
                {formData.officerIds.length} Petugas
              </Badge>
            </div>

            {isLoadingOptions ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat daftar petugas...</span>
              </div>
            ) : availableOfficers.length === 0 ? (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-500 text-xs">
                Tidak ada petugas yang belum ditugaskan. Petugas dapat ditugaskan nanti melalui tombol "Tugaskan Petugas".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {availableOfficers.map((off) => {
                  const isSelected = formData.officerIds.includes(off.uid);
                  return (
                    <button
                      key={off.uid}
                      type="button"
                      onClick={() => handleOfficerToggle(off.uid)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                          {off.fullName || off.email}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {off.email}
                        </span>
                      </div>
                      <Badge variant={isSelected ? 'success' : 'secondary'} className="text-[10px]">
                        {isSelected ? 'Bertugas' : 'Pilih'}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Posko</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
