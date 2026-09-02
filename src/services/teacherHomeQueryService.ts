/**
 * Yapendik School OS — Stage 4.1 Teacher Home Read Model & Query Service
 * Provides consolidated aggregation over canonical projections (v_teacher_class_roster, v_student_safety_profile),
 * attendance pulse, health/safety exceptions, and progressive enrichment trays.
 */

import { db } from '../db/database';
import { getSupabaseClient } from '../db/supabaseClient';
import {
  TeacherHomeAggregatePayload,
  ChildContextDeepPayload,
  StudentRosterItem,
  ClassObservationItem,
  GuardianNoticeItem,
  ClassroomPulseData,
  ActiveTeacherContext,
  PAUDQuickTag,
  ArrivalMood,
  HealthAlertType
} from '../types/teacherDailyTypes';
import { DevelopmentDomain, AttendanceStatus, MilestoneRating } from '../domain/types';

export class TeacherHomeQueryService {
  /**
   * Returns Kurikulum Merdeka PAUD Standard Quick Tags
   */
  public getQuickTags(): Array<{ id: PAUDQuickTag; label: string; domain: DevelopmentDomain }> {
    return [
      { id: 'NILAI_AGAMA_BUDI_PEKERTI', label: 'Nilai Agama & Budi Pekerti', domain: 'NILAI_AGAMA_MORAL' },
      { id: 'JATI_DIRI', label: 'Jati Diri & Emosi', domain: 'SOSIAL_EMOSIONAL' },
      { id: 'LITERASI_STEAM', label: 'Literasi & Komunikasi', domain: 'BAHASA' },
      { id: 'STEAM_BALOK', label: 'STEAM: Balok & Konstruksi', domain: 'KOGNITIF' },
      { id: 'MOTORIK_KASAR', label: 'Fisik & Motorik Kasar', domain: 'FISIK_MOTORIK' },
      { id: 'MOTORIK_HALUS', label: 'Fisik & Motorik Halus', domain: 'FISIK_MOTORIK' },
      { id: 'KEMANDIRIAN', label: 'Kemandirian & Disiplin Diri', domain: 'SOSIAL_EMOSIONAL' },
      { id: 'SENI_KREATIF', label: 'Seni & Ekspresi Kreatif', domain: 'SENI' }
    ];
  }

  /**
   * Main Read Model: Aggregates the entire Teacher Home active surface
   */
  public async getTeacherHomeAggregate(
    schoolId: string,
    classId: string,
    date: string,
    teacherPersonId: string
  ): Promise<TeacherHomeAggregatePayload> {
    const supabase = getSupabaseClient();

    // 1. Resolve Institutional Hierarchy & Active Context
    const schools = db.getSchools();
    const currentSchool = schools.find(s => s.id === schoolId) || schools[0] || {
      id: schoolId,
      name: '—'
    };

    const schoolClasses = db.getClasses(schoolId);
    const currentClass = schoolClasses.find(c => c.id === classId) || schoolClasses[0] || {
      id: classId,
      name: 'Kelompok TK A',
      academicYearId: 'ay_2026_ganjil',
      homeroomTeacherId: teacherPersonId
    };

    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.id === currentClass.academicYearId) || academicYears[0] || {
      id: 'ay_2026_ganjil',
      name: '2026/2027',
      semester: 'GANJIL',
      isActive: true
    };

    const teacherPerson = db.getPersonById(teacherPersonId) || {
      id: teacherPersonId,
      fullName: 'Guru Kelas',
      preferredName: 'Guru'
    };

    const initials = teacherPerson.fullName
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const isSemesterClosed = !activeAy.isActive;

    const context: ActiveTeacherContext = {
      school_id: schoolId,
      school_name: currentSchool.name,
      class_id: currentClass.id,
      class_name: currentClass.name,
      academic_year_id: activeAy.id,
      academic_year_name: activeAy.name,
      semester: activeAy.semester as 'GANJIL' | 'GENAP',
      is_semester_closed: isSemesterClosed,
      date,
      teacher: {
        person_id: teacherPersonId,
        name: teacherPerson.fullName,
        role: (currentClass as any).homeroomTeacherId === teacherPersonId ? 'HOMEROOM' : 'CO_TEACHER',
        initials
      }
    };

    // 2. Resolve Student Roster & Safety Profiles (Zero Leak)
    const rawStudents = db.getStudents(schoolId, currentClass.id);
    const todayAttendance = db.getAttendance(schoolId, date, currentClass.id);
    const allSemesterAttendance = db.getAttendance(schoolId, '', currentClass.id);
    const allObservations = db.getObservations(schoolId, currentClass.id);
    const allReports = db.getProgressReports(schoolId, activeAy.id);

