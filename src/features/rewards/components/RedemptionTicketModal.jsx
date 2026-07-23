import React, { useEffect, useState } from 'react';
import { VoucherQRCode } from './VoucherQRCode';
import { rewardService } from '@/services/rewardService';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Info,
  UserCheck,
  PackageCheck,
  Loader2,
  ShieldCheck,
  Camera,
  MapPin,
} from 'lucide-react';

export const RedemptionTicketModal = ({ isOpen, onClose, redemption: initialRedemption, isOfficerMode = false }) => {
  const { userProfile, user } = useAuth();
  const [redemption, setRedemption] = useState(initialRedemption);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const { playChime } = useClientSettings();

  const userRole = userProfile?.role?.toLowerCase();
  const isOfficer = isOfficerMode || userRole === 'officer' || userRole === 'admin';

  const redId = initialRedemption?.redemptionId || initialRedemption?.id || redemption?.redemptionId || redemption?.id;

  useEffect(() => {
    if (initialRedemption) {
      setRedemption((prev) => {
        const sameDoc = (prev?.redemptionId || prev?.id) === (initialRedemption?.redemptionId || initialRedemption?.id);
        if (sameDoc && prev?.status && prev.status !== initialRedemption.status) {
          return { ...initialRedemption, ...prev };
        }
        return initialRedemption;
      });
    }
  }, [initialRedemption]);

  // Real-time listener for live status updates on this ticket
  useEffect(() => {
    if (!isOpen || !redId) return;

    const unsubscribe = rewardService.listenToRedemption(redId, (latestData) => {
      setRedemption((prev) => {
        if (prev?.status && prev.status !== latestData.status) {
          playChime();
        }
        return { ...prev, ...latestData };
      });
    });

    return () => unsubscribe();
  }, [isOpen, redId]);

  if (!isOpen || !redemption) return null;

  const isPending = redemption.status === 'pending';
  const isAwaitingConfirmation = redemption.status === 'awaiting_confirmation';
  const isCompleted = redemption.status === 'completed';
  const isRejected = redemption.status === 'rejected';

  // Perform handshake confirmation for the viewing party (Officer or Citizen)
  const handleConfirmHandshake = async () => {
    setIsConfirmingReceipt(true);
    try {
      if (isOfficer) {
        await rewardService.confirmOfficerHandshake(redId, userProfile?.uid || user?.uid);
      } else {
        await rewardService.confirmCitizenReceipt(redId);
      }
      playChime();
    } catch (err) {
      console.error('Error confirming handshake:', err);
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center space-y-2 shrink-0">
          <div className={`inline-flex p-3 rounded-2xl mb-1 ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
          }`}>
            {isCompleted ? <PackageCheck className="w-7 h-7" /> : <Gift className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Voucher Penukaran Reward
          </h3>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {isPending && (
              <Badge variant="warning" className="gap-1 text-xs px-3 py-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Langkah 1 — Tunjukkan QR ke Petugas</span>
              </Badge>
            )}
            {isAwaitingConfirmation && (
              <Badge className="bg-amber-500 text-white gap-1 text-xs px-3 py-1 animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Langkah 2 — Handshake Konfirmasi 2 Pihak</span>
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-emerald-600 text-white gap-1 text-xs px-3 py-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transaksi Berhasil & Selesai</span>
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="gap-1 text-xs px-3 py-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Ditolak oleh Petugas</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">

          {/* SUCCESS MARKER */}
          {isCompleted && (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-base">
                Penukaran Poin Berhasil & Terkonfirmasi
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Poin sebesar <strong>{redemption.pointsRequired} Pts</strong> telah berhasil dipotong dan stok barang telah diperbarui. Terima kasih!
              </p>
              {redemption.proofImageUrl && (
                <div className="mt-3 space-y-1.5 text-left">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    Foto Bukti Penyerahan Barang
                  </span>
                  <div className="w-full h-40 bg-slate-900 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800">
                    <img
                      src={redemption.proofImageUrl}
                      alt="Bukti penyerahan barang"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DUAL-CONFIRMATION HANDSHAKE STEP */}
          {isAwaitingConfirmation && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                    Konfirmasi Penyerahan Fisik (Handshake 2 Pihak)
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    Kedua pihak (Petugas & Warga) wajib menekan tombol konfirmasi pada perangkat masing-masing untuk menyelesaikan penukaran.
                  </p>
                </div>
              </div>

              {/* Proof photo & details */}
              {redemption.proofImageUrl && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Foto Bukti Penyerahan dari Petugas
                  </span>
                  <div className="w-full h-48 bg-slate-950 rounded-xl overflow-hidden border-2 border-amber-300 dark:border-amber-700 shadow-inner relative">
                    <img
                      src={redemption.proofImageUrl}
                      alt="Foto bukti penyerahan barang"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs p-2 rounded-lg border border-white/10 text-white text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-emerald-400">{redemption.officerName || 'Petugas Station'}</span>
                        <span className="text-slate-300 text-[10px]">{redemption.postName || 'Posko SCV Utama'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Indicators for Both Parties */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Konfirmasi Petugas:</span>
                  {redemption.officerConfirmed ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sudah Konfirmasi</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 text-[10px] gap-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Menunggu Tombol Petugas</span>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Konfirmasi Warga:</span>
                  {redemption.citizenConfirmed ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sudah Konfirmasi</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 text-[10px] gap-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Menunggu Tombol Warga</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Button Action depending on who is viewing */}
              {isOfficer ? (
                redemption.officerConfirmed ? (
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-center font-bold">
                    Konfirmasi Petugas Selesai. Menunggu Warga menekan tombol di HP miliknya...
                  </div>
                ) : (
                  <Button
                    onClick={handleConfirmHandshake}
                    disabled={isConfirmingReceipt}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-11 font-bold gap-2 shadow-xs"
                  >
                    {isConfirmingReceipt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengonfirmasi...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-5 h-5" />
                        <span>Konfirmasi Penyerahan Barang (Petugas)</span>
                      </>
                    )}
                  </Button>
                )
              ) : (
                redemption.citizenConfirmed ? (
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-center font-bold">
                    Konfirmasi Warga Selesai. Menunggu Petugas menekan tombol di perangkatnya...
                  </div>
                ) : (
                  <Button
                    onClick={handleConfirmHandshake}
                    disabled={isConfirmingReceipt}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-11 font-bold gap-2 shadow-xs"
                  >
                    {isConfirmingReceipt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengonfirmasi...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-5 h-5" />
                        <span>Konfirmasi Penerimaan Barang (Warga)</span>
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          )}

          {/* QR Code — shown when status is pending */}
          {isPending && (
            <VoucherQRCode value={redemption.redemptionId} size={170} />
          )}

          {/* Reward Info Details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Reward:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{redemption.rewardName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Poin Dibutuhkan:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {redemption.pointsRequired} Poin
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Waktu Pemesanan:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(redemption.createdAt?.seconds ? redemption.createdAt.seconds * 1000 : redemption.createdAt || Date.now()).toLocaleString('id-ID')}
              </span>
            </div>

            {redemption.officerName && (
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  Petugas Verifikator:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {redemption.officerName}
                </span>
              </div>
            )}

            {redemption.postName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Posko Pengumpulan:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {redemption.postName}
                </span>
              </div>
            )}

            {isRejected && redemption.rejectionReason && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-[11px]">
                <strong className="block">Alasan Penolakan:</strong>
                {redemption.rejectionReason}
              </div>
            )}
          </div>

          {/* Citizen Guidance Notice — only when pending */}
          {isPending && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Tunjukkan QR Code atau Redemption ID ini kepada petugas di Pos Bank Sampah untuk mengambil barang reward Anda.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <Button onClick={onClose} variant="outline" className="w-full text-xs h-10 font-bold">
            Tutup Tiket
          </Button>
        </div>
      </div>
    </div>
  );
};
