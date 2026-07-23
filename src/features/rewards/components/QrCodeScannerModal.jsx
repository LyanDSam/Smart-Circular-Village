import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { QrCode, Camera, Search, X, AlertCircle, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

export const QrCodeScannerModal = ({ isOpen, onClose, onScanned }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);

  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [successCode, setSuccessCode] = useState(null);

  // Start Real Live Camera Stream with multi-tier fallback
  const startCamera = async () => {
    setCameraError('');
    setIsScanning(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Akses Web Cam diblokir oleh browser (memerlukan protokol HTTPS atau localhost). Gunakan tombol "Scan dari Kamera HP / File Foto" di bawah.'
      );
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream = null;
      try {
        // Try 1: Rear environment camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err1) {
        // Try 2: Basic video fallback (works on all webcams & laptops)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);

      // Start BarcodeDetector loop if supported by browser
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128'] });
        const scan = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const scannedText = barcodes[0].rawValue.trim();
                if (scannedText) {
                  handleSuccessfulScan(scannedText);
                  return;
                }
              }
            } catch (err) {
              // Ignore frame detection hiccups
            }
          }
          scanLoopRef.current = requestAnimationFrame(scan);
        };
        scanLoopRef.current = requestAnimationFrame(scan);
      }
    } catch (err) {
      console.warn('Live camera access warning:', err);
      setCameraError('Gagal mengakses kamera. Gunakan tombol "Scan dari Kamera HP / File Foto" di bawah.');
    }
  };

  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      setSuccessCode(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccessfulScan = (code) => {
    const cleanId = String(code || '').trim().toUpperCase();
    if (!cleanId) return;

    setSuccessCode(cleanId);
    stopCamera();

    // Trigger parent callback
    setTimeout(() => {
      onScanned(cleanId);
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError('');
    const cleanId = manualId.trim().toUpperCase();
    if (!cleanId) {
      setError('Masukkan Redemption ID yang valid (misal SCV-RWD-7Z6Q9K)');
      return;
    }
    handleSuccessfulScan(cleanId);
  };

  // Image Upload QR Reader Fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128'] });
          const barcodes = await detector.detect(img);
          if (barcodes && barcodes.length > 0) {
            handleSuccessfulScan(barcodes[0].rawValue);
            return;
          }
        } catch (err) {
          console.warn('BarcodeDetector file parse error:', err);
        }
      }

      // Fallback: try parsing Redemption ID pattern from filename or manual fallback
      const match = file.name.match(/SCV-RWD-[A-Z0-9]+/i);
      if (match) {
        handleSuccessfulScan(match[0]);
      } else {
        setError('QR Code tidak terdeteksi di gambar ini. Masukkan Redemption ID secara manual.');
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative font-sans flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Scan QR Code Voucher</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Arahkan kamera ke QR Code voucher warga</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
          {/* Live Camera Viewfinder */}
          <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/50 flex items-center justify-center shadow-inner">
            {!successCode && (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Target Reticle Overlay */}
            {!successCode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] relative animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {successCode && (
              <div className="absolute inset-0 bg-emerald-600 text-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <CheckCircle2 className="w-14 h-14 mb-2 animate-bounce" />
                <h4 className="font-extrabold text-lg">QR Code Terdeteksi!</h4>
                <p className="text-xs font-mono font-bold mt-1 bg-emerald-700 px-3 py-1 rounded-lg">
                  {successCode}
                </p>
              </div>
            )}

            {/* Camera Permission / Access Error */}
            {cameraError && !successCode && (
              <div className="absolute inset-0 bg-slate-950 p-6 text-center flex flex-col items-center justify-center text-xs text-rose-400 space-y-3 z-10">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p>{cameraError}</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl cursor-pointer hover:bg-slate-700 font-bold text-xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload Foto QR Code</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

            {/* Quick Scanner Action Bar */}
            <div className="flex gap-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 font-bold text-xs shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Buka Kamera HP / Upload Foto QR</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </label>

            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              className="text-xs font-bold gap-1.5 h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Kamera</span>
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Atau Masukkan Redemption ID Manual:
            </label>
            <div className="flex gap-2">
              <Input
                value={manualId}
                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                placeholder="misal: SCV-RWD-7Z6Q9K"
                className="font-mono uppercase font-bold text-xs h-10"
              />
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shrink-0 h-10 gap-1.5">
                <Search className="w-4 h-4" />
                <span>Cari Voucher</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
