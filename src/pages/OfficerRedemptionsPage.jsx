import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardService } from '@/services/rewardService';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PromptDialog } from '@/components/common/PromptDialog';
import { QrCodeScannerModal } from '@/features/rewards/components/QrCodeScannerModal';
import { RedemptionTicketModal } from '@/features/rewards/components/RedemptionTicketModal';
import { ProofPhotoModal } from '@/features/rewards/components/ProofPhotoModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Gift,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Ticket,
  AlertCircle,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  Camera,
  EyeOff,
  Eye,
} from 'lucide-react';

export const OfficerRedemptionsPage = () => {
  const { userProfile, user } = useAuth();
  const [redemptions, setRedemptions] = useState([]);
  const [stats, setStats] = useState({
    activeRewardsCount: 0,
    pendingCount: 0,
    completedTodayCount: 0,
    totalPointsRedeemed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // 'pending' | 'completed' | 'rejected' | 'all'

  // Modals & Feedback
  const [scannerOpen, setScannerOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Photo Capture Modal State
  const [proofPhotoModalOpen, setProofPhotoModalOpen] = useState(false);
  const [targetForPhoto, setTargetForPhoto] = useState(null);

  // Anonymous Officer Mode
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const officerRealName = userProfile?.fullName || userProfile?.displayName || user?.displayName || 'Petugas Station';
  const officerPublicName = isAnonymousMode ? 'Anonim' : officerRealName;

  // Custom Confirm & Prompt Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Konfirmasi',
    variant: 'success',
    onConfirm: () => {},
  });

  const [promptDialog, setPromptDialog] = useState({
    isOpen: false,
    targetRedemption: null,
  });

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchRedemptionsData = async () => {
    setLoading(true);
    try {
      const list = await rewardService.getAllRedemptions({ statusFilter: 'all' });
      setRedemptions(list);
      const metrics = await rewardService.getRedemptionStats();
      setStats(metrics);
    } catch (err) {
      console.error('Error loading redemptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptionsData();
  }, []);

  // Open Proof Photo Camera for a redemption
  const handleOpenPhotoCapture = (redemption) => {
    setTargetForPhoto(redemption);
    setProofPhotoModalOpen(true);
  };

  // Called after photo is snapped by Officer
  const handlePhotoCaptured = async (proofImageUrl) => {
    if (!targetForPhoto) return;
    const redemption = targetForPhoto;
    const redId = redemption.redemptionId || redemption.id;

    setActionLoading(true);
    try {
      await rewardService.requestOfficerVerification(
        redId,
        userProfile?.uid || user?.uid || 'officer',
        officerPublicName,
        proofImageUrl,
        isAnonymousMode,
        officerRealName
      );
      showToast(`Foto bukti tersimpan. Sinyal konfirmasi dikirim ke layar warga ${redemption.userName}.`);
      setProofPhotoModalOpen(false);
      setTargetForPhoto(null);
      fetchRedemptionsData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan foto bukti.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // STEP 2: Officer executes final atomic WriteBatch write (deducts points & stock)
  const promptExecuteFinalRedemption = (redemption) => {
    const redId = redemption.redemptionId || redemption.id;
    setConfirmDialog({
      isOpen: true,
      title: `Selesaikan & Potong Poin (${redemption.pointsRequired} Pts)?`,
      description: `Warga ${redemption.userName} telah mengonfirmasi penerimaan barang fisik beserta foto bukti. Klik konfirmasi untuk memotong poin dan stok secara atomik.`,
      confirmText: 'Selesaikan & Potong Poin Atomik',
      variant: 'success',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await rewardService.confirmRedemption(redId, userProfile?.uid || user?.uid || 'officer');
          showToast(`Transaksi selesai. Penukaran "${redemption.rewardName}" oleh ${redemption.userName} berhasil dan poin telah dipotong.`);
          fetchRedemptionsData();
        } catch (err) {
          showToast(err.message || 'Gagal mengonfirmasi penukaran.', 'error');
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Officer rejects redemption via PromptDialog
  const promptRejectRedemption = (redemption) => {
    setPromptDialog({
      isOpen: true,
      targetRedemption: redemption,
    });
  };

  const handleExecuteReject = async (reason) => {
    if (!promptDialog.targetRedemption) return;
    const redemption = promptDialog.targetRedemption;
    const redId = redemption.redemptionId || redemption.id;

    setActionLoading(true);
    try {
      await rewardService.rejectRedemption(redId, userProfile?.uid || user?.uid || 'officer', reason);
      showToast(`Penukaran "${redId}" telah ditolak. Poin warga tetap utuh.`);
      setPromptDialog({ isOpen: false, targetRedemption: null });
      fetchRedemptionsData();
    } catch (err) {
      showToast(err.message || 'Gagal menolak penukaran.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Scanned Redemption ID from Scanner Modal
  const handleScannedId = async (scannedId) => {
    const target = redemptions.find(
      (r) => (r.redemptionId || r.id).toUpperCase() === scannedId.toUpperCase()
    );
    if (target) {
      setSelectedRedemption(target);
      setTicketModalOpen(true);
      showToast(`Voucher "${scannedId}" ditemukan! Potret foto bukti penyerahan.`);

      // Auto-open camera modal if pending
      if (target.status === 'pending') {
        handleOpenPhotoCapture(target);
      }
    } else {
      showToast(`Voucher "${scannedId}" tidak ditemukan dalam database.`, 'error');
    }
  };

  // Filtering
  const filteredList = redemptions.filter((r) => {
    const idStr = String(r.redemptionId || r.id || '').toLowerCase();
    const userStr = String(r.userName || '').toLowerCase();
    const itemStr = String(r.rewardName || '').toLowerCase();
    const queryStr = searchQuery.toLowerCase();

    const matchesQuery = idStr.includes(queryStr) || userStr.includes(queryStr) || itemStr.includes(queryStr);
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus || (filterStatus === 'pending' && (r.status === 'pending' || r.status === 'awaiting_confirmation' || r.status === 'citizen_confirmed'));

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title="Verifikasi & Klaim Penukaran Reward"
        description="Scan QR Code voucher warga, potret foto bukti penyerahan barang dengan kamera, lalu potong poin secara atomik."
        icon={Gift}
      >
        <div className="flex items-center gap-2">
          {/* Anonymous Mode Toggle */}
          <button
            onClick={() => setIsAnonymousMode((prev) => !prev)}
            title={isAnonymousMode ? `Mode Anonim Aktif — Anda tampil sebagai "Anonim" ke warga` : `Mode Normal — Anda tampil sebagai "${officerRealName}"`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isAnonymousMode
                ? 'bg-slate-800 text-white border-slate-700 dark:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAnonymousMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isAnonymousMode ? 'Anonim' : officerRealName}</span>
          </button>

          <Button
            onClick={() => setScannerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9 font-bold shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Voucher</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRedemptionsData}
            className="text-xs h-9 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400">Voucher Pending</span>
              <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">{stats.pendingCount}</div>
            </div>
            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">Selesai Hari Ini</span>
              <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">{stats.completedTodayCount}</div>
            </div>
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Katalog Aktif</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.activeRewardsCount}</div>
            </div>
            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Total Poin Ditukar</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.totalPointsRedeemed.toLocaleString()}</div>
            </div>
            <div className="p-2.5 bg-purple-600 text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Redemption ID, Nama Warga, atau Reward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Pending / Handshake
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Ditolak
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Redemptions Grid / List */}
      {loading ? (
        <LoadingState message="Memuat permohonan penukaran reward..." />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="Tidak Ada Voucher Penukaran"
          description="Tidak ada permohonan penukaran voucher yang sesuai dengan filter pencarian."
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((red) => {
            const redId = red.redemptionId || red.id;
            const isPending = red.status === 'pending';
            const isAwaitingConfirmation = red.status === 'awaiting_confirmation';
            const isCitizenConfirmed = red.status === 'citizen_confirmed';
            const isCompleted = red.status === 'completed';
            const isRejected = red.status === 'rejected';

            return (
              <Card
                key={redId}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {red.rewardName}
                      </span>
                      {isPending && (
                        <Badge variant="warning" className="gap-1 text-[10px]">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>1. Menunggu Potret Bukti</span>
                        </Badge>
                      )}
                      {isAwaitingConfirmation && (
                        <Badge className="bg-amber-500 text-white gap-1 text-[10px] animate-pulse">
                          <ShieldCheck className="w-3 h-3" />
                          <span>2. Menunggu Konfirmasi HP Warga</span>
                        </Badge>
                      )}
                      {isCitizenConfirmed && (
                        <Badge className="bg-blue-600 text-white gap-1 text-[10px] animate-bounce">
                          <PackageCheck className="w-3 h-3" />
                          <span>3. Warga Sudah Konfirmasi (Siap Potong Poin)</span>
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="success" className="gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai — Diklaim Kedua Pihak</span>
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>Ditolak</span>
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-x-2">
                      <span>Warga: <strong className="text-slate-900 dark:text-slate-100">{red.userName}</strong> ({red.userMemberId || 'N/A'})</span>
                      <span>•</span>
                      <span>Poin Required: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{red.pointsRequired} Pts</strong></span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                      <span>ID Voucher: <strong className="text-slate-700 dark:text-slate-300">{redId}</strong></span>
                      <span>•</span>
                      <span>Tgl: {new Date(red.createdAt?.seconds ? red.createdAt.seconds * 1000 : red.createdAt || Date.now()).toLocaleDateString('id-ID')}</span>
                    </div>

                    {/* Proof Photo — clearly visible in officer/admin card */}
                    {red.proofImageUrl && (
                      <div className="pt-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          Foto Bukti Penyerahan
                        </span>
                        <div
                          className="w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setSelectedRedemption(red);
                            setTicketModalOpen(true);
                          }}
                        >
                          <img
                            src={red.proofImageUrl}
                            alt="Foto bukti penyerahan barang"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Officer name — visible in admin panel (shows real name even if anonymous) */}
                    {(red.officerName || red.officerRealName) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span>Verifikator:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {red.officerRealName || red.officerName}
                        </span>
                        {red.officerIsAnonymous && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">
                            <EyeOff className="w-3 h-3" />
                            <span>Anonim ke Warga</span>
                          </span>
                        )}
                      </div>
                    )}

                    {isRejected && red.rejectionReason && (
                      <p className="text-xs italic text-rose-600 dark:text-rose-400 pt-1">
                        Alasan penolakan: "{red.rejectionReason}"
                      </p>
                    )}
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        setSelectedRedemption(red);
                        setTicketModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Ticket className="w-4 h-4 text-emerald-600" />
                      <span>Detail Ticket</span>
                    </Button>

                    {/* Step 1 -> Open camera to take proof photo & request confirmation */}
                    {isPending && (
                      <Button
                        onClick={() => handleOpenPhotoCapture(red)}
                        disabled={actionLoading}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 gap-1.5 font-bold shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Potret Bukti Penyerahan</span>
                      </Button>
                    )}

                    {/* Step 2 -> Retake photo or re-request */}
                    {isAwaitingConfirmation && (
                      <Button
                        onClick={() => handleOpenPhotoCapture(red)}
                        disabled={actionLoading}
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-800 dark:text-amber-300 text-xs h-9 gap-1 animate-pulse"
                      >
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>Foto Ulang Bukti</span>
                      </Button>
                    )}

                    {/* Step 3 -> Citizen confirmed receipt, Officer executes final atomic write */}
                    {(isCitizenConfirmed || isAwaitingConfirmation) && (
                      <Button
                        onClick={() => promptExecuteFinalRedemption(red)}
                        disabled={actionLoading}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 font-extrabold shadow-md animate-bounce"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan & Potong Poin</span>
                      </Button>
                    )}

                    {!isCompleted && !isRejected && (
                      <Button
                        onClick={() => promptRejectRedemption(red)}
                        disabled={actionLoading}
                        variant="destructive"
                        size="sm"
                        className="text-xs h-9 gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <QrCodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleScannedId}
      />

      <ProofPhotoModal
        isOpen={proofPhotoModalOpen}
        onClose={() => {
          setProofPhotoModalOpen(false);
          setTargetForPhoto(null);
        }}
        onCapture={handlePhotoCaptured}
        rewardName={targetForPhoto?.rewardName}
        citizenName={targetForPhoto?.userName}
      />

      <RedemptionTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        redemption={selectedRedemption}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={actionLoading}
      />

      <PromptDialog
        isOpen={promptDialog.isOpen}
        onClose={() => setPromptDialog({ isOpen: false, targetRedemption: null })}
        onSubmit={handleExecuteReject}
        title={`Tolak Penukaran "${promptDialog.targetRedemption?.rewardName || ''}"?`}
        description={`Masukkan alasan penolakan penukaran voucher untuk warga ${promptDialog.targetRedemption?.userName || ''}:`}
        placeholder="misal: Stok fisik barang di gudang rusak / habis"
        initialValue="Stok fisik barang di gudang rusak / habis."
        confirmText="Tolak Penukaran"
        isLoading={actionLoading}
      />
    </div>
  );
};
