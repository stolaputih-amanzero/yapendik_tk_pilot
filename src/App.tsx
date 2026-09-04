/**
 * Yapendik School OS — TK Pilot
 * Main Application Shell & Contextual Orchestrator (Sidebar + TopBar + Mobile Omni-Bar Architecture)
 */

import React, { useState, Suspense, lazy } from 'react';
import { SecurityContextProvider, useSecurityContext } from './auth/context';
import { AmanauraSplashScreen } from './components/common/AmanauraSplashScreen';
import { PremiumLoginScreen } from './components/auth/PremiumLoginScreen';
import { TopBar, WorkspaceTab } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileOmniBar } from './components/layout/MobileOmniBar';
import { ProfileDrawer } from './components/layout/ProfileDrawer';
import { WorkspaceSkeleton } from './components/common/WorkspaceSkeleton';
import { db } from './db/database';
import { Building2, User } from 'lucide-react';
import { SelectSheet } from './components/ui';

// Lazy-loaded persona workspace chunks (ARB Guardrail 2)
// --- Teacher Persona (ws-teacher) ---
const TeacherHomeShell = lazy(() => import('./components/workspaces/teacher/TeacherHomeShell').then(m => ({ default: m.TeacherHomeShell })));
const TeacherDailyWorkWorkspace = lazy(() => import('./components/workspaces/TeacherDailyWorkWorkspace').then(m => ({ default: m.TeacherDailyWorkWorkspace })));
const AttendanceWorkspace = lazy(() => import('./components/workspaces/AttendanceWorkspace').then(m => ({ default: m.AttendanceWorkspace })));
const ObservationWorkspace = lazy(() => import('./components/workspaces/ObservationWorkspace').then(m => ({ default: m.ObservationWorkspace })));
const DevelopmentWorkspace = lazy(() => import('./components/workspaces/DevelopmentWorkspace').then(m => ({ default: m.DevelopmentWorkspace })));
const CommunicationWorkspace = lazy(() => import('./components/workspaces/CommunicationWorkspace').then(m => ({ default: m.CommunicationWorkspace })));
const StudentJourneyTimeline = lazy(() => import('./components/workspaces/StudentJourneyTimeline').then(m => ({ default: m.StudentJourneyTimeline })));

// --- Foundation Persona (ws-foundation) ---
const FoundationLayout = lazy(() => import('./workspaces/foundation/FoundationLayout').then(m => ({ default: m.FoundationLayout })));
const FoundationAdmissionsTelemetryView = lazy(() => import('./workspaces/admissions/foundation/FoundationAdmissionsTelemetryView').then(m => ({ default: m.FoundationAdmissionsTelemetryView })));
const SchoolReviewWorkspace = lazy(() => import('./components/workspaces/SchoolReviewWorkspace').then(m => ({ default: m.SchoolReviewWorkspace })));
const InstitutionalHealthDashboard = lazy(() => import('./components/workspaces/InstitutionalHealthDashboard').then(m => ({ default: m.InstitutionalHealthDashboard })));

// --- Headmaster Persona (ws-headmaster) ---
const HeadmasterAdoptionLayout = lazy(() => import('./workspaces/school/HeadmasterAdoptionLayout').then(m => ({ default: m.HeadmasterAdoptionLayout })));
const HeadmasterAdmissionsDesk = lazy(() => import('./workspaces/admissions/school/HeadmasterAdmissionsDesk').then(m => ({ default: m.HeadmasterAdmissionsDesk })));
const AcademicLifecycleWorkspace = lazy(() => import('./components/workspaces/AcademicLifecycleWorkspace').then(m => ({ default: m.AcademicLifecycleWorkspace })));
const CohortPromotionWorkspace = lazy(() => import('./components/workspaces/CohortPromotionWorkspace').then(m => ({ default: m.CohortPromotionWorkspace })));
const GraduationRegistryWorkspace = lazy(() => import('./components/workspaces/GraduationRegistryWorkspace').then(m => ({ default: m.GraduationRegistryWorkspace })));

// --- Guardian Persona (ws-guardian) ---
const GuardianWorkspace = lazy(() => import('./workspaces/guardian/GuardianWorkspace').then(m => ({ default: m.GuardianWorkspace })));
const ApplicationDashboard = lazy(() => import('./workspaces/admissions/portal/ApplicationDashboard').then(m => ({ default: m.ApplicationDashboard })));
const GuardianDevelopmentTimeline = lazy(() => import('./workspaces/guardian/GuardianDevelopmentTimeline').then(m => ({ default: m.GuardianDevelopmentTimeline })));

