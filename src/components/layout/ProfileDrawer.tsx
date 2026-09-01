/**
 * @file ProfileDrawer.tsx
 * @description Profile Hub v2 & User Management (ADR-UX-013)
 * 
 * Features:
 * 1. Avatar Management: Photo upload with client-side canvas downscale (512x512px, <= 2MB, JPEG/PNG)
 * 2. Personal Information: Inline name and masked phone edit (+62) via AdaptiveDialog
 * 3. Canonical Security: Readonly email (SUPERADMIN only) & Password Change dialog
 * 4. Biometric Preference: Passkey soft-toggle with informative confirmation dialog (#DW-02)
 * 5. Digital Credentials: CR80 "Agung" Name Card generator trigger (PDF/PNG)
 * 6. Ergonomics: Danger-tinted Sign Out and 48dp touch floor
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { getSupabaseClient } from '../../db/supabaseClient';
import { NameCardModal } from '../profile/NameCardModal';
import { PasskeyManager } from '../profile/PasskeyManager';
import { registerPasskey } from '../../services/webauthn';
import { 
  X, 
  Building2, 
  Camera, 
  Edit3, 
  Lock, 
  KeyRound, 
  Fingerprint, 
  CreditCard, 
  LogOut, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: any) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const { currentPersona, updateOwnProfile, signOut } = useSecurityContext();
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal / Dialog States
  const [isNameCardOpen, setIsNameCardOpen] = useState<boolean>(false);
  const [isPasskeyManagerOpen, setIsPasskeyManagerOpen] = useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useState<'NAME' | 'PHONE' | 'PASSWORD' | 'PASSKEY_ON' | 'PASSKEY_OFF' | null>(null);

  // Form Field States
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Feedback & Loading States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && currentPersona) {
      if (supabase && currentPersona.personId) {
        supabase
          .from('persons')
          .select('passkey_enabled')
          .eq('id', currentPersona.personId)
          .maybeSingle()
          .then(({ data: pData }) => {
            if (pData?.passkey_enabled !== undefined && pData.passkey_enabled !== currentPersona.passkeyEnabled) {
              updateOwnProfile({ passkeyEnabled: Boolean(pData.passkey_enabled) });
            }
          })
          .catch(() => {});
      } else if (!supabase && typeof localStorage !== 'undefined' && currentPersona.id) {
        // Scoped to specific simulation persona ID
        const local = JSON.parse(localStorage.getItem(`yapendik_mock_passkeys_${currentPersona.id}`) || '[]');
        const hasCreds = local.length > 0;
        if (hasCreds !== Boolean(currentPersona.passkeyEnabled)) {
          updateOwnProfile({ passkeyEnabled: hasCreds });
        }
      }
    }
  }, [isOpen, currentPersona?.personId, currentPersona?.id]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ----------------------------------------------------
  // 1. Client-Side Image Downscale & Upload (Canvas 512px)
  // ----------------------------------------------------
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    // Validate MIME type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorMessage('Format gambar harus JPG atau PNG.');
      return;
    }

    // Validate file size <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal 2 MB.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Downscale to max 512×512 using HTML5 Canvas API
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const maxDim = 512;
      let { width, height } = imageBitmap;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Gagal memproses kanvas gambar.');
      ctx.drawImage(imageBitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );

      if (!blob) throw new Error('Gagal mengonversi gambar.');

      let publicUrl: string;

      if (supabase && currentPersona?.id) {
        const filePath = `${currentPersona.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('staff-avatars')
          .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });

        if (uploadError) {
          console.warn('Storage upload error, using local data URL fallback:', uploadError);
          publicUrl = canvas.toDataURL('image/jpeg', 0.85);
        } else {
          const { data } = supabase.storage.from('staff-avatars').getPublicUrl(filePath);
          publicUrl = data.publicUrl;
        }
      } else {
        publicUrl = canvas.toDataURL('image/jpeg', 0.85);
      }

      const res = await updateOwnProfile({ avatarUrl: publicUrl });
      if (res.success) {
        showToast('Foto profil berhasil diperbarui.');
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan foto profil.');
      }
    } catch (err: any) {
      console.error('Photo processing error', err);
      setErrorMessage(err.message || 'Gagal memproses foto.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // 2. Name & Phone Edit Handlers
  // ----------------------------------------------------
  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setErrorMessage('Nama lengkap harus terdiri dari 2 hingga 100 karakter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await updateOwnProfile({ name: trimmed });
    setIsLoading(false);

    if (res.success) {
      setActiveDialog(null);
      showToast('Nama lengkap berhasil diperbarui.');
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui nama.');
    }
  };

  const handleSavePhone = async () => {
    const trimmed = editPhone.trim();
    const phoneRegex = /^(\+62|0)[0-9\s\-]{8,15}$/;
    if (!phoneRegex.test(trimmed)) {
      setErrorMessage('Nomor telepon tidak valid. Gunakan format internasional (contoh: +6281218641392).');
      return;
    }

    // Standardize to international +62 format if started with 0
    let standardPhone = trimmed.replace(/[\s\-]/g, '');
    if (standardPhone.startsWith('0')) {
      standardPhone = '+62' + standardPhone.slice(1);
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await updateOwnProfile({ phone: standardPhone });
    setIsLoading(false);

    if (res.success) {
      setActiveDialog(null);
      showToast('Nomor telepon berhasil diperbarui.');
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui nomor telepon.');
    }
  };

  // ----------------------------------------------------
  // 3. Password Change Handler
  // ----------------------------------------------------
  const handleSavePassword = async () => {
    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      setActiveDialog(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Kata sandi berhasil diperbarui.');
    } catch (err: any) {
      console.error('Password update error', err);
      setErrorMessage(err.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // 4. Passkey WebAuthn Handler (#DW-02 / ADR-05)
  // ----------------------------------------------------
  const handleRegisterPasskey = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await registerPasskey(supabase);
      if (res.success) {
        await updateOwnProfile({ passkeyEnabled: true });
        showToast(res.message || 'Passkey biometrik berhasil didaftarkan');
      } else if (!res.cancelled) {
        setErrorMessage(res.error || 'Gagal mendaftarkan passkey');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan passkey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPasskeyToggle = async (enable: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await updateOwnProfile({ passkeyEnabled: enable });
    setIsLoading(false);

    if (res.success) {
      setActiveDialog(null);
      showToast(enable 
        ? 'Preferensi login sidik jari diaktifkan.' 
        : 'Login sidik jari dinonaktifkan.'
      );
    } else {
      setErrorMessage(res.error || 'Gagal mengubah preferensi passkey.');
    }
  };

  const initials = currentPersona?.name
    ? currentPersona.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-end medium:items-center justify-center p-0 medium:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-drawer-title"
        data-testid="profile-drawer"
      >
        <div className="w-full max-w-lg bg-surface rounded-t-3xl medium:rounded-3xl border border-line-soft shadow-modal overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
          
          {/* Header Ribbon & Close Button */}
          <div className="p-4 medium:p-5 border-b border-line-hairline flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-ink-faint uppercase">
                Amanaura OS ✦ • Profil Saya
              </span>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-surface border border-line-hairline flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer transition-colors"
              aria-label="Tutup Profil Saya"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="px-5 py-3 bg-brand-tint border-b border-brand-line/50 flex items-center space-x-2 text-xs font-semibold text-brand-primary animate-in fade-in duration-150 shrink-0">
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="px-5 py-3 bg-danger-tint border-b border-danger-line/50 flex items-center space-x-2 text-xs font-semibold text-danger animate-in fade-in duration-150 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scrollable Body */}
          <div className="p-5 medium:p-6 space-y-6 overflow-y-auto flex-1 no-scrollbar">
            
            {/* 1. Avatar & Identity Header Zone */}
            <div className="flex flex-col medium:flex-row items-center medium:items-start space-y-4 medium:space-y-0 medium:space-x-5 p-4 rounded-2xl bg-surface-subtle border border-line-hairline">
              <div className="relative shrink-0">
                {currentPersona?.avatarUrl ? (
                  <img 
                    src={currentPersona.avatarUrl} 
                    alt={currentPersona.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-brand-primary shadow-soft"
                    data-testid="profile-avatar-img"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-2xl font-bold font-serif shadow-soft"
                    data-testid="profile-avatar-fallback"
                  >
                    {initials}
                  </div>
                )}

                {/* Circadian Active Marker Dot */}
                <span 
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-surface flex items-center justify-center shadow-xs"
                  title="Status Aktif Sirkadian"
                >
                  <span className="w-3 h-3 rounded-full bg-accent-valor" />
                </span>

                {/* Change Photo Button Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute -bottom-1 -left-1 p-2 rounded-full bg-surface border border-line-hairline text-brand-primary hover-only:bg-surface-subtle shadow-xs cursor-pointer transition-colors"
                  aria-label="Ganti Foto Profil"
                  title="Ganti Foto Profil (JPG/PNG max 2MB)"
                  data-testid="btn-change-photo"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="flex-1 text-center medium:text-left min-w-0 space-y-2">
                <div className="flex items-center justify-center medium:justify-between">
                  <h1 className="font-bold text-lg text-ink truncate">
                    {currentPersona?.name || 'Pengguna Amanaura'}
                  </h1>
                </div>
                <p className="text-xs text-ink-soft">
                  {currentPersona?.roleTitle || currentPersona?.role}
                </p>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface text-xs font-mono text-ink-soft border border-line-hairline">
                  <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="truncate">{currentPersona?.schoolName || 'Satuan Pendidikan Yapendik'}</span>
                </div>
              </div>
            </div>

            {/* 2. Personal Information Fields */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold text-ink-faint uppercase tracking-wider px-1">
                Informasi Akun
              </h2>

              <div className="divide-y divide-line-hairline rounded-2xl bg-surface-subtle border border-line-hairline text-xs">
                
                {/* Nama Lengkap Row */}
                <div className="p-4 flex items-center justify-between space-x-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono text-ink-faint block">NAMA LENGKAP</span>
                    <span className="font-semibold text-ink truncate block">
                      {currentPersona?.name || '-'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(currentPersona?.name || '');
                      setErrorMessage(null);
                      setActiveDialog('NAME');
                    }}
                    className="px-3 py-2 rounded-lg bg-surface border border-line-hairline text-brand-primary font-medium hover-only:bg-surface-subtle flex items-center space-x-2 cursor-pointer transition-colors shrink-0"
                    data-testid="btn-edit-name"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Ubah</span>
                  </button>
                </div>

                {/* Email Address Row (Readonly Canonical) */}
                <div className="p-4 flex items-start justify-between space-x-3 bg-surface/50">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-ink-faint" />
                      <span className="text-[10px] font-mono text-ink-faint">EMAIL (KANONIKAL)</span>
                    </div>
                    <span className="font-mono text-ink-soft truncate block select-all">
                      {currentPersona?.email || 'yapendikmaranathajkt@gmail.com'}
                    </span>
                    <span className="text-[10px] text-ink-faint italic block">
                      Perubahan email hanya dapat dilakukan oleh SUPERADMIN.
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded text-[10px] font-mono bg-surface border border-line-hairline text-ink-faint shrink-0">
                    Readonly
                  </span>
                </div>

                {/* Nomor Telepon Row */}
                <div className="p-4 flex items-center justify-between space-x-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-ink-faint" />
                      <span className="text-[10px] font-mono text-ink-faint">NOMOR TELEPON</span>
                    </div>
                    <span className="font-mono font-semibold text-ink truncate block">
                      {currentPersona?.phone || '+6281218641392'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPhone(currentPersona?.phone || '+62');
                      setErrorMessage(null);
                      setActiveDialog('PHONE');
                    }}
                    className="px-3 py-2 rounded-lg bg-surface border border-line-hairline text-brand-primary font-medium hover-only:bg-surface-subtle flex items-center space-x-2 cursor-pointer transition-colors shrink-0"
                    data-testid="btn-edit-phone"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Ubah</span>
                  </button>
                </div>

              </div>
            </div>

            {/* 3. Security & Action Settings */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold text-ink-faint uppercase tracking-wider px-1">
                Keamanan & Kredensial
              </h2>

              <div className="space-y-2">
                
                {/* Ganti Kata Sandi */}
                <button
                  type="button"
                  onClick={() => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrorMessage(null);
                    setActiveDialog('PASSWORD');
                  }}
                  className="w-full p-4 rounded-2xl bg-surface-subtle border border-line-hairline text-ink hover-only:bg-surface font-medium text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[48px]"
                  data-testid="btn-change-password-dialog"
                >
                  <div className="flex items-center space-x-3">
                    <KeyRound className="w-4 h-4 text-brand-primary" />
                    <div className="text-left">
                      <span className="font-bold block">Ganti Kata Sandi</span>
                      <span className="text-[11px] text-ink-soft block">Perbarui kata sandi autentikasi akun Anda</span>
                    </div>
                  </div>
                  <span className="text-xs text-brand-primary font-bold">Atur</span>
                </button>

                {/* Login Sidik Jari / Passkey Section (#DW-02 / ADR-05) */}
                <div className="w-full p-4 rounded-2xl bg-surface-subtle border border-line space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 pr-2">
                      <div className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center shrink-0 border border-brand-line/40">
                        <Fingerprint className="w-5 h-5 text-brand-primary shrink-0" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-ink text-xs">Login Sidik Jari / Biometrik</span>
                          <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold ${
                            currentPersona?.passkeyEnabled
                              ? 'bg-success-tint text-success border border-success-line'
                              : 'bg-surface border border-line text-ink-faint'
                          }`}>
                            {currentPersona?.passkeyEnabled ? 'AKTIF' : 'PASSKEY'}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-soft block mt-0.5">
                          {currentPersona?.passkeyEnabled
                            ? 'Login Sidik Jari Aktif'
                            : 'Nonaktif (Login menggunakan kata sandi)'}
                        </span>
                      </div>
                    </div>

                    {/* High-Contrast Tactile Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(currentPersona?.passkeyEnabled)}
                      onClick={() => {
                        setErrorMessage(null);
                        setActiveDialog(currentPersona?.passkeyEnabled ? 'PASSKEY_OFF' : 'PASSKEY_ON');
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 border-2 transition-all duration-200 ease-in-out focus:outline-hidden ${
                        currentPersona?.passkeyEnabled 
                          ? 'bg-brand-primary border-brand-primary shadow-sm ring-2 ring-brand-primary/20' 
                          : 'bg-line-strong/40 border-line-strong'
                      }`}
                      data-testid="toggle-passkey-switch"
                      aria-label="Toggle login sidik jari"
                    >
                      <span 
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                          currentPersona?.passkeyEnabled 
                            ? 'translate-x-5 bg-on-brand' 
                            : 'translate-x-0 bg-ink-soft'
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Action row: Daftarkan Passkey or Kelola */}
                  <div className="pt-2 border-t border-line-hairline flex items-center justify-between">
                    {currentPersona?.passkeyEnabled ? (
                      <>
                        <div className="text-[11px] text-success font-medium flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Login Sidik Jari Aktif</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPasskeyManagerOpen(true)}
                          className="px-3 py-2 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle text-ink font-semibold text-xs transition-colors cursor-pointer"
                          data-testid="btn-manage-passkeys"
                        >
                          Kelola
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegisterPasskey}
                        disabled={isLoading}
                        className="w-full py-2 px-3 rounded-xl bg-brand-primary text-on-brand hover-only:opacity-95 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        data-testid="btn-register-passkey"
                      >
                        <Fingerprint className="w-4 h-4" />
                        <span>Daftarkan Passkey</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Unduh Kartu Nama Digital (Staf) / Unduh Kartu Keluarga (Wali) */}
                <button
                  type="button"
                  onClick={() => setIsNameCardOpen(true)}
                  className="w-full p-4 rounded-2xl bg-surface-subtle border border-line-hairline text-ink hover-only:bg-surface font-medium text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[48px]"
                  data-testid="btn-open-namecard"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-accent-valor" />
                    <div className="text-left">
                      <span className="font-bold block">
                        {currentPersona?.role === 'GUARDIAN' ? 'Unduh Kartu Keluarga' : 'Unduh Kartu Nama Digital'}
                      </span>
                      <span className="text-[11px] text-ink-soft block">
                        {currentPersona?.role === 'GUARDIAN' 
                          ? 'Format standar CR80 untuk verifikasi antar-jemput' 
                          : 'Format standar CR80 dengan QR Verifikasi Resmi'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-brand-primary font-bold">PDF / PNG</span>
                </button>

              </div>
            </div>

            {/* 4. Action Zone: Done / Save Profile */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full p-4 rounded-2xl bg-brand-primary text-on-brand hover-only:opacity-95 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[48px] shadow-soft"
                aria-label="Selesai dan Tutup Profil"
                data-testid="btn-drawer-done"
              >
                <Check className="w-4 h-4" />
                <span>Selesai & Simpan Profil</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ADAPTIVE DIALOGS                                     */}
      {/* ---------------------------------------------------- */}

      {/* Dialog: Ubah Nama Lengkap */}
      {activeDialog === 'NAME' && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-soft shadow-modal p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink">Ubah Nama Lengkap</h3>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft">Nama Lengkap (2-100 karakter):</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink text-xs focus:outline-brand-primary"
                placeholder="Nama Lengkap"
                data-testid="input-edit-name"
              />
            </div>
            {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-ink-soft hover-only:text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-on-brand bg-brand-primary hover-only:opacity-95 cursor-pointer disabled:opacity-50"
                data-testid="btn-save-name"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Ubah Nomor Telepon */}
      {activeDialog === 'PHONE' && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-soft shadow-modal p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink">Ubah Nomor Telepon</h3>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft">Nomor Telepon (Format +62):</label>
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink text-xs font-mono focus:outline-brand-primary"
                placeholder="+6281218641392"
                data-testid="input-edit-phone"
              />
            </div>
            {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-ink-soft hover-only:text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePhone}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-on-brand bg-brand-primary hover-only:opacity-95 cursor-pointer disabled:opacity-50"
                data-testid="btn-save-phone"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Ganti Kata Sandi */}
      {activeDialog === 'PASSWORD' && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-soft shadow-modal p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink">Ganti Kata Sandi</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-ink-soft">Kata Sandi Lama:</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-ink-soft">Kata Sandi Baru (min. 8 karakter):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink"
                  placeholder="••••••••"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-1">
                <label className="text-ink-soft">Konfirmasi Kata Sandi Baru:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink"
                  placeholder="••••••••"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-ink-soft hover-only:text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-on-brand bg-brand-primary hover-only:opacity-95 cursor-pointer disabled:opacity-50"
                data-testid="btn-save-password"
              >
                {isLoading ? 'Menyimpan...' : 'Perbarui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Konfirmasi Passkey ON */}
      {activeDialog === 'PASSKEY_ON' && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-soft shadow-modal p-5 space-y-4">
            <div className="flex items-center space-x-2 text-brand-primary">
              <Fingerprint className="w-5 h-5" />
              <h3 className="font-bold text-sm text-ink">Aktifkan Login Sidik Jari</h3>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Login sidik jari akan diaktifkan. Pada sprint berikutnya, Anda akan dapat mendaftarkan biometrik perangkat Anda. Untuk saat ini, toggle ini menandai preferensi autentikasi akun Anda.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-ink-soft hover-only:text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPasskeyToggle(true)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-on-brand bg-brand-primary hover-only:opacity-95 cursor-pointer"
                data-testid="btn-confirm-passkey-on"
              >
                {isLoading ? 'Mengaktifkan...' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Konfirmasi Passkey OFF */}
      {activeDialog === 'PASSKEY_OFF' && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-soft shadow-modal p-5 space-y-4">
            <div className="flex items-center space-x-2 text-ink-faint">
              <Fingerprint className="w-5 h-5" />
              <h3 className="font-bold text-sm text-ink">Nonaktifkan Login Sidik Jari</h3>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Anda akan login hanya dengan kata sandi. Jika Anda sudah mendaftarkan biometrik sebelumnya, preferensi tersebut akan dinonaktifkan.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-ink-soft hover-only:text-ink cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPasskeyToggle(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold text-danger bg-danger-tint border border-danger-line hover-only:bg-danger-tint/80 cursor-pointer"
                data-testid="btn-confirm-passkey-off"
              >
                {isLoading ? 'Menonaktifkan...' : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Card Generator Modal */}
      {currentPersona && (
        <NameCardModal 
          isOpen={isNameCardOpen}
          onClose={() => setIsNameCardOpen(false)}
          profile={currentPersona}
        />
      )}

      {/* Passkey / Biometric Credential Manager Modal */}
      <PasskeyManager
        isOpen={isPasskeyManagerOpen}
        onClose={() => setIsPasskeyManagerOpen(false)}
        onPasskeyCountChange={async (count) => {
          if (count === 0 && currentPersona?.passkeyEnabled) {
            await updateOwnProfile({ passkeyEnabled: false });
          } else if (count > 0 && !currentPersona?.passkeyEnabled) {
            await updateOwnProfile({ passkeyEnabled: true });
          }
        }}
      />
    </>
  );
};
