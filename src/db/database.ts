/**
 * Yapendik School OS — Relational Repository & Database Engine
 * 
 * Production Hardened:
 * - Direct Supabase Cloud RPC State-Machine Operations
 * - Namespaced, Scoped & Flushed Local Storage Cache
 * - Server-Side Privacy Projections (Staff Confidentiality Isolation)
 * - Deterministic Attendance Records & Unique Constraints
 * - Immutable Cloud Audit Logging via SECURITY DEFINER RPC
 */

import {
  School,
  AcademicYear,
  ClassRoom,
  Person,
  StudentProfile,
  GuardianRelationship,
  LearningActivity,
  DevelopmentalMilestone,
  ObservationRecord,
  DailyAttendanceEntry,
  GuardianNotice,
  AuditLogEntry,
  StudentProgressReport,
  SchoolReadinessResult
} from '../domain/types';

import {
  SEED_SCHOOLS,
  SEED_ACADEMIC_YEARS,
  SEED_CLASSES,
  SEED_PERSONS,
  SEED_STUDENTS,
  SEED_GUARDIAN_RELATIONSHIPS,
  SEED_DEVELOPMENT_MILESTONES,
  SEED_LEARNING_ACTIVITIES,
  SEED_OBSERVATIONS,
  SEED_ATTENDANCE,
  SEED_GUARDIAN_NOTICES,
  SEED_AUDIT_LOGS
} from './seed';

import { getSupabaseClient } from './supabaseClient';

const CACHE_ROOT_PREFIX = 'yapendik_os_v3_genesis_';

// ==============================================================================
// MAPPER HELPERS (CamelCase Domain Object <-> SnakeCase Supabase Table)
// ==============================================================================