// --- Operations & Administration (ws-operations) ---
const DataRosterWorkspace = lazy(() => import('./pages/roster/DataRosterWorkspace'));
const ProvisioningWorkspace = lazy(() => import('./components/workspaces/ProvisioningWorkspace').then(m => ({ default: m.ProvisioningWorkspace })));
const LivingContractWorkspace = lazy(() => import('./components/workspaces/LivingContractWorkspace').then(m => ({ default: m.LivingContractWorkspace })));
const AuthorizationTestingWorkspace = lazy(() => import('./components/workspaces/AuthorizationTestingWorkspace').then(m => ({ default: m.AuthorizationTestingWorkspace })));
const SupabaseSettingsModal = lazy(() => import('./components/workspaces/SupabaseSettingsModal').then(m => ({ default: m.SupabaseSettingsModal })));

const TAB_TO_HASH: Record<WorkspaceTab, string> = {
  TEACHER_HOME: 'beranda-guru',
  DAILY_WORK: 'kerja-harian',
  ATTENDANCE: 'presensi',
  OBSERVATIONS: 'observasi',
  DEVELOPMENT: 'perkembangan',
  STUDENT_JOURNEY: 'jejak-anak',
  COMMUNICATION: 'buku-penghubung',
  ROSTER: 'data-roster',
  GOVERNANCE: 'evaluasi-sekolah',
  INSTITUTIONAL_HEALTH: 'kesehatan-sekolah',
  HEADMASTER_ADOPTION: 'beranda-sekolah',
  FOUNDATION_GOVERNANCE: 'yayasan',
  ADMISSIONS_PORTAL: 'portal-ppdb',
  ADMISSIONS_DESK: 'meja-ppdb',
  GUARDIAN_WORKSPACE: 'portal-keluarga',
  ACADEMIC_LIFECYCLE: 'siklus-akademik',
  COHORT_PROMOTION: 'kenaikan-kelas',
  GRADUATION_REGISTRY: 'kelulusan',
  PROVISIONING: 'manajemen-pengguna',
  TESTS: 'uji-otorisasi',
  PERCONTOHAN: 'percontohan'
};

const HASH_TO_TAB: Record<string, WorkspaceTab> = {
  ...Object.entries(TAB_TO_HASH).reduce(
    (acc, [tab, hash]) => {
      acc[hash] = tab as WorkspaceTab;
      acc[tab.toLowerCase().replace(/_/g, '-')] = tab as WorkspaceTab;
      return acc;
    },
    {} as Record<string, WorkspaceTab>
  ),
  'adopsi-ks': 'HEADMASTER_ADOPTION'
};

