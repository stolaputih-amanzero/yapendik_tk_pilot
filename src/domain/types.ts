/**
 * Yapendik School OS — TK Pilot
 * Canonical Domain Models & Entity Definitions
 * Follows the Yapendik Operating System Constitution:
 * Canonical Entity + Contextual Projections (Person != User != Student != Teacher)
 */

export type Role = 
  | 'YAPENDIK_SUPERADMIN'
  | 'HEADMASTER'
  | 'TEACHER'
  | 'ASSISTANT_TEACHER'
  | 'STAFF'
  | 'GUARDIAN'
  | 'APPLICANT';

export type SchoolLevel = 'TK' | 'SD' | 'SMP' | 'SMA';

export type DevelopmentDomain = 
  | 'NILAI_AGAMA_MORAL'
  | 'FISIK_MOTORIK'
  | 'KOGNITIF'
  | 'BAHASA'
  | 'SOSIAL_EMOSIONAL'
  | 'SENI';

export type MilestoneRating = 
  | 'BB'  // Belum Berkembang
  | 'MB'  // Mulai Berkembang
  | 'BSH' // Berkembang Sesuai Harapan
  | 'BSB'; // Berkembang Sangat Baik

export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';

// ----------------------------------------------------
// 1. CANONICAL PERSON & IDENTITY
// ----------------------------------------------------
export interface Person {
  id: string;
  nationalIdNumber?: string; // NIK
  fullName: string;
  preferredName: string;
  gender: 'MALE' | 'FEMALE';
  birthDate?: string; // YYYY-MM-DD
  birthPlace?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  personId: string;
  email: string;
  role: Role;
  assignedSchoolId: string;
  active: boolean;
  lastLoginAt?: string;
}

// ----------------------------------------------------
// 2. INSTITUTIONAL & ACADEMIC HIERARCHY
// ----------------------------------------------------
export interface School {
  id: string;
  npsn: string; // Nomor Pokok Sekolah Nasional
  name: string;
  level: SchoolLevel;
  subType: 'TK_A' | 'TK_B' | 'PAUD_TERPADU' | 'STANDARD';
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  headmasterPersonId: string;
  academicYearActiveId: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  operationalReadiness?: 'NOT_READY' | 'READY';
  createdAt: string;
}

