import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, CheckCircle2, X, AlertCircle, Upload } from 'lucide-react';

export const ProofPhotoModal = ({ isOpen, onClose, onCapture, rewardName, citizenName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start Live Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser.');
    }
  };

  // Stop Camera Streams
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  if (!isOpen) return null;

  // Snap Photo from Video Stream
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to compressed JPEG DataURL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Ambil Foto Bukti Penyerahan Barang
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Posisikan kamera ke warga <strong className="text-slate-900 dark:text-slate-100">{citizenName || 'Warga'}</strong> yang menerima barang <strong className="text-emerald-600">{rewardName || 'Reward'}</strong>.
          </div>

          <div className="relative w-full aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {/* Live Camera View */}
            {!capturedImage && !cameraError && (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-500/50 rounded-2xl pointer-events-none m-4 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-emerald-400 bg-slate-950/70 px-3 py-1 rounded-full backdrop-blur-xs">
                    Target Foto Penyerahan Barang
                  </span>
                </div>
              </>
            )}

            {/* Captured Preview */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Bukti Penyerahan"
                className="w-full h-full object-cover animate-in fade-in"
              />
            )}

            {/* Camera Error Fallback */}
            {cameraError && !capturedImage && (
              <div className="p-6 text-center text-xs text-rose-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p>{cameraError}</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl cursor-pointer hover:bg-slate-700 font-bold">
                  <Upload className="w-4 h-4" />
                  <span>Upload Foto dari Galeri</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!capturedImage ? (
              <Button
                onClick={handleSnap}
                disabled={!isCameraActive}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 gap-2 rounded-2xl shadow-md"
              >
                <Camera className="w-5 h-5" />
                <span>Ambil Foto Bukti (Snap)</span>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex-1 text-xs h-11 font-bold gap-1.5 border-slate-200 dark:border-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Foto Ulang</span>
                </Button>
                <Button
                  onClick={handleConfirmPhoto}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gunakan Foto Ini</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
