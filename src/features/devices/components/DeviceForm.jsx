import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deviceSchema } from '../schemas/deviceSchema';
import { deviceService } from '@/services/deviceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Cpu, Loader2, Save, RefreshCw, Sparkles } from 'lucide-react';

export const DeviceForm = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialData?.deviceId);
  const [generatingId, setGeneratingId] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: initialData
      ? {
          deviceId: initialData.deviceId,
          name: initialData.name,
          deviceType: initialData.deviceType || initialData.type || 'collection_station',
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
          deviceId: 'SCV-COLL-001',
          name: '',
          deviceType: 'collection_station',
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

  const selectedType = useWatch({ control, name: 'deviceType' }) || 'collection_station';

  // Auto-generate Device ID when opening modal or changing device type
  const autoGenerateId = async (typeToUse) => {
    if (isEdit) return;
    setGeneratingId(true);
    try {
      const nextId = await deviceService.generateNextDeviceId(typeToUse || selectedType);
      setValue('deviceId', nextId);
    } catch (err) {
      console.error('Error generating device ID:', err);
    } finally {
      setGeneratingId(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isEdit) {
      autoGenerateId(selectedType);
    }
  }, [isOpen, selectedType, isEdit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
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
                <option value="collection_station">Smart Collection Station </option>
                <option value="compost">Smart Compost Bin</option>
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

          {/* Device ID (Auto-Generated) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Device ID (Otomatis) <span className="text-rose-500">*</span>
              </label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => autoGenerateId(selectedType)}
                  disabled={generatingId}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${generatingId ? 'animate-spin' : ''}`} />
                  <span>Generate Ulang</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                {...register('deviceId')}
                readOnly
                placeholder="Membuat Device ID otomatis..."
                className="text-xs font-mono font-bold uppercase bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generated</span>
              </span>
            </div>
            {errors.deviceId ? (
              <p className="text-[11px] text-rose-500 mt-1">{errors.deviceId.message}</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Device ID digenerate otomatis secara berurutan sesuai tipe perangkat.
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
              placeholder={
                selectedType === 'collection_station'
                  ? 'Contoh: Timbangan Sampah RFID Station 01'
                  : 'Contoh: Smart Compost Bin #01 RW 03'
              }
              className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
            )}
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
            <p><strong className="text-slate-900 dark:text-slate-100">Status Online/Offline:</strong> Dihitung secara otomatis di Realtime Database berdasarkan heartbeat timestamp (`lastSeen &lt; 60s`). Tidak disimpan statis di Firestore.</p>
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
              disabled={isSubmitting || generatingId}
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