export interface SchoolReadinessResult {
  schoolId: string;
  schoolName: string;
  isReady: boolean;
  status: 'READY' | 'NOT_READY';
  gates: {
    gate1_legalActive: boolean;
    gate2_academicYear: boolean;
    gate3_academicPeriod: boolean;
    gate4_headmaster: boolean;
    gate5_staffedClassroom: boolean;
    gate6_placedStudents: boolean;
  };
  blockers: string[];
  evaluatedAt: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026/2027"
  semester: 'GANJIL' | 'GENAP';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ClassRoom {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g., "Kelompok A (Bintang Ceria)", "Kelompok B (Matahari)"
  ageGroup: 'TK_A_4_5' | 'TK_B_5_6' | 'PLAYGROUP';
  roomNumber: string;
  capacity: number;
  homeroomTeacherId: string; // Person ID of teacher
  coTeacherId?: string;
  isActive: boolean;
}

// ----------------------------------------------------
// 3. CONTEXTUAL PROJECTIONS & RELATIONSHIPS
// ----------------------------------------------------
export interface StudentProfile {
  id: string; // Student ID
  personId: string; // Reference to canonical Person
  schoolId: string;
  nisn?: string;
  nis: string;
  currentClassId: string;
  bloodType?: 'A' | 'B' | 'AB' | 'O';
  allergies?: string;
  specialNeedsNotes?: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'INACTIVE';
}

export interface GuardianRelationship {
  id: string;
  studentPersonId: string; // Canonical person of child
  guardianPersonId: string; // Canonical person of parent
  relationshipType: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  isPrimaryContact: boolean;
  isLegalGuardian: boolean;
  emergencyContactPriority: number;
}

export interface TeacherProfile {
  id: string;
  personId: string;
  schoolId: string;
  nuptk?: string;
  specialization: string;
  employmentType: 'TETAP' | 'KONTRAK' | 'HONORER';
  joinDate: string;
  isActive: boolean;
}

// ----------------------------------------------------
// 4. TEACHER DAILY WORK & LEARNING ACTIVITIES
// ----------------------------------------------------
export interface LearningActivity {
  id: string;
  schoolId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  theme: string; // e.g., "Diriku / Tubuhku Ciptaan Tuhan"
  subTheme: string; // e.g., "Panca Indra dan Fungsinya"
  timeSlot: string; // e.g., "08:00 - 09:30"
  activityName: string;
  developmentalFocus: DevelopmentDomain[];
  materialsNeeded: string[];
  plannedSteps: string[];
  teacherReflection?: string;
  completed: boolean;
}

// ----------------------------------------------------
// 5. OBSERVATION & EVIDENCE (TK PILOT HEARTBEAT)
// ----------------------------------------------------
export interface ObservationRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string; // Student ID
  observerPersonId: string;
  observedAt: string; // ISO datetime
  domain: DevelopmentDomain;
  anecdoteDescription: string;
  behaviorTrigger?: string;
  childReaction?: string;
  teacherIntervention?: string;
  milestoneRating: MilestoneRating;
  indicatorsObserved: string[];
  photoEvidenceUrl?: string;
  isConfidentialToStaff: boolean;
  sharedWithGuardian: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// 6. DEVELOPMENT MILESTONES & CAPAIAN
// ----------------------------------------------------
export interface DevelopmentalMilestone {
  id: string;
  domain: DevelopmentDomain;
  ageGroup: 'TK_A_4_5' | 'TK_B_5_6';
  code: string; // e.g., "NAM.1.1"
  title: string;
  description: string;
  standardAssessmentGuidelines: string;
}

export interface StudentProgressReport {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  semester: 'GANJIL' | 'GENAP';
  evaluatedByPersonId: string;
  evaluatedAt: string;
  summaryNotes: {
    domain: DevelopmentDomain;
    rating: MilestoneRating;
    narrative: string;
    strengths: string;
    growthFocus: string;
  }[];
  physicalHealthNotes: {
    heightCm: number;
    weightKg: number;
    headCircumferenceCm?: number;
    visionHearingHealth: string;
  };
  attendanceSummary: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  homeroomFeedback: string;
  headmasterApprovalDate?: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
}

// ----------------------------------------------------
// 7. ATTENDANCE REGISTERS
// ----------------------------------------------------
export interface DailyAttendanceEntry {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  recordedByPersonId: string;
  recordedAt: string;
  temperatureCelsius?: number;
  arrivalMood?: 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS';
}

// ----------------------------------------------------
// 8. GUARDIAN COMMUNICATION (BUKU PENGHUBUNG)
// ----------------------------------------------------
export interface GuardianNotice {
  id: string;
  schoolId: string;
  classId?: string; // If general to class
  studentId?: string; // If specific to student
  authorPersonId: string;
  recipientPersonId?: string;
  type: 'DAILY_SUMMARY' | 'ANECDOTE_SHARE' | 'HEALTH_ALERT' | 'CLASS_ANNOUNCEMENT' | 'DIRECT_NOTE';
  title: string;
  content: string;
  requiresAcknowledgment: boolean;
  acknowledgedAt?: string;
  acknowledgedByPersonId?: string;
  guardianReply?: string;
  createdAt: string;
}

// ----------------------------------------------------
// 9. AUDIT LOGS (GOVERNANCE TRACEABILITY)
// ----------------------------------------------------
export interface AuditLogEntry {
  id: string;
  schoolId: string;
  userId: string;
  personName: string;
  role: Role;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}
