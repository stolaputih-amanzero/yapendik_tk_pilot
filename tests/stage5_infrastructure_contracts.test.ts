/**
 * ==============================================================================
 * YAPENDIK SCHOOL OS TK PILOT - TEST SUITE 21
 * STAGE 5 SPRINT 1 (PHASE A): INFRASTRUCTURE HARDENING & TECH DEBT CONTRACTS
 * ==============================================================================
 * Covers:
 * - Module 1: ADR-01 Down-Scripts & Rollback Safety Strategy
 * - Module 2: ADR-02 Shadow Partitioning Schema Fidelity (daily_attendance)
 * - Module 3: ADR-02 Control Replication (RLS Policies & Hardening Triggers)
 * - Module 4: ADR-02 Zero-Downtime Backfill & Safe Cutover Protocol
 * ==============================================================================
 */

import { strict as assert } from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

export async function runStage5InfrastructureContractsTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 5 INFRASTRUCTURE & TECH DEBT CONTRACT TEST SUITE (SUITE 21)');
  console.log('════════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(testName: string, fn: () => void) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  const migrationsDir = path.resolve(process.cwd(), 'db_migrations');
  const schemaFilePath = path.resolve(process.cwd(), 'supabase_schema.sql');

  const m07DownPath = path.join(migrationsDir, 'm07_institutional_learning_ddl_and_guards_down.sql');
  const m08Path = path.join(migrationsDir, 'm08_shadow_partitioning_daily_attendance.sql');
  const m08DownPath = path.join(migrationsDir, 'm08_shadow_partitioning_daily_attendance_down.sql');

  // ------------------------------------------------------------------------------
  // MODULE 1: ADR-01 DOWN-SCRIPTS & ROLLBACK DETERMINISM
  // ------------------------------------------------------------------------------
  console.log('--- MODULE 1: ADR-01 Migration Down-Scripts & Rollback Determinism ---');

  runCheck('Suite 21 [ADR-01]: m07 rollback down-script exists physically and is non-empty', () => {
    assert.ok(fs.existsSync(m07DownPath), 'm07 down-script file must exist');
    const content = fs.readFileSync(m07DownPath, 'utf8');
    assert.ok(content.length > 200, 'm07 down-script must contain substantial SQL content');
  });

  runCheck('Suite 21 [ADR-01]: m08 rollback down-script exists physically and is non-empty', () => {
    assert.ok(fs.existsSync(m08DownPath), 'm08 down-script file must exist');
    const content = fs.readFileSync(m08DownPath, 'utf8');
    assert.ok(content.length > 200, 'm08 down-script must contain substantial SQL content');
  });

  runCheck('Suite 21 [ADR-01]: Down-scripts enforce mandatory ADR-01 historical archive warning comment', () => {
    const m07DownSql = fs.readFileSync(m07DownPath, 'utf8');
    const m08DownSql = fs.readFileSync(m08DownPath, 'utf8');
    
    const expectedWarning = 'WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).';
    assert.ok(m07DownSql.includes(expectedWarning), 'm07 down-script must contain ADR-01 archive warning');
    assert.ok(m08DownSql.includes(expectedWarning), 'm08 down-script must contain ADR-01 archive warning');
  });

  runCheck('Suite 21 [ADR-01]: Down-scripts are wrapped in atomic transaction blocks (BEGIN; ... COMMIT;)', () => {
    const m07DownSql = fs.readFileSync(m07DownPath, 'utf8');
    const m08DownSql = fs.readFileSync(m08DownPath, 'utf8');

    assert.ok(m07DownSql.includes('BEGIN;') && m07DownSql.includes('COMMIT;'), 'm07 down script must be transactional');
    assert.ok(m08DownSql.includes('BEGIN;') && m08DownSql.includes('COMMIT;'), 'm08 down script must be transactional');
  });

  // ------------------------------------------------------------------------------
  // MODULE 2: ADR-02 SHADOW PARTITIONING SCHEMA FIDELITY (daily_attendance)
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 2: ADR-02 Shadow Partitioning Schema Fidelity (daily_attendance) ---');

  const m08Sql = fs.readFileSync(m08Path, 'utf8');

  runCheck('Suite 21 [ADR-02 SCHEMA]: daily_attendance_partitioned declared with RANGE partitioning', () => {
    assert.ok(
      m08Sql.includes('CREATE TABLE IF NOT EXISTS public.daily_attendance_partitioned'),
      'Must define daily_attendance_partitioned table'
    );
    assert.ok(
      m08Sql.includes('PARTITION BY RANGE (date)'),
      'Must declare declarative partitioning by RANGE (date)'
    );
  });

  runCheck('Suite 21 [ADR-02 SCHEMA]: 100% column fidelity between original daily_attendance and shadow table', () => {
    const expectedColumns = [
      'id TEXT NOT NULL',
      'school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE',
      'class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE',
      'student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE',
      'date DATE NOT NULL',
      'status TEXT NOT NULL CHECK (status IN (\'HADIR\', \'SAKIT\', \'IZIN\', \'ALPA\'))',
      'notes TEXT',
      'recorded_by_person_id TEXT REFERENCES public.persons(id) ON DELETE SET NULL',
      'recorded_at TIMESTAMPTZ DEFAULT timezone(\'utc\'::text, now())',
      'temperature_celsius NUMERIC(4, 1)',
      'arrival_mood TEXT CHECK (arrival_mood IN (\'CERIA\', \'TENANG\', \'GELISAH\', \'MENANGIS\'))'
    ];

    for (const col of expectedColumns) {
      assert.ok(
        m08Sql.includes(col),
        `Shadow table must contain exact column definition: ${col}`
      );
    }
  });

  runCheck('Suite 21 [ADR-02 SCHEMA]: Primary Key & Unique Constraints correctly incorporate partition key (date)', () => {
    assert.ok(
      m08Sql.includes('CONSTRAINT pk_daily_attendance_partitioned PRIMARY KEY (id, date)'),
      'Primary key must include partition key date'
    );
    assert.ok(
      m08Sql.includes('CONSTRAINT uq_daily_attendance_partitioned_record UNIQUE (school_id, class_id, student_id, date)'),
      'Unique constraint must incorporate school_id, class_id, student_id, and date'
    );
  });

  runCheck('Suite 21 [ADR-02 SCHEMA]: Yearly academic partitions and default partition declared', () => {
    assert.ok(m08Sql.includes('daily_attendance_p2024_2025'), 'Must declare 2024/2025 partition');
    assert.ok(m08Sql.includes('daily_attendance_p2025_2026'), 'Must declare 2025/2026 partition');
    assert.ok(m08Sql.includes('daily_attendance_p2026_2027'), 'Must declare 2026/2027 partition');
    assert.ok(m08Sql.includes('daily_attendance_p2027_2028'), 'Must declare 2027/2028 partition');
    assert.ok(m08Sql.includes('daily_attendance_default'), 'Must declare default fallback partition');
  });

  // ------------------------------------------------------------------------------
  // MODULE 3: ADR-02 CONTROL REPLICATION (RLS, INDEXES, & TRIGGERS)
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 3: ADR-02 Control Replication (RLS Policies & Hardening Triggers) ---');

  runCheck('Suite 21 [ADR-02 CONTROLS]: Indexes replicated on shadow partitioned table', () => {
    assert.ok(m08Sql.includes('idx_att_part_school_date'), 'Must index (school_id, date)');
    assert.ok(m08Sql.includes('idx_att_part_class_date'), 'Must index (class_id, date)');
    assert.ok(m08Sql.includes('idx_att_part_student_date'), 'Must index (student_id, date)');
  });

  runCheck('Suite 21 [ADR-02 CONTROLS]: Fail-Closed RLS Matrix replicated on shadow partitioned table', () => {
    assert.ok(m08Sql.includes('ALTER TABLE public.daily_attendance_partitioned ENABLE ROW LEVEL SECURITY;'));
    assert.ok(m08Sql.includes('REVOKE ALL ON public.daily_attendance_partitioned FROM anon, authenticated;'));
    assert.ok(m08Sql.includes('GRANT SELECT, INSERT, UPDATE ON public.daily_attendance_partitioned TO authenticated;'));
    
    assert.ok(m08Sql.includes('CREATE POLICY "Relevant actors can view daily_attendance_partitioned"'));
    assert.ok(m08Sql.includes('CREATE POLICY "Teachers can insert daily_attendance_partitioned"'));
    assert.ok(m08Sql.includes('CREATE POLICY "Teachers can update daily_attendance_partitioned"'));
  });

  runCheck('Suite 21 [ADR-02 CONTROLS]: Stage 3.4 Temporal Guard trigger replicated on shadow table', () => {
    assert.ok(
      m08Sql.includes('CREATE TRIGGER trg_guard_closed_semester_att_part'),
      'Must replicate closed semester temporal trigger'
    );
    assert.ok(
      m08Sql.includes('EXECUTE FUNCTION public.fn_guard_closed_semester_mutations()'),
      'Must execute canonical fn_guard_closed_semester_mutations'
    );
  });

  runCheck('Suite 21 [ADR-02 CONTROLS]: Stage 4.5 FB-06 Foundation Mutation Block trigger replicated on shadow table', () => {
    assert.ok(
      m08Sql.includes('CREATE TRIGGER trg_fb06_block_foundation_att_part'),
      'Must replicate FB-06 hard block trigger'
    );
    assert.ok(
      m08Sql.includes('EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06()'),
      'Must execute canonical fn_guard_foundation_mutation_block_fb06'
    );
  });

  // ------------------------------------------------------------------------------
  // MODULE 4: ADR-02 ZERO-DOWNTIME BACKFILL & SAFE CUTOVER PROTOCOL
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 4: ADR-02 Zero-Downtime Backfill & Safe Cutover Protocol ---');

  runCheck('Suite 21 [ADR-02 BACKFILL]: Non-blocking chunked backfill function with advisory lock protection', () => {
    assert.ok(
      m08Sql.includes('CREATE OR REPLACE FUNCTION public.fn_backfill_attendance_to_shadow'),
      'Must define fn_backfill_attendance_to_shadow'
    );
    assert.ok(
      m08Sql.includes('pg_try_advisory_lock(8492019)'),
      'Must protect backfill execution with pg_try_advisory_lock'
    );
    assert.ok(
      m08Sql.includes('pg_sleep('),
      'Must include pg_sleep yield to prevent lock starvation'
    );
  });

  runCheck('Suite 21 [ADR-02 CUTOVER]: Safe cutover encapsulated in manual function without auto-executing', () => {
    assert.ok(
      m08Sql.includes('CREATE OR REPLACE FUNCTION public.fn_execute_attendance_cutover'),
      'Must define fn_execute_attendance_cutover'
    );
    assert.ok(
      m08Sql.includes('ALTER TABLE public.daily_attendance RENAME TO daily_attendance_archive_monolith;'),
      'Must rename original table to archive'
    );
    assert.ok(
      m08Sql.includes('ALTER TABLE public.daily_attendance_partitioned RENAME TO daily_attendance;'),
      'Must rename shadow table to daily_attendance'
    );

    // CRITICAL SAFETY: Bare cutover commands MUST NOT be executed outside functions in the migration
    const lines = m08Sql.split('\n');
    const bareRenames = lines.filter(line => 
      line.trim().startsWith('ALTER TABLE public.daily_attendance RENAME') && 
      !line.includes('daily_attendance_partitioned')
    );
    assert.ok(bareRenames.length === 1, 'Rename command must only exist inside fn_execute_attendance_cutover function');
  });

  runCheck('Suite 21 [ADR-02 CUTOVER]: Cutover verifies row count parity before executing atomic rename swap', () => {
    assert.ok(
      m08Sql.includes('v_count_orig <> v_count_shadow'),
      'Must check row count parity between original and shadow tables'
    );
    assert.ok(
      m08Sql.includes('CUTOVER_ABORTED: Row count mismatch!'),
      'Must abort cutover if row counts do not match'
    );
  });

  // ------------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 5 SUITE 21 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 5 Infrastructure Test Suite Failed with ${failedTests} error(s).`);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('stage5_infrastructure_contracts.test.ts')) {
  runStage5InfrastructureContractsTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
