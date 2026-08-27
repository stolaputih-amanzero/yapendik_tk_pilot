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

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('TEACHER_HOME');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const { authState, currentPersona, securityContext, activeSchoolId, setActiveSchoolId } = useSecurityContext();

  const activeSchool = securityContext ? db.getSchoolById(securityContext.activeSchoolId) : null;
  const schools = db.getSchools();

  if (authState === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mb-4"></div>
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
    <div className="flex flex-row min-h-screen bg-white lg:bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* Left Sidebar Navigation (Desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto bg-white lg:bg-transparent relative">
        {/* Global Top Bar (Header) */}
        <TopBar
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onSelectTab={setActiveTab}
        />

        {/* Institutional Context Ribbon (Hidden on Mobile) */}
        <div className="hidden lg:block bg-slate-900 text-slate-200 border-b border-slate-800 px-4 lg:px-6 py-2.5">
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
        <main className="grow shrink-0 w-full max-w-7xl mx-auto p-0 lg:p-6 pb-[180px] lg:pb-8 bg-white lg:bg-transparent">
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

          {/* Scroll Clearance Cushion for Mobile Omni-Bar & FAB */}
          <div className="h-[120px] lg:hidden shrink-0 pointer-events-none" aria-hidden="true" />
        </main>

        {/* Institutional Footer (Hidden on Mobile) */}
        <footer className="hidden lg:flex bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
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
