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
import { ProfileDrawer } from './components/layout/ProfileDrawer';
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
import { GuardianWorkspace } from './workspaces/guardian/GuardianWorkspace';
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
  GUARDIAN_WORKSPACE: 'portal-keluarga',
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
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
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
    if (currentPersona?.role === 'APPLICANT' || currentPersona?.id === 'user_parent_bona') {
      setActiveTab('ADMISSIONS_PORTAL');
    } else if (currentPersona?.id === 'user_parent_budi') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'INSTITUTIONAL_HEALTH' || activeTab === 'HEADMASTER_ADOPTION' || activeTab === 'FOUNDATION_GOVERNANCE') {
        setActiveTab('GUARDIAN_WORKSPACE');
      }
    } else if (currentPersona?.role === 'HEADMASTER') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'GUARDIAN_WORKSPACE') {
        setActiveTab('HEADMASTER_ADOPTION');
      }
    } else if (currentPersona?.role === 'YAPENDIK_SUPERADMIN') {
      if (activeTab === 'TEACHER_HOME' || activeTab === 'DAILY_WORK' || activeTab === 'ATTENDANCE' || activeTab === 'GUARDIAN_WORKSPACE') {
        setActiveTab('FOUNDATION_GOVERNANCE');
      }
    } else if (currentPersona?.role === 'TEACHER') {
      if (activeTab === 'HEADMASTER_ADOPTION' || activeTab === 'FOUNDATION_GOVERNANCE' || activeTab === 'GUARDIAN_WORKSPACE' || activeTab === 'ADMISSIONS_PORTAL') {
        setActiveTab('TEACHER_HOME');
      }
    }
  }, [currentPersona?.id, currentPersona?.role]);

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
        <div className="font-semibold text-sm">Memuat Konteks Identitas Amanaura OS...</div>
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
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 max-h-[100dvh] overflow-y-scroll bg-canvas expanded:bg-transparent relative scrollbar-stable">
        {/* Global Context Bar (TopBar Header) - 100% Pure Clean Context */}
        <TopBar
          activeTab={activeTab}
        />

        {/* Institutional Context Ribbon (Hidden on Mobile) */}
        <div className="hidden expanded:block bg-surface-subtle/60 backdrop-blur-md text-ink border-b border-line-hairline px-4 medium:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-col medium:flex-row medium:items-center justify-between gap-3 text-xs">
            {/* Active School Selector & Level */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 font-semibold text-ink">
                <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
                {currentPersona.role === 'YAPENDIK_SUPERADMIN' ? (
                  <div className="w-60">
                    <SelectSheet
                      value={activeSchoolId}
                      onChange={setActiveSchoolId}
                      options={schools.map(s => ({ value: s.id, label: s.name }))}
                    />
                  </div>
                ) : (
                  <span className="font-bold text-ink">{activeSchool?.name || 'Unit TK Yapendik'}</span>
                )}
              </div>
              <span className="text-line-soft">•</span>
              <span className="text-ink-soft font-mono text-[11px] whitespace-nowrap">
                NPSN: {activeSchool?.npsn || '20104821'}
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
          {activeTab === 'GUARDIAN_WORKSPACE' && <GuardianWorkspace />}
          {activeTab === 'ADMISSIONS_PORTAL' && (
            <ApplicationDashboard 
              creatorUid={currentPersona.id || 'user_parent_bona'} 
              personId={currentPersona.personId || 'per_parent_bona'}
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
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full">
            <span className="font-semibold text-ink">Amanaura OS</span>
            <span>—</span>
            <span>Make It Simple • Keep It Future-Proof • Child-Centered</span>
          </div>
        </footer>
      </div>

      {/* Mobile Zero-Navigation Omni-Bar & App Library Drawer */}
      <MobileOmniBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Supabase Integration Configuration Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Mobile Profile & Context Drawer (ADR-UX-011 §4.2) */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onSelectTab={setActiveTab}
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
