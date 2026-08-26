/**
 * Yapendik School OS — TK Pilot
 * Main Application Shell & Contextual Orchestrator
 */

import React, { useState } from 'react';
import { SecurityContextProvider, useSecurityContext } from './auth/context';
import { TopBar, WorkspaceTab } from './components/layout/TopBar';
import { TeacherDailyWorkWorkspace } from './components/workspaces/TeacherDailyWorkWorkspace';
import { ObservationWorkspace } from './components/workspaces/ObservationWorkspace';
import { DevelopmentWorkspace } from './components/workspaces/DevelopmentWorkspace';
import { AttendanceWorkspace } from './components/workspaces/AttendanceWorkspace';
import { CommunicationWorkspace } from './components/workspaces/CommunicationWorkspace';
import { EnrollmentWorkspace } from './components/workspaces/EnrollmentWorkspace';
import { SchoolReviewWorkspace } from './components/workspaces/SchoolReviewWorkspace';
import { AuthorizationTestingWorkspace } from './components/workspaces/AuthorizationTestingWorkspace';
import { ProvisioningWorkspace } from './components/workspaces/ProvisioningWorkspace';
import { AcademicLifecycleWorkspace } from './components/workspaces/AcademicLifecycleWorkspace';
import { CohortPromotionWorkspace } from './components/workspaces/CohortPromotionWorkspace';
import { GraduationRegistryWorkspace } from './components/workspaces/GraduationRegistryWorkspace';
import { InstitutionalHealthDashboard } from './components/workspaces/InstitutionalHealthDashboard';
import { StudentJourneyTimeline } from './components/workspaces/StudentJourneyTimeline';
import { TeacherHomeShell } from './components/workspaces/teacher/TeacherHomeShell';
import { FoundationLayout } from './workspaces/foundation/FoundationLayout';
import { HeadmasterAdoptionLayout } from './workspaces/school/HeadmasterAdoptionLayout';
import { ApplicationDashboard } from './workspaces/admissions/portal/ApplicationDashboard';
import { HeadmasterAdmissionsDesk } from './workspaces/admissions/school/HeadmasterAdmissionsDesk';
import { SupabaseSettingsModal } from './components/workspaces/SupabaseSettingsModal';
import { db } from './db/database';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  HeartHandshake, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('TEACHER_HOME');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'SIMULATION' | 'REAL_AUTH'>('SIMULATION');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { authState, currentPersona, securityContext, activeSchoolId, setActiveSchoolId, switchPersona, signInWithEmail } = useSecurityContext();

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await signInWithEmail(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Autentikasi gagal.');
    }
  };

  const activeSchool = securityContext ? db.getSchoolById(securityContext.activeSchoolId) : null;
  const schools = db.getSchools();

  if (authState === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mb-4"></div>
        <div className="font-semibold text-sm">Memuat Konteks Identitas Yapendik OS...</div>
      </div>
    );
  }

  if (authState === 'UNAUTHENTICATED' || authState === 'AUTHENTICATED_NO_PERSON' || authState === 'MAPPED_INACTIVE' || authState === 'NO_INSTITUTIONAL_RELATIONSHIP') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Building2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Yapendik School OS</h1>
          <p className="text-xs font-mono text-amber-400/90 mb-5">TK PILOT v1.0 • CONTEXTUAL AUTHENTICATION</p>

          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5 text-xs">
            <button
              onClick={() => setAuthTab('SIMULATION')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                authTab === 'SIMULATION' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulasi Persona Pilot (6 Role)
            </button>
            <button
              onClick={() => setAuthTab('REAL_AUTH')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                authTab === 'REAL_AUTH' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk Akun Supabase (Resmi)
            </button>
          </div>

          {authState === 'AUTHENTICATED_NO_PERSON' && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 mb-5 text-left text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Notice Identitas Kanonikal (C-13)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Akun Supabase terautentikasi namun belum dipetakan ke baris <code className="text-amber-300">persons</code>. Gunakan tab simulasi untuk pengujian fungsional modul TK:
              </p>
            </div>
          )}

          {authTab === 'REAL_AUTH' ? (
            <form onSubmit={handleRealLogin} className="space-y-3.5 text-left mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Institusi Yapendik</label>
                <input
                  type="email"
                  placeholder="siti@yapendik.sch.id"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              {loginError && (
                <div className="p-2.5 bg-red-950/50 border border-red-500/30 rounded text-red-300 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
              >
                {isLoggingIn ? 'Memvalidasi Identitas...' : 'Masuk Melalui Supabase Auth'}
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 text-left mb-6">
              <button
                type="button"
                onClick={() => switchPersona('user_teacher_siti')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Siti Rahmawati, S.Pd</div>
                  <div className="text-[11px] text-slate-400">Wali Kelas TK A (Kelompok Bintang Ceria)</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">TEACHER</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_teacher_maria')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Maria Magdalena, S.Pd.Aud</div>
                  <div className="text-[11px] text-slate-400">Wali Kelas TK B (Kelompok Matahari)</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">TEACHER</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_headmaster_esther')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Dra. Esther Nugroho, M.Pd</div>
                  <div className="text-[11px] text-slate-400">Kepala Sekolah TK Yapendik 01 Menteng</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400">HEADMASTER</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_parent_budi')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Budi Santoso, S.T.</div>
                  <div className="text-[11px] text-slate-400">Orang Tua / Wali (Ayah Kenzo & Nathanael)</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-blue-400">GUARDIAN</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_parent_bona')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Bona Pandjaitan, S.T.</div>
                  <div className="text-[11px] text-slate-400">Orang Tua Pendaftar PPDB (Ayah Timothy)</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">APPLICANT</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_teacher_diana_tk2')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-red-300 transition-colors">Diana Sari, S.Pd (TK 02)</div>
                  <div className="text-[11px] text-slate-400">Guru TK 02 Kebayoran (Negative Test)</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-red-400">CROSS_SCHOOL</span>
              </button>

              <button
                type="button"
                onClick={() => switchPersona('user_superadmin_yapendik')}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">Dr. Andreas Hendrawan</div>
                  <div className="text-[11px] text-slate-400">Pengawas Mutu Pendidikan Yayasan Yapendik</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-400">SUPERADMIN</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-amber-400 transition-colors underline"
            >
              Konfigurasi Supabase
            </button>
            <span className="font-mono text-[11px]">V2.1.5 Definitive Hardened</span>
          </div>
        </div>

        <SupabaseSettingsModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* 3-Zone Institutional Top Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Institutional Context Ribbon */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 lg:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Active School Selector & Level */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 font-semibold text-white">
              <Building2 className="w-4 h-4 text-amber-400" />
              {currentPersona.role === 'YAPENDIK_SUPERADMIN' ? (
                <select
                  value={activeSchoolId}
                  onChange={(e) => setActiveSchoolId(e.target.value)}
                  className="bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/40 rounded px-2 py-1 focus:ring-1 focus:ring-amber-400 focus:outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white font-normal">
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{activeSchool?.name || 'Unit TK Yapendik'}</span>
              )}
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              NPSN: {activeSchool?.npsn || '20104821'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">
              T.A. 2026/2027 (Ganjil)
            </span>
          </div>

          {/* Persona Context Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Persona Aktif:</span>
            <span className="font-bold text-amber-300">{currentPersona.name}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
              {currentPersona.role}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'TEACHER_HOME' && <TeacherHomeShell />}
        {activeTab === 'DAILY_WORK' && <TeacherDailyWorkWorkspace />}
        {activeTab === 'OBSERVATIONS' && <ObservationWorkspace />}
        {activeTab === 'DEVELOPMENT' && <DevelopmentWorkspace />}
        {activeTab === 'STUDENT_JOURNEY' && <StudentJourneyTimeline />}
        {activeTab === 'ATTENDANCE' && <AttendanceWorkspace />}
        {activeTab === 'COMMUNICATION' && <CommunicationWorkspace />}
        {activeTab === 'ROSTER' && <EnrollmentWorkspace />}
        {activeTab === 'GOVERNANCE' && <SchoolReviewWorkspace />}
        {activeTab === 'INSTITUTIONAL_HEALTH' && <InstitutionalHealthDashboard />}
        {activeTab === 'ACADEMIC_LIFECYCLE' && <AcademicLifecycleWorkspace />}
        {activeTab === 'COHORT_PROMOTION' && <CohortPromotionWorkspace />}
        {activeTab === 'GRADUATION_REGISTRY' && <GraduationRegistryWorkspace />}
        {activeTab === 'FOUNDATION_GOVERNANCE' && <FoundationLayout />}
        {activeTab === 'HEADMASTER_ADOPTION' && <HeadmasterAdoptionLayout />}
        {activeTab === 'ADMISSIONS_PORTAL' && (
          <ApplicationDashboard 
            creatorUid={currentPersona.id || 'user_parent_budi'} 
            personId={currentPersona.personId || 'per_parent_budi'}
            guardianName={currentPersona.name}
          />
        )}
        {activeTab === 'ADMISSIONS_DESK' && (
          <HeadmasterAdmissionsDesk
            schoolId={activeSchoolId || 'sch_tk_yapendik_01'}
            headmasterContext={{
              personId: currentPersona.id,
              role: currentPersona.role,
              activeSchoolId: activeSchoolId || 'sch_tk_yapendik_01'
            }}
          />
        )}
        {activeTab === 'PROVISIONING' && <ProvisioningWorkspace onNavigateToOperations={() => setActiveTab('DAILY_WORK')} />}
        {activeTab === 'TESTS' && <AuthorizationTestingWorkspace />}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">Yapendik School OS</span>
            <span>—</span>
            <span>Prinsip Konstitusi: Make It Simple • Keep It Future-Proof • Child-Centered</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Sprint 0 Foundation • Modul Monolitik TK Pilot
          </div>
        </div>
      </footer>

      {/* Supabase Integration Configuration Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SecurityContextProvider>
      <AppContent />
    </SecurityContextProvider>
  );
}
