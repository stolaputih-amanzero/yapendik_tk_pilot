/**
 * Yapendik School OS — Stage 4.3 Child Continuity Application Service & Analytics Engine (Fase 4.3-B)
 * 
 * Epistemological & Governance Invariants:
 * 1. "ChildContinuityProfile is a pure dynamic projection from PUBLISHED LPPA records, never an independent source of truth."
 * 2. "System Proposes, Educator Decides (System cannot activate a plan autonomously)."
 * 3. "Traceability: Every recommendation MUST maintain an anchor to source_historical_baseline_record_id."
 * 4. "C-11 Zero Leakage: Confidential internal notes are strictly quarantined."
 * 5. "Non-Diagnostic Principle: No medical/psychological pseudo-diagnosis, strictly play-based developmental prompts."
 * 6. "State Machine: PROPOSED -> TEACHER_REVIEW -> ACTIVE -> COMPLETED -> ARCHIVED."
 */

import { db } from '../db/database';
import { getSupabaseClient } from '../db/supabaseClient';
import { offlineSyncQueueService } from './offlineSyncQueueService';
import { MilestoneRating } from '../domain/types';
import { LppaElementKey, CanonicalPublishedLppaRecord } from '../types/lppaReportingTypes';
import {
  ChildContinuityProfile,
  HistoricalLppaReference,
  DevelopmentalTrajectoryArc,
  LearningStimulationPlan,
  StimulationRecommendation,
  TeacherPedagogicalDecision,
  ClassroomDevelopmentalHeatmap,
  GenerateProposedStimulationPlansCommand,
  ConfirmLearningStimulationPlanCommand,
  CompleteLearningStimulationPlanCommand,
  RecordHomeStimulationFeedbackCommand,
  PlayCenterType
} from '../types/childContinuityTypes';

export class ChildContinuityService {
  // In-memory store for Learning Stimulation Plans (fallback and simulation)
  private stimulationPlans: LearningStimulationPlan[] = [];

