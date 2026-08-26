/**
 * Yapendik School OS — Contextual Authorization Model
 * 
 * Constitutional Principle:
 * "Contextual Authorization. USER + ROLE + SCHOOL CONTEXT + RELATIONSHIP + ACTION + RESOURCE"
 * Never trust a single role flag.
 */

import { Role, GuardianRelationship, StudentProfile, ClassRoom } from '../domain/types';

export type ActionType = 
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'APPROVE'
  | 'PUBLISH'
  | 'EXPORT'
  | 'ACKNOWLEDGE';

export type ResourceType = 
  | 'SCHOOL_PROFILE'
  | 'CLASS_ROSTER'
  | 'TEACHER_DAILY_WORK'
  | 'STUDENT_OBSERVATION'
  | 'STUDENT_DEVELOPMENT'
  | 'ATTENDANCE_REGISTER'
  | 'GUARDIAN_COMMUNICATION'
  | 'AUDIT_LOG';

export interface SecurityContext {
  userId: string;
  personId: string;
  personName: string;
  role: Role;
  activeSchoolId: string;
  assignedClasses: string[]; // Class IDs assigned to this teacher
  guardianChildrenPersonIds: string[]; // Canonical person IDs of children for guardian
  isSuperAdmin: boolean;
}

export interface AuthorizationRequest {
  context: SecurityContext;
  action: ActionType;
  resource: ResourceType;
  resourceSchoolId: string;
  targetClassId?: string;
  targetStudentId?: string;
  targetStudentPersonId?: string;
  targetAuthorPersonId?: string;
  isConfidential?: boolean;
}

export interface AuthorizationResult {
  granted: boolean;
  reason: string;
  code: 'ALLOW' | 'DENY_CROSS_SCHOOL' | 'DENY_INSUFFICIENT_ROLE' | 'DENY_NO_GUARDIAN_RELATIONSHIP' | 'DENY_CONFIDENTIAL_RESTRICTED' | 'DENY_CLASS_UNASSIGNED';
}

/**
 * Contextual Authorization Policy Engine
 */