const mappers = {
  school: {
    toDb: (s: School) => ({
      id: s.id,
      npsn: s.npsn,
      name: s.name,
      level: s.level,
      sub_type: s.subType,
      address: s.address,
      city: s.city,
      province: s.province,
      phone: s.phone,
      email: s.email,
      headmaster_person_id: s.headmasterPersonId || null,
      academic_year_active_id: s.academicYearActiveId || null,
      status: s.status || 'ACTIVE',
      operational_readiness: s.operationalReadiness || 'NOT_READY',
      created_at: s.createdAt
    }),
    fromDb: (row: any): School => ({
      id: row.id,
      npsn: row.npsn,
      name: row.name,
      level: row.level,
      subType: row.sub_type,
      address: row.address || '',
      city: row.city || '',
      province: row.province || '',
      phone: row.phone || '',
      email: row.email || '',
      headmasterPersonId: row.headmaster_person_id || '',
      academicYearActiveId: row.academic_year_active_id || '',
      status: row.status || 'ACTIVE',
      operationalReadiness: row.operational_readiness || 'NOT_READY',
      createdAt: row.created_at
    })
  },
  academicYear: {
    toDb: (a: AcademicYear) => ({
      id: a.id,
      school_id: a.schoolId,
      name: a.name,
      semester: a.semester,
      start_date: a.startDate,
      end_date: a.endDate,
      is_active: a.isActive
    }),
    fromDb: (row: any): AcademicYear => ({
      id: row.id,
      schoolId: row.school_id,
      name: row.name,
      semester: row.semester,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active
    })
  },
  class: {
    toDb: (c: ClassRoom) => ({
      id: c.id,
      school_id: c.schoolId,
      academic_year_id: c.academicYearId || null,
      name: c.name,
      age_group: c.ageGroup,
      room_number: c.roomNumber,
      capacity: c.capacity,
      homeroom_teacher_id: c.homeroomTeacherId || null,
      co_teacher_id: c.coTeacherId || null,
      is_active: c.isActive
    }),
    fromDb: (row: any): ClassRoom => ({
      id: row.id,
      schoolId: row.school_id,
      academicYearId: row.academic_year_id || '',
      name: row.name,
      ageGroup: row.age_group,
      roomNumber: row.room_number || '',
      capacity: row.capacity || 15,
      homeroomTeacherId: row.homeroom_teacher_id || '',
      coTeacherId: row.co_teacher_id || undefined,
      isActive: row.is_active
    })
  },
  person: {
    toDb: (p: Person) => ({
      id: p.id,
      national_id_number: p.nationalIdNumber || null,
      full_name: p.fullName,
      preferred_name: p.preferredName || null,
      gender: p.gender || null,
      birth_date: p.birthDate || null,
      birth_place: p.birthPlace || null,
      phone: p.phone || null,
      address: p.address || null,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }),
    fromDb: (row: any): Person => ({
      id: row.id,
      nationalIdNumber: row.national_id_number || undefined,
      fullName: row.full_name,
      preferredName: row.preferred_name || row.full_name,
      gender: row.gender || 'FEMALE',
      birthDate: row.birth_date || '',
      birthPlace: row.birth_place || '',
      phone: row.phone || undefined,
      address: row.address || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })
  },
  student: {
    toDb: (s: StudentProfile) => ({
      id: s.id,
      person_id: s.personId,
      school_id: s.schoolId,
      nisn: s.nisn || null,
      nis: s.nis,
      current_class_id: s.currentClassId || null,
      blood_type: s.bloodType || null,
      allergies: s.allergies || null,
      special_needs_notes: s.specialNeedsNotes || null,
      enrollment_date: s.enrollmentDate || null,
      status: s.status
    }),
    fromDb: (row: any): StudentProfile => ({
      id: row.id,
      personId: row.person_id,
      schoolId: row.school_id,
      nisn: row.nisn || undefined,
      nis: row.nis,
      currentClassId: row.current_class_id || '',
      bloodType: row.blood_type || undefined,
      allergies: row.allergies || undefined,
      specialNeedsNotes: row.special_needs_notes || undefined,
      enrollmentDate: row.enrollment_date || '',
      status: row.status
    })
  },
  guardianRelationship: {
    toDb: (g: GuardianRelationship) => ({
      id: g.id,
      student_person_id: g.studentPersonId,
      guardian_person_id: g.guardianPersonId,
      relationship_type: g.relationshipType,
      is_primary_contact: g.isPrimaryContact,
      is_legal_guardian: g.isLegalGuardian,
      emergency_contact_priority: g.emergencyContactPriority
    }),
    fromDb: (row: any): GuardianRelationship => ({
      id: row.id,
      studentPersonId: row.student_person_id,
      guardianPersonId: row.guardian_person_id,
      relationshipType: row.relationship_type,
      isPrimaryContact: row.is_primary_contact,
      isLegalGuardian: row.is_legal_guardian,
      emergencyContactPriority: row.emergency_contact_priority
    })
  },
  milestone: {
    toDb: (m: DevelopmentalMilestone) => ({
      id: m.id,
      domain: m.domain,
      age_group: m.ageGroup,
      code: m.code,
      title: m.title,
      description: m.description,
      standard_assessment_guidelines: m.standardAssessmentGuidelines
    }),
    fromDb: (row: any): DevelopmentalMilestone => ({
      id: row.id,
      domain: row.domain,
      ageGroup: row.age_group,
      code: row.code,
      title: row.title,
      description: row.description || '',
      standardAssessmentGuidelines: row.standard_assessment_guidelines || ''
    })
  },
  activity: {
    toDb: (a: LearningActivity) => ({
      id: a.id,
      school_id: a.schoolId,
      class_id: a.classId,
      date: a.date,
      theme: a.theme,
      sub_theme: a.subTheme || null,
      time_slot: a.timeSlot || null,
      activity_name: a.activityName,
      developmental_focus: a.developmentalFocus || [],
      materials_needed: a.materialsNeeded || [],
      planned_steps: a.plannedSteps || [],
      teacher_reflection: a.teacherReflection || null,
      completed: a.completed
    }),
    fromDb: (row: any): LearningActivity => ({
      id: row.id,
      schoolId: row.school_id,
      classId: row.class_id,
      date: row.date,
      theme: row.theme,
      subTheme: row.sub_theme || '',
      timeSlot: row.time_slot || '',
      activityName: row.activity_name,
      developmentalFocus: row.developmental_focus || [],
      materialsNeeded: row.materials_needed || [],
      plannedSteps: row.planned_steps || [],
      teacherReflection: row.teacher_reflection || undefined,
      completed: Boolean(row.completed)
    })
  },
  observation: {
    toDb: (o: ObservationRecord) => ({
      id: o.id,
      school_id: o.schoolId,
      class_id: o.classId,
      student_id: o.studentId,
      observer_person_id: o.observerPersonId || null,
      observed_at: o.observedAt,
      domain: o.domain,
      anecdote_description: o.anecdoteDescription,
      behavior_trigger: o.behaviorTrigger || null,
      child_reaction: o.childReaction || null,
      teacher_intervention: o.teacherIntervention || null,
      milestone_rating: o.milestoneRating,
      indicators_observed: o.indicatorsObserved || [],
      photo_evidence_url: o.photoEvidenceUrl || null,
      is_confidential_to_staff: o.isConfidentialToStaff,
      shared_with_guardian: o.sharedWithGuardian,
      created_at: o.createdAt
    }),
    fromDb: (row: any): ObservationRecord => ({
      id: row.id,
      schoolId: row.school_id,
      classId: row.class_id,
      studentId: row.student_id,
      observerPersonId: row.observer_person_id || '',
      observedAt: row.observed_at,
      domain: row.domain,
      anecdoteDescription: row.anecdote_description,
      behaviorTrigger: row.behavior_trigger || undefined,
      childReaction: row.child_reaction || undefined,
      teacherIntervention: row.teacher_intervention || undefined,
      milestoneRating: row.milestone_rating,
      indicatorsObserved: row.indicators_observed || [],
      photoEvidenceUrl: row.photo_evidence_url || undefined,
      isConfidentialToStaff: Boolean(row.is_confidential_to_staff),
      sharedWithGuardian: Boolean(row.shared_with_guardian),
      createdAt: row.created_at
    })
  },
  attendance: {
    toDb: (a: DailyAttendanceEntry) => ({
      id: a.id,
      school_id: a.schoolId,
      class_id: a.classId,
      student_id: a.studentId,
      date: a.date,
      status: a.status,
      notes: a.notes || null,
      recorded_by_person_id: a.recordedByPersonId || null,
      recorded_at: a.recordedAt,
      temperature_celsius: a.temperatureCelsius || null,
      arrival_mood: a.arrivalMood || null
    }),
    fromDb: (row: any): DailyAttendanceEntry => ({
      id: row.id,
      schoolId: row.school_id,
      classId: row.class_id,
      studentId: row.student_id,
      date: row.date,
      status: row.status,
      notes: row.notes || undefined,
      recordedByPersonId: row.recorded_by_person_id || '',
      recordedAt: row.recorded_at,
      temperatureCelsius: row.temperature_celsius ? Number(row.temperature_celsius) : undefined,
      arrivalMood: row.arrival_mood || undefined
    })
  },
  notice: {
    toDb: (n: GuardianNotice) => ({
      id: n.id,
      school_id: n.schoolId,
      class_id: n.classId || null,
      student_id: n.studentId || null,
      author_person_id: n.authorPersonId || null,
      recipient_person_id: n.recipientPersonId || null,
      type: n.type,
      title: n.title,
      content: n.content,
      requires_acknowledgment: n.requiresAcknowledgment,
      acknowledged_at: n.acknowledgedAt || null,
      acknowledged_by_person_id: n.acknowledgedByPersonId || null,
      guardian_reply: n.guardianReply || null,
      created_at: n.createdAt
    }),
    fromDb: (row: any): GuardianNotice => ({
      id: row.id,
      schoolId: row.school_id,
      classId: row.class_id || undefined,
      studentId: row.student_id || undefined,
      authorPersonId: row.author_person_id || '',
      recipientPersonId: row.recipient_person_id || undefined,
      type: row.type,
      title: row.title,
      content: row.content,
      requiresAcknowledgment: Boolean(row.requires_acknowledgment),
      acknowledgedAt: row.acknowledged_at || undefined,
      acknowledgedByPersonId: row.acknowledged_by_person_id || undefined,
      guardianReply: row.guardian_reply || undefined,
      createdAt: row.created_at
    })
  },
  report: {
    toDb: (r: StudentProgressReport) => ({
      id: r.id,
      school_id: r.schoolId,
      student_id: r.studentId,
      academic_year_id: r.academicYearId || null,
      semester: r.semester,
      evaluated_by_person_id: r.evaluatedByPersonId || null,
      evaluated_at: r.evaluatedAt,
      summary_notes: r.summaryNotes || [],
      physical_health_notes: r.physicalHealthNotes || {},
      attendance_summary: r.attendanceSummary || {},
      homeroom_feedback: r.homeroomFeedback || null,
      headmaster_approval_date: r.headmasterApprovalDate || null,
      status: r.status
    }),
    fromDb: (row: any): StudentProgressReport => ({
      id: row.id,
      schoolId: row.school_id,
      studentId: row.student_id,
      academicYearId: row.academic_year_id || '',
      semester: row.semester,
      evaluatedByPersonId: row.evaluated_by_person_id || '',
      evaluatedAt: row.evaluated_at,
      summaryNotes: row.summary_notes || [],
      physicalHealthNotes: row.physical_health_notes || { heightCm: 0, weightKg: 0, visionHearingHealth: '' },
      attendanceSummary: row.attendance_summary || { hadir: 0, sakit: 0, izin: 0, alpa: 0 },
      homeroomFeedback: row.homeroom_feedback || '',
      headmasterApprovalDate: row.headmaster_approval_date || undefined,
      status: row.status || 'DRAFT'
    })
  },
  audit: {
    toDb: (a: AuditLogEntry) => ({
      id: a.id,
      school_id: a.schoolId || null,
      user_id: a.userId,
      person_name: a.personName,
      role: a.role,
      action: a.action,
      resource: a.resource,
      resource_id: a.resourceId,
      details: a.details,
      ip_address: a.ipAddress || null,
      timestamp: a.timestamp
    }),
    fromDb: (row: any): AuditLogEntry => ({
      id: row.id,
      schoolId: row.school_id || '',
      userId: row.user_id,
      personName: row.person_name,
      role: row.role,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address || undefined,
      timestamp: row.timestamp
    })
  }
};

export class DatabaseEngine {
  private schools: School[] = [];
  private academicYears: AcademicYear[] = [];
  private classes: ClassRoom[] = [];
  private persons: Person[] = [];
  private students: StudentProfile[] = [];
  private guardianRelationships: GuardianRelationship[] = [];
  private milestones: DevelopmentalMilestone[] = [];
  private activities: LearningActivity[] = [];
  private observations: ObservationRecord[] = [];
  private attendance: DailyAttendanceEntry[] = [];
  private notices: GuardianNotice[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private progressReports: StudentProgressReport[] = [];
  
  private currentUserId: string = 'anonymous';
  private currentSchoolId: string = 'sch_tk_yapendik_01';
  private listeners: Set<() => void> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    this.initialize();
  }

