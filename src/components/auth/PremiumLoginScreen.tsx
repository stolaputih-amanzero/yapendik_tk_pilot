/**
 * Yapendik School OS — Premium SaaS Login & Identity Portal
 * Split-Screen Layout with Contextual Auth & Persona Simulation (Amanaura 100% Light Theme)
 */

import React, { useState } from 'react';
import { useSecurityContext } from '../../auth/context';
import { SupabaseSettingsModal } from '../workspaces/SupabaseSettingsModal';
import { Button, Badge, ListItem } from '../ui';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Mail, 
  Lock, 
  AlertCircle, 
  SlidersHorizontal,
  Users,
  ArrowRight,
  Flower2
} from 'lucide-react';

export const PremiumLoginScreen: React.FC = () => {
  const [authTab, setAuthTab] = useState<'REAL_AUTH' | 'SIMULATION'>(
    import.meta.env.VITE_ENABLE_SIMULATION === 'true' ? 'SIMULATION' : 'REAL_AUTH'
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const { authState, switchPersona, signInWithEmail } = useSecurityContext();

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await signInWithEmail(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
    }
  };

  const isSimulationEnabled = import.meta.env.VITE_ENABLE_SIMULATION === 'true';

  return (
    <div className="min-h-[100dvh] flex flex-col expanded:flex-row bg-canvas text-ink font-sans selection:bg-brand selection:text-on-brand">
      {/* SISI KIRI: BRANDING & VALUE PROPOSITION PANEL (Hidden di Mobile) */}
      <div className="hidden expanded:flex expanded:w-5/12 large:w-1/2 flex-col justify-between p-12 bg-surface border-r border-line relative overflow-hidden">
        {/* Ambient background blur glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brass/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-info/5 rounded-full blur-3xl pointer-events-none" />

        {/* Padma Watermark Line-Art (Nusantara Soul) */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 pointer-events-none select-none text-brass opacity-10 flex items-center justify-center">
          <Flower2 className="w-full h-full stroke-[0.6]" />
        </div>

        {/* Top Branding Section */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-card bg-surface-subtle border border-line flex items-center justify-center text-ink shadow-hairline">
              <Building2 className="w-6 h-6 text-brass" />
            </div>
            <div>
              <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2 font-display">
                Yapendik School OS
              </h1>
              <p className="text-xs text-ink-soft font-medium">Enterprise Institutional Operating System</p>
            </div>
          </div>
        </div>

        {/* Middle Educational Vision & Pillar Highlights */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-line text-ink text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brass fill-brass" />
            <span>Fondasi Pendidikan Usia Dini Berkarakter</span>
          </div>

          <h2 className="text-3xl large:text-4xl font-extrabold text-ink tracking-tight leading-tight mb-4 font-display">
            Ekosistem Terpadu untuk Tumbuh Kembang Holistik.
          </h2>
          
          <p className="text-ink-soft text-sm leading-relaxed mb-8 max-w-lg">
            Mengintegrasikan perencanaan kurikulum merdeka, asesmen perkembangan autentik (LPPA), tata kelola institusi terstandarisasi, dan kemitraan erat antara sekolah serta orang tua.
          </p>

          <div className="grid grid-cols-1 gap-3 max-w-lg">
            <div className="flex items-start space-x-3.5 p-3 rounded-card bg-surface-subtle border border-line">
              <div className="p-2 rounded-field bg-warning-tint border border-warning-line text-warning-deep shrink-0">
                <Sparkles className="w-4 h-4 text-warning fill-warning" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">Observasi & Penilaian Autentik (LPPA)</h3>
                <p className="text-[11px] text-ink-soft leading-normal mt-0.5">Pencatatan anekdot harian, portofolio karya, dan laporan capaian berbasis Kurikulum Merdeka.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3 rounded-card bg-surface-subtle border border-line">
              <div className="p-2 rounded-field bg-success-tint border border-success-line text-success-deep shrink-0">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">Keamanan & Tata Kelola Yayasan</h3>
                <p className="text-[11px] text-ink-soft leading-normal mt-0.5">Sistem akses aman yang memastikan data institusi Anda terlindungi dengan standar yayasan.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3 rounded-card bg-surface-subtle border border-line">
              <div className="p-2 rounded-field bg-info-tint border border-info-line text-info-deep shrink-0">
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
          <span>Yayasan Pendidikan Kristen - Yapendik GPIB</span>
        </div>
      </div>

      {/* SISI KANAN: FORM & IDENTITY PORTAL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 medium:p-10 expanded:p-12 relative">
        <div className="w-full max-w-md mx-auto bg-surface border border-line shadow-floating rounded-card p-6 medium:p-8">
          {/* Mobile Branding Header (Only visible on mobile/small screens) */}
          <div className="expanded:hidden flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-field bg-surface-subtle border border-line flex items-center justify-center text-ink">
              <Building2 className="w-5 h-5 text-brass" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink font-display">Yapendik School OS</h1>
              <p className="text-[11px] text-ink-soft font-mono whitespace-nowrap">TK PILOT v1.0 • PORTAL GURU & YAYASAN</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl medium:text-2xl font-bold tracking-tight text-ink mb-1 font-display">
              Portal Akses Institusi
            </h2>
            <p className="text-xs text-ink-soft font-medium">
              Silakan autentikasi identitas Anda untuk memasuki ruang kerja Yapendik OS.
            </p>
          </div>

          {/* Mode Switcher Tabs (Only shown if VITE_ENABLE_SIMULATION is enabled) */}
          {isSimulationEnabled && (
            <div className="flex bg-surface-subtle p-1 rounded-field border border-line mb-6 text-xs">
              <button
                type="button"
                onClick={() => setAuthTab('SIMULATION')}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'SIMULATION' 
                    ? 'bg-surface text-ink shadow-hairline font-bold' 
                    : 'text-ink-soft hover-only:text-ink'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Simulasi Persona (6+ Role)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('REAL_AUTH')}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'REAL_AUTH' 
                    ? 'bg-brand text-on-brand shadow-hairline font-bold' 
                    : 'text-ink-soft hover-only:text-ink'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Login Pengguna</span>
              </button>
            </div>
          )}

          {/* Special Canonical Identity Warning Notice (C-13) */}
          {authState === 'AUTHENTICATED_NO_PERSON' && (
            <div className="bg-warning-tint border border-warning-line rounded-field p-4 mb-6 text-left text-xs">
              <div className="flex items-center space-x-2 text-warning-deep font-bold mb-1.5">
                <ShieldCheck className="w-4 h-4 text-warning shrink-0" />
                <span>Notice Identitas Kanonikal (C-13)</span>
              </div>
              <p className="text-warning-deep leading-relaxed mb-2 font-medium">
                Akun Anda terautentikasi, namun profil Anda belum terdaftar aktif di sistem sekolah. Silakan hubungi Tata Usaha untuk aktivasi.
              </p>
              {isSimulationEnabled && (
                <p className="text-warning-deep/80 text-[11px]">
                  Gunakan tab simulasi persona di atas untuk pengujian fungsional modul TK Pilot.
                </p>
              )}
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
          {authTab === 'REAL_AUTH' ? (
            <form onSubmit={handleRealLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Email Institusi Yapendik
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@yapendik.sch.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-field pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
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
                    className="w-full bg-surface-subtle border border-line rounded-field pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-danger-tint border border-danger-line rounded-field text-danger-deep text-xs font-medium flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoggingIn}
                rightIcon={!isLoggingIn ? <ArrowRight className="w-4 h-4" /> : undefined}
                className="w-full shadow-hairline mt-2"
              >
                {isLoggingIn ? 'Memvalidasi Identitas...' : 'Masuk ke Ruang Kerja'}
              </Button>
            </form>
          ) : (
            /* SIMULATION PERSONA SELECTOR */
            <div className="space-y-2 text-left mb-2">
              <div className="text-[11px] text-ink-soft mb-2 font-medium">
                Pilih persona uji untuk mengeksplorasi modul sesuai kewenangan peran:
              </div>

              <div className="bg-surface border border-line rounded-field overflow-hidden divide-y divide-line-soft shadow-hairline">
                <ListItem
                  title="Siti Rahmawati, S.Pd"
                  subtitle="Wali Kelas TK A (Kelompok Bintang Ceria)"
                  badge={<Badge variant="info">TEACHER</Badge>}
                  onClick={() => switchPersona('user_teacher_siti')}
                  showChevron
                />

                <ListItem
                  title="Maria Magdalena, S.Pd.Aud"
                  subtitle="Wali Kelas TK B (Kelompok Matahari)"
                  badge={<Badge variant="info">TEACHER</Badge>}
                  onClick={() => switchPersona('user_teacher_maria')}
                  showChevron
                />

                <ListItem
                  title="Dra. Esther Nugroho, M.Pd"
                  subtitle="Kepala Sekolah TK Yapendik 01 Menteng"
                  badge={<Badge variant="success">HEADMASTER</Badge>}
                  onClick={() => switchPersona('user_headmaster_esther')}
                  showChevron
                />

                <ListItem
                  title="Budi Santoso, S.T."
                  subtitle="Orang Tua / Wali (Ayah Kenzo & Nathanael)"
                  badge={<Badge variant="neutral">GUARDIAN</Badge>}
                  onClick={() => switchPersona('user_parent_budi')}
                  showChevron
                />

                <ListItem
                  title="Bona Pandjaitan, S.T."
                  subtitle="Orang Tua Calon Siswa PPDB (Ayah Timothy)"
                  badge={<Badge variant="warning">APPLICANT</Badge>}
                  onClick={() => switchPersona('user_parent_bona')}
                  showChevron
                />

                <ListItem
                  title="Diana Sari, S.Pd (TK 02)"
                  subtitle="Guru TK 02 Kebayoran (Negative Test Isolasi)"
                  badge={<Badge variant="danger">CROSS_SCHOOL</Badge>}
                  onClick={() => switchPersona('user_teacher_diana_tk2')}
                  showChevron
                />

                <ListItem
                  title="Dr. Andreas Hendrawan"
                  subtitle="Pengawas Mutu Pendidikan Yayasan Yapendik"
                  badge={<Badge variant="lppa">SUPERADMIN</Badge>}
                  onClick={() => switchPersona('user_superadmin_yapendik')}
                  showChevron
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className={`mt-6 pt-4 border-t border-line-soft flex items-center text-xs text-ink-soft ${isSimulationEnabled ? 'justify-between' : 'justify-end'}`}>
            {isSimulationEnabled && (
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="inline-flex items-center gap-2 text-ink-soft hover-only:text-ink transition-colors text-xs font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Konfigurasi Supabase</span>
              </button>
            )}
            <span className="font-mono text-[11px] text-ink-faint whitespace-nowrap">V2.1.5</span>
          </div>
        </div>

        {/* Supabase Settings Modal (Only accessible if simulation / dev enabled) */}
        {isSimulationEnabled && (
          <SupabaseSettingsModal
            isOpen={isSupabaseModalOpen}
            onClose={() => setIsSupabaseModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