    const roster: StudentRosterItem[] = rawStudents.map(st => {
      const att = todayAttendance.find(a => a.studentId === st.id);
      const studentObs = allObservations.filter(o => o.studentId === st.id);
      const report = allReports.find(r => r.studentId === st.id);
      
      const readyPct = report?.status === 'APPROVED' || report?.status === 'PUBLISHED' 
        ? 100 
        : report?.status === 'READY_FOR_REVIEW' 
        ? 80 
        : studentObs.length >= 3 
        ? 50 
        : Math.min(studentObs.length * 15, 40);

      return {
        student_id: st.id,
        person_id: st.personId,
        nis: st.nis,
        nisn: st.nisn,
        name: st.person?.fullName || 'Siswa',
        gender: st.person?.gender || 'MALE',
        birth_date: st.person?.birthDate,
        allergies: st.allergies,
        special_needs_notes: st.specialNeedsNotes,
        blood_type: st.bloodType,
        today_status: att?.status,
        today_temperature: att?.temperatureCelsius,
        today_mood: att?.arrivalMood as ArrivalMood,
        today_arrival_note: att?.notes,
        evidence_count_semester: studentObs.length,
        lppa_ready_percentage: readyPct
      };
    });

    // 3. Compute Classroom Pulse
    let presentCount = 0;
    let sickCount = 0;
    let permitCount = 0;
    let absentCount = 0;
    const healthAlerts: ClassroomPulseData['health_alerts'] = [];

    roster.forEach(r => {
      if (r.today_status === 'HADIR') presentCount++;
      else if (r.today_status === 'SAKIT') {
        sickCount++;
        healthAlerts.push({
          student_id: r.student_id,
          student_name: r.name,
          alert_type: 'FEVER',
          note: r.today_arrival_note || 'Demam / Sakit',
          temperature: r.today_temperature
        });
      } else if (r.today_status === 'IZIN') permitCount++;
      else if (r.today_status === 'ALPA') absentCount++;

      if (
        r.allergies &&
        r.allergies.trim() !== '' &&
        !['tidak ada', 'none', '-', 'tidak'].includes(r.allergies.trim().toLowerCase())
      ) {
        healthAlerts.push({
          student_id: r.student_id,
          student_name: r.name,
          alert_type: 'ALLERGY',
          note: `Alergi: ${r.allergies}`
        });
      }
    });

    const unaccountedCount = roster.length - (presentCount + sickCount + permitCount + absentCount);

    // 4. Resolve Guardian Notices
    const notices = db.getNotices(schoolId, currentClass.id);
    const unreadCount = notices.filter(n => !n.acknowledgedAt).length;

    const guardian_notices: GuardianNoticeItem[] = notices.map(n => {
      const author = db.getPersonById(n.authorPersonId);
      const student = n.studentId ? db.getStudentById(n.studentId) : undefined;
      return {
        id: n.id,
        student_id: n.studentId,
        student_name: student?.person?.fullName,
        class_id: n.classId,
        author_person_id: n.authorPersonId,
        author_name: author?.fullName || 'Pengirim',
        recipient_person_id: n.recipientPersonId,
        type: n.type,
        title: n.title,
        content: n.content,
        requires_acknowledgment: n.requiresAcknowledgment,
        acknowledged_at: n.acknowledgedAt,
        acknowledged_by_person_id: n.acknowledgedByPersonId,
        guardian_reply: n.guardianReply,
        created_at: n.createdAt
      };
    });

    const pulse: ClassroomPulseData = {
      total_students: roster.length,
      present_count: presentCount,
      sick_count: sickCount,
      permit_count: permitCount,
      absent_count: absentCount,
      unaccounted_count: Math.max(0, unaccountedCount),
      health_alerts: healthAlerts,
      unread_guardian_notes: unreadCount
    };

    // 5. Resolve Recent Observations for Today
    const recent_observations: ClassObservationItem[] = allObservations
      .filter(o => o.observedAt.startsWith(date) || o.createdAt.startsWith(date))
      .map(o => {
        const obsTeacher = db.getPersonById(o.observerPersonId);
        const obsInitials = obsTeacher?.fullName
          ? obsTeacher.fullName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
          : 'GR';
        const st = db.getStudentById(o.studentId);
        const isDraft = !o.anecdoteDescription || o.anecdoteDescription.length < 20;

        return {
          id: o.id,
          recorded_at: o.observedAt || o.createdAt,
          recorded_by_person_id: o.observerPersonId,
          recorded_by_name: obsTeacher?.fullName || 'Guru Kelas',
          recorded_by_initials: obsInitials,
          target_student_ids: [o.studentId],
          target_student_names: [st?.person?.fullName || 'Siswa'],
          media_url: o.photoEvidenceUrl,
          media_type: 'IMAGE',
          anecdote_description: o.anecdoteDescription,
          domain: o.domain,
          milestone_rating: o.milestoneRating,
          quick_tags: o.indicatorsObserved || [],
          status: isDraft ? 'QUICK_DRAFT' : 'MATURE_EVIDENCE',
          is_lppa_evidence: o.milestoneRating === 'BSH' || o.milestoneRating === 'BSB',
          is_shared_with_guardian: o.sharedWithGuardian,
          is_staff_confidential: o.isConfidentialToStaff
        };
      });

