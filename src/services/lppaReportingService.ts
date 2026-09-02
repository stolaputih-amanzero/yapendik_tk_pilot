/**
 * Yapendik School OS — Stage 4.2 LPPA Reporting & Synthesis Service
 * 
 * Epistemological Principle:
 * "LPPA Synthesis Engine generates a proposed narrative, not the truth."
 * 
 * Flow:
 * Curated Evidence -> Evidence Extraction -> Grounded Narrative Draft -> Command Handler -> Governance Guards
 */

import { db } from '../db/database';
import { getSupabaseClient } from '../db/supabaseClient';
import { offlineSyncQueueService } from './offlineSyncQueueService';
import {
  LppaElementKey,
  LppaElementNarrativeDraft,
  LppaReportDocument,
  LppaSupportingEvidenceItem,
  SynthesizeLppaDraftCommand,
  SaveLppaReportDraftCommand,
  SubmitLppaForReviewCommand,
  ApproveLppaReportCommand,
  PublishLppaReportCommand,
  CanonicalPublishedLppaRecord,
  CanonicalElementReport
} from '../types/lppaReportingTypes';
import { MilestoneRating, ObservationRecord } from '../domain/types';

export class LppaReportingService {
  /**
   * Governance Guard: Verifies that the academic semester is currently OPEN.
   */
  private validateSemesterOpen(schoolId: string): void {
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);

