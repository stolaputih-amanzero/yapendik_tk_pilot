/**
 * Yapendik School OS — TK Pilot
 * Main Application Shell & Contextual Orchestrator (Sidebar + TopBar + Mobile Omni-Bar Architecture)
 */

import React, { useState } from 'react';
import { SecurityContextProvider, useSecurityContext } from './auth/context';
import { PremiumLoginScreen } from './components/auth/PremiumLoginScreen';
import { TopBar, WorkspaceTab } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileOmniBar } from './components/layout/MobileOmniBar';
import { TeacherDailyWorkWorkspace } from './components/workspaces/TeacherDailyWorkWorkspace';
import { ObservationWorkspace } from './components/workspaces/ObservationWorkspace';
import { DevelopmentWorkspace } from './components/workspaces/DevelopmentWorkspace';
import { AttendanceWorkspace } from './components/workspaces/AttendanceWorkspace';
import { CommunicationWorkspace } from './components/workspaces/CommunicationWorkspace';
import { EnrollmentWorkspace } from './components/workspaces/EnrollmentWorkspace';
import { SchoolReviewWorkspace } from './components/workspaces/SchoolReviewWorkspace';
import { AuthorizationTestingWorkspace } from './components/workspaces/AuthorizationTestingWorkspace';
import { LivingContractWorkspace } from './components/workspaces/LivingContractWorkspace';
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
import { Building2 } from 'lucide-react';
import { SelectSheet } from './components/ui';

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
  HEADMASTER_ADOPTION: 'adopsi-ks',
  FOUNDATION_GOVERNANCE: 'yayasan',
  ADMISSIONS_PORTAL: 'portal-ppdb',
  ADMISSIONS_DESK: 'meja-ppdb',
  ACADEMIC_LIFECYCLE: 'siklus-akademik',
  COHORT_PROMOTION: 'kenaikan-kelas',
  GRADUATION_REGISTRY: 'kelulusan',
  PROVISIONING: 'manajemen-pengguna',
  TESTS: 'uji-otorisasi',
  PERCONTOHAN: 'percontohan'
};

const HASH_TO_TAB: Record<string, WorkspaceTab> = Object.entries(TAB_TO_HASH).reduce(
  (acc, [tab, hash]) => {
    acc[hash] = tab as WorkspaceTab;
    acc[tab.toLowerCase().replace(/_/g, '-')] = tab as WorkspaceTab;
    return acc;
  },
  {} as Record<string, WorkspaceTab>
);

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yapendik_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
      // On tablet screen size (768px - 1023px), collapse sidebar by default to maximize work canvas
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  const { authState, currentPersona, securityContext, activeSchoolId, setActiveSchoolId } = useSecurityContext();

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

  React.useEffect(() => {
    if (currentPersona?.role === 'GUARDIAN' || currentPersona?.role === 'APPLICANT_GUARDIAN' || currentPersona?.role === 'PARENT_BUDI') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'INSTITUTIONAL_HEALTH') {
        setActiveTab('COMMUNICATION');
      }
    }
  }, [currentPersona?.role]);

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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-canvas text-ink">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
        <div className="font-semibold text-sm">Memuat Konteks Identitas Yapendik OS...</div>
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
    return <PremiumLoginScreen />;
  }

  return (
    <div className="flex flex-row min-h-[100dvh] bg-canvas text-ink font-sans antialiased transition-colors duration-300">
      {/* Left Sidebar Navigation (Tablet / Desktop Collapsible) */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 max-h-[100dvh] overflow-y-scroll bg-canvas expanded:bg-transparent relative scrollbar-stable">
        {/* Global Top Bar (Header) */}
        <TopBar
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onSelectTab={setActiveTab}
        />

        {/* Institutional Context Ribbon (Hidden on Mobile) */}
        <div className="hidden expanded:block bg-brand text-on-brand border-b border-line-strong px-4 medium:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-col medium:flex-row medium:items-center justify-between gap-2 text-xs">
            {/* Active School Selector & Level */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 font-semibold text-on-brand">
                <Building2 className="w-4 h-4 text-brass" />
                {currentPersona.role === 'YAPENDIK_SUPERADMIN' ? (
                  <div className="w-56">
                    <SelectSheet
                      value={activeSchoolId}
                      onChange={setActiveSchoolId}
                      options={schools.map(s => ({ value: s.id, label: s.name }))}
                      className="bg-surface-inset text-brass font-bold text-xs border border-brass/40"
                    />
                  </div>
                ) : (
                  <span>{activeSchool?.name || 'Unit TK Yapendik'}</span>
                )}
              </div>
              <span className="text-line-strong">•</span>
              <span className="text-on-brand/70 font-mono text-[11px] whitespace-nowrap">
                NPSN: {activeSchool?.npsn || '20104821'}
              </span>
              <span className="text-line-strong">•</span>
              <span className="text-on-brand/90 font-medium">
                T.A. 2026/2027 (Ganjil)
              </span>
            </div>

            {/* Persona Context Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-on-brand/70">Persona Aktif:</span>
              <span className="font-bold text-brass">{currentPersona.name}</span>
              <span className="px-2 py-1 rounded bg-surface-inset text-on-brand/90 border border-line-strong text-[10px] font-mono whitespace-nowrap">
                {currentPersona.role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Surface */}
        <main className="grow shrink-0 w-full max-w-7xl mx-auto p-0 medium:p-6 pb-[180px] medium:pb-8 bg-canvas expanded:bg-transparent">
          {activeTab === 'TEACHER_HOME' && <TeacherHomeShell onNavigateToCommunication={() => setActiveTab('COMMUNICATION')} />}
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
          {activeTab === 'PERCONTOHAN' && <LivingContractWorkspace />}

          {/* Scroll Clearance Cushion for Mobile Omni-Bar & FAB */}
          <div className="h-[120px] expanded:hidden shrink-0 pointer-events-none" aria-hidden="true" />
        </main>

        {/* Institutional Footer (Hidden on Mobile) */}
        <footer className="hidden expanded:flex bg-surface border-t border-line py-4 px-6 text-xs text-ink-soft mt-auto shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col medium:flex-row items-center justify-between gap-2 w-full">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-ink">Yapendik School OS</span>
              <span>—</span>
              <span>Prinsip Konstitusi: Make It Simple • Keep It Future-Proof • Child-Centered</span>
            </div>
            <div className="font-mono text-[11px] text-ink-faint whitespace-nowrap">
              Yapendik GPIB
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Zero-Navigation Omni-Bar & App Library Drawer */}
      <MobileOmniBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

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
