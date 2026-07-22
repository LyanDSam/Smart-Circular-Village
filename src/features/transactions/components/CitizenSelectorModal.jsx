import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/services/userService';
import {
  X,
  Search,
  User,
  CreditCard,
  Phone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Link2,
} from 'lucide-react';

export const CitizenSelectorModal = ({
  isOpen = false,
  onClose,
  onRfidLinked,
  rfidUidToLink = '',
  officerUser = null,
}) => {
  const [search, setSearch] = useState('');
  const [citizens, setCitizens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const cleanRfid = String(rfidUidToLink || '').replace(/\s+/g, '').toUpperCase();

  // Load verified active citizens matching search query
  useEffect(() => {
    if (!isOpen) return;

    const fetchCitizens = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await userService.getUsers({
          search,
          role: 'citizen',
          status: 'active',
          pageSize: 50,
        });
        setCitizens(result.users || []);
      } catch (err) {
        console.error('Error searching citizens:', err);
        setErrorMessage('Gagal mencari data warga.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchCitizens, 300);
    return () => clearTimeout(timer);
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSelect = (citizen) => {
    setSelectedCitizen(citizen);
    setShowConfirmStep(true);
  };

  const handleCommitLink = async () => {
    if (!selectedCitizen || !cleanRfid) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await userService.assignRfid(
        selectedCitizen.uid,
        cleanRfid,
        officerUser?.uid || officerUser?.id || 'system_officer'
      );

      const updatedCitizen = {
        ...selectedCitizen,
        rfidUid: cleanRfid,
      };

      onRfidLinked(updatedCitizen);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menautkan kartu RFID.');
      setShowConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Tautkan RFID ke Warga Terdaftar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target RFID Card Display */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Kartu RFID Ditautkan:
            </span>
            <Badge className="font-mono bg-amber-500 text-white text-xs px-2.5 py-0.5">
              {cleanRfid}
            </Badge>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!showConfirmStep ? (
            <>
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama Warga, Member ID, atau No HP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Citizen List */}
              <div className="space-y-2 min-h-[200px] max-h-[280px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs">Mencari data warga terdaftar...</span>
                  </div>
                ) : citizens.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <User className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    Tidak ditemukan warga terverifikasi yang cocok dengan pencarian "{search}".
                  </div>
                ) : (
                  citizens.map((citizen) => (
                    <div
                      key={citizen.uid}
                      onClick={() => handleSelect(citizen)}
                      className="p-3 bg-white dark:bg-slate-900 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl transition-all cursor-pointer flex items-center justify-between group text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {citizen.fullName}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>Member ID: {citizen.memberId || 'SCV-26-XXXXXX'}</span>
                          {citizen.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {citizen.phone}
                            </span>
                          )}
                        </div>
                        {citizen.rfidUid && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block pt-0.5">
                            RFID Terpasang Saat Ini: {citizen.rfidUid}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold group-hover:bg-emerald-600 group-hover:text-white border-slate-200 dark:border-slate-700"
                      >
                        Pilih Warga
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Konfirmasi Penautan Kartu RFID
              </h4>

              <div className="space-y-2 border-t border-b border-slate-200 dark:border-slate-800 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Warga:</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">{selectedCitizen.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedCitizen.memberId || 'SCV-26-XXXXXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kartu RFID Baru:</span>
                  <Badge className="font-mono bg-emerald-600 text-white text-xs">{cleanRfid}</Badge>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tindakan ini akan menetapkan `rfidUid` ke profil warga di Firestore dan mencatat riwayat ke koleksi audit `audit_logs`.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmStep(false)}
                  disabled={isSubmitting}
                  className="text-xs h-8"
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  onClick={handleCommitLink}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menautkan...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Ya, Tautkan Sekarang</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Footer Close */}
          {!showConfirmStep && (
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs font-semibold border-slate-200 dark:border-slate-800"
              >
                Batal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
