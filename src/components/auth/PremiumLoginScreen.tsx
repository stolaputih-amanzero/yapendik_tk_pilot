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
  ArrowRight
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* SISI KIRI: BRANDING & VALUE PROPOSITION PANEL (Hidden di Mobile) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-white border-r border-slate-200 relative overflow-hidden">
        {/* Ambient background blur glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Section */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Yapendik School OS
              </h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise Institutional Operating System</p>
            </div>
          </div>
        </div>

        {/* Middle Educational Vision & Pillar Highlights */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Fondasi Pendidikan Usia Dini Berkarakter</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Ekosistem Terpadu untuk Tumbuh Kembang Holistik.
          </h2>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg">
            Mengintegrasikan perencanaan kurikulum merdeka, asesmen perkembangan autentik (LPPA), tata kelola institusi terstandarisasi, dan kemitraan erat antara sekolah serta orang tua.
          </p>

          <div className="grid grid-cols-1 gap-3.5 max-w-lg">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Observasi & Penilaian Autentik (LPPA)</h3>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Pencatatan anekdot harian, portofolio karya, dan laporan capaian berbasis Kurikulum Merdeka.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Keamanan & Tata Kelola Yayasan</h3>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Sistem akses aman yang memastikan data institusi Anda terlindungi dengan standar yayasan.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 shrink-0">
                <HeartHandshake className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Sinergi Guru & Orang Tua Terhubung</h3>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Portal komunikasi transparan untuk rekap harian, absensi, dan tahapan PPDB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Credit */}
        <div className="relative z-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Yayasan Pendidikan Kristen - Yapendik GPIB</span>
        </div>
      </div>

      {/* SISI KANAN: FORM & IDENTITY PORTAL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative">
        <div className="w-full max-w-md mx-auto bg-white border border-slate-200 shadow-floating rounded-2xl p-6 sm:p-8">
          {/* Mobile Branding Header (Only visible on mobile/small screens) */}
          <div className="lg:hidden flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Yapendik School OS</h1>
              <p className="text-[11px] text-slate-500 font-mono">TK PILOT v1.0 • PORTAL GURU & YAYASAN</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1">
              Portal Akses Institusi
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Silakan autentikasi identitas Anda untuk memasuki ruang kerja Yapendik OS.
            </p>
          </div>

          {/* Mode Switcher Tabs (Only shown if VITE_ENABLE_SIMULATION is enabled) */}
          {isSimulationEnabled && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6 text-xs">
              <button
                type="button"
                onClick={() => setAuthTab('SIMULATION')}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'SIMULATION' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Simulasi Persona (6+ Role)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('REAL_AUTH')}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'REAL_AUTH' 
                    ? 'bg-slate-900 text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Pengguna</span>
              </button>
            </div>
          )}

          {/* Special Canonical Identity Warning Notice (C-13) */}
          {authState === 'AUTHENTICATED_NO_PERSON' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-xs">
              <div className="flex items-center space-x-2 text-amber-900 font-bold mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Notice Identitas Kanonikal (C-13)</span>
              </div>
              <p className="text-amber-800 leading-relaxed mb-2 font-medium">
                Akun Anda terautentikasi, namun profil Anda belum terdaftar aktif di sistem sekolah. Silakan hubungi Tata Usaha untuk aktivasi.
              </p>
              {isSimulationEnabled && (
                <p className="text-amber-700 text-[11px]">
                  Gunakan tab simulasi persona di atas untuk pengujian fungsional modul TK Pilot.
                </p>
              )}
            </div>
          )}

          {authState === 'MAPPED_INACTIVE' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-left text-xs text-rose-800">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Akun Tidak Aktif</span>
              </div>
              <p className="text-rose-700 font-medium">
                Profil person Anda tercatat non-aktif pada unit institusi. Hubungi Administrator Yayasan.
              </p>
            </div>
          )}

          {authState === 'NO_INSTITUTIONAL_RELATIONSHIP' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-xs text-amber-800">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tidak Ada Relasi Institusional</span>
              </div>
              <p className="text-amber-700 font-medium">
                Tidak ditemukan penetapan peran aktif pada unit TK mana pun.
              </p>
            </div>
          )}

          {/* REAL AUTHENTICATION FORM */}
          {authTab === 'REAL_AUTH' ? (
            <form onSubmit={handleRealLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Institusi Yapendik
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@yapendik.sch.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{loginError}</div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoggingIn}
                rightIcon={!isLoggingIn ? <ArrowRight className="w-4 h-4" /> : undefined}
                className="w-full shadow-xs mt-2"
              >
                {isLoggingIn ? 'Memvalidasi Identitas...' : 'Masuk ke Ruang Kerja'}
              </Button>
            </form>
          ) : (
            /* SIMULATION PERSONA SELECTOR */
            <div className="space-y-2 text-left mb-2">
              <div className="text-[11px] text-slate-500 mb-2 font-medium">
                Pilih persona uji untuk mengeksplorasi modul sesuai kewenangan peran:
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
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
          <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500 ${isSimulationEnabled ? 'justify-between' : 'justify-end'}`}>
            {isSimulationEnabled && (
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Konfigurasi Supabase</span>
              </button>
            )}
            <span className="font-mono text-[11px] text-slate-400">V2.1.5</span>
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