  public setContextScope(userId: string, schoolId: string) {
    this.currentUserId = userId;
    this.currentSchoolId = schoolId;
    this.initialize();
  }

  private getScopedKey(tableName: string): string {
    return `${CACHE_ROOT_PREFIX}u_${this.currentUserId}_s_${this.currentSchoolId}_${tableName}`;
  }

  private initialize() {
    try {
      const loadedSchools = this.loadOrSeed('schools', SEED_SCHOOLS);
      const realSchools = loadedSchools.filter(s => s.id === 'sch_tk_maranatha' || (!s.id.startsWith('sch_tk_yapendik_') && s.id !== 'sch_tk_yapendik_01' && s.id !== 'sch_tk_yapendik_02'));
      this.schools = realSchools.length > 0 ? realSchools : [...SEED_SCHOOLS];
      this.persist('schools', this.schools);

      this.academicYears = this.loadOrSeed('academic_years', SEED_ACADEMIC_YEARS);
      this.classes = this.loadOrSeed('classes', SEED_CLASSES);

      const loadedPersons = this.loadOrSeed('persons', SEED_PERSONS);
      const loadedStudents = this.loadOrSeed('students', SEED_STUDENTS);
      const loadedGuardians = this.loadOrSeed('guardian_relationships', SEED_GUARDIAN_RELATIONSHIPS);

      const personMap = new Map(loadedPersons.map(p => [p.id, p]));
      SEED_PERSONS.forEach(sp => {
        const existing = personMap.get(sp.id) || {};
        personMap.set(sp.id, { ...existing, ...sp });
      });
      this.persons = Array.from(personMap.values());
      this.persist('persons', this.persons);

      const studentMap = new Map(loadedStudents.map(s => [s.id, s]));
      SEED_STUDENTS.forEach(ss => {
        const existing = studentMap.get(ss.id) || {};
        studentMap.set(ss.id, { ...existing, ...ss });
      });
      this.students = Array.from(studentMap.values());
      this.persist('students', this.students);

      const validLoadedGuardians = loadedGuardians.filter(r => !r.id.startsWith('rel_maranatha_'));
      const relMap = new Map(validLoadedGuardians.map(r => [r.id, r]));
      SEED_GUARDIAN_RELATIONSHIPS.forEach(sr => {
        const existing = relMap.get(sr.id) || {};
        relMap.set(sr.id, { ...existing, ...sr });
      });
      this.guardianRelationships = Array.from(relMap.values());
      this.persist('guardian_relationships', this.guardianRelationships);

      this.milestones = this.loadOrSeed('milestones', SEED_DEVELOPMENT_MILESTONES);

      // Clean transactional tables to start 100% fresh for authentic school operations
      const loadedActs = this.loadOrSeed('activities', SEED_LEARNING_ACTIVITIES);
      this.activities = loadedActs.filter(a => !a.id.startsWith('act_00') && !a.id.startsWith('act_maranatha_'));
      this.persist('activities', this.activities);

      const loadedObs = this.loadOrSeed('observations', SEED_OBSERVATIONS);
      this.observations = loadedObs.filter(o => !o.id.startsWith('obs_00') && !o.id.startsWith('obs_maranatha_'));
      this.persist('observations', this.observations);

      const loadedAtt = this.loadOrSeed('attendance', SEED_ATTENDANCE);
      this.attendance = loadedAtt.filter(a => !a.id.startsWith('att_00') && !a.id.startsWith('att_maranatha_'));
      this.persist('attendance', this.attendance);

      const loadedNotices = this.loadOrSeed('notices', SEED_GUARDIAN_NOTICES);
      this.notices = loadedNotices.filter(n => !n.id.startsWith('notif_00') && !n.id.startsWith('notif_maranatha_'));
      this.persist('notices', this.notices);

      const loadedAudits = this.loadOrSeed('audit_logs', SEED_AUDIT_LOGS);
      this.auditLogs = loadedAudits.filter(a => !a.id.startsWith('aud_00') && !a.id.startsWith('aud_maranatha_'));
      this.persist('audit_logs', this.auditLogs);

      this.progressReports = this.loadOrSeed('progress_reports', []);

      // Trigger asynchronous sync from Supabase Cloud
      this.syncFromSupabase();
    } catch (err) {
      console.error('Error initializing database engine:', err);
      this.resetToDefaults();
    }
  }