    // 6. Daily Completion Status
    const isAttendanceComplete = unaccountedCount === 0 && roster.length > 0;
    const pendingEnrichmentCount = recent_observations.filter(o => o.status === 'QUICK_DRAFT').length;
    const isAllClear = isAttendanceComplete && pendingEnrichmentCount === 0 && unreadCount === 0;

    return {
      context,
      pulse,
      roster,
      recent_observations,
      guardian_notices,
      daily_completion: {
        is_attendance_complete: isAttendanceComplete,
        pending_enrichment_count: pendingEnrichmentCount,
        unacknowledged_notice_count: unreadCount,
        is_all_clear: isAllClear
      }
    };
  }

  /**
   * One Child Deep Dive Query (CC-09 Pivot)
   */
  public async getChildContextDeep(
    studentId: string,
    schoolId: string,
    classId: string
  ): Promise<ChildContextDeepPayload | null> {
    const student = db.getStudentById(studentId);
    if (!student) return null;

    const allObs = db.getObservations(schoolId, classId, studentId);
    const notices = db.getNotices(schoolId, classId, studentId);
    const rawAtt = db.getAttendance(schoolId, '', classId).filter(a => a.studentId === studentId);

    const reports = db.getProgressReports(schoolId).filter(r => r.studentId === studentId);
    const latestReport = reports[reports.length - 1];

    const rosterItem: StudentRosterItem = {
      student_id: student.id,
      person_id: student.personId,
      nis: student.nis,
      nisn: student.nisn,
      name: student.person?.fullName || 'Siswa',
      gender: student.person?.gender || 'MALE',
      birth_date: student.person?.birthDate,
      allergies: student.allergies,
      special_needs_notes: student.specialNeedsNotes,
      blood_type: student.bloodType,
      evidence_count_semester: allObs.length,
      lppa_ready_percentage: latestReport ? 100 : allObs.length >= 3 ? 60 : allObs.length * 20
    };

    const attendance_history = rawAtt.map(a => ({
      date: a.date,
      status: a.status,
      temperature: a.temperatureCelsius,
      mood: a.arrivalMood as ArrivalMood,
      notes: a.notes
    })).sort((a, b) => b.date.localeCompare(a.date));

    const evidence_portfolio: ClassObservationItem[] = allObs.map(o => {
      const obsTeacher = db.getPersonById(o.observerPersonId);
      const initials = obsTeacher?.fullName
        ? obsTeacher.fullName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
        : 'GR';
      const isDraft = !o.anecdoteDescription || o.anecdoteDescription.length < 20;

      return {
        id: o.id,
        recorded_at: o.observedAt,
        recorded_by_person_id: o.observerPersonId,
        recorded_by_name: obsTeacher?.fullName || 'Guru',
        recorded_by_initials: initials,
        target_student_ids: [studentId],
        target_student_names: [student.person?.fullName || 'Siswa'],
        media_url: o.photoEvidenceUrl,
        media_type: 'IMAGE',
        anecdote_description: o.anecdoteDescription,
        domain: o.domain,
        milestone_rating: o.milestoneRating,
        quick_tags: o.indicatorsObserved || [],
        status: isDraft ? 'QUICK_DRAFT' : 'MATURE_EVIDENCE',
        is_lppa_evidence: o.milestoneRating === 'BSH' || o.milestoneRating === 'BSB',
        is_shared_with_guardian: o.sharedWithGuardian,
        is_staff_confidential: o.isConfidentialToStaff
      };
    });

    const guardian_communications: GuardianNoticeItem[] = notices.map(n => ({
      id: n.id,
      student_id: n.studentId,
      student_name: student.person?.fullName,
      class_id: n.classId,
      author_person_id: n.authorPersonId,
      author_name: db.getPersonById(n.authorPersonId)?.fullName || 'Pengirim',
      type: n.type,
      title: n.title,
      content: n.content,
      requires_acknowledgment: n.requiresAcknowledgment,
      acknowledged_at: n.acknowledgedAt,
      acknowledged_by_person_id: n.acknowledgedByPersonId,
      guardian_reply: n.guardianReply,
      created_at: n.createdAt
    }));

    return {
      student: rosterItem,
      attendance_history,
      evidence_portfolio,
      guardian_communications,
      lppa_summary: {
        report_id: latestReport?.id,
        status: latestReport?.status,
        domains_covered: latestReport?.summaryNotes?.length || allObs.length,
        homeroom_feedback: latestReport?.homeroomFeedback
      }
    };
  }
}

export const teacherHomeQueryService = new TeacherHomeQueryService();
