/**
 * Yapendik School OS — Contextual Authorization Test Suite
 * Includes Positive and Strict Negative Authorization Testing
 */

import { evaluateAuthorization, SecurityContext, AuthorizationRequest } from '../auth/authorization';

export interface TestResult {
  id: string;
  name: string;
  category: 'POSITIVE' | 'NEGATIVE_CROSS_SCHOOL' | 'NEGATIVE_ROLE_ESCALATION' | 'NEGATIVE_GUARDIAN_PII';
  expected: 'ALLOW' | 'DENY';
  actual: 'ALLOW' | 'DENY';
  passed: boolean;
  code: string;
  reason: string;
  scenario: string;
}

export function runAuthorizationTestSuite(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const testCases: {
    id: string;
    name: string;
    category: 'POSITIVE' | 'NEGATIVE_CROSS_SCHOOL' | 'NEGATIVE_ROLE_ESCALATION' | 'NEGATIVE_GUARDIAN_PII';
    expected: 'ALLOW' | 'DENY';
    req: AuthorizationRequest;
    scenario: string;
  }[] = [
    // ----------------------------------------------------
    // 1. POSITIVE TESTS (Legitimate Scenarios)
    // ----------------------------------------------------
    {
      id: 'auth_pos_01',
      name: 'Guru TK A merekam observasi siswa di kelasnya sendiri',
      category: 'POSITIVE',
      expected: 'ALLOW',
      scenario: 'Bu Siti (Guru TK 01) membuat catatan observasi untuk Kenzo (Siswa TK 01)',
      req: {
        context: {
          userId: 'user_teacher_siti',
          personId: 'per_teacher_siti',
          personName: 'Siti Rahmawati, S.Pd',
          role: 'TEACHER',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: ['cls_tka_01'],
          guardianChildrenPersonIds: [],
          isSuperAdmin: false
        },
        action: 'CREATE',
        resource: 'STUDENT_OBSERVATION',
        resourceSchoolId: 'sch_tk_yapendik_01',
        targetClassId: 'cls_tka_01',
        targetStudentId: 'stu_kenzo_01'
      }
    },
    {
      id: 'auth_pos_02',
      name: 'Orang tua melihat catatan harian anak kandung yang sah',
      category: 'POSITIVE',
      expected: 'ALLOW',
      scenario: 'Pak Budi (Wali Kenzo) melihat catatan observasi publik milik Kenzo (per_child_kenzo)',
      req: {
        context: {
          userId: 'user_parent_budi',
          personId: 'per_parent_budi',
          personName: 'Budi Santoso, S.T.',
          role: 'GUARDIAN',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: [],
          guardianChildrenPersonIds: ['per_child_kenzo'],
          isSuperAdmin: false
        },
        action: 'VIEW',
        resource: 'STUDENT_OBSERVATION',
        resourceSchoolId: 'sch_tk_yapendik_01',
        targetStudentPersonId: 'per_child_kenzo',
        isConfidential: false
      }
    },
    {
      id: 'auth_pos_03',
      name: 'Kepala Sekolah menyetujui laporan perkembangan TK',
      category: 'POSITIVE',
      expected: 'ALLOW',
      scenario: 'Ibu Esther (Kepala Sekolah TK 01) memvalidasi & approve Rapor LPPA',
      req: {
        context: {
          userId: 'user_headmaster_esther',
          personId: 'per_headmaster_esther',
          personName: 'Dra. Esther Nugroho, M.Pd',
          role: 'HEADMASTER',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: ['cls_tka_01', 'cls_tkb_01'],
          guardianChildrenPersonIds: [],
          isSuperAdmin: false
        },
        action: 'APPROVE',
        resource: 'STUDENT_DEVELOPMENT',
        resourceSchoolId: 'sch_tk_yapendik_01'
      }
    },

    // ----------------------------------------------------
    // 2. NEGATIVE TESTS: CROSS-SCHOOL BOUNDARY ISOLATION
    // ----------------------------------------------------
    {
      id: 'auth_neg_cross_01',
      name: 'Guru TK 02 mencoba merekam data di TK 01 (Cross-School Breach)',
      category: 'NEGATIVE_CROSS_SCHOOL',
      expected: 'DENY',
      scenario: 'Bu Diana (Guru di TK 02 Kebayoran) mencoba membuat observasi di TK 01 Menteng',
      req: {
        context: {
          userId: 'user_teacher_diana_tk2',
          personId: 'per_teacher_diana',
          personName: 'Diana Sari, S.Pd',
          role: 'TEACHER',
          activeSchoolId: 'sch_tk_yapendik_02', // School 2
          assignedClasses: ['cls_tka_02'],
          guardianChildrenPersonIds: [],
          isSuperAdmin: false
        },
        action: 'CREATE',
        resource: 'STUDENT_OBSERVATION',
        resourceSchoolId: 'sch_tk_yapendik_01', // Target School 1
        targetClassId: 'cls_tka_01'
      }
    },
    {
      id: 'auth_neg_cross_02',
      name: 'Kepala Sekolah TK 02 mencoba melihat Log Audit TK 01',
      category: 'NEGATIVE_CROSS_SCHOOL',
      expected: 'DENY',
      scenario: 'Kepala Sekolah TK 02 mengakses Log Audit internal TK 01 Menteng',
      req: {
        context: {
          userId: 'user_headmaster_tk2',
          personId: 'per_headmaster_johan',
          personName: 'Drs. Johan, M.Pd',
          role: 'HEADMASTER',
          activeSchoolId: 'sch_tk_yapendik_02',
          assignedClasses: [],
          guardianChildrenPersonIds: [],
          isSuperAdmin: false
        },
        action: 'VIEW',
        resource: 'AUDIT_LOG',
        resourceSchoolId: 'sch_tk_yapendik_01'
      }
    },

    // ----------------------------------------------------
    // 3. NEGATIVE TESTS: GUARDIAN CHILD PII PROTECTION
    // ----------------------------------------------------
    {
      id: 'auth_neg_guardian_pii_01',
      name: 'Orang tua mencoba mengakses catatan observasi anak orang lain',
      category: 'NEGATIVE_GUARDIAN_PII',
      expected: 'DENY',
      scenario: 'Pak Budi (Wali Ananda Kenzo) mencoba mengakses data observasi Ananda Alina',
      req: {
        context: {
          userId: 'user_parent_budi',
          personId: 'per_parent_budi',
          personName: 'Budi Santoso, S.T.',
          role: 'GUARDIAN',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: [],
          guardianChildrenPersonIds: ['per_child_kenzo'], // Only Kenzo!
          isSuperAdmin: false
        },
        action: 'VIEW',
        resource: 'STUDENT_OBSERVATION',
        resourceSchoolId: 'sch_tk_yapendik_01',
        targetStudentPersonId: 'per_child_alina', // Alina's ID!
        isConfidential: false
      }
    },
    {
      id: 'auth_neg_guardian_pii_02',
      name: 'Orang tua mencoba membaca catatan observasi rahasia internal guru',
      category: 'NEGATIVE_GUARDIAN_PII',
      expected: 'DENY',
      scenario: 'Pak Budi mencoba membuka catatan observasi Kenzo yang ditandai isConfidential=true',
      req: {
        context: {
          userId: 'user_parent_budi',
          personId: 'per_parent_budi',
          personName: 'Budi Santoso, S.T.',
          role: 'GUARDIAN',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: [],
          guardianChildrenPersonIds: ['per_child_kenzo'],
          isSuperAdmin: false
        },
        action: 'VIEW',
        resource: 'STUDENT_OBSERVATION',
        resourceSchoolId: 'sch_tk_yapendik_01',
        targetStudentPersonId: 'per_child_kenzo',
        isConfidential: true // Restricted
      }
    },

    // ----------------------------------------------------
    // 4. NEGATIVE TESTS: ROLE ESCALATION & UNPRIVILEGED ACTIONS
    // ----------------------------------------------------
    {
      id: 'auth_neg_role_01',
      name: 'Guru mencoba menyetujui final Rapor LPPA tanpa wewenang Kepala Sekolah',
      category: 'NEGATIVE_ROLE_ESCALATION',
      expected: 'DENY',
      scenario: 'Bu Siti (Guru) memaksakan aksi APPROVE pada LPPA (Hanya wewenang Kepala Sekolah)',
      req: {
        context: {
          userId: 'user_teacher_siti',
          personId: 'per_teacher_siti',
          personName: 'Siti Rahmawati, S.Pd',
          role: 'TEACHER',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: ['cls_tka_01'],
          guardianChildrenPersonIds: [],
          isSuperAdmin: false
        },
        action: 'APPROVE',
        resource: 'STUDENT_DEVELOPMENT',
        resourceSchoolId: 'sch_tk_yapendik_01'
      }
    },
    {
      id: 'auth_neg_role_02',
      name: 'Orang tua mencoba mengubah/menghapus Rencana Aktivitas Harian Guru',
      category: 'NEGATIVE_ROLE_ESCALATION',
      expected: 'DENY',
      scenario: 'Pak Budi mencoba menghapus rencana kegiatan harian guru',
      req: {
        context: {
          userId: 'user_parent_budi',
          personId: 'per_parent_budi',
          personName: 'Budi Santoso, S.T.',
          role: 'GUARDIAN',
          activeSchoolId: 'sch_tk_yapendik_01',
          assignedClasses: [],
          guardianChildrenPersonIds: ['per_child_kenzo'],
          isSuperAdmin: false
        },
        action: 'DELETE',
        resource: 'TEACHER_DAILY_WORK',
        resourceSchoolId: 'sch_tk_yapendik_01'
      }
    }
  ];

  const results: TestResult[] = testCases.map(tc => {
    const res = evaluateAuthorization(tc.req);
    const actualStatus = res.granted ? 'ALLOW' : 'DENY';
    const passed = actualStatus === tc.expected;

    return {
      id: tc.id,
      name: tc.name,
      category: tc.category,
      expected: tc.expected,
      actual: actualStatus,
      passed,
      code: res.code,
      reason: res.reason,
      scenario: tc.scenario
    };
  });

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  return {
    total,
    passed,
    failed,
    results
  };
}