  private getStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    return {
      getItem: (k: string) => (globalThis as any).__memStore?.[k] || null,
      setItem: (k: string, v: string) => {
        if (!(globalThis as any).__memStore) (globalThis as any).__memStore = {};
        (globalThis as any).__memStore[k] = v;
      },
      removeItem: (k: string) => {
        if ((globalThis as any).__memStore) delete (globalThis as any).__memStore[k];
      },
      get length() {
        return Object.keys((globalThis as any).__memStore || {}).length;
      },
      key: (i: number) => Object.keys((globalThis as any).__memStore || {})[i] || null
    };
  }

  private loadOrSeed<T>(key: string, seedData: T[]): T[] {
    const scopedKey = this.getScopedKey(key);
    const storage = this.getStorage();
    const raw = storage.getItem(scopedKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn(`Failed parsing stored table ${key}, falling back to seed.`, e);
      }
    }
    this.persist(key, seedData);
    return seedData;
  }

  private persist<T>(key: string, data: T[]) {
    try {
      const scopedKey = this.getScopedKey(key);
      this.getStorage().setItem(scopedKey, JSON.stringify(data));
    } catch (e) {
      console.error(`Storage persist error for ${key}:`, e);
    }
  }

  /**
   * Secure Session Purge: Clears all Yapendik-scoped data on logout / account switch.
   */
  public purgeAllSessionCache() {
    const storage = this.getStorage();
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && (k.startsWith(CACHE_ROOT_PREFIX) || k.startsWith('yapendik_os_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => storage.removeItem(k));

    // Reset in-memory stores
    this.schools = [];
    this.academicYears = [];
    this.classes = [];
    this.persons = [];
    this.students = [];
    this.guardianRelationships = [];
    this.milestones = [];
    this.activities = [];
    this.observations = [];
    this.attendance = [];
    this.notices = [];
    this.auditLogs = [];
    this.progressReports = [];
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ==============================================================================
  // SUPABASE CLOUD SYNC & REPLICATION
  // ==============================================================================

  public async syncFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase || this.isSyncing) return;

    this.isSyncing = true;
    try {
      console.log('🔄 Syncing data from Supabase Cloud Database...');

      const [
        schoolsRes,
        academicYearsRes,
        classesRes,
        personsRes,
        studentsRes,
        guardiansRes,
        milestonesRes,
        activitiesRes,
        observationsRes,
        attendanceRes,
        noticesRes,
        reportsRes,
        auditRes
      ] = await Promise.all([
        supabase.from('schools').select('*'),
        supabase.from('academic_years').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('persons').select('*'),
        supabase.from('students').select('*'),
        supabase.from('guardian_relationships').select('*'),
        supabase.from('developmental_milestones').select('*'),
        supabase.from('learning_activities').select('*').order('date', { ascending: false }),
        supabase.from('observation_records').select('*').order('observed_at', { ascending: false }),
        supabase.from('daily_attendance').select('*').order('date', { ascending: false }),
        supabase.from('guardian_notices').select('*').order('created_at', { ascending: false }),
        supabase.from('student_progress_reports').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100)
      ]);

      if (schoolsRes.data && schoolsRes.data.length > 0) {
        this.schools = schoolsRes.data.map(mappers.school.fromDb);
        this.persist('schools', this.schools);
      }
      if (academicYearsRes.data && academicYearsRes.data.length > 0) {
        this.academicYears = academicYearsRes.data.map(mappers.academicYear.fromDb);
        this.persist('academic_years', this.academicYears);
      }
      if (classesRes.data && classesRes.data.length > 0) {
        this.classes = classesRes.data.map(mappers.class.fromDb);
        this.persist('classes', this.classes);
      }
      if (personsRes.data && personsRes.data.length > 0) {
        this.persons = personsRes.data.map(mappers.person.fromDb);
        this.persist('persons', this.persons);
      }
      if (studentsRes.data && studentsRes.data.length > 0) {
        this.students = studentsRes.data.map(mappers.student.fromDb);
        this.persist('students', this.students);
      }
      if (guardiansRes.data && guardiansRes.data.length > 0) {
        this.guardianRelationships = guardiansRes.data.map(mappers.guardianRelationship.fromDb);
        this.persist('guardian_relationships', this.guardianRelationships);
      }
      if (milestonesRes.data && milestonesRes.data.length > 0) {
        this.milestones = milestonesRes.data.map(mappers.milestone.fromDb);
        this.persist('milestones', this.milestones);
      }
      if (activitiesRes.data && activitiesRes.data.length > 0) {
        this.activities = activitiesRes.data.map(mappers.activity.fromDb);
        this.persist('activities', this.activities);
      }
      if (observationsRes.data && observationsRes.data.length > 0) {
        this.observations = observationsRes.data.map(mappers.observation.fromDb);
        this.persist('observations', this.observations);
      }
      if (attendanceRes.data && attendanceRes.data.length > 0) {
        this.attendance = attendanceRes.data.map(mappers.attendance.fromDb);
        this.persist('attendance', this.attendance);
      }
      if (noticesRes.data && noticesRes.data.length > 0) {
        this.notices = noticesRes.data.map(mappers.notice.fromDb);
        this.persist('notices', this.notices);
      }
      if (reportsRes.data && reportsRes.data.length > 0) {
        this.progressReports = reportsRes.data.map(mappers.report.fromDb);
        this.persist('progress_reports', this.progressReports);
      }
      if (auditRes.data && auditRes.data.length > 0) {
        this.auditLogs = auditRes.data.map(mappers.audit.fromDb);
        this.persist('audit_logs', this.auditLogs);
      }

      console.log('✅ Supabase sync completed successfully.');
      this.notify();
    } catch (err) {
      console.warn('⚠️ Supabase sync encountered an issue, running with local cache:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  public resetToDefaults() {
    this.purgeAllSessionCache();
    this.schools = [...SEED_SCHOOLS];
    this.academicYears = [...SEED_ACADEMIC_YEARS];
    this.classes = [...SEED_CLASSES];
    this.persons = [...SEED_PERSONS];
    this.students = [...SEED_STUDENTS];
    this.guardianRelationships = [...SEED_GUARDIAN_RELATIONSHIPS];
    this.milestones = [...SEED_DEVELOPMENT_MILESTONES];
    this.activities = [...SEED_LEARNING_ACTIVITIES];
    this.observations = [...SEED_OBSERVATIONS];
    this.attendance = [...SEED_ATTENDANCE];
    this.notices = [...SEED_GUARDIAN_NOTICES];
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.progressReports = [];

    this.persist('schools', this.schools);
    this.persist('academic_years', this.academicYears);
    this.persist('classes', this.classes);
    this.persist('persons', this.persons);
    this.persist('students', this.students);
    this.persist('guardian_relationships', this.guardianRelationships);
    this.persist('milestones', this.milestones);
    this.persist('activities', this.activities);
    this.persist('observations', this.observations);
    this.persist('attendance', this.attendance);
    this.persist('notices', this.notices);
    this.persist('audit_logs', this.auditLogs);
    this.persist('progress_reports', this.progressReports);

    this.notify();
  }

  // ----------------------------------------------------
  // SCHOOL & ACADEMIC QUERIES
  // ----------------------------------------------------
  public getSchools(): School[] {
    const valid = this.schools.filter(s => s.id === 'sch_tk_maranatha' || (!s.id.startsWith('sch_tk_yapendik_') && s.id !== 'sch_tk_yapendik_01' && s.id !== 'sch_tk_yapendik_02'));
    return valid.length > 0 ? valid : [...SEED_SCHOOLS];
  }

  public getSchoolById(schoolId: string): School | undefined {
    return this.schools.find(s => s.id === schoolId) || this.getSchools()[0];
  }

  public getClasses(schoolId: string): ClassRoom[] {
    return this.classes.filter(c => c.schoolId === schoolId);
  }

  public getClassById(classId: string): ClassRoom | undefined {
    return this.classes.find(c => c.id === classId);
  }

  public getAcademicYears(schoolId?: string): AcademicYear[] {
    return this.academicYears.filter(a => !schoolId || a.schoolId === schoolId);
  }

  // ----------------------------------------------------
  // CANONICAL PERSON & STUDENT QUERIES
  // ----------------------------------------------------
  public getPersons(): Person[] {
    return [...this.persons];
  }

  public getPersonById(personId: string): Person | undefined {
    return this.persons.find(p => p.id === personId);
  }

  public getStudents(schoolId: string, classId?: string): (StudentProfile & { person: Person; guardians: { relation: GuardianRelationship; person: Person }[] })[] {
    return this.students
      .filter(s => s.schoolId === schoolId && (!classId || s.currentClassId === classId))
      .map(s => {
        const person: Person = 
          this.persons.find(p => p.id === s.personId && p.fullName !== 'Siswa') || 
          SEED_PERSONS.find(p => p.id === s.personId) || 
          this.persons.find(p => p.id === s.personId) || {
            id: s.personId,
            fullName: s.nis ? `Siswa (${s.nis})` : 'Siswa',
            preferredName: 'Siswa',
            gender: 'MALE',
            birthDate: '2020-01-01',
            birthPlace: 'Jakarta',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

        const guardianRels = this.guardianRelationships.filter(r => r.studentPersonId === s.personId);
        const guardians = guardianRels.map(r => {
          const foundPerson: Person = 
            this.persons.find(p => p.id === r.guardianPersonId && p.fullName !== 'Wali Murid') ||
            SEED_PERSONS.find(p => p.id === r.guardianPersonId) ||
            this.persons.find(p => p.id === r.guardianPersonId) || {
              id: r.guardianPersonId,
              fullName: 'Wali Murid',
              preferredName: 'Wali',
              gender: 'MALE',
              birthDate: '1985-01-01',
              birthPlace: 'Jakarta',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

          return {
            relation: r,
            person: foundPerson
          };
        });

        return { ...s, person, guardians };
      });
  }

  public getStudentById(studentId: string) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return undefined;
    const person: Person = this.persons.find(p => p.id === student.personId) || {
      id: student.personId,
      fullName: student.nis ? `Siswa (${student.nis})` : 'Siswa',
      preferredName: 'Siswa',
      gender: 'MALE',
      birthDate: '2020-01-01',
      birthPlace: 'Jakarta',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { ...student, person };
  }

  public getChildrenForGuardian(guardianPersonId: string) {
    const relations = this.guardianRelationships.filter(r => r.guardianPersonId === guardianPersonId);
    const studentPersonIds = relations.map(r => r.studentPersonId);
    return this.students
      .filter(s => studentPersonIds.includes(s.personId))
      .map(s => ({
        student: s,
        person: (this.persons.find(p => p.id === s.personId) || {
          id: s.personId,
          fullName: 'Ananda',
          preferredName: 'Ananda',
          gender: 'MALE',
          birthDate: '2020-01-01',
          birthPlace: 'Jakarta',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }) as Person,
        relation: relations.find(r => r.studentPersonId === s.personId)!
      }));
  }

  // ----------------------------------------------------
  // TRUSTED STUDENT PLACEMENT RPC
  // ----------------------------------------------------
  public async placeStudentInClass(studentId: string, targetClassId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_place_student_in_class', {
        p_student_id: studentId,
        p_target_class_id: targetClassId
      });
      if (error) {
        console.error('RPC Error placing student:', error);
        return { success: false, error: error.message };
      }
    }

    // Update locally
    this.students = this.students.map(s => s.id === studentId ? { ...s, currentClassId: targetClassId } : s);
    this.persist('students', this.students);
    this.notify();
    return { success: true };
  }

  public updateStudentProfile(
    studentId: string,
    data: {
      bloodType?: 'A' | 'B' | 'AB' | 'O';
      allergies?: string;
      specialNeeds?: string;
      fullName?: string;
      preferredName?: string;
      nationalIdNumber?: string;
      birthPlace?: string;
      birthDate?: string;
      gender?: 'MALE' | 'FEMALE';
      address?: string;
    },
    actorName: string = 'Pendidik',
    userId: string = 'system',
    role: any = 'TEACHER'
  ): { success: boolean; student?: any } {
    const studentIdx = this.students.findIndex(s => s.id === studentId);
    if (studentIdx === -1) return { success: false };

    const student = this.students[studentIdx];
    const updatedStudent: StudentProfile = {
      ...student,
      ...(data.bloodType !== undefined ? { bloodType: data.bloodType } : {}),
      ...(data.allergies !== undefined ? { allergies: data.allergies } : {}),
      ...(data.specialNeeds !== undefined ? { specialNeeds: data.specialNeeds } : {}),
      updatedAt: new Date().toISOString()
    };

    this.students[studentIdx] = updatedStudent;
    this.persist('students', this.students);

    // Update associated Person
    const personIdx = this.persons.findIndex(p => p.id === student.personId);
    if (personIdx !== -1) {
      const person = this.persons[personIdx];
      const updatedPerson: Person = {
        ...person,
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.preferredName ? { preferredName: data.preferredName } : {}),
        ...(data.nationalIdNumber !== undefined ? { nationalIdNumber: data.nationalIdNumber } : {}),
        ...(data.birthPlace ? { birthPlace: data.birthPlace } : {}),
        ...(data.birthDate ? { birthDate: data.birthDate } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        updatedAt: new Date().toISOString()
      };
      this.persons[personIdx] = updatedPerson;
      this.persist('persons', this.persons);
    }

    // Sync to Supabase Cloud if available
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('students')
        .update(mappers.student.toDb(updatedStudent))
        .eq('id', studentId)
        .then(({ error }) => {
          if (error) console.error('Supabase error updating student:', error);
        });

      if (personIdx !== -1) {
        supabase.from('persons')
          .update(mappers.person.toDb(this.persons[personIdx]))
          .eq('id', student.personId)
          .then(({ error }) => {
            if (error) console.error('Supabase error updating person:', error);
          });
      }
    }

    this.recordAudit({
      schoolId: student.schoolId,
      userId,
      personName: actorName,
      role,
      action: 'UPDATE_STUDENT_PROFILE',
      resource: 'STUDENT_ROSTER',
      resourceId: studentId,
      details: `Memperbarui profil data ananda ${data.fullName || student.id} (Gol. Darah: ${data.bloodType || student.bloodType || '-'})`,
      timestamp: new Date().toISOString()
    });

    this.notify();
    return { success: true, student: this.getStudentById(studentId) };
  }

  // ----------------------------------------------------
  // LEARNING ACTIVITIES (TEACHER DAILY WORK)
  // ----------------------------------------------------
  public getLearningActivities(schoolId: string, classId?: string, date?: string): LearningActivity[] {
    return this.activities.filter(a => 
      a.schoolId === schoolId && 
      (!classId || a.classId === classId) && 
      (!date || a.date === date)
    );
  }

  public addLearningActivity(activity: Omit<LearningActivity, 'id'>, authorName: string, userId: string, role: any): LearningActivity {
    const newActivity: LearningActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    this.activities = [newActivity, ...this.activities];
    this.persist('activities', this.activities);

    // Sync to Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('learning_activities')
        .insert(mappers.activity.toDb(newActivity))
        .then(({ error }) => {
          if (error) console.error('Supabase error inserting activity:', error);
        });
    }

    this.recordAudit({
      schoolId: activity.schoolId,
      userId,
      personName: authorName,
      role,
      action: 'CREATE_LEARNING_ACTIVITY',
      resource: 'TEACHER_DAILY_WORK',
      resourceId: newActivity.id,
      details: `Menyusun rencana aktivitas harian: "${newActivity.activityName}" (${newActivity.date})`
    });

    this.notify();
    return newActivity;
  }

  public toggleActivityComplete(activityId: string, reflection?: string) {
    let updatedActivity: LearningActivity | undefined;

    this.activities = this.activities.map(a => {
      if (a.id === activityId) {
        updatedActivity = {
          ...a,
          completed: !a.completed,
          teacherReflection: reflection !== undefined ? reflection : a.teacherReflection
        };
        return updatedActivity;
      }
      return a;
    });
    this.persist('activities', this.activities);

    // Sync to Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase && updatedActivity) {
      supabase.from('learning_activities')
        .update({
          completed: updatedActivity.completed,
          teacher_reflection: updatedActivity.teacherReflection || null
        })
        .eq('id', activityId)
        .then(({ error }) => {
          if (error) console.error('Supabase error updating activity:', error);
        });
    }

    this.notify();
  }

  // ----------------------------------------------------
  // OBSERVATION RECORDS & EVIDENCE (PRIVACY GOVERNED)
  // ----------------------------------------------------
  public getObservations(schoolId: string, classId?: string, studentId?: string, isGuardian: boolean = false): ObservationRecord[] {
    return this.observations.filter(o => {
      if (o.schoolId !== schoolId) return false;
      if (classId && o.classId !== classId) return false;
      if (studentId && o.studentId !== studentId) return false;
      // Strict privacy predicate: guardians cannot view staff-confidential observations
      if (isGuardian && (o.isConfidentialToStaff || !o.sharedWithGuardian)) return false;
      return true;
    });
  }

  public addObservation(
    obs: Omit<ObservationRecord, 'id' | 'createdAt'>, 
    authorName: string, 
    userId: string, 
    role: any
  ): ObservationRecord {
    const newObs: ObservationRecord = {
      ...obs,
      id: (obs as any).id || `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: (obs as any).createdAt || new Date().toISOString()
    };
    this.observations = [newObs, ...this.observations];
    this.persist('observations', this.observations);

    // Sync to Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('observation_records')
        .insert(mappers.observation.toDb(newObs))
        .then(({ error }) => {
          if (error) console.error('Supabase error inserting observation:', error);
        });
    }

    this.recordAudit({
      schoolId: obs.schoolId,
      userId,
      personName: authorName,
      role,
      action: 'CREATE_OBSERVATION',
      resource: 'STUDENT_OBSERVATION',
      resourceId: newObs.id,
      details: `Merekam observasi domain ${obs.domain} untuk ID siswa '${obs.studentId}' (Rating: ${obs.milestoneRating})`
    });

    this.notify();
    return newObs;
  }

  public updateObservation(updatedObs: ObservationRecord): boolean {
    let found = false;
    this.observations = this.observations.map(o => {
      if (o.id === updatedObs.id) {
        found = true;
        return { ...updatedObs };
      }
      return o;
    });
    if (found) {
      this.persist('observations', this.observations);
      this.notify();
    }
    return found;
  }

  // ----------------------------------------------------
  // ATTENDANCE REGISTERS (DETERMINISTIC IDENTIFIERS)
  // ----------------------------------------------------
  public getAttendance(schoolId: string, date?: string, classId?: string): DailyAttendanceEntry[] {
    return this.attendance.filter(a => 
      a.schoolId === schoolId && 
      (!date || a.date === date) && 
      (!classId || a.classId === classId)
    );
  }

  public saveAttendanceBatch(
    entries: Omit<DailyAttendanceEntry, 'id' | 'recordedAt'>[],
    authorName: string,
    userId: string,
    role: any
  ) {
    const date = entries[0]?.date;
    const schoolId = entries[0]?.schoolId;
    const classId = entries[0]?.classId;

    if (!date || !schoolId) return;

    // Deterministic identity generation: att_{schoolId}_{classId}_{studentId}_{date}
    const newEntries: DailyAttendanceEntry[] = entries.map(e => ({
      ...e,
      id: `att_${e.schoolId}_${e.classId}_${e.studentId}_${e.date}`,
      recordedAt: new Date().toISOString()
    }));

    // Filter out existing matching records
    const remaining = this.attendance.filter(a => 
      !(a.schoolId === schoolId && a.date === date && a.classId === classId)
    );

    this.attendance = [...newEntries, ...remaining];
    this.persist('attendance', this.attendance);

    // Sync to Supabase Cloud via deterministic upsert
    const supabase = getSupabaseClient();
    if (supabase && newEntries.length > 0) {
      supabase.from('daily_attendance')
        .upsert(newEntries.map(mappers.attendance.toDb), { onConflict: 'school_id,class_id,student_id,date' })
        .then(({ error }) => {
          if (error) console.error('Supabase error upserting attendance:', error);
        });
    }

    this.recordAudit({
      schoolId,
      userId,
      personName: authorName,
      role,
      action: 'RECORD_ATTENDANCE',
      resource: 'ATTENDANCE_REGISTER',
      resourceId: `${classId}_${date}`,
      details: `Merekam presensi harian kelas (${newEntries.length} siswa) tanggal ${date}`
    });

    this.notify();
  }

  // ----------------------------------------------------
  // GUARDIAN COMMUNICATION (BUKU PENGHUBUNG)
  // ----------------------------------------------------
  public getNotices(schoolId: string, classId?: string, studentId?: string): GuardianNotice[] {
    return this.notices.filter(n => 
      n.schoolId === schoolId && 
      (!n.classId || !classId || n.classId === classId) &&
      (!n.studentId || !studentId || n.studentId === studentId)
    );
  }

  public addNotice(
    notice: Omit<GuardianNotice, 'id' | 'createdAt'>,
    authorName: string,
    userId: string,
    role: any
  ): GuardianNotice {
    const newNotice: GuardianNotice = {
      ...notice,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.notices = [newNotice, ...this.notices];
    this.persist('notices', this.notices);

    // Sync to Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('guardian_notices')
        .insert(mappers.notice.toDb(newNotice))
        .then(({ error }) => {
          if (error) console.error('Supabase error inserting notice:', error);
        });
    }

    this.recordAudit({
      schoolId: notice.schoolId,
      userId,
      personName: authorName,
      role,
      action: 'SEND_GUARDIAN_COMMUNICATION',
      resource: 'GUARDIAN_COMMUNICATION',
      resourceId: newNotice.id,
      details: `Mengirim komunikasi "${notice.title}" tipe ${notice.type}`
    });

    this.notify();
    return newNotice;
  }

  public acknowledgeNotice(noticeId: string, personId: string, replyText?: string) {
    let targetNotice: GuardianNotice | undefined;

    this.notices = this.notices.map(n => {
      if (n.id === noticeId) {
        targetNotice = {
          ...n,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedByPersonId: personId,
          guardianReply: replyText || n.guardianReply
        };
        return targetNotice;
      }
      return n;
    });
    this.persist('notices', this.notices);

    // Sync to Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase && targetNotice) {
      supabase.from('guardian_notices')
        .update({
          acknowledged_at: targetNotice.acknowledgedAt || null,
          acknowledged_by_person_id: targetNotice.acknowledgedByPersonId || null,
          guardian_reply: targetNotice.guardianReply || null
        })
        .eq('id', noticeId)
        .then(({ error }) => {
          if (error) console.error('Supabase error acknowledging notice:', error);
        });
    }

    if (targetNotice) {
      this.recordAudit({
        schoolId: targetNotice.schoolId,
        userId: personId,
        personName: 'Orang Tua / Wali',
        role: 'GUARDIAN',
        action: 'ACKNOWLEDGE_NOTICE',
        resource: 'GUARDIAN_COMMUNICATION',
        resourceId: noticeId,
        details: 'Orang tua menandatangani tanda terima dan mengirim umpan balik.'
      });
    }

    this.notify();
  }

  // ----------------------------------------------------
  // DEVELOPMENT MILESTONES & CAPAIAN
  // ----------------------------------------------------
  public getMilestones(): DevelopmentalMilestone[] {
    return [...this.milestones];
  }

  // ----------------------------------------------------
  // PROGRESS REPORTS (LPPA / RAPOR) & V2.1.5 RPC SUITE
  // ----------------------------------------------------
  public getProgressReports(schoolId?: string, academicYearId?: string): StudentProgressReport[] {
    return this.progressReports.filter(r => 
      (!schoolId || r.schoolId === schoolId) &&
      (!academicYearId || r.academicYearId === academicYearId)
    );
  }

  public getStudentProgressReports(schoolId?: string, academicYearId?: string): StudentProgressReport[] {
    return this.getProgressReports(schoolId, academicYearId);
  }

  public getProgressReport(studentId: string, academicYearId?: string, semester?: string): StudentProgressReport | undefined {
    return this.progressReports.find(r => 
      r.studentId === studentId &&
      (!academicYearId || r.academicYearId === academicYearId) &&
      (!semester || r.semester === semester)
    );
  }

  public async saveProgressReportDraft(report: StudentProgressReport): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_save_progress_report_draft', {
        p_report_id: report.id,
        p_school_id: report.schoolId,
        p_student_id: report.studentId,
        p_academic_year_id: report.academicYearId,
        p_semester: report.semester,
        p_summary_notes: report.summaryNotes,
        p_physical_health_notes: report.physicalHealthNotes,
        p_attendance_summary: report.attendanceSummary,
        p_homeroom_feedback: report.homeroomFeedback
      });

      if (error) {
        console.error('RPC Error saving draft:', error);
        return { success: false, error: error.message };
      }
    }

    // Update local store
    const existingIndex = this.progressReports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      this.progressReports[existingIndex] = { ...report, status: 'DRAFT' };
    } else {
      this.progressReports.push({ ...report, status: 'DRAFT' });
    }
    this.persist('progress_reports', this.progressReports);
    this.notify();
    return { success: true };
  }

  public async submitReportForReview(reportId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_submit_report_for_review', {
        p_report_id: reportId
      });
      if (error) {
        console.error('RPC Error submitting report:', error);
        return { success: false, error: error.message };
      }
    }

    this.progressReports = this.progressReports.map(r => 
      r.id === reportId ? { ...r, status: 'READY_FOR_REVIEW' } : r
    );
    this.persist('progress_reports', this.progressReports);
    this.notify();
    return { success: true };
  }

  public async approveProgressReport(reportId: string, approvalNotes?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_approve_progress_report', {
        p_report_id: reportId,
        p_approval_notes: approvalNotes || null
      });
      if (error) {
        console.error('RPC Error approving report:', error);
        return { success: false, error: error.message };
      }
    }

    const existingIndex = this.progressReports.findIndex(r => r.id === reportId);
    if (existingIndex >= 0) {
      this.progressReports[existingIndex] = { 
        ...this.progressReports[existingIndex], 
        status: 'APPROVED', 
        headmasterApprovalDate: new Date().toISOString(),
        homeroomFeedback: approvalNotes || this.progressReports[existingIndex].homeroomFeedback 
      };
    } else {
      const rawParts = reportId.split('_');
      this.progressReports.push({
        id: reportId,
        schoolId: rawParts[1] || 'sch_tk_yapendik_01',
        studentId: rawParts[2] || '',
        academicYearId: 'ay_2025_2026',
        semester: 'GANJIL',
        evaluatedByPersonId: 'per_teacher_siti',
        evaluatedAt: new Date().toISOString(),
        status: 'APPROVED',
        summaryNotes: [],
        attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
        physicalHealthNotes: { heightCm: 106, weightKg: 18.5, headCircumferenceCm: 50.2, visionHearingHealth: 'Baik' },
        homeroomFeedback: approvalNotes || 'Disahkan Kepala Sekolah.',
        headmasterApprovalDate: new Date().toISOString()
      });
    }
    this.persist('progress_reports', this.progressReports);
    this.notify();
    return { success: true };
  }

  public async publishProgressReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_publish_progress_report', {
        p_report_id: reportId
      });
      if (error) {
        console.error('RPC Error publishing report:', error);
        return { success: false, error: error.message };
      }
    }

    const existingIndex = this.progressReports.findIndex(r => r.id === reportId);
    if (existingIndex >= 0) {
      this.progressReports[existingIndex] = { 
        ...this.progressReports[existingIndex], 
        status: 'PUBLISHED'
      };
    }
    this.persist('progress_reports', this.progressReports);
    this.notify();
    return { success: true };
  }

  // ==============================================================================
  // STAGE 2: GOVERNED PROVISIONING DOMAIN COMMANDS & READINESS ENGINE
  // ==============================================================================

  public evaluateSchoolReadinessLocal(schoolId: string): SchoolReadinessResult {
    const school = this.schools.find(s => s.id === schoolId);
    const blockers: string[] = [];

    const gate1 = school?.status === 'ACTIVE';
    if (!gate1) blockers.push('Gate 1: Status hukum sekolah belum ACTIVE');

    const activeYears = this.academicYears.filter(a => a.schoolId === schoolId && a.isActive);
    const gate2 = activeYears.length === 1;
    if (!gate2) blockers.push('Gate 2: Belum ada tepat 1 Tahun Akademik yang aktif');

    const gate3 = gate2 && !!activeYears[0].semester;
    if (!gate3) blockers.push('Gate 3: Semester/Periode Akademik belum terdefinisi');

    const gate4 = !!school?.headmasterPersonId;
    if (!gate4) blockers.push('Gate 4: Kepala Sekolah belum diangkat/ditetapkan');

    const staffedClasses = this.classes.filter(c => c.schoolId === schoolId && c.isActive && !!c.homeroomTeacherId);
    const gate5 = staffedClasses.length >= 1;
    if (!gate5) blockers.push('Gate 5: Belum ada Rombel aktif dengan Guru Wali Kelas yang ditugaskan');

    const placedStudents = this.students.filter(s => s.schoolId === schoolId && s.status === 'ACTIVE' && !!s.currentClassId);
    const gate6 = placedStudents.length >= 1;
    if (!gate6) blockers.push('Gate 6: Belum ada Siswa aktif yang ditempatkan pada Rombel');

    const isReady = gate1 && gate2 && gate3 && gate4 && gate5 && gate6;
    const status = isReady ? 'READY' : 'NOT_READY';

    // Update school operational readiness state
    if (school && school.operationalReadiness !== status) {
      school.operationalReadiness = status;
      this.persist('schools', this.schools);
      this.notify();
    }

    return {
      schoolId,
      schoolName: school?.name || '',
      isReady,
      status,
      gates: {
        gate1_legalActive: gate1,
        gate2_academicYear: gate2,
        gate3_academicPeriod: gate3,
        gate4_headmaster: gate4,
        gate5_staffedClassroom: gate5,
        gate6_placedStudents: gate6
      },
      blockers,
      evaluatedAt: new Date().toISOString()
    };
  }

  public async evaluateSchoolReadiness(schoolId: string): Promise<SchoolReadinessResult> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.rpc('rpc_evaluate_school_readiness', {
        p_school_id: schoolId
      });
      if (!error && data) {
        const school = this.schools.find(s => s.id === schoolId);
        if (school) {
          school.operationalReadiness = data.status;
          this.persist('schools', this.schools);
          this.notify();
        }
        return data as SchoolReadinessResult;
      }
    }
    return this.evaluateSchoolReadinessLocal(schoolId);
  }

  public async createSchoolCommand(data: Omit<School, 'createdAt'>): Promise<{ success: boolean; school?: School; error?: string; readiness?: SchoolReadinessResult }> {
    const newSchool: School = {
      ...data,
      status: 'ACTIVE',
      operationalReadiness: 'NOT_READY',
      createdAt: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: rpcRes, error } = await supabase.rpc('rpc_create_school', {
        p_id: newSchool.id,
        p_npsn: newSchool.npsn,
        p_name: newSchool.name,
        p_level: newSchool.level || 'TK',
        p_sub_type: newSchool.subType || 'STANDARD',
        p_address: newSchool.address || '',
        p_city: newSchool.city || '',
        p_province: newSchool.province || '',
        p_phone: newSchool.phone || '',
        p_email: newSchool.email || ''
      });
      if (error) {
        console.error('Error establishing school on Supabase RPC:', error);
        return { success: false, error: error.message };
      }
    }

    this.schools.push(newSchool);
    this.persist('schools', this.schools);

    this.recordAudit({
      schoolId: newSchool.id,
      userId: 'usr_superadmin_01',
      personName: 'Dr. Andreas Hendrawan',
      role: 'YAPENDIK_SUPERADMIN',
      action: 'ESTABLISH_SCHOOL',
      resource: 'schools',
      resourceId: newSchool.id,
      details: `Unit Sekolah Baru Didirikan: ${newSchool.name} (NPSN: ${newSchool.npsn})`
    });

    const readiness = this.evaluateSchoolReadinessLocal(newSchool.id);
    this.notify();
    return { success: true, school: newSchool, readiness };
  }

  public async assignHeadmasterCommand(schoolId: string, headmasterPersonId: string): Promise<{ success: boolean; error?: string; readiness?: SchoolReadinessResult }> {
    const school = this.schools.find(s => s.id === schoolId);
    if (!school) return { success: false, error: 'School not found' };

    school.headmasterPersonId = headmasterPersonId;

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('rpc_assign_headmaster', {
        p_school_id: schoolId,
        p_person_id: headmasterPersonId
      });
      if (error) {
        console.error('Error assigning headmaster on Supabase RPC:', error);
        return { success: false, error: error.message };
      }
    }

    this.persist('schools', this.schools);

    this.recordAudit({
      schoolId: schoolId,
      userId: 'usr_superadmin_01',
      personName: 'Dr. Andreas Hendrawan',
      role: 'YAPENDIK_SUPERADMIN',
      action: 'ASSIGN_HEADMASTER',
      resource: 'schools',
      resourceId: schoolId,
      details: `Pengangkatan Kepala Sekolah Unit: ${headmasterPersonId}`
    });

    const readiness = this.evaluateSchoolReadinessLocal(schoolId);
    this.notify();
    return { success: true, readiness };
  }

  public async initializeAcademicYearCommand(data: AcademicYear): Promise<{ success: boolean; error?: string; readiness?: SchoolReadinessResult }> {
    this.academicYears = this.academicYears.map(a => 
      a.schoolId === data.schoolId ? { ...a, isActive: false } : a
    );
    this.academicYears.push({ ...data, isActive: true });
    this.persist('academic_years', this.academicYears);

    const school = this.schools.find(s => s.id === data.schoolId);
    if (school) {
      school.academicYearActiveId = data.id;
      this.persist('schools', this.schools);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('rpc_initialize_academic_year', {
        p_id: data.id,
        p_school_id: data.schoolId,
        p_name: data.name,
        p_semester: data.semester,
        p_start_date: data.startDate,
        p_end_date: data.endDate
      });
      if (error) {
        console.error('Error initializing academic year on Supabase RPC:', error);
        return { success: false, error: error.message };
      }
    }

    this.recordAudit({
      schoolId: data.schoolId,
      userId: 'usr_superadmin_01',
      personName: 'Dr. Andreas Hendrawan',
      role: 'YAPENDIK_SUPERADMIN',
      action: 'INITIALIZE_ACADEMIC_YEAR',
      resource: 'academic_years',
      resourceId: data.id,
      details: `Inisialisasi Tahun Akademik: ${data.name} (${data.semester})`
    });

    const readiness = this.evaluateSchoolReadinessLocal(data.schoolId);
    this.notify();
    return { success: true, readiness };
  }

  public async createClassroomCommand(data: ClassRoom): Promise<{ success: boolean; error?: string; readiness?: SchoolReadinessResult }> {
    this.classes.push(data);
    this.persist('classes', this.classes);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('rpc_create_classroom', {
        p_id: data.id,
        p_school_id: data.schoolId,
        p_academic_year_id: data.academicYearId,
        p_name: data.name,
        p_age_group: data.ageGroup,
        p_capacity: data.capacity,
        p_homeroom_teacher_person_id: data.homeroomTeacherId || null
      });
      if (error) {
        console.error('Error creating classroom on Supabase RPC:', error);
        return { success: false, error: error.message };
      }
    }

    this.recordAudit({
      schoolId: data.schoolId,
      userId: 'usr_headmaster_01',
      personName: 'Kepala Sekolah',
      role: 'HEADMASTER',
      action: 'CREATE_CLASSROOM',
      resource: 'classes',
      resourceId: data.id,
      details: `Pembentukan Rombel: ${data.name} (Kapasitas: ${data.capacity})`
    });

    const readiness = this.evaluateSchoolReadinessLocal(data.schoolId);
    this.notify();
    return { success: true, readiness };
  }

  public async admitAndPlaceStudentCommand(params: {
    schoolId: string;
    classId: string;
    childPerson: Person;
    student: StudentProfile;
    guardianPerson?: Person;
    guardianRelationship?: GuardianRelationship;
  }): Promise<{ success: boolean; studentId?: string; error?: string; readiness?: SchoolReadinessResult }> {
    const { schoolId, classId, childPerson, student, guardianPerson, guardianRelationship } = params;

    this.persons.push(childPerson);
    this.persist('persons', this.persons);

    const newStudent: StudentProfile = {
      ...student,
      personId: childPerson.id,
      schoolId: schoolId,
      currentClassId: classId,
      status: 'ACTIVE'
    };
    this.students.push(newStudent);
    this.persist('students', this.students);

    if (guardianPerson && guardianRelationship) {
      this.persons.push(guardianPerson);
      this.persist('persons', this.persons);

      this.guardianRelationships.push({
        ...guardianRelationship,
        studentPersonId: childPerson.id,
        guardianPersonId: guardianPerson.id
      });
      this.persist('guardian_relationships', this.guardianRelationships);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.rpc('rpc_admit_and_place_student', {
        p_school_id: schoolId,
        p_target_class_id: classId,
        p_child_person: {
          id: childPerson.id,
          full_name: childPerson.fullName,
          preferred_name: childPerson.preferredName || childPerson.fullName,
          gender: childPerson.gender,
          birth_date: childPerson.birthDate,
          birth_place: childPerson.birthPlace || null,
          address: childPerson.address || null
        },
        p_student_info: {
          id: newStudent.id,
          nis: newStudent.nis || null,
          nisn: newStudent.nisn || null,
          enrollment_date: newStudent.enrollmentDate || new Date().toISOString().split('T')[0]
        },
        p_guardian_person: null,
        p_guardian_relation: null
      });
      if (error) {
        console.error('Error admitting and placing student on Supabase RPC:', error);
        return { success: false, error: error.message };
      }
    }

    this.recordAudit({
      schoolId: schoolId,
      userId: 'usr_headmaster_01',
      personName: 'Kepala Sekolah',
      role: 'HEADMASTER',
      action: 'ADMIT_AND_PLACE_STUDENT',
      resource: 'students',
      resourceId: newStudent.id,
      details: `Admisi & Penempatan Siswa: ${childPerson.fullName} ke Rombel ${classId}`
    });

    const readiness = this.evaluateSchoolReadinessLocal(schoolId);
    this.notify();
    return { success: true, studentId: newStudent.id, readiness };
  }

  // ----------------------------------------------------
  // AUDIT LOGS (GOVERNED CLOUD RPC INTEGRATION)
  // ----------------------------------------------------
  public getAuditLogs(schoolId?: string): AuditLogEntry[] {
    if (schoolId) {
      return this.auditLogs.filter(a => a.schoolId === schoolId);
    }
    return [...this.auditLogs];
  }

  public recordAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const log: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs = [log, ...this.auditLogs].slice(0, 100);
    this.persist('audit_logs', this.auditLogs);

    // Invoke governed SECURITY DEFINER RPC on Supabase Cloud
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.rpc('rpc_log_client_event', {
        p_school_id: entry.schoolId,
        p_action: entry.action,
        p_resource: entry.resource,
        p_resource_id: entry.resourceId,
        p_details: entry.details || ''
      }).then(
        ({ error }: { error: any }) => {
          if (error) {
            console.warn('Could not record cloud audit event via RPC:', error.message);
          }
        },
        (err: any) => {
          console.warn('Network error recording cloud audit:', err);
        }
      );
    }
  }
}

export const db = new DatabaseEngine();
