import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeviceStatusBadge } from '@/features/devices/components/DeviceStatusBadge';
import { pointService, WASTE_CATEGORIES } from '@/services/pointService';
import { deviceService } from '@/services/deviceService';
import {
  X,
  Scale,
  Award,
  CreditCard,
  User,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export const ConfirmTransactionModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  pendingItem = null,
  citizen = null,
  isSubmitting = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Organic');
  const [device, setDevice] = useState(null);
  const [isDeviceLoading, setIsDeviceLoading] = useState(false);

  // In-memory cache ref for device lookups to avoid repeated Firestore queries
  const deviceCacheRef = useRef({});

  const deviceId = pendingItem?.deviceId || pendingItem?.device || '';
  const rawRfid = pendingItem?.rfidUid || pendingItem?.uid || '';
  const cleanRfid = useMemo(
    () => String(rawRfid || '').replace(/\s+/g, '').toUpperCase(),
    [rawRfid]
  );

  const weightGram = pendingItem?.weightGram ?? pendingItem?.weight ?? 0;
  const weightKg = useMemo(() => pointService.formatWeightKg(weightGram), [weightGram]);

  // Query fresh device details on modal open
  useEffect(() => {
    if (!isOpen || !deviceId) {
      setDevice(null);
      return;
    }

    let isMounted = true;
    setIsDeviceLoading(true);

    deviceService
      .getDeviceById(deviceId)
      .then((dev) => {
        if (!isMounted) return;
        setDevice(dev);
      })
      .catch((err) => {
        console.warn(`[ConfirmModal] Error querying device ${deviceId}:`, err);
        if (!isMounted) return;
        setDevice(null);
      })
      .finally(() => {
        if (isMounted) setIsDeviceLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, deviceId]);

  // Real-time point calculation preview
  const calculatedPoints = useMemo(
    () => pointService.calculatePoints(selectedCategory, weightGram),
    [selectedCategory, weightGram]
  );

  if (!isOpen || !pendingItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      pendingTx: pendingItem,
      wasteType: selectedCategory,
      citizenUser: citizen,
    });
  };

  const addressText =
    device?.location?.address ||
    device?.address ||
    (typeof device?.location === 'string' ? device.location : '') ||
    '-';
  const villageText = device?.location?.village || device?.village || '-';
  const deviceNameText = device?.name || device?.deviceName || 'IoT Collection Station';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans flex flex-col max-h-[90vh] my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Konfirmasi Transaksi Sampah</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
          {/* Section 1: Device Information Card (Device Information) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Device Information
              </span>
              {device ? (
                <DeviceStatusBadge status={device.status} />
              ) : (
                <Badge variant="outline" className="text-[10px] font-semibold bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Perangkat Tidak Terdaftar</span>
                </Badge>
              )}
            </div>

            {isDeviceLoading ? (
              <div className="flex items-center space-x-2 py-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat informasi lokasi perangkat...</span>
              </div>
            ) : device ? (
              <div className="pl-5 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {deviceNameText}
                  </p>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                    {device.deviceId}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 pt-0.5">
                  <p>
                    <span className="font-medium text-slate-400">Location: </span>
                    <span className="font-semibold">{addressText}</span>
                  </p>
                  <p>
                    <span className="font-medium text-slate-400">Village: </span>
                    <span className="font-semibold">{villageText}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Unknown Device</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-semibold">
                      Device ID: {deviceId || 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    Perangkat ini belum terdaftar di Cloud Firestore. Transaksi tetap dapat dilanjutkan.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Data Warga Penyetor
              </span>
              <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800">
                RFID: {cleanRfid}
              </Badge>
            </div>

            {citizen ? (
              <div className="pl-5 space-y-0.5">
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {citizen.fullName}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Member ID: {citizen.memberId || 'SCV-26-000101'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  Saldo Saldo Poin Saat Ini: {citizen.points || 0} Pts
                </p>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold text-rose-800 dark:text-rose-200 block">Unknown RFID Card ({cleanRfid})</span>
                  <span className="text-[11px] text-rose-600 dark:text-rose-300">
                    Kartu RFID ini belum terhubung dengan akun warga terverifikasi. Transaksi tidak dapat dikonfirmasi.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Weight Reading Box */}
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Hasil Timbangan Load Cell
              </span>
              <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 font-mono mt-0.5">
                {weightKg}
                <span className="text-xs font-normal text-slate-500 ml-2">({weightGram} gram)</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs">
              <Scale className="w-7 h-7" />
            </div>
          </div>

          {/* Waste Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Kategori Jenis Sampah <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WASTE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedCategory === cat.key
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cat.key}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.label}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {cat.pointsPerKg} Pts / kg
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Point Preview Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Total Poin Ditambahkan Ke Warga
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Award className="w-6 h-6 text-amber-400" />
                <span>+{calculatedPoints.toLocaleString()} Pts</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-400 bg-emerald-950">
              Kategori: {selectedCategory}
            </Badge>
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
              disabled={isSubmitting || !citizen}
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
                  <span>Konfirmasi & Simpan Setoran</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
