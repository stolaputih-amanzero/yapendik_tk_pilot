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
import { OfflineSyncStateIndicator } from './OfflineSyncStateIndicator';

import { TodaySurface } from './TodaySurface';
import { LearningSurface } from './LearningSurface';
import { StudentRosterSurface } from './StudentRosterSurface';
import { SegmentedControl } from '../../ui';

import { 
  CalendarDays, 
  Puzzle, 
  Users, 
  Sparkles, 
  Home, 
  Clock 
} from 'lucide-react';

export const TeacherHomeShell: React.FC = () => {
  const { securityContext, currentPersona } = useSecurityContext();

  const [activeTab, setActiveTab] = useState<'TODAY' | 'LEARNING' | 'ROSTER'>('TODAY');
  const [operatingState, setOperatingState] = useState<OperatingState>('WELCOME');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-26');
  
  const [aggregate, setAggregate] = useState<TeacherHomeAggregatePayload | null>(null);
  const [learningActivities, setLearningActivities] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Safety Assurance States (Stage 4.4-C)
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [activeSafetySignals, setActiveSafetySignals] = useState<SafetyExceptionSignal[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<SafetyIncidentRecord[]>([]);

  // Modal / Drawer States
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickCaptureStudentId, setQuickCaptureStudentId] = useState<string | undefined>(undefined);
  
  const [selectedEnrichmentObs, setSelectedEnrichmentObs] = useState<ClassObservationItem | null>(null);
  const [isEnrichmentDrawerOpen, setIsEnrichmentDrawerOpen] = useState(false);

  const [pivotStudentId, setPivotStudentId] = useState<string | null>(null);
  const [lppaStudioStudentId, setLppaStudioStudentId] = useState<string | null>(null);
  const [continuityModalStudentId, setContinuityModalStudentId] = useState<string | null>(null);

  const schoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';
  const classId = currentPersona?.activeClassId || 'cls_tka_01';
  const teacherPersonId = currentPersona?.personId || 'per_teacher_siti';

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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto mt-6 shadow-xs">
        <div className="w-12 h-12 bg-sky-50 text-sky-700 border border-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Portal Wali Murid</h3>
        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
          Selamat datang, <strong>{currentPersona.name}</strong>. Ruang Guru dikhususkan untuk pendidik TK. Anda dapat memantau capaian dan komunikasi perkembangan ananda melalui tab <strong>Jejak Ananda</strong> atau <strong>Buku Penghubung</strong>.
        </p>
      </div>
    );
  }

  if (loading || !aggregate) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Menyiapkan Ruang Guru (Teacher Home)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-6 pb-24 lg:pb-0 bg-white lg:bg-transparent">
      {/* Top Bar: Title & Wifi Status */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Beranda Kelas
        </h1>
        <OfflineSyncStateIndicator />
      </div>

      {/* Surface Tab Segmented Control */}
      <div className="border-b border-slate-100 sm:border-slate-200 pb-3.5">
        <SegmentedControl
          options={[
            { id: 'TODAY', label: 'Hari Ini', icon: CalendarDays },
            { id: 'LEARNING', label: 'Belajar & Karya', icon: Puzzle },
            { id: 'ROSTER', label: 'Siswa & Rapor', icon: Users }
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'TODAY' | 'LEARNING' | 'ROSTER')}
          size="sm"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Tier 1: Real-time Classroom Pulse Banner */}
      <ClassroomPulseBanner
        context={aggregate.context}
        pulse={aggregate.pulse}
        onFilterExceptionStudent={studentId => setPivotStudentId(studentId)}
        onOpenGuardianNotices={() => setActiveTab('TODAY')}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        activeIncidentsCount={activeIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'AUDITED_CLOSED').length}
      />

      {/* Dynamic Operating State Rhythm Indicator */}
      <OperatingStateIndicator
        currentState={operatingState}
        onStateChange={setOperatingState}
      />

      {/* Active Surface Router */}
      {activeTab === 'TODAY' ? (
        <TodaySurface
          roster={aggregate.roster}
          guardianNotices={aggregate.guardian_notices}
          isAttendanceComplete={aggregate.daily_completion.is_attendance_complete}
          pendingEnrichmentCount={aggregate.daily_completion.pending_enrichment_count}
          unacknowledgedNoticeCount={aggregate.daily_completion.unacknowledged_notice_count}
          isAllClear={aggregate.daily_completion.is_all_clear}
          onUpdateAttendanceBatch={handleUpdateAttendanceBatch}
          onOpenChildPivot={studentId => setPivotStudentId(studentId)}
          onQuickCaptureForChild={studentId => {
            setQuickCaptureStudentId(studentId);
            setIsQuickCaptureOpen(true);
          }}
          onAcknowledgeNotice={handleAcknowledgeNotice}
          onSendNewNotice={handleSendNewNotice}
          onOpenEnrichmentQueue={() => setActiveTab('LEARNING')}
        />
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

      {/* Floating Fast Capture Action Primitive [⚡ Momen Cepat] */}
      <QuickCaptureFloatingButton
        onClick={() => {
          setQuickCaptureStudentId(undefined);
          setIsQuickCaptureOpen(true);
        }}
        pendingDraftCount={aggregate.daily_completion.pending_enrichment_count}
      />

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