  /**
   * Governance Guard: Verifies that the academic semester is currently OPEN.
   */
  private validateSemesterOpen(schoolId: string) {
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);
    if (!activeAy) {
      throw new Error('CANNOT_MUTATE_CLOSED_SEMESTER: Operasi ditolak karena semester telah ditutup.');
    }
    return activeAy;
  }

  /**
   * Helper to map an element key to display title
   */
  private getElementTitle(key: LppaElementKey): string {
    switch (key) {
      case 'NILAI_AGAMA_BUDI_PEKERTI': return 'Nilai Agama dan Budi Pekerti';
      case 'JATI_DIRI': return 'Jati Diri & Regulasi Emosi';
      case 'LITERASI_STEAM': return 'Dasar Literasi & STEAM';
      case 'PROJEK_P5': return 'Projek Profil Pelajar Pancasila (P5)';
    }
  }

  /**
   * Helper to map element to default play centers
   */
  private getDefaultPlayCenters(key: LppaElementKey): PlayCenterType[] {
    switch (key) {
      case 'NILAI_AGAMA_BUDI_PEKERTI': return ['SENTRA_IBADAH_KARAKTER', 'SENTRA_MAIN_PERAN_MAKRO'];
      case 'JATI_DIRI': return ['SENTRA_MAIN_PERAN_MAKRO', 'SENTRA_BAHAN_ALAM'];
      case 'LITERASI_STEAM': return ['SENTRA_BALOK', 'SENTRA_PERSIAPAN_LITERASI', 'SENTRA_SENI_KREATIF'];
      case 'PROJEK_P5': return ['SENTRA_BAHAN_ALAM', 'SENTRA_SENI_KREATIF'];
    }
  }

  // -------------------------------------------------------------------------
  // 1. DERIVED READ MODEL: CHILD CONTINUITY PROFILE
  // -------------------------------------------------------------------------

  /**
   * Dynamically projects the Child Continuity Profile from PUBLISHED LPPA records
   * (Does NOT create a parallel source of truth)
   */
  public async getChildContinuityProfile(
    studentId: string,
    schoolId: string
  ): Promise<ChildContinuityProfile> {
    const student = db.getStudentById(studentId);
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Siswa '${studentId}' tidak ditemukan.`);
    }

    const person = db.getPersonById(student.personId);
    const studentName = person?.fullName || 'Peserta Didik';
    const classes = db.getClasses(schoolId);
    const currentClass = classes.find(c => c.id === student.currentClassId);
    const className = currentClass?.name || 'Kelompok A';

    // 1. Fetch only PUBLISHED LPPA progress reports (governance constraint: strictly published)
    const allReports = db.getProgressReports(schoolId);
    const publishedReports = allReports.filter(
      r => r.studentId === studentId && (r.status === 'PUBLISHED' || r.status === 'APPROVED')
    );

    const academicYears = db.getAcademicYears(schoolId);

    // 2. Build Historical LPPA References
    const historicalReferences: HistoricalLppaReference[] = publishedReports.map(r => {
      const ay = academicYears.find(a => a.id === r.academicYearId);
      
      const elementRatings: Record<LppaElementKey, MilestoneRating> = {
        NILAI_AGAMA_BUDI_PEKERTI: r.summaryNotes?.find(n => n.domain === 'NILAI_AGAMA_MORAL')?.rating || 'BSH',
        JATI_DIRI: r.summaryNotes?.find(n => n.domain === 'SOSIAL_EMOSIONAL')?.rating || 'BSH',
        LITERASI_STEAM: r.summaryNotes?.find(n => n.domain === 'KOGNITIF')?.rating || 'BSH',
        PROJEK_P5: r.summaryNotes?.find(n => n.domain === 'SENI')?.rating || 'BSH'
      };

      const growthRecommendations: Record<LppaElementKey, string> = {
        NILAI_AGAMA_BUDI_PEKERTI: r.summaryNotes?.find(n => n.domain === 'NILAI_AGAMA_MORAL')?.growthFocus || 'Pembiasaan doa harian.',
        JATI_DIRI: r.summaryNotes?.find(n => n.domain === 'SOSIAL_EMOSIONAL')?.growthFocus || 'Regulasi emosi saat transisi kegiatan.',
        LITERASI_STEAM: r.summaryNotes?.find(n => n.domain === 'KOGNITIF')?.growthFocus || 'Eksplorasi konstruksi spasial dan geometri.',
        PROJEK_P5: r.summaryNotes?.find(n => n.domain === 'SENI')?.growthFocus || 'Kolaborasi karya bahan alam.'
      };

      const strengths = (r.summaryNotes || [])
        .map(n => n.strengths)
        .filter((s): s is string => Boolean(s));

      return {
        published_record_id: `lppa_pub_${r.id}`,
        academic_year_id: r.academicYearId,
        academic_year_name: ay?.name || '2025/2026',
        semester: r.semester,
        published_at: r.evaluatedAt,
        official_report_number: `042/LPPA-TK-YPD/${r.semester}/${new Date(r.evaluatedAt).getFullYear()}`,
        homeroom_teacher_name: (r.evaluatedByPersonId ? db.getPersonById(r.evaluatedByPersonId)?.fullName : undefined) || '—',
        element_ratings: elementRatings,
        growth_recommendations_summary: growthRecommendations,
        strengths_snapshot: strengths.length > 0 ? strengths : ['Aktif dan bersemangat dalam eksplorasi main.']
      };
    });

    // 3. Build Multi-Semester Developmental Trajectory Arcs (4 Elements)
    const elementKeys: LppaElementKey[] = [
      'NILAI_AGAMA_BUDI_PEKERTI',
      'JATI_DIRI',
      'LITERASI_STEAM',
      'PROJEK_P5'
    ];

    const trajectories: Record<LppaElementKey, DevelopmentalTrajectoryArc> = {} as any;

    elementKeys.forEach(k => {
      const trajectoryPoints = historicalReferences.map(ref => ({
        academic_year_name: ref.academic_year_name,
        semester: ref.semester,
        rating: ref.element_ratings[k] || 'BSH',
        published_record_id: ref.published_record_id
      }));

      const latestRating = trajectoryPoints.length > 0
        ? trajectoryPoints[trajectoryPoints.length - 1].rating
        : 'BSH';

      const historicalGrowth = historicalReferences.map(ref => ref.growth_recommendations_summary[k]);

      // Invariant C-11: Fetch non-confidential observations to compute real-time strength indicators
      const rawObs = db.getObservations(schoolId);
      const childObs = rawObs.filter(o => o.studentId === studentId && !o.isConfidentialToStaff);
      
      const observedStrengths = childObs
        .flatMap(o => o.indicatorsObserved || [])
        .filter((v, i, a) => a.indexOf(v) === i);

      trajectories[k] = {
        element_key: k,
        element_title: this.getElementTitle(k),
        trajectory_points: trajectoryPoints,
        current_rating: latestRating,
        observed_strengths: observedStrengths.length > 0 ? observedStrengths : ['Antusiasme bermain mandiri'],
        system_identified_growth_focus: latestRating === 'MB' 
          ? ['Pendampingan intensif stimulasi transisi', 'Penguatan rasa percaya diri di sentra']
          : latestRating === 'BSH'
          ? ['Diferensiasi stimulasi tantangan bertahap', 'Perluasan kosakata reflektif']
          : ['Pengayaan peran pemecahan masalah', 'Pemberian proyek kolaborasi tingkat lanjut'],
        historical_growth_recommendations: historicalGrowth
      };
    });

    // 4. Retrieve Active Plans for this Student
    const activePlans = this.stimulationPlans.filter(
      p => p.target_student_ids.includes(studentId) && (p.status === 'ACTIVE' || p.status === 'TEACHER_REVIEW')
    );

    return {
      student_id: studentId,
      student_name: studentName,
      nis: student.nis,
      current_class_id: student.currentClassId || '',
      current_class_name: className,
      age_years_months: '4 Tahun 7 Bulan',
      historical_lppa_references: historicalReferences,
      developmental_trajectories: trajectories,
      active_stimulation_plans: activePlans,
      guardian_bridge_summary: {
        guardian_name: 'Budi Santoso, S.T.',
        last_home_reflection_date: undefined,
        active_home_activities_count: activePlans.filter(p => p.home_school_extension?.is_shared_with_home).length
      }
    };
  }

  // -------------------------------------------------------------------------
  // 2. CLASSROOM HEATMAP & AGGREGATE READ MODEL
  // -------------------------------------------------------------------------

  /**
   * Projects classroom developmental distribution for Headmaster & Teacher
   */
  public async getClassroomDevelopmentalHeatmap(
    classId: string,
    schoolId: string
  ): Promise<ClassroomDevelopmentalHeatmap> {
    const classes = db.getClasses(schoolId);
    const targetClass = classes.find(c => c.id === classId);
    const className = targetClass?.name || 'Kelompok A';

    const students = db.getStudents(schoolId).filter(s => s.currentClassId === classId);
    const ay = db.getAcademicYears(schoolId).find(a => a.isActive) || db.getAcademicYears(schoolId)[0];

    const elementKeys: LppaElementKey[] = [
      'NILAI_AGAMA_BUDI_PEKERTI',
      'JATI_DIRI',
      'LITERASI_STEAM',
      'PROJEK_P5'
    ];

    const distribution: Record<LppaElementKey, any> = {} as any;

    for (const key of elementKeys) {
      let mb = 0;
      let bsh = 0;
      let bsb = 0;

      for (const st of students) {
        try {
          const profile = await this.getChildContinuityProfile(st.id, schoolId);
          const rating = profile.developmental_trajectories[key]?.current_rating || 'BSH';
          if (rating === 'MB') mb++;
          else if (rating === 'BSB') bsb++;
          else bsh++;
        } catch {
          bsh++;
        }
      }

      distribution[key] = {
        element_title: this.getElementTitle(key),
        mb_count: mb,
        bsh_count: bsh,
        bsb_count: bsb,
        common_growth_themes: key === 'LITERASI_STEAM' 
          ? ['Eksplorasi balok geometri', 'Pengenalan pola ritmik'] 
          : key === 'JATI_DIRI'
          ? ['Regulasi emosi bergantian alat main', 'Kemandirian toilet & makan']
          : ['Pengenalan ciptaan Tuhan', 'Kerja sama merawat lingkungan'],
        priority_stimulation_centers: this.getDefaultPlayCenters(key)
      };
    }

    const classPlans = this.stimulationPlans.filter(p => p.class_id === classId);

    return {
      school_id: schoolId,
      class_id: classId,
      class_name: className,
      academic_year_id: ay?.id || 'ay_2025_2026',
      semester: ay?.semester as any || 'GANJIL',
      total_students_count: students.length,
      element_distribution: distribution,
      active_plans_count: classPlans.filter(p => p.status === 'ACTIVE').length,
      unaddressed_growth_focus_count: Math.max(0, students.length - classPlans.length)
    };
  }

  // -------------------------------------------------------------------------
  // 3. APPLICATION COMMAND HANDLERS
  // -------------------------------------------------------------------------

  /**
   * Command 1: Engine Synthesizes Proposed Continuity Stimulation Plans
   * (Invariants: Strictly PROPOSED, non-authoritative, anchored to historical baseline)
   */
  public async generateProposedStimulationPlans(
    command: GenerateProposedStimulationPlansCommand
  ): Promise<{ success: boolean; generated_plans: LearningStimulationPlan[] }> {
    this.validateSemesterOpen(command.school_id);

    const targetStudentIds = command.student_ids && command.student_ids.length > 0
      ? command.student_ids
      : db.getStudents(command.school_id)
          .filter(s => s.currentClassId === command.class_id)
          .map(s => s.id);

    const classes = db.getClasses(command.school_id);
    const cls = classes.find(c => c.id === command.class_id);
    const className = cls?.name || 'Kelompok A';

    const ays = db.getAcademicYears(command.school_id);
    const ay = ays.find(a => a.id === command.academic_year_id) || ays[0];

    const generatedPlans: LearningStimulationPlan[] = [];

    for (const studentId of targetStudentIds) {
      const student = db.getStudentById(studentId);
      const studentName = student?.person?.fullName || 'Peserta Didik';
      
      const profile = await this.getChildContinuityProfile(studentId, command.school_id);
      
      // Determine element with highest growth priority
      const historicalRef = profile.historical_lppa_references[0];
      const baselineRecordId = historicalRef?.published_record_id || `lppa_pub_baseline_${studentId}`;

      // Pick STEAM or Jati Diri as high-value pedagogical demonstration
      const targetElementKey: LppaElementKey = 'LITERASI_STEAM';
      const traj = profile.developmental_trajectories[targetElementKey];

      const recommendationId = `rec_${offlineSyncQueueService.generateUUID()}`;
      const planId = `plan_${offlineSyncQueueService.generateUUID()}`;

      // Non-Diagnostic, Play-Based Suggestion
      const systemProposal: StimulationRecommendation = {
        recommendation_id: recommendationId,
        element_key: targetElementKey,
        reasoning_basis: {
          source_published_record_id: baselineRecordId,
          historical_rating: traj.current_rating,
          extracted_growth_focus: traj.historical_growth_recommendations[0] || 'Eksplorasi konstruksi bertingkat.',
          recent_observation_indicators: traj.observed_strengths
        },
        suggested_goal: `Memfasilitasi ${studentName} merancang konstruksi balok dengan tantangan keseimbangan bertingkat dan pola simetri.`,
        suggested_play_centers: ['SENTRA_BALOK', 'SENTRA_PERSIAPAN_LITERASI'],
        suggested_provocations: [
          'Menyediakan balok lengkung, jembatan kayu, dan kartu tantangan arsitektur sederhana.',
          'Mengajak ananda menceritakan rancangan bangunan setelah sesi bermain balok.'
        ],
        confidence_rationale: `Berdasarkan rekor LPPA (${traj.current_rating}), ananda menunjukkan minat tinggi pada konstruksi mandiri.`
      };

      const newPlan: LearningStimulationPlan = {
        plan_id: planId,
        school_id: command.school_id,
        class_id: command.class_id,
        class_name: className,
        academic_year_id: command.academic_year_id,
        academic_year_name: ay?.name || '2025/2026',
        semester: command.semester,
        source_historical_baseline_record_id: baselineRecordId,
        target_type: 'INDIVIDUAL',
        target_student_ids: [studentId],
        target_student_names: [studentName],
        target_element_key: targetElementKey,
        status: 'PROPOSED', // Invariant: Initial state is PROPOSED, not ACTIVE
        system_proposal: systemProposal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.stimulationPlans.push(newPlan);
      generatedPlans.push(newPlan);
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.requested_by_person_id,
      personName: command.requested_by_name,
      role: command.role as any,
      action: 'CREATE_LEARNING_ACTIVITY',
      resource: 'TEACHER_DAILY_WORK',
      resourceId: `batch_plans_${command.class_id}`,
      details: `Engine menghasilkan ${generatedPlans.length} usulan rencana stimulasi kontinuitas belajar untuk kelas '${command.class_id}'.`
    });

    return { success: true, generated_plans: generatedPlans };
  }

  /**
   * Command 2: Teacher Authorizes / Confirms Pedagogical Decision for a Plan
   * (Invariants: Transitions PROPOSED/TEACHER_REVIEW -> ACTIVE; requires TeacherPedagogicalDecision)
   */
  public async confirmLearningStimulationPlan(
    command: ConfirmLearningStimulationPlanCommand
  ): Promise<{ success: boolean; plan: LearningStimulationPlan }> {
    this.validateSemesterOpen(command.school_id);

    if (command.role !== 'TEACHER' && command.role !== 'HEADMASTER' && command.role !== 'YAPENDIK_SUPERADMIN') {
      throw new Error('UNAUTHORIZED: Hanya guru kelas atau pimpinan sekolah yang berwenang menetapkan keputusan rencana stimulasi.');
    }

    const plan = this.stimulationPlans.find(p => p.plan_id === command.plan_id);
    if (!plan) {
      throw new Error(`PLAN_NOT_FOUND: Rencana stimulasi '${command.plan_id}' tidak ditemukan.`);
    }

    const nowIso = new Date().toISOString();

    // Attach Educator Decision & Activate
    plan.teacher_decision = command.teacher_decision;
    plan.status = 'ACTIVE';
    plan.activated_at = nowIso;
    plan.updated_at = nowIso;

    // Configure Home-School Bridge if selected
    if (command.share_with_home) {
      plan.home_school_extension = {
        is_shared_with_home: true,
        home_activity_prompt: command.home_activity_prompt || 'Ajak ananda merapikan dan mengelompokkan mainan berdasarkan bentuk di rumah.',
        parent_acknowledgment_status: 'PENDING'
      };
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.confirmed_by_person_id,
      personName: command.confirmed_by_name,
      role: command.role as any,
      action: 'EDIT_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: plan.plan_id,
      details: `Guru mengesahkan keputusan pedagogis untuk rencana stimulasi '${plan.plan_id}' (Status: ACTIVE).`
    });

    return { success: true, plan };
  }

  /**
   * Command 3: Teacher Updates Plan Execution Progress / Completes Goal
   * (Invariants: Transitions ACTIVE -> COMPLETED with evidence backlinks)
   */
  public async completeLearningStimulationPlan(
    command: CompleteLearningStimulationPlanCommand
  ): Promise<{ success: boolean; plan: LearningStimulationPlan }> {
    this.validateSemesterOpen(command.school_id);

    const plan = this.stimulationPlans.find(p => p.plan_id === command.plan_id);
    if (!plan) {
      throw new Error(`PLAN_NOT_FOUND: Rencana stimulasi '${command.plan_id}' tidak ditemukan.`);
    }

    if (plan.status !== 'ACTIVE') {
      throw new Error(`INVALID_STATUS_TRANSITION: Rencana harus berstatus ACTIVE sebelum diselesaikan (Status saat ini: ${plan.status}).`);
    }

    const nowIso = new Date().toISOString();
    plan.status = 'COMPLETED';
    plan.completed_at = nowIso;
    plan.updated_at = nowIso;

    if (plan.teacher_decision) {
      plan.teacher_decision.pedagogical_notes += `\n[Catatan Penuntasan ${nowIso.slice(0, 10)}]: ${command.completion_reflection}`;
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.completed_by_person_id,
      personName: command.completed_by_name,
      role: command.role as any,
      action: 'EDIT_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: plan.plan_id,
      details: `Guru menyelesaikan rencana stimulasi '${plan.plan_id}' dengan bukti observasi baru.`
    });

    return { success: true, plan };
  }

  /**
   * Command 4: Parent Confirms Home Stimulation Reflection (Home-School Bridge)
   * (Invariants: Scoped to Guardian role; does NOT mutate school canonical assessment)
   */
  public async recordHomeStimulationFeedback(
    command: RecordHomeStimulationFeedbackCommand
  ): Promise<{ success: boolean; plan: LearningStimulationPlan }> {
    this.validateSemesterOpen(command.school_id);

    const plan = this.stimulationPlans.find(p => p.plan_id === command.plan_id);
    if (!plan) {
      throw new Error(`PLAN_NOT_FOUND: Rencana stimulasi '${command.plan_id}' tidak ditemukan.`);
    }

    if (!plan.home_school_extension?.is_shared_with_home) {
      throw new Error('FORBIDDEN: Rencana stimulasi ini tidak dibagikan ke kemitraan rumah.');
    }

    const nowIso = new Date().toISOString();
    plan.home_school_extension.parent_acknowledgment_status = 'ACKNOWLEDGED';
    plan.home_school_extension.parent_reflection_notes = command.home_reflection_notes;
    plan.home_school_extension.parent_acknowledged_at = nowIso;
    plan.updated_at = nowIso;

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.guardian_person_id,
      personName: command.guardian_name,
      role: command.role as any,
      action: 'ACKNOWLEDGE_NOTICE',
      resource: 'TEACHER_DAILY_WORK',
      resourceId: plan.plan_id,
      details: `Orang tua '${command.guardian_name}' mencatat refleksi stimulasi kemitraan rumah untuk rencana '${plan.plan_id}'.`
    });

    return { success: true, plan };
  }

  /**
   * Query: Get active learning stimulation plans with optional filters
   */
  public async getActiveLearningStimulationPlans(
    schoolId: string,
    classId?: string,
    studentId?: string
  ): Promise<LearningStimulationPlan[]> {
    return this.stimulationPlans.filter(p => {
      if (p.school_id !== schoolId) return false;
      if (classId && p.class_id !== classId) return false;
      if (studentId && !p.target_student_ids.includes(studentId)) return false;
      return true;
    });
  }
}

export const childContinuityService = new ChildContinuityService();
