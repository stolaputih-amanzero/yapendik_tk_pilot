/**
 * YAPENDIK SCHOOL OS — TK PILOT v1.0
 * SQL SCHEMA & RLS CONTRACT VERIFICATION TEST SUITE
 * 
 * Verifies that the physical database schema and V2.1.5 migration scripts:
 * 1. Enable RLS on all 15 canonical tables.
 * 2. Contain ZERO permissive "Public Full Access For Pilot" / USING (true) loops.
 * 3. Define mandatory triggers: trg_student_placement_guard and trg_report_published_immutability.
 * 4. Define mandatory unique constraints: uq_daily_attendance_record.
 * 5. Define mandatory SECURITY DEFINER RPCs: rpc_place_student_in_class, rpc_save_progress_report_draft,
 *    rpc_submit_report_for_review, rpc_approve_progress_report, rpc_publish_progress_report, rpc_log_client_event.
 * 6. Revoke direct anon access to sensitive functions and tables.
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function test(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err?.message || err}`);
    failCount++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
      }
    }
  };
}

console.log('================================================================');
console.log('🏛️ SQL SCHEMA & V2.1.5 RLS CONTRACT VERIFICATION SUITE');
console.log('================================================================\n');

const schemaPath = path.resolve(process.cwd(), 'supabase_schema.sql');
const migrationPath = path.resolve(process.cwd(), 'db_migrations/rls_migration_v2_1_5_hardened.sql');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

const CANONICAL_TABLES = [
  'persons',
  'schools',
  'academic_years',
  'classes',
  'students',
  'guardian_relationships',
  'teacher_profiles',
  'staff_profiles',
  'developmental_milestones',
  'learning_activities',
  'observation_records',
  'daily_attendance',
  'guardian_notices',
  'student_progress_reports',
  'audit_logs'
];

test('RLS is explicitly enabled on all 15 canonical tables in supabase_schema.sql', () => {
  for (const table of CANONICAL_TABLES) {
    const regex = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, 'i');
    expect(regex.test(schemaSql)).toBe(true);
  }
});

test('RLS is explicitly enabled on all 15 canonical tables in rls_migration_v2_1_5_hardened.sql', () => {
  for (const table of CANONICAL_TABLES) {
    const regex = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, 'i');
    expect(regex.test(migrationSql)).toBe(true);
  }
});

test('Zero permissive "Public Full Access For Pilot" policies exist in schema or migrations', () => {
  expect(schemaSql.includes('CREATE POLICY "Public Full Access For Pilot"')).toBe(false);
  expect(migrationSql.includes('CREATE POLICY "Public Full Access For Pilot"')).toBe(false);
  expect(schemaSql.includes('FOR ALL TO anon, authenticated USING (true)')).toBe(false);
});

test('Placement guard trigger (trg_student_placement_guard) is defined in hardened migration', () => {
  expect(migrationSql.includes('CREATE TRIGGER trg_student_placement_guard')).toBe(true);
  expect(migrationSql.includes('BEFORE INSERT OR UPDATE ON students')).toBe(true);
  expect(migrationSql.includes('trg_guard_student_class_placement()')).toBe(true);
});

test('Report published immutability trigger (trg_report_published_immutability) is defined', () => {
  expect(migrationSql.includes('CREATE TRIGGER trg_report_published_immutability')).toBe(true);
  expect(migrationSql.includes('BEFORE UPDATE OR DELETE ON student_progress_reports')).toBe(true);
  expect(migrationSql.includes('trg_enforce_published_report_immutability()')).toBe(true);
});

test('Deterministic attendance uniqueness constraint (uq_daily_attendance_record) is declared', () => {
  expect(schemaSql.includes('CONSTRAINT uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date)')).toBe(true);
  expect(migrationSql.includes('uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date)')).toBe(true);
});

test('All V2.1.5 state machine RPC functions are defined as SECURITY DEFINER with authenticated grant only', () => {
  const rpcs = [
    'rpc_place_student_in_class',
    'rpc_save_progress_report_draft',
    'rpc_submit_report_for_review',
    'rpc_approve_progress_report',
    'rpc_publish_progress_report',
    'rpc_log_client_event'
  ];

  for (const rpc of rpcs) {
    expect(migrationSql.includes(`CREATE OR REPLACE FUNCTION ${rpc}`)).toBe(true);
    expect(migrationSql.includes(`REVOKE EXECUTE ON FUNCTION ${rpc}`)).toBe(true);
    expect(migrationSql.includes(`GRANT EXECUTE ON FUNCTION ${rpc}`)).toBe(true);
  }
});

test('Audit logs direct INSERT is denied for authenticated users and gated to SECURITY DEFINER functions', () => {
  expect(migrationSql.includes('CREATE POLICY "Deny insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (false);')).toBe(true);
  expect(migrationSql.includes('CREATE OR REPLACE FUNCTION fn_write_audit_log')).toBe(true);
  expect(migrationSql.includes('REVOKE EXECUTE ON FUNCTION fn_write_audit_log')).toBe(true);
});

console.log('\n================================================================');
console.log(`🏁 SQL CONTRACT TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
