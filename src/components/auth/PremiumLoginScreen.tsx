/**
 * Yapendik School OS — Premium SaaS Login & Identity Portal
 * Split-Screen Layout with Contextual Auth, Avatar Indicator & Biometric Option (ADR-UX-013)
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext, GENESIS_PERSONAS } from '../../auth/context';
import { getSupabaseClient } from '../../db/supabaseClient';
import { authenticateWithPasskey, isPlatformAuthenticatorAvailable, isWebAuthnSupported } from '../../services/webauthn';
import { Button } from '../ui';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  Flower2,
  Fingerprint,
  CheckCircle2,
  Info
} from 'lucide-react';

export const PremiumLoginScreen: React.FC<{ initialEmail?: string }> = ({ initialEmail = '' }) => {
  const [loginEmail, setLoginEmail] = useState(() => {
    if (initialEmail) return initialEmail;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('amanaura_remembered_email') || '';
    }
    return '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(initialEmail || (typeof localStorage !== 'undefined' && localStorage.getItem('amanaura_remembered_email'))));
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(true);

  const { authState, signInWithEmail, switchPersona, updateOwnProfile } = useSecurityContext();
  const supabase = getSupabaseClient();

  // Load remember me & check WebAuthn platform support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('amanaura_remembered_email');
      if (savedEmail) {
        setLoginEmail(savedEmail);
        setRememberMe(true);
      }
      setWebAuthnSupported(isWebAuthnSupported());
    }
  }, []);

  // Find matched persona for avatar preview based on email input
  const matchedPersona = GENESIS_PERSONAS.find(p => 
    loginEmail && p.email?.toLowerCase() === loginEmail.toLowerCase().trim()
  );

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsLoggingIn(true);
    setLoginError(null);
    setPasskeyNotice(null);

    if (rememberMe && typeof window !== 'undefined') {
      localStorage.setItem('amanaura_remembered_email', loginEmail.trim());
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('amanaura_remembered_email');
    }

    const res = await signInWithEmail(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
    }
  };

  const handlePasskeyLogin = async () => {
    if (!loginEmail) {
      setLoginError('Masukkan email Anda terlebih dahulu untuk memulai login biometrik.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    setPasskeyNotice(null);

    try {
      const res = await authenticateWithPasskey(supabase, loginEmail);
      if (res.success) {
        if (rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('amanaura_remembered_email', loginEmail.trim());
        }
        if (matchedPersona) {
          switchPersona(matchedPersona.id);
          updateOwnProfile({ passkeyEnabled: true, passkeyRegisteredAt: new Date().toISOString() });
        }
      } else if (res.fallback === 'password') {
        setPasskeyNotice(res.error || 'Login biometrik belum tersedia — silakan masuk menggunakan kata sandi.');
        // Auto-focus password input
        if (typeof document !== 'undefined') {
          const pwdInput = document.getElementById('login-password-input');
          pwdInput?.focus();
        }
      } else if (!res.cancelled) {
        setLoginError(res.error || 'Login biometrik gagal. Silakan gunakan kata sandi.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat otentikasi biometrik.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col expanded:flex-row bg-canvas text-ink font-sans selection:bg-brand selection:text-on-brand">
      {/* SISI KIRI: BRANDING & VALUE PROPOSITION PANEL (Hidden di Mobile) */}
      <div className="hidden expanded:flex expanded:w-5/12 large:w-1/2 flex-col justify-between p-12 bg-surface border-r border-line relative overflow-hidden">
        {/* Ambient background blur glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-info/5 rounded-full blur-3xl pointer-events-none" />

        {/* Padma Watermark Line-Art (Nusantara Soul) */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 pointer-events-none select-none text-brand-primary opacity-10 flex items-center justify-center">
          <Flower2 className="w-full h-full stroke-[0.6]" />
        </div>

        {/* Top Branding Section */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-card bg-surface-subtle border border-line-hairline flex items-center justify-center p-1.5 shadow-hairline">
              <img 
                src="/branding/amanaura-logo-plain.png" 
                alt="Amanaura OS Logo" 
                className="w-full h-full object-contain drop-shadow-xs dark:drop-shadow-[0_0_8px_rgba(168,135,76,0.3)]" 
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2 font-display">
                Amanaura OS <span className="text-accent-valor text-base font-normal">✦</span>
              </h1>
              <p className="text-xs text-ink-soft font-medium">The Warm, Tactile, and Dignified Operating Experience</p>
            </div>
          </div>
        </div>

        {/* Middle Educational Vision & Pillar Highlights */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transparent border border-line-hairline text-ink text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
            <span>Fondasi Pendidikan Usia Dini Berkarakter</span>
          </div>

          <h2 className="text-3xl large:text-4xl font-extrabold text-ink tracking-tight leading-tight mb-4 font-display">
            Ekosistem Terpadu untuk Tumbuh Kembang Holistik.
          </h2>
          
          <p className="text-ink-soft text-sm leading-relaxed mb-8 max-w-lg">
            Mengintegrasikan perencanaan kurikulum merdeka, asesmen perkembangan autentik (LPPA), tata kelola institusi terstandarisasi, dan kemitraan erat antara sekolah serta orang tua.
          </p>

          <div className="grid grid-cols-1 gap-3 max-w-lg">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-card bg-transparent border border-line-hairline transition-colors">
              <div className="p-2 rounded-field bg-warning-tint/60 border border-warning-line text-warning-deep shrink-0">
                <Sparkles className="w-4 h-4 text-warning fill-warning" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">Observasi & Penilaian Autentik (LPPA)</h3>
                <p className="text-[11px] text-ink-soft leading-normal mt-0.5">Pencatatan anekdot harian, portofolio karya, dan laporan capaian berbasis Kurikulum Merdeka.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-card bg-transparent border border-line-hairline transition-colors">
              <div className="p-2 rounded-field bg-success-tint/60 border border-success-line text-success-deep shrink-0">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">Keamanan & Tata Kelola Yayasan</h3>
                <p className="text-[11px] text-ink-soft leading-normal mt-0.5">Sistem akses aman yang memastikan data institusi Anda terlindungi dengan standar yayasan.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-card bg-transparent border border-line-hairline transition-colors">
              <div className="p-2 rounded-field bg-info-tint/60 border border-info-line text-info-deep shrink-0">
                <HeartHandshake className="w-4 h-4 text-info" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">Sinergi Guru & Orang Tua Terhubung</h3>
                <p className="text-[11px] text-ink-soft leading-normal mt-0.5">Portal komunikasi transparan untuk rekap harian, absensi, dan tahapan PPDB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Credit */}
        <div className="relative z-10 pt-6 border-t border-line flex items-center justify-between text-xs text-ink-soft">
          <span>Amanaura OS ✦ FLOW Design System • 2026</span>
        </div>
      </div>

      {/* SISI KANAN: FORM & IDENTITY PORTAL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 medium:p-10 expanded:p-12 relative">
        <div className="w-full max-w-md mx-auto bg-surface border border-line shadow-floating rounded-card p-6 medium:p-8">
          {/* Mobile Branding Header */}
          <div className="expanded:hidden flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-field bg-surface-subtle border border-line-hairline flex items-center justify-center p-1">
              <img 
                src="/branding/amanaura-logo-plain.png" 
                alt="Amanaura OS Logo" 
                className="w-full h-full object-contain drop-shadow-xs dark:drop-shadow-[0_0_8px_rgba(168,135,76,0.3)]" 
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink font-display flex items-center gap-1.5">
                Amanaura OS <span className="text-accent-valor text-xs">✦</span>
              </h1>
              <p className="text-[11px] text-ink-soft font-mono whitespace-nowrap">PLATFORM v1.0 • PORTAL GURU & YAYASAN</p>
            </div>
          </div>

          {/* User Avatar Indicator (if recognized) */}
          <div className="mb-6 flex items-center space-x-3.5 p-3 rounded-2xl bg-surface-subtle border border-line-hairline">
            {matchedPersona?.avatarUrl ? (
              <img 
                src={matchedPersona.avatarUrl} 
                alt={matchedPersona.name}
                className="w-12 h-12 rounded-full object-cover border border-brand-primary shrink-0 shadow-xs"
                data-testid="login-user-avatar"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-base font-bold font-serif shrink-0 shadow-xs"
                data-testid="login-user-avatar-fallback"
              >
                {matchedPersona ? matchedPersona.name.charAt(0) : '✦'}
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <h2 className="text-sm font-bold text-ink truncate">
                {matchedPersona ? matchedPersona.name : 'Portal Akses Institusi'}
              </h2>
              <p className="text-[11px] text-ink-soft truncate">
                {matchedPersona ? matchedPersona.roleTitle : 'Silakan autentikasi identitas Anda'}
              </p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-5 text-left">
            <h2 className="text-lg font-bold tracking-tight text-ink mb-0.5 font-display">
              Autentikasi Akun
            </h2>
            <p className="text-xs text-ink-soft font-medium">
              Masukkan kredensial resmi Yayasan Yapendik.
            </p>
          </div>

          {/* Special Notices (C-13) */}
          {authState === 'AUTHENTICATED_NO_PERSON' && (
            <div className="bg-warning-tint border border-warning-line rounded-field p-4 mb-6 text-left text-xs">
              <div className="flex items-center space-x-2 text-warning-deep font-bold mb-1.5">
                <ShieldCheck className="w-4 h-4 text-warning shrink-0" />
                <span>Notice Identitas Kanonikal (C-13)</span>
              </div>
              <p className="text-warning-deep leading-relaxed font-medium">
                Akun Anda terautentikasi, namun profil Anda belum terdaftar aktif di sistem sekolah. Silakan hubungi Administrator Yayasan atau Kepala Sekolah untuk aktivasi identitas.
              </p>
            </div>
          )}

          {authState === 'MAPPED_INACTIVE' && (
            <div className="bg-danger-tint border border-danger-line rounded-field p-4 mb-6 text-left text-xs text-danger-deep">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                <span>Akun Tidak Aktif</span>
              </div>
              <p className="text-danger-deep font-medium">
                Profil person Anda tercatat non-aktif pada unit institusi. Hubungi Administrator Yayasan.
              </p>
            </div>
          )}

          {authState === 'NO_INSTITUTIONAL_RELATIONSHIP' && (
            <div className="bg-warning-tint border border-warning-line rounded-field p-4 mb-6 text-left text-xs text-warning-deep">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <span>Tidak Ada Relasi Institusional</span>
              </div>
              <p className="text-warning-deep font-medium">
                Tidak ditemukan penetapan peran aktif pada unit TK mana pun.
              </p>
            </div>
          )}

          {/* REAL AUTHENTICATION FORM */}
          <form onSubmit={handleRealLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Email Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="contoh: yapendikmaranathajkt@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-field pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-field pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-line-hairline text-brand-primary focus:ring-brand cursor-pointer"
                  data-testid="checkbox-remember-me"
                />
                <span className="text-ink-soft text-[11px]">Ingat saya di perangkat ini</span>
              </label>
            </div>

            {loginError && (
              <div className="p-3 bg-danger-tint border border-danger-line rounded-field text-danger-deep text-xs font-medium flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <div className="leading-relaxed">{loginError}</div>
              </div>
            )}

            {passkeyNotice && (
              <div className="p-3 bg-info-tint border border-info-line rounded-field text-info-deep text-xs font-medium flex items-start space-x-2.5" data-testid="passkey-notice">
                <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <div className="leading-relaxed">{passkeyNotice}</div>
              </div>
            )}

            {/* Dynamic Passkey / Biometric Login Button (#DW-02 / ADR-05) */}
            {webAuthnSupported && (
              <>
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-surface-subtle hover-only:bg-surface border border-brand-line/60 hover-only:border-brand-primary text-ink text-xs font-sans font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px] shadow-xs disabled:opacity-50"
                  data-testid="btn-login-passkey"
                >
                  <Fingerprint className="w-4 h-4 text-brand-primary" />
                  <span>Login dengan Sidik Jari / Biometrik</span>
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-line" />
                  <span className="text-[11px] text-ink-faint font-medium">atau</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoggingIn}
              rightIcon={!isLoggingIn ? <ArrowRight className="w-4 h-4" /> : undefined}
              className="w-full shadow-hairline mt-1"
            >
              {isLoggingIn ? 'Memvalidasi Identitas...' : 'Masuk dengan Kata Sandi'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};