const getInitialTab = (): WorkspaceTab => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (HASH_TO_TAB[raw]) {
      return HASH_TO_TAB[raw];
    }
  }
  return 'TEACHER_HOME';
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(getInitialTab);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yapendik_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
      // MEDIUM screen (600px - 839px) defaults to rail icon (72px); EXPANDED (>= 840px) defaults to full sidebar (w-64)
      return window.innerWidth >= 600 && window.innerWidth < 840;
    }
    return false;
  });

  const { authState, currentPersona, securityContext, activeSchoolId, setActiveSchoolId } = useSecurityContext();

  const [showSplash, setShowSplash] = useState<boolean>(true);

  React.useEffect(() => {
    if (authState !== 'LOADING') {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [authState]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('yapendik_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const activeSchool = securityContext ? db.getSchoolById(securityContext.activeSchoolId) : null;
  const schools = db.getSchools();

  const isGuardianPersona = currentPersona?.role === 'GUARDIAN' || currentPersona?.role === 'PARENT_BUDI';
  const guardianChildStudent = React.useMemo(() => {
    if (!isGuardianPersona) return null;
    const childPersonIds = currentPersona?.guardianChildrenPersonIds || securityContext?.guardianChildrenPersonIds || [];
    if (childPersonIds.length === 0) return null;
    const schoolStudents = db.getStudents(activeSchoolId || 'sch_tk_maranatha');
    return schoolStudents.find(s => childPersonIds.includes(s.personId)) || null;
  }, [isGuardianPersona, currentPersona?.guardianChildrenPersonIds, securityContext?.guardianChildrenPersonIds, activeSchoolId]);

  React.useEffect(() => {
    if (currentPersona?.role === 'APPLICANT') {
      if (activeTab !== 'ADMISSIONS_PORTAL') {
        setActiveTab('ADMISSIONS_PORTAL');
      }
    } else if (currentPersona?.role === 'GUARDIAN') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'INSTITUTIONAL_HEALTH' || activeTab === 'HEADMASTER_ADOPTION' || activeTab === 'FOUNDATION_GOVERNANCE') {
        setActiveTab('GUARDIAN_WORKSPACE');
      }
    } else if (currentPersona?.role === 'HEADMASTER') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'GUARDIAN_WORKSPACE') {
        setActiveTab('HEADMASTER_ADOPTION');
      }
    } else if (currentPersona?.role === 'YAPENDIK_SUPERADMIN' || currentPersona?.role === 'FOUNDATION_DIRECTOR') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'OBSERVATIONS' || activeTab === 'COMMUNICATION' || activeTab === 'GUARDIAN_WORKSPACE' || activeTab === 'HEADMASTER_ADOPTION') {
        setActiveTab('FOUNDATION_GOVERNANCE');
      }
    } else if (currentPersona?.role === 'TEACHER' || currentPersona?.role === 'ASSISTANT_TEACHER') {
      if (activeTab === 'HEADMASTER_ADOPTION' || activeTab === 'FOUNDATION_GOVERNANCE' || activeTab === 'GUARDIAN_WORKSPACE' || activeTab === 'ADMISSIONS_PORTAL' || activeTab === 'ADMISSIONS_DESK' || activeTab === 'PROVISIONING') {
        setActiveTab('TEACHER_HOME');
      }
    }
  }, [currentPersona?.role, currentPersona?.id, activeTab]);

  // 1. Listen for browser Back/Forward (hashchange)
  React.useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
        if (raw && HASH_TO_TAB[raw]) {
          setActiveTab(HASH_TO_TAB[raw]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Sync tab changes to URL hash (without triggering full reloads)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetHash = TAB_TO_HASH[activeTab] || activeTab.toLowerCase().replace(/_/g, '-');
      const currentRawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (currentRawHash !== targetHash) {
        window.history.replaceState(null, '', `#${targetHash}`);
      }
    }
  }, [activeTab]);

  if (authState === 'LOADING') {
    return (
      <div aria-label="Memuat Konteks Identitas Amanaura OS...">
        <AmanauraSplashScreen fading={false} />
      </div>
    );
  }

  if (
    authState === 'UNAUTHENTICATED' || 
    authState === 'AUTHENTICATED_NO_PERSON' || 
    authState === 'MAPPED_INACTIVE' || 
    authState === 'NO_INSTITUTIONAL_RELATIONSHIP' ||
    !currentPersona
  ) {
    return (
      <>
        {showSplash && <AmanauraSplashScreen fading={true} />}
        <PremiumLoginScreen />
      </>
    );
  }

  return (
    <>
      {showSplash && <AmanauraSplashScreen fading={true} />}
      <div className="flex flex-row min-h-[100dvh] bg-canvas text-ink font-sans antialiased transition-colors duration-300">
      {/* Left Sidebar Navigation (Tablet / Desktop Collapsible) */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 max-h-[100dvh] overflow-y-scroll bg-canvas expanded:bg-transparent relative scrollbar-stable">
        {/* Global Context Bar (TopBar Header) - 100% Pure Clean Context with Universal Back */}
        <TopBar
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
        />

        {/* Institutional Context Ribbon (Hidden on Mobile) */}
        <div className="hidden expanded:block bg-surface-subtle/60 backdrop-blur-md text-ink border-b border-line-hairline px-4 medium:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-col medium:flex-row medium:items-center justify-between gap-3 text-xs">
            {/* Active School Selector & Level */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 font-semibold text-ink">
                <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
                {currentPersona.role === 'YAPENDIK_SUPERADMIN' && schools.length > 1 ? (
                  <div className="w-60">
                    <SelectSheet
                      value={activeSchoolId}
                      onChange={setActiveSchoolId}
                      options={schools.map(s => ({ value: s.id, label: s.name }))}
                    />
                  </div>
                ) : (
                  <span className="font-bold text-ink">{activeSchool?.name || schools[0]?.name || 'TK YAPENDIK GPIB Cabang Maranatha'}</span>
                )}
              </div>
              <span className="text-line-soft">•</span>
              <span className="text-ink-soft font-mono text-[11px] whitespace-nowrap">
                NPSN: {activeSchool?.npsn || '—'}
              </span>
              <span className="text-line-soft">•</span>
              <span className="text-ink font-medium">
                T.A. 2026/2027 (Ganjil)
              </span>
            </div>

            {/* Persona Context Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-ink-soft">Persona Aktif:</span>
              <span className="font-bold text-ink">{currentPersona.name}</span>
              <span className="px-2 py-1 rounded-full bg-surface text-ink-soft border border-line-hairline text-[10px] font-mono whitespace-nowrap shadow-hairline">
                {currentPersona.role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Surface */}
        <main className="grow shrink-0 w-full max-w-7xl mx-auto px-4 py-4 medium:p-6 pb-[180px] medium:pb-8 bg-canvas expanded:bg-transparent">
          <Suspense fallback={<WorkspaceSkeleton />}>
            {activeTab === 'TEACHER_HOME' && (
              <TeacherHomeShell 
                onNavigateToCommunication={() => setActiveTab('COMMUNICATION')} 
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === 'DAILY_WORK' && <TeacherDailyWorkWorkspace />}
            {activeTab === 'OBSERVATIONS' && <ObservationWorkspace />}
            {activeTab === 'DEVELOPMENT' && (
              isGuardianPersona ? (
                guardianChildStudent ? (
                  <GuardianDevelopmentTimeline 
                    studentId={guardianChildStudent.id} 
                    schoolId={activeSchoolId || guardianChildStudent.schoolId || 'sch_tk_maranatha'} 
                  />
                ) : (
                  <div className="p-8 text-center bg-surface border border-line rounded-card shadow-hairline space-y-3" data-testid="guardian-empty-child-state">
                    <div className="w-12 h-12 rounded-full bg-surface-subtle text-ink-soft flex items-center justify-center mx-auto border border-line">
                      <User className="w-6 h-6 text-ink-soft" />
                    </div>
                    <h3 className="text-base font-bold text-ink">Belum Ada Data Ananda Terhubung</h3>
                    <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
                      Belum ada data siswa ananda yang terhubung secara resmi ke akun wali ini. Silakan hubungi administrasi sekolah untuk pengaitan data murid.
                    </p>
                  </div>
                )
              ) : (
                <DevelopmentWorkspace />
              )
            )}
            {activeTab === 'STUDENT_JOURNEY' && <StudentJourneyTimeline />}
            {activeTab === 'ATTENDANCE' && <AttendanceWorkspace />}
            {activeTab === 'COMMUNICATION' && <CommunicationWorkspace />}
            {activeTab === 'ROSTER' && <DataRosterWorkspace />}
            {activeTab === 'GOVERNANCE' && <SchoolReviewWorkspace />}
            {activeTab === 'INSTITUTIONAL_HEALTH' && <InstitutionalHealthDashboard />}
            {activeTab === 'ACADEMIC_LIFECYCLE' && <AcademicLifecycleWorkspace />}
            {activeTab === 'COHORT_PROMOTION' && <CohortPromotionWorkspace />}
            {activeTab === 'GRADUATION_REGISTRY' && <GraduationRegistryWorkspace />}
            {activeTab === 'FOUNDATION_GOVERNANCE' && <FoundationLayout onNavigateTab={setActiveTab} />}
            {activeTab === 'HEADMASTER_ADOPTION' && <HeadmasterAdoptionLayout onNavigateTab={setActiveTab} />}
            {activeTab === 'GUARDIAN_WORKSPACE' && <GuardianWorkspace />}
            {activeTab === 'ADMISSIONS_PORTAL' && (
              (currentPersona?.role === 'YAPENDIK_SUPERADMIN' || currentPersona?.role === 'FOUNDATION_DIRECTOR') ? (
                <FoundationAdmissionsTelemetryView />
              ) : currentPersona?.role === 'HEADMASTER' ? (
                <HeadmasterAdmissionsDesk
                  schoolId={activeSchoolId || 'sch_tk_yapendik_01'}
                  headmasterContext={{
                    personId: currentPersona.id,
                    role: currentPersona.role,
                    activeSchoolId: activeSchoolId || 'sch_tk_yapendik_01'
                  }}
                />
              ) : (
                <ApplicationDashboard 
                  creatorUid={currentPersona?.id || 'usr_guest_applicant'} 
                  personId={currentPersona?.personId || 'per_guest_applicant'}
                  guardianName={currentPersona?.name || 'Orang Tua Calon Siswa'}
                />
              )
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
            {activeTab === 'PERCONTOHAN' && <LivingContractWorkspace />}
          </Suspense>

          {/* Scroll Clearance Cushion for Mobile Slide-Up Chevron & FAB (Reclaimed ADR-UX-012) */}
          <div className="h-[72px] expanded:hidden shrink-0 pointer-events-none" aria-hidden="true" />
        </main>

        {/* Institutional Footer (Hidden on Mobile) */}
        <footer className="hidden expanded:flex bg-surface border-t border-line py-4 px-6 text-xs text-ink-soft mt-auto shrink-0">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full">
            <span className="font-semibold text-ink">Amanaura OS</span>
            <span>—</span>
            <span>The OS truly disappears into the day.</span>
          </div>
        </footer>
      </div>

      {/* Mobile Slide-Up Chevron & Navigation Sheet (ADR-UX-012) */}
      <MobileOmniBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Supabase Integration Configuration Modal */}
      <Suspense fallback={null}>
        {isSupabaseModalOpen && (
          <SupabaseSettingsModal
            isOpen={isSupabaseModalOpen}
            onClose={() => setIsSupabaseModalOpen(false)}
          />
        )}
      </Suspense>

      {/* Mobile Profile & Context Drawer (ADR-UX-011 §4.2) */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onSelectTab={setActiveTab}
      />
    </div>
    </>
  );
};

export default function App() {
  return (
    <SecurityContextProvider>
      <AppContent />
    </SecurityContextProvider>
  );
}
