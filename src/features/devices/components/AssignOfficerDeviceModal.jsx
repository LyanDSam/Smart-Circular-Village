import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { deviceService } from '@/services/deviceService';
import { userService } from '@/services/userService';
import {
  X,
  Cpu,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const AssignOfficerDeviceModal = ({
  isOpen = false,
  onClose,
  onAssigned,
  officer = null,
}) => {
  const [devices, setDevices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [customDeviceId, setCustomDeviceId] = useState('');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !officer) return;

    setErrorMessage('');
    setIsLoadingDevices(true);
    const currentDevice = (officer.assignedDeviceId || officer.deviceId || '').trim().toUpperCase();
    setSelectedDeviceId(currentDevice);
    setCustomDeviceId(currentDevice);

    Promise.all([
      deviceService.getDevices({ pageSize: 1000 }),
      userService.getUsers({ role: 'officer', pageSize: 1000 }),
    ])
      .then(([devRes, offRes]) => {
        setDevices(devRes.devices || []);
        setOfficers(offRes.users || []);
      })
      .catch((err) => {
        console.error('Error loading devices/officers:', err);
      })
      .finally(() => {
        setIsLoadingDevices(false);
      });
  }, [isOpen, officer]);

  if (!isOpen || !officer) return null;

  // Map which officer currently owns each deviceId
  const deviceOwnerMap = {};
  officers.forEach((off) => {
    if (!off.isDeleted && off.status === 'active') {
      const devId = (off.assignedDeviceId || off.deviceId || '').trim().toUpperCase();
      if (devId) {
        deviceOwnerMap[devId] = off;
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetDeviceId = (selectedDeviceId || customDeviceId).trim().toUpperCase();

    setIsSubmitting(true);
    try {
      await userService.assignDeviceToOfficer(officer.uid, targetDeviceId);
      onAssigned();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan penugasan perangkat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base">Tugaskan Perangkat IoT Ke Petugas</h3>
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
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Officer Info Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-slate-500 block">Petugas Operational:</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {officer.fullName}
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                ID: {officer.memberId || officer.uid}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">{officer.email}</p>
          </div>

          {/* Device Selection List */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Dari Perangkat Terdaftar <span className="text-rose-500">*</span>
            </label>

            {isLoadingDevices ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat daftar perangkat IoT...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {/* Option: Unassign / Clear Device */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeviceId('');
                    setCustomDeviceId('');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedDeviceId === ''
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/60 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    -- Bebaskan Penugasan (Tanpa Perangkat) --
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Kosong
                  </Badge>
                </button>

                {devices.map((dev) => {
                  const devId = dev.deviceId.toUpperCase();
                  const isSelected = selectedDeviceId === devId;
                  const currentOwner = deviceOwnerMap[devId];
                  const isOwnedByOther = currentOwner && currentOwner.uid !== officer.uid;
                  const isNotApproved = dev.approvalStatus === 'pending' || dev.approvalStatus === 'rejected' || dev.status === 'pending';
                  const isDisabledOption = isOwnedByOther || isNotApproved;

                  return (
                    <button
                      key={devId}
                      type="button"
                      disabled={isDisabledOption}
                      onClick={() => {
                        setSelectedDeviceId(devId);
                        setCustomDeviceId(devId);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isDisabledOption
                          ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {dev.name}
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            {devId}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {dev.location?.address || dev.address || 'Pos Stasiun'}
                        </span>
                      </div>

                      {isNotApproved ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300">
                          Belum Disetujui
                        </Badge>
                      ) : isOwnedByOther ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Dipakai ({currentOwner.fullName || currentOwner.email})
                        </Badge>
                      ) : isSelected ? (
                        <Badge variant="default" className="text-[10px] bg-blue-600">
                          Ditugaskan
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Tersedia
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Or Manual Custom Device ID Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Atau Input Manual Device ID
            </label>
            <Input
              type="text"
              placeholder="misal: SCV-09009 atau SCV-COLL-001"
              value={customDeviceId}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setCustomDeviceId(val);
                setSelectedDeviceId(val);
              }}
              className="text-xs font-mono uppercase bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Setiap perangkat hanya dapat ditugaskan ke 1 petugas aktif (1-to-1 Uniqueness).
            </p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 px-5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validasi & Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Penugasan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
