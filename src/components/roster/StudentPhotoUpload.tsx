import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, Check, RefreshCw, RotateCcw } from 'lucide-react';
import { AvatarChild } from '../ui/AvatarChild';

export interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  studentNis: string;
  currentPhotoUrl?: string;
  onSavePhoto: (photoUrl: string) => Promise<void> | void;
  onClose: () => void;
}

export const StudentPhotoUpload: React.FC<StudentPhotoUploadProps> = ({
  studentId: _studentId,
  studentName,
  studentNis,
  currentPhotoUrl,
  onSavePhoto,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl);
  const [isCapturingCamera, setIsCapturingCamera] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File Picker Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Live Camera
  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        setIsCapturingCamera(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }, 100);
      } else {
        // Fallback ke file input with capture
        cameraInputRef.current?.click();
      }
    } catch (err) {
      console.warn('Live camera error, falling back to input capture:', err);
      setCameraError('Kamera web tidak tersedia, gunakan pengambilan foto sistem.');
      cameraInputRef.current?.click();
    }
  };

  // Stop Live Camera
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  // Capture Snapshot from Live Camera Video
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewUrl(dataUrl);
    }
    stopLiveCamera();
  };

  // Save Final Photo
  const handleSave = async () => {
    setIsUploading(true);
    try {
      await onSavePhoto(previewUrl || '');
      onClose();
    } catch (err) {
      console.error('Failed to save student photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-inset/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-line-strong rounded-card shadow-hairline max-w-md w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="font-display font-bold text-ink text-base">
              Foto Profil Anak Didik
            </h3>
            <p className="text-xs text-ink-soft font-medium mt-0.5">
              {studentName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            aria-label="Tutup"
            className="min-h-[48px] min-w-[48px] p-2 rounded-lg text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera View or Preview */}
        <div className="flex flex-col items-center justify-center py-4 bg-surface-subtle border border-line rounded-xl overflow-hidden min-h-[220px]">
          {isCapturingCamera ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-accent-valor bg-canvas flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="min-h-[48px] px-5 py-2 rounded-full bg-brand text-on-brand font-semibold text-xs flex items-center gap-2 shadow-sm hover-only:bg-brand-deep cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto</span>
                </button>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="min-h-[48px] px-4 py-2 rounded-full bg-surface border border-line text-ink-soft font-semibold text-xs flex items-center gap-1 cursor-pointer hover-only:text-ink"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt={`Foto ${studentName}`}
                    className="w-32 h-32 rounded-full object-cover border-2 border-line shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    aria-label="Hapus Foto"
                    className="absolute -top-1 -right-1 min-h-[48px] min-w-[48px] p-2 rounded-full bg-danger text-on-brand shadow-sm flex items-center justify-center cursor-pointer hover-only:bg-danger-deep transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="my-2">
                    <AvatarChild
                      name={studentName}
                      id={studentNis}
                      size="lg"
                      showSymbol={false}
                      uniformColor={true}
                      className="scale-125"
                    />
                  </div>
                  <p className="text-xs text-ink-faint">
                    Avatar Default (Inisial Nama)
                  </p>
                </div>
              )}
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-warning font-medium mt-2 px-4 text-center">
              {cameraError}
            </p>
          )}
        </div>

        {/* Action Pickers (3-Column Grid) */}
        <div className="grid grid-cols-3 gap-2">
          {/* File input (Camera) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* File input (Picker) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={startLiveCamera}
            className="min-h-[48px] px-2 py-2 rounded-xl bg-surface border border-line text-ink font-semibold text-xs flex flex-col items-center justify-center gap-1 hover-only:bg-surface-subtle hover-only:text-ink cursor-pointer transition-colors"
          >
            <Camera className="w-4 h-4 text-accent-valor" />
            <span>Kamera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[48px] px-2 py-2 rounded-xl bg-surface border border-line text-ink font-semibold text-xs flex flex-col items-center justify-center gap-1 hover-only:bg-surface-subtle hover-only:text-ink cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-accent-valor" />
            <span>Unggah</span>
          </button>

          <button
            type="button"
            onClick={handleRemovePhoto}
            className="min-h-[48px] px-2 py-2 rounded-xl bg-surface border border-line text-ink-soft hover-only:text-ink font-semibold text-xs flex flex-col items-center justify-center gap-1 hover-only:bg-surface-subtle cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-ink-faint" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
          <button
            type="button"
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="min-h-[48px] px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSave}
            className="min-h-[48px] px-5 py-2 rounded-xl bg-brand text-on-brand font-semibold text-xs flex items-center gap-2 shadow-sm hover-only:bg-brand-deep disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Menyimpan…' : 'Simpan Foto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
