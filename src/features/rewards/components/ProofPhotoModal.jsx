import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, CheckCircle2, X, AlertCircle, Upload, MapPin } from 'lucide-react';
import { postService } from '@/services/postService';

export const ProofPhotoModal = ({
  isOpen,
  onClose,
  onCapture,
  rewardName,
  citizenName,
  officerPostId = '',
  defaultPostName = 'Posko SCV Utama',
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Posko Dropdown State
  const [postName, setPostName] = useState(defaultPostName || 'Posko SCV Utama');
  const [postsList, setPostsList] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Fetch all posts from database and put officer's assigned Posko at the VERY TOP of the dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchPoskoList = async () => {
      setIsLoadingPosts(true);
      try {
        const res = await postService.getPosts({ pageSize: 100 });
        const fetched = res.posts || [];

        if (fetched.length > 0) {
          // Identify officer's assigned post
          const assigned = fetched.find(
            (p) =>
              (officerPostId && p.postId === officerPostId) ||
              (defaultPostName && (p.name || '').toLowerCase() === defaultPostName.toLowerCase())
          );

          let ordered = [];
          if (assigned) {
            // Place officer's assigned post at Index 0 (Topmost)
            const remaining = fetched.filter((p) => p.postId !== assigned.postId);
            ordered = [assigned, ...remaining];
          } else {
            ordered = fetched;
          }

          setPostsList(ordered);
          if (ordered[0]?.name) {
            setPostName(ordered[0].name);
          }
        } else {
          // Fallback if no posts in database yet
          const fallbackObj = { postId: 'default', name: defaultPostName || 'Posko SCV Utama' };
          setPostsList([fallbackObj]);
          setPostName(fallbackObj.name);
        }
      } catch (err) {
        console.error('Error loading Posko list for dropdown:', err);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPoskoList();
  }, [isOpen, officerPostId, defaultPostName]);

  // Start Live Camera with multi-tier fallback
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Akses Web Cam diblokir oleh browser (memerlukan protokol HTTPS atau localhost). Gunakan tombol "Buka Kamera HP / Galeri" di bawah.'
      );
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let mediaStream = null;
      try {
        // Try 1: Rear environment camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err1) {
        // Try 2: Basic video fallback (works on all webcams)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diizinkan atau gunakan tombol "Ambil Foto Kamera HP / Galeri".');
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

  // Snap Photo from Video Stream (Compressed to ~30KB-50KB for instant Firestore real-time sync)
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const maxWidth = 640;
    const scale = video.videoWidth ? Math.min(1, maxWidth / video.videoWidth) : 1;
    const targetWidth = Math.round((video.videoWidth || 640) * scale);
    const targetHeight = Math.round((video.videoHeight || 480) * scale);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Convert to highly compressed JPEG DataURL (~30-50KB payload)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.55);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle File Upload & Native Camera Capture Fallback with Client Resizing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 640;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.55);
          setCapturedImage(compressedDataUrl);
        };
        img.src = event.target.result;
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
      onCapture(capturedImage, postName || 'Posko SCV Utama');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative font-sans flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-4 px-5 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
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
        <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
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
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 font-extrabold text-xs shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Ambil Foto via Kamera HP / Galeri</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Direct Native Camera Trigger (Always accessible) */}
          {!capturedImage && (
            <div className="text-center pt-1">
              <label className="inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Atau Buka Kamera Asli Perangkat (Native Camera / Galeri)</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Posko Location Field (Database Dropdown Select) */}
          {capturedImage && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Posko Pengumpulan Tempat Penyerahan:
                </span>
              </label>

              <select
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                disabled={isLoadingPosts}
                className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/60 dark:border-emerald-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none shadow-xs"
              >
                {postsList.map((p, idx) => (
                  <option key={p.postId || idx} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  <span>Kirim Foto & Minta Konfirmasi Warga</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
