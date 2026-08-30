/**
 * Yapendik School OS — Stage 4.1 Teacher Home Shell (CC-01)
 * Root orchestrator for Teacher Daily Operating Loop:
 * - 3 Canonical Surfaces: Hari Ini (Today), Belajar & Karya (Learning), Siswa & Rapor (Roster)
 * - 8 Pedagogical Operating States
 * - Zero-Dropdown Context Anchoring (Child first, system disappears into the day)
 * - Transparent offline sync & Stage 3 governance compliance
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../../auth/context';
import { db } from '../../../db/database';
import {
  teacherHomeQueryService,
  teacherDailyWorkService
} from '../../../services';
import {
  TeacherHomeAggregatePayload,
  OperatingState,
  ClassObservationItem,
  StudentRosterItem,
  PAUDQuickTag,
  ArrivalMood
} from '../../../types/teacherDailyTypes';
import { AttendanceStatus, DevelopmentDomain, MilestoneRating, LearningActivity } from '../../../domain/types';

import { ClassroomPulseBanner } from './ClassroomPulseBanner';
import { OperatingStateIndicator } from './OperatingStateIndicator';
import { QuickCaptureFloatingButton } from './QuickCaptureFloatingButton';
import { EvidenceCaptureSheet } from './EvidenceCaptureSheet';
import { EnrichmentTrayDrawer } from './EnrichmentTrayDrawer';
import { ChildContextPivotModal } from './ChildContextPivotModal';
import { LppaSynthesisStudioModal } from './LppaSynthesisStudioModal';
import { ChildContinuityModal } from './ChildContinuityModal';
import { SafetyIncidentModal } from './SafetyIncidentModal';
import { schoolSafetyAssuranceService } from '../../../services/schoolSafetyAssuranceService';
import { SafetyExceptionSignal, SafetyIncidentRecord } from '../../../types/schoolSafetyAssuranceTypes';

import { TodaySurface } from './TodaySurface';
import { GuardianNoticeLedger } from './GuardianNoticeLedger';
import { DailyCompletionSummary } from './DailyCompletionSummary';
import { LearningSurface } from './LearningSurface';
import { StudentRosterSurface } from './StudentRosterSurface';
import { SegmentedControl, Button, Skeleton, AdaptiveDialog } from '../../ui';
import { TeacherBriefing } from '../briefing/TeacherBriefing';
import { TeacherBriefingData } from '../../../types/briefingTypes';
import { briefingEngine } from '../../../services/BriefingEngine';

import { 
  CalendarDays, 
  Puzzle, 
  Users, 
  Sparkles, 
  Home, 
  Clock,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
  FileText
} from 'lucide-react';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const TeacherHomeShell: React.FC<{ onNavigateToCommunication?: () => void }> = ({ onNavigateToCommunication }) => {
  const { securityContext, currentPersona } = useSecurityContext();

  const [activeTab, setActiveTab] = useState<'TODAY' | 'LEARNING' | 'ROSTER'>('TODAY');
  const [operatingState, setOperatingState] = useState<OperatingState>('WELCOME');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  
  const [aggregate, setAggregate] = useState<TeacherHomeAggregatePayload | null>(null);
  const [learningActivities, setLearningActivities] = useState<LearningActivity[]>([]);
  const [briefingData, setBriefingData] = useState<TeacherBriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Safety Assurance States (Stage 4.4-C)
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [activeSafetySignals, setActiveSafetySignals] = useState<SafetyExceptionSignal[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<SafetyIncidentRecord[]>([]);

  // Mobile Dialog / Drawer States (Mobile-First Architecture)
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);

  // Modal / Drawer States
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickCaptureStudentId, setQuickCaptureStudentId] = useState<string | undefined>(undefined);
  
  const [selectedEnrichmentObs, setSelectedEnrichmentObs] = useState<ClassObservationItem | null>(null);
  const [isEnrichmentDrawerOpen, setIsEnrichmentDrawerOpen] = useState(false);

  const [pivotStudentId, setPivotStudentId] = useState<string | null>(null);
  const [lppaStudioStudentId, setLppaStudioStudentId] = useState<string | null>(null);
  const [continuityModalStudentId, setContinuityModalStudentId] = useState<string | null>(null);

  const schoolId = securityContext?.activeSchoolId || currentPersona?.schoolId || 'sch_tk_maranatha';
  const classId = currentPersona?.assignedClasses?.[0] || 'cls_maranatha_tka';
  const teacherPersonId = currentPersona?.personId || 'per_teacher_erna';

  const loadData = async () => {
    try {
      const data = await teacherHomeQueryService.getTeacherHomeAggregate(
        schoolId,
        classId,
        selectedDate,
        teacherPersonId
      );
      setAggregate(data);

      const acts = db.getLearningActivities(schoolId, classId, selectedDate);
      setLearningActivities(acts);

      // Load Safety Pulse & Incidents (Stage 4.4-C)
      const safetyPulse = await schoolSafetyAssuranceService.evaluateClassroomSafetyPulse(classId, schoolId);
      setActiveSafetySignals(safetyPulse.active_exception_signals);

      const incs = await schoolSafetyAssuranceService.getIncidents(schoolId, 'TEACHER', classId);
      setActiveIncidents(incs);

      // Load Stage 6-A Warm Briefing Data
      const bData = await briefingEngine.getBriefingDataForUser('TEACHER', schoolId, teacherPersonId);
      setBriefingData(bData as TeacherBriefingData);
    } catch (err) {
      console.error('Error loading Teacher Home aggregate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [schoolId, classId, selectedDate, teacherPersonId]);

  // Command 1: Record Batch Attendance
  const handleUpdateAttendanceBatch = async (
    updates: { studentId: string; status: AttendanceStatus; mood?: ArrivalMood; temp?: number; note?: string }[]
  ) => {
    if (!aggregate) return;

    const currentMap = new Map<string, StudentRosterItem>(aggregate.roster.map(r => [r.student_id, r]));
    updates.forEach(u => {
      const existing = currentMap.get(u.studentId);
      if (existing) {
        currentMap.set(u.studentId, {
          ...existing,
          today_status: u.status,
          today_mood: u.mood || existing.today_mood,
          today_temperature: u.temp !== undefined ? u.temp : existing.today_temperature,
          today_arrival_note: u.note !== undefined ? u.note : existing.today_arrival_note
        });
      }
    });

    const entries = Array.from(currentMap.values()).map(r => ({
      student_id: r.student_id,
      status: r.today_status || 'HADIR',
      temperature_celsius: r.today_temperature,
      arrival_mood: r.today_mood,
      notes: r.today_arrival_note
    }));

    try {
      await teacherDailyWorkService.recordDailyAttendanceBatch({
        school_id: schoolId,
        class_id: classId,
        attendance_date: selectedDate,
        recorded_by_person_id: teacherPersonId,
        recorded_by_name: currentPersona?.name || 'Ibu Guru',
        role: currentPersona?.role || 'TEACHER',
        entries
      });
      loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan presensi: ${err?.message}`);
    }
  };

  // Command 2: Fast Capture Observation
  const handleSaveQuickCapture = async (payload: {
    targetStudentIds: string[];
    quickTags: PAUDQuickTag[];
    initialNote: string;
    mediaUrl?: string;
  }) => {
    await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: payload.targetStudentIds,
      quick_tags: payload.quickTags,
      initial_note: payload.initialNote,
      media_url: payload.mediaUrl,
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: currentPersona?.name || 'Ibu Guru',
      role: currentPersona?.role || 'TEACHER'
    });
    loadData();
  };

  // Command 3: Enrich Observation Narrative
  const handleSaveEnrichment = async (payload: {
    observationId: string;
    narrative: string;
    domain: DevelopmentDomain;
    milestoneRating: MilestoneRating;
    indicators: string[];
    isLppaEvidence: boolean;
    isStaffConfidential: boolean;
    isSharedWithGuardian: boolean;
  }) => {
    await teacherDailyWorkService.enrichObservationNarrative({
      observation_id: payload.observationId,
      pedagogical_narrative: payload.narrative,
      domain: payload.domain,
      milestone_rating: payload.milestoneRating,
      indicators_observed: payload.indicators,
      is_lppa_evidence: payload.isLppaEvidence,
      is_staff_confidential: payload.isStaffConfidential,
      is_shared_with_guardian: payload.isSharedWithGuardian,
      enriched_by_person_id: teacherPersonId,
      enriched_by_name: currentPersona?.name || 'Ibu Guru',
      role: currentPersona?.role || 'TEACHER',
      school_id: schoolId
    });
    loadData();
  };

  // Command 4: Acknowledge Guardian Notice
  const handleAcknowledgeNotice = async (noticeId: string, replyText?: string) => {
    await teacherDailyWorkService.acknowledgeGuardianNotice({
      notice_id: noticeId,
      acknowledged_by_person_id: teacherPersonId,
      acknowledged_by_name: currentPersona?.name || 'Ibu Guru',
      teacher_reply_text: replyText,
      school_id: schoolId,
      role: currentPersona?.role || 'TEACHER'
    });
    loadData();
  };

  const handleSendNewNotice = (notice: { studentId?: string; type: any; title: string; content: string }) => {
    db.addNotice(
      {
        schoolId,
        classId,
        studentId: notice.studentId,
        authorPersonId: teacherPersonId,
        type: notice.type,
        title: notice.title,
        content: notice.content,
        requiresAcknowledgment: true
      },
      currentPersona?.name || 'Ibu Guru',
      teacherPersonId,
      currentPersona?.role || 'TEACHER'
    );
    loadData();
  };

  // RPPH activities
  const handleToggleActivityComplete = (activityId: string, reflection?: string) => {
    db.toggleActivityComplete(activityId, reflection);
    loadData();
  };

  const handleAddActivity = (activity: Omit<LearningActivity, 'id'>) => {
    db.addLearningActivity(
      activity,
      currentPersona?.name || 'Ibu Guru',
      teacherPersonId,
      currentPersona?.role || 'TEACHER'
    );
    loadData();
  };

  if (currentPersona?.role === 'GUARDIAN') {
    return (
      <div className="bg-surface border border-line rounded-card p-4 medium:p-4 text-center max-w-lg mx-auto mt-6 shadow-hairline">
        <div className="w-12 h-12 bg-info-tint text-info-deep border border-info-line rounded-control flex items-center justify-center mx-auto mb-4 font-bold">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base medium:text-lg font-bold text-ink">Portal Wali Murid</h3>
        <p className="text-xs text-ink-soft font-medium mt-2 leading-relaxed">
          Selamat datang, <strong>{currentPersona.name}</strong>. Ruang Guru dikhususkan untuk pendidik TK. Anda dapat memantau capaian dan komunikasi perkembangan ananda melalui tab <strong>Jejak Ananda</strong> atau <strong>Buku Penghubung</strong>.
        </p>
      </div>
    );
  }

  if (loading || !aggregate) {
    return (
      <div className="w-full space-y-6 pb-24 expanded:pb-0 text-ink font-sans p-4 medium:p-6 animate-in fade-in duration-200">
        <div className="bg-surface-subtle border border-line rounded-card p-6 space-y-4 shadow-hairline">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="p-4 bg-surface rounded-card border border-line space-y-3 shadow-hairline">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="text-center pt-2">
          <span className="text-xs font-semibold text-ink-soft">Menyiapkan Beranda Kelas...</span>
        </div>
      </div>
    );
  }

  const attendanceRate = aggregate.pulse.total_students > 0
    ? Math.round((aggregate.pulse.present_count / aggregate.pulse.total_students) * 100)
    : 0;

  const hasHealthAlerts = aggregate.pulse.health_alerts && aggregate.pulse.health_alerts.some(
    a => a.alert_type === 'FEVER' || (a.note && !['tidak ada', 'none', '-', 'tidak'].includes(a.note.replace(/^alergi:\s*/i, '').trim().toLowerCase()))
  );

  const activeIncidentsUnresolved = activeIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'AUDITED_CLOSED');
  const hasSafetyExceptions = activeSafetySignals.length > 0 || hasHealthAlerts || activeIncidentsUnresolved.length > 0;

  return (
    <div className="w-full pb-24 expanded:pb-0 text-ink font-sans">
      {/* Stage 6-A The Warm Briefing Header */}
      {briefingData && (
        <TeacherBriefing
          data={briefingData}
          onTriggerAction={(actionId) => {
            if (actionId === 'act_take_attendance') {
              setActiveTab('TODAY');
            } else if (actionId === 'act_record_moment') {
              setIsQuickCaptureOpen(true);
            }
          }}
          onClosureCompleted={loadData}
        />
      )}

      {/* Workspace Header Section (F-1 & F-6) */}
      <div className="px-4 medium:px-5 pt-2 pb-2 w-full text-ink">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-ink-soft/70 text-[11px] font-semibold uppercase tracking-widest mb-1">
              <Home className="w-3.5 h-3.5 text-ink-soft/70" />
              <span>Ruang Guru</span>
            </div>
            {(() => {
              const currentClass = db.getClasses(schoolId).find(c => c.id === classId);
              const homeroomTeacher = currentClass?.homeroomTeacherId ? db.getPersonById(currentClass.homeroomTeacherId) : undefined;
              const coTeacher = currentClass?.coTeacherId ? db.getPersonById(currentClass.coTeacherId) : undefined;
              const className = aggregate?.context?.class_name || currentClass?.name || 'Kelompok A (TK A)';
              const homeroomName = homeroomTeacher?.fullName || aggregate?.context?.teacher?.name || currentPersona?.name || 'ERNA BOYKELA R';

              return (
                <div className="space-y-0.5">
                  <h2 className="text-xl medium:text-2xl font-bold text-ink leading-tight">
                    {className}
                  </h2>
                  <p className="text-ink-soft text-xs medium:text-sm flex items-center gap-1.5 flex-wrap">
                    <span>Wali Kelas: <strong className="text-ink font-semibold">{toTitleCase(homeroomName)}</strong></span>
                    {coTeacher && (
                      <>
                        <span className="text-ink-faint">•</span>
                        <span>Pendamping: <strong className="text-ink-soft font-medium">{toTitleCase(coTeacher.fullName)}</strong></span>
                      </>
                    )}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Surface Tab Flat Navigation (Law R-8 Flat Fluid Navigation) */}
        <div className="mt-3">
          <nav 
            role="tablist" 
            aria-label="Permukaan Beranda Guru" 
            className="flex items-center gap-1 border-b border-line-soft w-full overflow-x-auto no-scrollbar"
          >
            {[
              { id: 'TODAY', label: 'Hari Ini', icon: CalendarDays },
              { id: 'LEARNING', label: 'Belajar & Karya', icon: Puzzle },
              { id: 'ROSTER', label: 'Siswa & Rapor', icon: Users }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'TODAY' | 'LEARNING' | 'ROSTER')}
                  className={`
                    flex items-center gap-2 py-3 px-3 medium:px-4 text-xs medium:text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap -mb-px
                    ${isActive 
                      ? 'text-ink border-b-2 border-brand-primary font-bold' 
                      : 'text-ink-soft hover-only:text-ink border-b-2 border-transparent hover-only:border-line'
                    }
                  `.trim()}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-primary' : 'text-ink-soft'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area (F-1 & F-2 + Anchor 4 Spatial Rhythm) */}
      <section className="px-4 medium:px-5 pt-3 space-y-6 large:grid large:grid-cols-[minmax(0,1fr)_380px] large:gap-8 large:space-y-0 items-start pb-[160px] expanded:pb-8">
        
        {/* Left Column (Primary Dashboard & Surfaces) */}
        <div className="space-y-6 min-w-0">

          {/* Active Surface Router */}
          {activeTab === 'TODAY' ? (
            <div className="space-y-6">
              {/* Desktop Full Tier 1: Real-time Classroom Pulse Banner (large:block, Hari Ini Only) */}
              <div className="hidden large:block">
                <ClassroomPulseBanner
                  context={aggregate.context}
                  pulse={aggregate.pulse}
                  onFilterExceptionStudent={studentId => setPivotStudentId(studentId)}
                  onOpenGuardianNotices={() => {
                    if (onNavigateToCommunication) {
                      onNavigateToCommunication();
                    }
                  }}
                  onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
                  activeIncidentsCount={activeIncidentsUnresolved.length}
                />
              </div>

              {/* Desktop Dynamic Operating State Rhythm Indicator (large:block, Hari Ini Only) */}
              <div className="hidden large:block">
                <OperatingStateIndicator
                  currentState={operatingState}
                  onStateChange={setOperatingState}
                />
              </div>
              <TodaySurface
                roster={aggregate.roster}
                onUpdateAttendanceBatch={handleUpdateAttendanceBatch}
                onOpenChildPivot={studentId => setPivotStudentId(studentId)}
                onQuickCaptureForChild={studentId => {
                  setQuickCaptureStudentId(studentId);
                  setIsQuickCaptureOpen(true);
                }}
                pulse={aggregate.pulse}
                hasSafetyExceptions={hasSafetyExceptions}
                onOpenPulseModal={() => setIsPulseModalOpen(true)}
              />

              {/* STEP 2: Mobile Bottom Decoupling - Replaced huge inline dump with sleek Action Trigger */}
              <div className="block large:hidden pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsReconciliationModalOpen(true)}
                  className="w-full bg-surface rounded-2xl min-h-[48px] p-4 flex items-center justify-between gap-3 text-xs border border-line-hairline shadow-hairline text-ink hover-only:bg-surface-subtle transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                    <span className="font-bold">Status Rekonsiliasi &amp; Buku Penghubung</span>
                  </div>
                  {aggregate.daily_completion.is_all_clear ? (
                    <span className="px-3 py-1 rounded-full bg-success-tint text-success-deep font-bold text-[10px] font-mono whitespace-nowrap">
                      ALL CLEAR
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-warning-tint text-warning-deep font-bold text-[10px] font-mono whitespace-nowrap">
                      {aggregate.daily_completion.pending_enrichment_count + aggregate.daily_completion.unacknowledged_notice_count} TUGAS
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'LEARNING' ? (
            <LearningSurface
              context={aggregate.context}
              activities={learningActivities}
              observations={aggregate.recent_observations}
              onToggleActivityComplete={handleToggleActivityComplete}
              onAddActivity={handleAddActivity}
              onOpenEnrichment={obs => {
                setSelectedEnrichmentObs(obs);
                setIsEnrichmentDrawerOpen(true);
              }}
              onOpenQuickCapture={() => {
                setQuickCaptureStudentId(undefined);
                setIsQuickCaptureOpen(true);
              }}
            />
          ) : (
            <StudentRosterSurface
              roster={aggregate.roster}
              onOpenChildPivot={studentId => setPivotStudentId(studentId)}
              onQuickCaptureForChild={studentId => {
                setQuickCaptureStudentId(studentId);
                setIsQuickCaptureOpen(true);
              }}
              onOpenLppaStudio={studentId => setLppaStudioStudentId(studentId)}
              onOpenContinuityModal={studentId => setContinuityModalStudentId(studentId)}
            />
          )}
        </div>

        {/* Right Column (Reconciliation & Communications) */}
        <div className="hidden large:block space-y-8">
          <DailyCompletionSummary
            isAttendanceComplete={aggregate.daily_completion.is_attendance_complete}
            pendingEnrichmentCount={aggregate.daily_completion.pending_enrichment_count}
            unacknowledgedNoticeCount={aggregate.daily_completion.unacknowledged_notice_count}
            isAllClear={aggregate.daily_completion.is_all_clear}
            onOpenEnrichmentQueue={() => setActiveTab('LEARNING')}
          />
          <section className="pt-0 border-t-0 border-line">
            <GuardianNoticeLedger
              notices={aggregate.guardian_notices}
              onAcknowledgeNotice={handleAcknowledgeNotice}
              onSendNewNotice={handleSendNewNotice}
            />
          </section>
        </div>
      </section>

      {/* Floating Fast Capture Action Primitive [ Momen Cepat] */}
      <QuickCaptureFloatingButton
        onClick={() => {
          setQuickCaptureStudentId(undefined);
          setIsQuickCaptureOpen(true);
        }}
        pendingDraftCount={aggregate.daily_completion.pending_enrichment_count}
      />

      {/* Mobile AdaptiveDialog: Full Classroom Pulse & Operating Rhythm Detail */}
      <AdaptiveDialog
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        title="Kondisi Kelas & Ritme Waktu"
      >
        <div className="p-4 space-y-6">
          <ClassroomPulseBanner
            context={aggregate.context}
            pulse={aggregate.pulse}
            onFilterExceptionStudent={studentId => {
              setIsPulseModalOpen(false);
              setPivotStudentId(studentId);
            }}
            onOpenGuardianNotices={() => {
              setIsPulseModalOpen(false);
              if (onNavigateToCommunication) {
                onNavigateToCommunication();
              }
            }}
            onOpenSafetyModal={() => {
              setIsPulseModalOpen(false);
              setIsSafetyModalOpen(true);
            }}
            activeIncidentsCount={activeIncidentsUnresolved.length}
          />

          <OperatingStateIndicator
            currentState={operatingState}
            onStateChange={setOperatingState}
          />
        </div>
      </AdaptiveDialog>

      {/* Mobile AdaptiveDialog: Decoupled Daily Completion Summary & Guardian Notice Ledger */}
      <AdaptiveDialog
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        title="Status Rekonsiliasi & Buku Penghubung"
      >
        <div className="p-4 space-y-6">
          <DailyCompletionSummary
            isAttendanceComplete={aggregate.daily_completion.is_attendance_complete}
            pendingEnrichmentCount={aggregate.daily_completion.pending_enrichment_count}
            unacknowledgedNoticeCount={aggregate.daily_completion.unacknowledged_notice_count}
            isAllClear={aggregate.daily_completion.is_all_clear}
            onOpenEnrichmentQueue={() => {
              setIsReconciliationModalOpen(false);
              setActiveTab('LEARNING');
            }}
          />
          <GuardianNoticeLedger
            notices={aggregate.guardian_notices}
            onAcknowledgeNotice={handleAcknowledgeNotice}
            onSendNewNotice={handleSendNewNotice}
          />
        </div>
      </AdaptiveDialog>

      {/* Modals and Slide-Over Drawers */}
      <EvidenceCaptureSheet
        isOpen={isQuickCaptureOpen}
        onClose={() => {
          setIsQuickCaptureOpen(false);
          setQuickCaptureStudentId(undefined);
        }}
        roster={aggregate.roster}
        preselectedStudentId={quickCaptureStudentId}
        onSaveCapture={handleSaveQuickCapture}
      />

      <EnrichmentTrayDrawer
        isOpen={isEnrichmentDrawerOpen}
        onClose={() => {
          setIsEnrichmentDrawerOpen(false);
          setSelectedEnrichmentObs(null);
        }}
        observation={selectedEnrichmentObs}
        onSaveEnrichment={handleSaveEnrichment}
      />

      <ChildContextPivotModal
        studentId={pivotStudentId}
        schoolId={schoolId}
        classId={classId}
        onClose={() => setPivotStudentId(null)}
        onOpenQuickCaptureForChild={studentId => {
          setPivotStudentId(null);
          setQuickCaptureStudentId(studentId);
          setIsQuickCaptureOpen(true);
        }}
      />

      {/* Stage 4.2: Authentic LPPA Synthesis Studio Modal */}
      {lppaStudioStudentId && (
        <LppaSynthesisStudioModal
          isOpen={Boolean(lppaStudioStudentId)}
          onClose={() => setLppaStudioStudentId(null)}
          studentId={lppaStudioStudentId}
          studentName={aggregate.roster.find(s => s.student_id === lppaStudioStudentId)?.name || 'Ananda'}
          studentNis={aggregate.roster.find(s => s.student_id === lppaStudioStudentId)?.nis || ''}
          schoolId={schoolId}
          classId={classId}
          academicYearId={aggregate.context.academic_year_id}
          academicYearName={aggregate.context.academic_year_name}
          semester={aggregate.context.semester}
          teacherPersonId={teacherPersonId}
          teacherName={currentPersona?.name || 'Ibu Guru'}
          onSuccessNotification={() => loadData()}
        />
      )}

      {/* Stage 4.3: Child Continuity & Learning Plan Modal */}
      {continuityModalStudentId && (
        <ChildContinuityModal
          isOpen={Boolean(continuityModalStudentId)}
          onClose={() => setContinuityModalStudentId(null)}
          studentId={continuityModalStudentId}
          schoolId={schoolId}
          academicYearId={aggregate.context.academic_year_id}
          semester={aggregate.context.semester}
          teacherPersonId={teacherPersonId}
          teacherName={currentPersona?.name || 'Ibu Guru'}
        />
      )}

      {/* Stage 4.4-C: Safety Incident & Signal Resolution Modal */}
      {isSafetyModalOpen && (
        <SafetyIncidentModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          schoolId={schoolId}
          classId={classId}
          className={aggregate.context.class_name}
          teacherPersonId={teacherPersonId}
          teacherName={currentPersona?.name || 'Ibu Guru'}
          students={aggregate.roster.map(r => ({ id: r.student_id, name: r.name }))}
          activeSignals={activeSafetySignals}
          activeIncidents={activeIncidents}
          onRefresh={() => loadData()}
        />
      )}
    </div>
  );
};
