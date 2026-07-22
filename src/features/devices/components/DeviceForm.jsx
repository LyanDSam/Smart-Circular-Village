import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deviceSchema } from '../schemas/deviceSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Cpu, Loader2, Save } from 'lucide-react';

export const DeviceForm = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialData?.deviceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: initialData
      ? {
          deviceId: initialData.deviceId,
          name: initialData.name,
          deviceType: initialData.deviceType || initialData.type || 'compost',
          firmwareVersion: initialData.firmwareVersion || '1.0.0',
          location: {
            village: initialData.location?.village || 'Desa Circular Utama',
            address: initialData.location?.address || '',
            latitude: initialData.location?.latitude || null,
            longitude: initialData.location?.longitude || null,
          },
          isActive: initialData.isActive ?? true,
        }
      : {
          deviceId: 'SCV-COMP-001',
          name: '',
          deviceType: 'compost',
          firmwareVersion: '1.0.0',
          location: {
            village: 'Desa Circular Utama',
            address: '',
            latitude: null,
            longitude: null,
          },
          isActive: true,
        },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">
              {isEdit ? 'Edit Metadata Perangkat' : 'Daftarkan Perangkat IoT Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Device ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Device ID <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register('deviceId')}
              disabled={isEdit}
              placeholder="Format: SCV-COMP-001 atau SCV-COLL-001"
              className="text-xs font-mono font-semibold uppercase bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            {errors.deviceId ? (
              <p className="text-[11px] text-rose-500 mt-1">{errors.deviceId.message}</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Gunakan `SCV-COLL-xxx` untuk Station atau `SCV-COMP-xxx` untuk Compost Bin.
              </p>
            )}
          </div>

          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Perangkat <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="Contoh: Smart Compost Bin #01 RW 03"
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Device Type & Firmware */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Perangkat <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('deviceType')}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="compost">Smart Compost Bin</option>
                <option value="collection_station">Smart Collection Station</option>
              </select>
              {errors.deviceType && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.deviceType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Versi Firmware <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('firmwareVersion')}
                placeholder="1.0.0"
                className="text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
              {errors.firmwareVersion && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.firmwareVersion.message}</p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Informasi Lokasi Pemasangan</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desa / Kelurahan <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('location.village')}
                placeholder="Contoh: Desa Circular Utama"
                className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
              {errors.location?.village && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.location.village.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat / Pos Pemasangan <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('location.address')}
                placeholder="Contoh: Pos Pengumpulan RT 02 / RW 01"
                className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
              {errors.location?.address && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.location.address.message}</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 space-y-1">
            <p>💡 <strong>Status Online/Offline:</strong> Dihitung secara otomatis di Realtime Database berdasarkan heartbeat timestamp (`lastSeen &lt; 60s`). Tidak disimpan statis di Firestore.</p>
          </div>

          {/* Buttons */}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Simpan Metadata' : 'Daftarkan Perangkat'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