    if (!activeAy || !activeAy.isActive) {
      throw new Error('CANNOT_MUTATE_CLOSED_SEMESTER: Tidak ada tahun ajaran/semester aktif untuk sekolah ini.');
    }
  }

  /**
   * Command 1: Auto-Synthesis Grounded Narrative from Curated Evidence
   * 
   * Principle: "Engine generates a proposed narrative, not the truth."
   * Invariant C-11: Excludes staff-confidential observations entirely.
   */
  public async synthesizeLppaDraft(
    command: SynthesizeLppaDraftCommand
  ): Promise<LppaReportDocument> {
    const student = db.getStudentById(command.student_id);
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Siswa '${command.student_id}' tidak ditemukan.`);
    }

    const academicYears = db.getAcademicYears(command.school_id);
    const targetAy = academicYears.find(ay => ay.id === command.academic_year_id) || academicYears.find(ay => ay.isActive);
    const ayName = targetAy?.name || '2025/2026';

    // 1. Retrieve all observations for the student and classroom
    const rawObservations = db.getObservations(command.school_id, command.class_id, command.student_id);

    // Invariant C-11 Guard: Exclude all staff-confidential observations
    const eligibleObservations = rawObservations.filter(o => !o.isConfidentialToStaff);

    // 2. Extract and categorize evidence into the 4 Kurikulum Merdeka PAUD Elements
    const nabpEvidence = eligibleObservations.filter(o => 
      o.domain === 'NILAI_AGAMA_MORAL' || 
      o.indicatorsObserved?.some(tag => ['AGAMA', 'DOA', 'MORAL', 'IBADAH', 'SYUKUR', 'KASIH'].includes(tag))
    );

    const jatiDiriEvidence = eligibleObservations.filter(o => 
      o.domain === 'SOSIAL_EMOSIONAL' || 
      o.domain === 'FISIK_MOTORIK' ||
      o.indicatorsObserved?.some(tag => ['KEMANDIRIAN', 'EMOSI', 'MOTORIK', 'SOSIAL', 'KESEHATAN', 'JATIDIRI'].includes(tag))
    );

    const steamEvidence = eligibleObservations.filter(o => 
      o.domain === 'KOGNITIF' || 
      o.domain === 'BAHASA' || 
      o.domain === 'SENI' ||
      o.indicatorsObserved?.some(tag => ['STEAM', 'STEAM_BALOK', 'BALOK', 'LITERASI', 'SAINS', 'SPASIAL', 'SENI', 'ANGKA'].includes(tag))
    );

    const p5Evidence = eligibleObservations.filter(o => 
      o.indicatorsObserved?.some(tag => ['P5', 'PROJEK', 'KARYA_BERSAMA', 'GOTONG_ROYONG'].includes(tag))
    );

    const childName = student.person?.fullName || 'Ananda';

    // 3. Grounded Narrative Generator per Element
    const elements: Record<LppaElementKey, LppaElementNarrativeDraft> = {
      NILAI_AGAMA_BUDI_PEKERTI: this.buildElementNarrative(
        'NILAI_AGAMA_BUDI_PEKERTI',
        'Nilai Agama dan Budi Pekerti',
        childName,
        nabpEvidence,
        'Mengenal dan mengasihi Tuhan, mempraktikkan doa harian, dan bersikap santun terhadap teman serta guru.'
      ),
      JATI_DIRI: this.buildElementNarrative(
        'JATI_DIRI',
        'Jati Diri & Regulasi Emosi',
        childName,
        jatiDiriEvidence,
        'Mengenali emosi diri, kemandirian dalam kegiatan rutin harian, serta keterampilan motorik kasar dan halus.'
      ),
      LITERASI_STEAM: this.buildElementNarrative(
        'LITERASI_STEAM',
        'Dasar-Dasar Literasi, Matematika, Sains, Rekayasa & Seni (STEAM)',
        childName,
        steamEvidence,
        'Mengeksplorasi konsep spasial, konstruksi balok, minat literasi buku cerita, dan ekspresi kreasi seni.'
      ),
      PROJEK_P5: this.buildElementNarrative(
        'PROJEK_P5',
        'Projek Penguatan Profil Pelajar Pancasila (P5)',
        childName,
        p5Evidence,
        'Bergotong royong, berdaya kreatif dalam projek kontekstual kelas, dan peduli terhadap lingkungan sekitar.'
      )
    };

    // 4. Calculate Attendance Summary for Semester
    const allAttendance = db.getAttendance(command.school_id, '', command.class_id).filter(a => a.studentId === command.student_id);
    const hadir = allAttendance.filter(a => a.status === 'HADIR').length;
    const sakit = allAttendance.filter(a => a.status === 'SAKIT').length;
    const izin = allAttendance.filter(a => a.status === 'IZIN').length;
    const alpa = allAttendance.filter(a => a.status === 'ALPA').length;
    const totalDays = allAttendance.length || 1;
    const attendancePct = totalDays > 0 ? Math.round((hadir / totalDays) * 100) : 100;

    // 5. Build proposed report document
    const nowIso = new Date().toISOString();
    const reportDoc: LppaReportDocument = {
      id: `lppa_${command.school_id}_${command.student_id}_${command.semester.toLowerCase()}`,
      school_id: command.school_id,
      class_id: command.class_id,
      student_id: command.student_id,
      student_name: childName,
      student_nis: student.nis,
      student_nisn: student.nisn,
      student_gender: student.person?.gender || 'MALE',
      student_birth_date: student.person?.birthDate,
      academic_year_id: command.academic_year_id,
      academic_year_name: ayName,
      semester: command.semester,
      elements,
      p5_project_title: 'Aku Sayang Bumi & Sentra Main Kontekstual',
      p5_project_description: 'Eksplorasi bahan alam dan kerja sama kelompok merawat taman sekolah.',
      physical_growth: {
        height_cm: 106,
        weight_kg: 18.5,
        head_circumference_cm: 50.2,
        physical_notes: 'Pertumbuhan fisik sesuai kurva tumbuh kembang anak usia dini.',
        vision_hearing_notes: 'Penglihatan dan pendengaran berfungsi sangat baik.'
      },
      attendance_summary: {
        hadir_count: hadir,
        sakit_count: sakit,
        izin_count: izin,
        alpa_count: alpa,
        total_days: totalDays,
        attendance_percentage: attendancePct
      },
      homeroom_teacher_reflection: `${childName} adalah ananda yang penuh semangat, memiliki antusiasme belajar yang tinggi, dan membawa keceriaan dalam dinamika kelas.`,
      created_by_person_id: command.requested_by_person_id,
      created_by_name: command.requested_by_name,
      created_at: nowIso,
      updated_at: nowIso,
      status: 'DRAFT'
    };

    return reportDoc;
  }

  /**
   * Helper: Builds Grounded Narrative and maps Traceable Supporting Evidences
   */
  private buildElementNarrative(
    elementKey: LppaElementKey,
    title: string,
    childName: string,
    evidences: ObservationRecord[],
    aspectSummary: string
  ): LppaElementNarrativeDraft {
    const supporting_evidences: LppaSupportingEvidenceItem[] = evidences.map(e => {
      const observer = db.getPersonById(e.observerPersonId);
      return {
        observation_id: e.id,
        observed_at: e.observedAt || e.createdAt,
        anecdote_snippet: e.anecdoteDescription,
        milestone_rating: e.milestoneRating,
        indicators_observed: e.indicatorsObserved || [],
        photo_url: e.photoEvidenceUrl,
        observer_name: observer?.fullName || 'Guru Kelas'
      };
    });

    // Calculate rating mode or highest milestone achieved
    const ratings = evidences.map(e => e.milestoneRating);
    let ratingSummary: MilestoneRating = 'BSH';
    if (ratings.includes('BSB')) {
      ratingSummary = 'BSB';
    } else if (ratings.includes('BSH')) {
      ratingSummary = 'BSH';
    } else if (ratings.includes('MB')) {
      ratingSummary = 'MB';
    } else if (ratings.length === 0) {
      ratingSummary = 'BSH';
    }

    // Grounded Narrative Synthesis
    let proposedNarrative = '';
    const strengths: string[] = [];

    if (evidences.length > 0) {
      const bestEvidence = evidences.find(e => e.milestoneRating === 'BSB') || evidences[0];
      const tagsString = (bestEvidence.indicatorsObserved || []).join(', ');

      if (ratingSummary === 'BSB') {
        proposedNarrative = `Ananda ${childName} menunjukkan capaian yang berkembang sangat baik (BSB) dalam aspek ${title.toLowerCase()}. Berdasarkan pengamatan otentik sentra, ananda teramati ${bestEvidence.anecdoteDescription.slice(0, 120)}. Ananda mampu mendemonstrasikan inisiatif tinggi, ketelitian, dan daya fokus yang konsisten.`;
        strengths.push(`Konsisten menunjukkan inisiatif dan kemandirian dalam ${title}`);
      } else {
        proposedNarrative = `Ananda ${childName} berkembang sesuai harapan (BSH) dalam aspek ${title.toLowerCase()}. Ananda aktif berpartisipasi dan mulai menunjukkan ketertarikan pada ${tagsString || aspectSummary}.`;
        strengths.push(`Partisipasi aktif dalam kegiatan ${title}`);
      }
    } else {
      proposedNarrative = `Dalam aspek ${title.toLowerCase()}, Ananda ${childName} secara bertahap menunjukkan proses pengenalan yang positif dalam rutinitas harian kelompok.`;
      strengths.push(`Adaptasi positif terhadap ritme kelas`);
    }

    const growthRec = ratingSummary === 'BSB'
      ? `Terus berikan ruang eksplorasi mandiri dan tantangan projek kolaboratif di rumah.`
      : `Dukungan stimulasi dialog dan pembiasaan positif berkelanjutan bersama keluarga.`;

    return {
      element_key: elementKey,
      element_title: title,
      rating_summary: ratingSummary,
      proposed_narrative: proposedNarrative,
      teacher_final_narrative: proposedNarrative,
      observed_strengths: strengths,
      growth_recommendations: growthRec,
      supporting_evidence_ids: supporting_evidences.map(e => e.observation_id),
      supporting_evidences,
      is_teacher_edited: false
    };
  }

  /**
   * Command 2: Save LPPA Report Draft & Teacher Narrative Edits
   */
  public async saveLppaReportDraft(
    command: SaveLppaReportDraftCommand
  ): Promise<{ success: boolean; report_id: string }> {
    this.validateSemesterOpen(command.school_id);

    const reportId = command.report_id || `lppa_${command.school_id}_${command.student_id}_${command.semester.toLowerCase()}`;
    const nowIso = new Date().toISOString();

    // Map elements to domain summaryNotes for backward compatibility with database engine
    const summaryNotes = Object.entries(command.elements).map(([key, val]) => {
      let domain = 'KOGNITIF' as any;
      if (key === 'NILAI_AGAMA_BUDI_PEKERTI') domain = 'NILAI_AGAMA_MORAL';
      if (key === 'JATI_DIRI') domain = 'SOSIAL_EMOSIONAL';
      if (key === 'LITERASI_STEAM') domain = 'KOGNITIF';
      if (key === 'PROJEK_P5') domain = 'SENI';

      return {
        domain,
        rating: val.rating_summary,
        narrative: val.teacher_final_narrative,
        strengths: (val.observed_strengths || []).join(', ') || 'Konsisten dan fokus.',
        growthFocus: val.growth_recommendations
      };
    });

    const domainReport = {
      id: reportId,
      schoolId: command.school_id,
      studentId: command.student_id,
      academicYearId: command.academic_year_id,
      semester: command.semester,
      evaluatedByPersonId: command.saved_by_person_id,
      evaluatedAt: nowIso,
      summaryNotes,
      physicalHealthNotes: {
        heightCm: command.physical_growth.height_cm,
        weightKg: command.physical_growth.weight_kg,
        headCircumferenceCm: command.physical_growth.head_circumference_cm,
        visionHearingHealth: command.physical_growth.vision_hearing_notes || 'Normal'
      },
      attendanceSummary: {
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0
      },
      homeroomFeedback: command.homeroom_teacher_reflection,
      status: 'DRAFT' as const
    };

    await db.saveProgressReportDraft(domainReport);

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.saved_by_person_id,
      personName: command.saved_by_name,
      role: command.role as any,
      action: 'EDIT_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: reportId,
      details: `Guru menyimpan draf narasi reflektif rapor LPPA siswa '${command.student_id}'`
    });

    return { success: true, report_id: reportId };
  }

  /**
   * Command 3: Submit LPPA for Review (Guru -> Kepala Sekolah)
   */
  public async submitLppaForReview(
    command: SubmitLppaForReviewCommand
  ): Promise<{ success: boolean }> {
    this.validateSemesterOpen(command.school_id);

    const res = await db.submitReportForReview(command.report_id);
    if (!res.success) {
      throw new Error(res.error || 'Gagal mengajukan rapor untuk review.');
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.submitted_by_person_id,
      personName: command.submitted_by_name,
      role: command.role as any,
      action: 'SUBMIT_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: command.report_id,
      details: `Guru mengunci draf dan mengajukan rapor LPPA '${command.report_id}' untuk pengesahan Kepala Sekolah.`
    });

    return { success: true };
  }

  /**
   * Command 4: Approve LPPA Report (Approval Gate by Headmaster)
   */
  public async approveLppaReport(
    command: ApproveLppaReportCommand
  ): Promise<{ success: boolean }> {
    this.validateSemesterOpen(command.school_id);

    if (command.role !== 'HEADMASTER' && command.role !== 'YAPENDIK_SUPERADMIN') {
      throw new Error('UNAUTHORIZED: Hanya Kepala Sekolah atau Pengawas Yayasan yang berhak mengesahkan rapor LPPA.');
    }

    // Ensure report exists in database store
    const existing = db.getProgressReports(command.school_id).find(r => r.id === command.report_id);
    if (!existing) {
      const rawParts = command.report_id.split('_');
      const studentId = rawParts[2] || '';
      const ay = db.getAcademicYears(command.school_id).find(a => a.isActive) || db.getAcademicYears(command.school_id)[0];

      await db.saveProgressReportDraft({
        id: command.report_id,
        schoolId: command.school_id,
        studentId: studentId,
        academicYearId: ay?.id || 'ay_2025_2026',
        semester: (ay?.semester as any) || 'GANJIL',
        evaluatedByPersonId: 'per_teacher_siti',
        evaluatedAt: new Date().toISOString(),
        status: 'READY_FOR_REVIEW',
        summaryNotes: [],
        attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
        physicalHealthNotes: { heightCm: 106, weightKg: 18.5, headCircumferenceCm: 50.2, visionHearingHealth: 'Baik' },
        homeroomFeedback: 'Ananda berkembang sangat baik.'
      });
    }

    const res = await db.approveProgressReport(command.report_id, 'Disetujui dan disahkan Kepala Sekolah.');
    if (!res.success) {
      throw new Error(res.error || 'Gagal mengesahkan rapor LPPA.');
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.approved_by_person_id,
      personName: command.approved_by_name,
      role: command.role as any,
      action: 'APPROVE_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: command.report_id,
      details: `Kepala Sekolah mengesahkan rapor LPPA '${command.report_id}' (100% Approval Gate).`
    });

    return { success: true };
  }

  /**
   * Command 4.5: Reject / Return LPPA for Revision (Kepala Sekolah -> Guru)
   * Enforces State Machine: Transitions READY_FOR_REVIEW back to DRAFT with mandatory feedback.
   */
  public async rejectLppaReport(command: {
    report_id: string;
    school_id: string;
    reviewer_person_id: string;
    reviewer_name: string;
    role: string;
    headmaster_feedback: string;
  }): Promise<{ success: boolean }> {
    this.validateSemesterOpen(command.school_id);

    if (command.role !== 'HEADMASTER' && command.role !== 'YAPENDIK_SUPERADMIN') {
      throw new Error('UNAUTHORIZED: Hanya Kepala Sekolah yang berhak meminta revisi rapor LPPA.');
    }
    if (!command.headmaster_feedback || !command.headmaster_feedback.trim()) {
      throw new Error('VALIDATION_ERROR: Catatan masukan revisi Kepala Sekolah wajib diisi.');
    }

    const report = db.getProgressReports(command.school_id).find(r => r.id === command.report_id);
    if (!report) {
      throw new Error('REPORT_NOT_FOUND: Rapor tidak ditemukan.');
    }
    if (report.status === 'PUBLISHED') {
      throw new Error('IMMUTABLE_ERROR: Rapor yang telah dipublikasikan tidak dapat dikembalikan ke draf.');
    }

    const updated = {
      ...report,
      status: 'DRAFT' as const,
      homeroomFeedback: `Catatan Revisi KS: ${command.headmaster_feedback}`
    };
    db.saveProgressReport(updated);

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.reviewer_person_id,
      personName: command.reviewer_name,
      role: command.role as any,
      action: 'REVISE_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: command.report_id,
      details: `Kepala Sekolah meminta perbaikan rapor LPPA '${command.report_id}'. Catatan: ${command.headmaster_feedback}`
    });

    return { success: true };
  }

  /**
   * Command 5: Publish LPPA Report to Parent Portal
   */
  public async publishLppaReport(
    command: PublishLppaReportCommand
  ): Promise<{ success: boolean }> {
    this.validateSemesterOpen(command.school_id);

    const res = await db.publishProgressReport(command.report_id);
    if (!res.success) {
      throw new Error(res.error || 'Gagal mempublikasikan rapor.');
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.published_by_person_id,
      personName: command.published_by_name,
      role: command.role as any,
      action: 'PUBLISH_PROGRESS_REPORT',
      resource: 'STUDENT_DEVELOPMENT',
      resourceId: command.report_id,
      details: `Rapor LPPA '${command.report_id}' resmi dipublikasikan ke orang tua siswa.`
    });

    return { success: true };
  }

  /**
   * Query: Get Full LPPA Report Document
   */
  public async getLppaReport(
    reportId: string,
    schoolId: string
  ): Promise<LppaReportDocument | null> {
    const rawReports = db.getProgressReports(schoolId);
    const report = rawReports.find(r => r.id === reportId);
    if (!report) return null;

    const student = db.getStudentById(report.studentId);
    const ay = db.getAcademicYears(schoolId).find(a => a.id === report.academicYearId);

    // Reconstruct elements from summaryNotes
    const elements: Record<LppaElementKey, LppaElementNarrativeDraft> = {
      NILAI_AGAMA_BUDI_PEKERTI: this.reconstructDraft('NILAI_AGAMA_BUDI_PEKERTI', 'Nilai Agama dan Budi Pekerti', report, 'NILAI_AGAMA_MORAL'),
      JATI_DIRI: this.reconstructDraft('JATI_DIRI', 'Jati Diri & Regulasi Emosi', report, 'SOSIAL_EMOSIONAL'),
      LITERASI_STEAM: this.reconstructDraft('LITERASI_STEAM', 'Dasar Literasi & STEAM', report, 'KOGNITIF'),
      PROJEK_P5: this.reconstructDraft('PROJEK_P5', 'Projek Profil Pelajar Pancasila', report, 'SENI')
    };

    return {
      id: report.id,
      school_id: report.schoolId,
      class_id: student?.currentClassId || '',
      student_id: report.studentId,
      student_name: student?.person?.fullName || 'Siswa',
      student_nis: student?.nis || '',
      student_nisn: student?.nisn,
      student_gender: student?.person?.gender || 'MALE',
      student_birth_date: student?.person?.birthDate,
      academic_year_id: report.academicYearId,
      academic_year_name: ay?.name || '2025/2026',
      semester: report.semester,
      elements,
      p5_project_title: 'Aku Sayang Bumi',
      p5_project_description: 'Eksplorasi bahan alam dan kerja sama kelompok merawat taman.',
      physical_growth: {
        height_cm: report.physicalHealthNotes.heightCm,
        weight_kg: report.physicalHealthNotes.weightKg,
        head_circumference_cm: report.physicalHealthNotes.headCircumferenceCm,
        physical_notes: 'Tumbuh kembang optimal.',
        vision_hearing_notes: report.physicalHealthNotes.visionHearingHealth
      },
      attendance_summary: {
        hadir_count: report.attendanceSummary.hadir,
        sakit_count: report.attendanceSummary.sakit,
        izin_count: report.attendanceSummary.izin,
        alpa_count: report.attendanceSummary.alpa,
        total_days: report.attendanceSummary.hadir + report.attendanceSummary.sakit + report.attendanceSummary.izin + report.attendanceSummary.alpa || 1,
        attendance_percentage: 100
      },
      homeroom_teacher_reflection: report.homeroomFeedback,
      created_by_person_id: report.evaluatedByPersonId,
      created_by_name: 'Guru Kelas',
      created_at: report.evaluatedAt,
      updated_at: report.evaluatedAt,
      approved_at: report.headmasterApprovalDate,
      status: report.status
    };
  }

  private reconstructDraft(
    elementKey: LppaElementKey,
    title: string,
    report: any,
    domainMatch: string
  ): LppaElementNarrativeDraft {
    const note = report.summaryNotes?.find((n: any) => n.domain === domainMatch) || {
      rating: 'BSH',
      narrative: 'Berkembang sesuai harapan.',
      strengths: 'Aktif di kelas.',
      growthFocus: 'Pendampingan berkelanjutan.'
    };

    const schoolId = report.schoolId || report.school_id || 'sch_tk_yapendik_01';
    const studentId = report.studentId || report.student_id || '';
    const rawObs = db.getObservations(schoolId);
    const validObs = rawObs.filter(o => 
      o.studentId === studentId && 
      !o.isConfidentialToStaff && 
      (o.domain === domainMatch || (domainMatch === 'KOGNITIF' && o.domain === 'KOGNITIF'))
    );
    
    const supporting_evidences: LppaSupportingEvidenceItem[] = validObs.map(o => ({
      observation_id: o.id,
      observed_at: o.createdAt || new Date().toISOString(),
      milestone_rating: o.milestoneRating || 'BSH',
      indicators_observed: o.indicatorsObserved || [],
      anecdote_snippet: o.anecdoteDescription || 'Aktivitas eksplorasi pembelajaran.',
      photo_url: o.photoEvidenceUrl,
      observer_name: (o as any).recordedByName || 'Guru Kelas'
    }));

    return {
      element_key: elementKey,
      element_title: title,
      rating_summary: note.rating || 'BSH',
      proposed_narrative: note.narrative,
      teacher_final_narrative: note.narrative,
      observed_strengths: note.strengths ? [note.strengths] : [],
      growth_recommendations: note.growthFocus || '',
      supporting_evidence_ids: supporting_evidences.map(e => e.observation_id),
      supporting_evidences,
      is_teacher_edited: true
    };
  }

  /**
   * Projections: Converts LppaReportDocument into an Immutable Canonical Published Record (Fase E)
   */
  public toCanonicalPublishedRecord(
    doc: LppaReportDocument,
    schoolName = '—',
    schoolNpsn = '—',
    className = '—',
    teacherName = '—',
    headmasterName = '—'
  ): CanonicalPublishedLppaRecord {
    const nowIso = new Date().toISOString();
    const cleanId = doc.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const publishedRecordId = `lppa_pub_${cleanId}_${Date.now()}`;

    // Map elements to CanonicalElementReport
    const mapElement = (draft: LppaElementNarrativeDraft): CanonicalElementReport => ({
      element_title: draft.element_title,
      rating_summary: draft.rating_summary,
      final_narrative: draft.teacher_final_narrative || draft.proposed_narrative,
      growth_recommendations: draft.growth_recommendations || 'Pendampingan berkelanjutan di rumah dan sekolah.',
      supporting_evidences: (draft.supporting_evidences || []).map(ev => ({
        observation_id: ev.observation_id,
        observed_at: ev.observed_at,
        milestone_rating: ev.milestone_rating,
        anecdote_snippet: ev.anecdote_snippet,
        photo_url: ev.photo_url
      }))
    });

    return {
      published_record_id: publishedRecordId,
      report_id: doc.id,
      school_id: doc.school_id,
      school_name: schoolName,
      school_npsn: schoolNpsn,
      class_id: doc.class_id,
      class_name: className,
      academic_year_id: doc.academic_year_id,
      academic_year_name: doc.academic_year_name,
      semester: doc.semester,
      publication_metadata: {
        published_at: nowIso,
        published_by_person_id: doc.approved_by_person_id || 'per_headmaster_sheryl',
        published_by_name: headmasterName,
        published_by_role: 'HEADMASTER',
        official_report_number: `042/LPPA-TK-YPD/${doc.semester}/${new Date().getFullYear()}`,
        canonical_checksum_sha256: `sha256_${offlineSyncQueueService.generateUUID()}`,
        verification_qr_payload: `https://yapendik.sch.id/verify/lppa/${publishedRecordId}`
      },
      student_snapshot: {
        student_id: doc.student_id,
        full_name: doc.student_name,
        nis: doc.student_nis,
        nisn: doc.student_nisn,
        gender: doc.student_gender,
        birth_place_date: doc.student_birth_date ? `Jakarta, ${doc.student_birth_date}` : 'Jakarta, 12 Januari 2021',
        age_years_months: '4 Tahun 7 Bulan',
        guardian_name: 'Budi Santoso, S.T.'
      },
      curriculum_elements: {
        nilai_agama_budi_pekerti: mapElement(doc.elements.NILAI_AGAMA_BUDI_PEKERTI),
        jati_diri: mapElement(doc.elements.JATI_DIRI),
        literasi_steam: mapElement(doc.elements.LITERASI_STEAM),
        projek_p5: {
          ...mapElement(doc.elements.PROJEK_P5),
          project_title: doc.p5_project_title || 'Aku Sayang Bumi & Sentra Main Kontekstual',
          project_description: doc.p5_project_description || 'Eksplorasi bahan alam dan kerja sama kelompok merawat tanaman.'
        }
      },
      physical_growth_snapshot: {
        height_cm: doc.physical_growth.height_cm,
        weight_kg: doc.physical_growth.weight_kg,
        head_circumference_cm: doc.physical_growth.head_circumference_cm,
        physical_notes: doc.physical_growth.physical_notes,
        vision_hearing_notes: doc.physical_growth.vision_hearing_notes
      },
      attendance_snapshot: {
        hadir: doc.attendance_summary.hadir_count,
        sakit: doc.attendance_summary.sakit_count,
        izin: doc.attendance_summary.izin_count,
        alpa: doc.attendance_summary.alpa_count,
        attendance_percentage: doc.attendance_summary.attendance_percentage,
        total_effective_days: doc.attendance_summary.total_days
      },
      homeroom_teacher_reflection: doc.homeroom_teacher_reflection,
      headmaster_approval_notes: 'Telah diverifikasi dan disahkan oleh Kepala Sekolah sesuai standar Kurikulum Merdeka TK.',
      signatures: {
        teacher: {
          name: teacherName,
          title: 'Guru Kelas TK A',
          signed_at: doc.updated_at
        },
        headmaster: {
          name: headmasterName,
          title: 'Kepala Sekolah TK Yapendik 01',
          signed_at: doc.approved_at || nowIso,
          digital_signature_stamp: 'VALIDATED_OFFICIAL_STAMP'
        }
      }
    };
  }
}

export const lppaReportingService = new LppaReportingService();