export function evaluateAuthorization(req: AuthorizationRequest): AuthorizationResult {
  const { context, action, resource, resourceSchoolId, targetClassId, targetStudentPersonId, isConfidential } = req;

  // 1. Cross-School Boundary Enforcement
  if (context.role !== 'YAPENDIK_SUPERADMIN' && context.activeSchoolId !== resourceSchoolId) {
    return {
      granted: false,
      code: 'DENY_CROSS_SCHOOL',
      reason: `Akses ditolak: Pengguna di sekolah '${context.activeSchoolId}' tidak diizinkan mengakses data dari sekolah '${resourceSchoolId}'.`
    };
  }

  // 2. Superadmin Bypass within School Boundaries
  if (context.role === 'YAPENDIK_SUPERADMIN') {
    return {
      granted: true,
      code: 'ALLOW',
      reason: 'Akses diizinkan: Yapendik Superadmin memiliki hak tata kelola lintas institusi.'
    };
  }

  // 3. Headmaster Permissions (Full oversight within their active school)
  if (context.role === 'HEADMASTER') {
    return {
      granted: true,
      code: 'ALLOW',
      reason: 'Akses diizinkan: Kepala Sekolah memiliki hak pemantauan dan persetujuan di sekolah aktif.'
    };
  }

  // 4. Guardian Context & Child Relationship Isolation
  if (context.role === 'GUARDIAN') {
    // Guardians can only VIEW and ACKNOWLEDGE
    if (action !== 'VIEW' && action !== 'ACKNOWLEDGE') {
      return {
        granted: false,
        code: 'DENY_INSUFFICIENT_ROLE',
        reason: `Akses ditolak: Orang Tua / Wali tidak memiliki hak '${action}' pada '${resource}'.`
      };
    }

    // Guardians CANNOT view audit logs or full teacher daily work
    if (resource === 'AUDIT_LOG' || resource === 'TEACHER_DAILY_WORK' || resource === 'SCHOOL_PROFILE') {
      return {
        granted: false,
        code: 'DENY_INSUFFICIENT_ROLE',
        reason: `Akses ditolak: Sumber daya '${resource}' hanya untuk staf akademik.`
      };
    }

    // Child Data Boundary: Must be parent of this child
    if (targetStudentPersonId) {
      const isMyChild = context.guardianChildrenPersonIds.includes(targetStudentPersonId);
      if (!isMyChild) {
        return {
          granted: false,
          code: 'DENY_NO_GUARDIAN_RELATIONSHIP',
          reason: `Akses ditolak: Anda bukan orang tua / wali sah dari anak ini (ID: ${targetStudentPersonId}).`
        };
      }
    }

    // Confidential Observations are hidden from guardians
    if (resource === 'STUDENT_OBSERVATION' && isConfidential) {
      return {
        granted: false,
        code: 'DENY_CONFIDENTIAL_RESTRICTED',
        reason: 'Akses ditolak: Catatan observasi ini ditandai rahasia internal guru.'
      };
    }

    return {
      granted: true,
      code: 'ALLOW',
      reason: 'Akses diizinkan: Hubungan orang tua dan anak telah terverifikasi.'
    };
  }

  // 5. Teacher Permissions
  if (context.role === 'TEACHER' || context.role === 'ASSISTANT_TEACHER') {
    // Class assignment boundary: teachers cannot modify records of classes they are not assigned to
    if (targetClassId && context.assignedClasses.length > 0 && !context.assignedClasses.includes(targetClassId)) {
      return {
        granted: false,
        code: 'DENY_CLASS_UNASSIGNED',
        reason: `Akses ditolak: Anda tidak ditugaskan sebagai pendidik di rombel/kelas '${targetClassId}'.`
      };
    }

    // Teachers cannot delete audit logs or modify school profiles
    if (resource === 'AUDIT_LOG' && action !== 'VIEW') {
      return {
        granted: false,
        code: 'DENY_INSUFFICIENT_ROLE',
        reason: 'Akses ditolak: Log audit sistem bersifat immutable.'
      };
    }

    if (resource === 'SCHOOL_PROFILE' && (action === 'EDIT' || action === 'DELETE')) {
      return {
        granted: false,
        code: 'DENY_INSUFFICIENT_ROLE',
        reason: 'Akses ditolak: Hanya Kepala Sekolah yang dapat mengubah profil institusi.'
      };
    }

    // Publishing final LPPA Progress Report requires Headmaster approval
    if (resource === 'STUDENT_DEVELOPMENT' && action === 'APPROVE') {
      return {
        granted: false,
        code: 'DENY_INSUFFICIENT_ROLE',
        reason: 'Akses ditolak: Persetujuan akhir Rapor/LPPA memerlukan wewenang Kepala Sekolah.'
      };
    }

    return {
      granted: true,
      code: 'ALLOW',
      reason: `Akses diizinkan untuk pendidik (${context.role}) di kelas sekolah terkait.`
    };
  }

  // 6. Staff Permissions
  if (context.role === 'STAFF') {
    if (resource === 'ATTENDANCE_REGISTER' || resource === 'GUARDIAN_COMMUNICATION') {
      return {
        granted: true,
        code: 'ALLOW',
        reason: 'Akses diizinkan: Staf administrasi memiliki hak pencatatan operasional.'
      };
    }
    return {
      granted: false,
      code: 'DENY_INSUFFICIENT_ROLE',
      reason: 'Akses ditolak: Staf operasional tidak memiliki wewenang pedagogis.'
    };
  }

  return {
    granted: false,
    code: 'DENY_INSUFFICIENT_ROLE',
    reason: 'Akses ditolak: Konteks pengguna tidak memenuhi kebijakan otorisasi.'
  };
}
