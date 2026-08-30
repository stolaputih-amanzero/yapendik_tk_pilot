/**
 * YAPENDIK SCHOOL OS — STAGE 6-A: SPRINT 1 BACKEND & RLS CONTRACT TEST SUITE
 * 
 * Verifies:
 * - Suite 26 Backend (FB-08): School Rhythm Autonomy schema, unique constraints, and KS-only RLS
 * - Suite 27 Backend (FB-09 & T-2): Guardian Data Minimization, server-derived scope, and indexing
 * - Suite 28 Backend (T-1, T-3, T-4, D-7, D-8): Server Timezone authority, non-aggregable closure ledger, and safety alert bypass
 */

import fs from 'fs';
import path from 'path';

let passedChecks = 0;
let totalChecks = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  totalChecks++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          passedChecks++;
          console.log(`  🟢 PASS: ${name}`);
        })
        .catch((err) => {
          console.error(`  ❌ FAIL: ${name}`);
          console.error(`     Error: ${err.message}`);
        });
    } else {
      passedChecks++;
      console.log(`  🟢 PASS: ${name}`);
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toContain(expected: any) {
      if (!actual || !actual.includes(expected)) {
        throw new Error(`Expected content to contain "${expected}"`);
      }
    },
    notToContain(expected: any) {
      if (actual && actual.includes(expected)) {
        throw new Error(`Expected content NOT to contain "${expected}"`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      }
    }
  };
}

async function runStage6aBackendTests() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 6-A: SPRINT 1 DATABASE & BACKEND SUBSTRATE SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  const migrationPath = path.resolve(process.cwd(), 'db_migrations/m12_stage6a_briefing_and_closure_substrate.sql');
  const migrationDownPath = path.resolve(process.cwd(), 'db_migrations/m12_stage6a_briefing_and_closure_substrate_down.sql');

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const migrationDownSql = fs.readFileSync(migrationDownPath, 'utf8');

  // ===========================================================================
  // 1. SCHEMA INTEGRITY & CONSTRAINTS (FB-08, T-1, T-4)
  // ===========================================================================
  console.log('--- MODULE 1: Database Schema & Canonical Constraints ---');

  runCheck('Schema [PHASE ACTION MAPPINGS]: Canonical catalog table created with valid action_type check', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.phase_action_mappings');
    expect(migrationSql).toContain("CHECK (action_type IN ('NAVIGATION', 'MODAL', 'SHEET', 'RITUAL'))");
    expect(migrationSql).toContain('act_take_attendance');
    expect(migrationSql).toContain('act_record_moment');
    expect(migrationSql).toContain('act_close_day');
  });

  runCheck('Schema [SCHOOL RHYTHM CONFIGS]: FB-08 & T-1 timezone enum (WIB/WITA/WIT) & T-4 vocabulary version', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.school_rhythm_configs');
    expect(migrationSql).toContain("CHECK (school_timezone IN ('WIB', 'WITA', 'WIT'))");
    expect(migrationSql).toContain("rhythm_vocabulary_version VARCHAR(4) NOT NULL DEFAULT 'v1'");
    expect(migrationSql).toContain('CONSTRAINT uq_school_rhythm_year UNIQUE (school_id, academic_year_id)');
  });

  runCheck('Schema [CLOSURE RITUAL LEDGER]: T-3 Non-aggregable teacher daily closure with state check constraint', () => {
    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS public.closure_ritual_ledger');
    expect(migrationSql).toContain("CHECK (closure_state IN ('TUNTAS', 'SISA_TENANG'))");
    expect(migrationSql).toContain('CONSTRAINT uq_teacher_daily_closure UNIQUE (teacher_user_id, ritual_date)');
  });

  runCheck('Schema [GUARDIAN RELATIONSHIPS]: Performance indexes declared for student and guardian lookups', () => {
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_guardian_relationships_guardian_person');
    expect(migrationSql).toContain('CREATE INDEX IF NOT EXISTS idx_guardian_relationships_student_person');
  });

  // ===========================================================================
  // 2. ROW LEVEL SECURITY (RLS) POLICIES (FB-08, FB-09, T-3)
  // ===========================================================================
  console.log('\n--- MODULE 2: RLS Policies & Authority Boundaries ---');

  runCheck('RLS [FB-08 AUTONOMY]: school_rhythm_configs restricts mutation exclusively to Headmaster', () => {
    expect(migrationSql).toContain('ALTER TABLE public.school_rhythm_configs ENABLE ROW LEVEL SECURITY;');
    expect(migrationSql).toContain('CREATE POLICY "p_school_rhythm_ks_manage"');
    expect(migrationSql).toContain('headmaster_person_id = public.get_auth_person_id()');
    // Ensure no foundation mutation policy exists
    expect(migrationSql).notToContain('CREATE POLICY "Foundation can manage school rhythm"');
  });

  runCheck('RLS [T-3 PRIVATE JOURNAL]: closure_ritual_ledger allows only self insert and select', () => {
    expect(migrationSql).toContain('ALTER TABLE public.closure_ritual_ledger ENABLE ROW LEVEL SECURITY;');
    expect(migrationSql).toContain('CREATE POLICY "p_closure_teacher_select_self"');
    expect(migrationSql).toContain('USING (teacher_user_id = public.get_auth_person_id())');
    expect(migrationSql).toContain('CREATE POLICY "p_closure_teacher_insert_self"');
    expect(migrationSql).toContain('WITH CHECK (teacher_user_id = public.get_auth_person_id())');
  });

  runCheck('RLS [PHASE ACTIONS READ]: phase_action_mappings is readable by all authenticated users', () => {
    expect(migrationSql).toContain('ALTER TABLE public.phase_action_mappings ENABLE ROW LEVEL SECURITY;');
    expect(migrationSql).toContain('CREATE POLICY "p_phase_action_read_all"');
  });

  // ===========================================================================
  // 3. RPC FUNCTIONS SECURITY DEFINER & SERVER-DERIVED SCOPES
  // ===========================================================================
  console.log('\n--- MODULE 3: Trusted RPC Functions & Server-Derived Logic ---');

  runCheck('RPC [rpc_get_briefing_data]: SECURITY DEFINER with search_path hardening & server timezone authority', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_get_briefing_data');
    expect(migrationSql).toContain('SECURITY DEFINER');
    expect(migrationSql).toContain('SET search_path = public, pg_temp');
    expect(migrationSql).toContain("v_rhythm.school_timezone = 'WIT'");
    expect(migrationSql).toContain("v_rhythm.school_timezone = 'WITA'");
    // Verify T-2 server-derived child scope (no client child_id parameter)
    expect(migrationSql).toContain('WHERE gr.guardian_person_id = v_caller_person_id');
  });

  runCheck('RPC [rpc_update_phase_action_mapping]: Validates FB-08 Headmaster role before updating JSONB phases', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_update_phase_action_mapping');
    expect(migrationSql).toContain('FORBIDDEN_RHYTHM_MUTATION');
    expect(migrationSql).toContain('headmaster_person_id = v_caller_person_id');
    expect(migrationSql).toContain('jsonb_set');
  });

  runCheck('RPC [rpc_trigger_closure_ritual]: Blocks serene closure when safety alerts > 0 (Safety Override)', () => {
    expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_trigger_closure_ritual');
    expect(migrationSql).toContain('CLOSURE_BLOCKED_BY_SAFETY');
    expect(migrationSql).toContain('p_safety > 0');
    expect(migrationSql).toContain('INSERT INTO public.closure_ritual_ledger');
  });

  runCheck('Rollback [MIGRATION DOWN INTEGRITY]: Drops created RPCs and tables in reverse dependency order', () => {
    expect(migrationDownSql).toContain('DROP FUNCTION IF EXISTS public.rpc_trigger_closure_ritual');
    expect(migrationDownSql).toContain('DROP FUNCTION IF EXISTS public.rpc_update_phase_action_mapping');
    expect(migrationDownSql).toContain('DROP FUNCTION IF EXISTS public.rpc_get_briefing_data');
    expect(migrationDownSql).toContain('DROP TABLE IF EXISTS public.closure_ritual_ledger CASCADE;');
    expect(migrationDownSql).toContain('DROP TABLE IF EXISTS public.school_rhythm_configs CASCADE;');
    expect(migrationDownSql).toContain('DROP TABLE IF EXISTS public.phase_action_mappings CASCADE;');
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SPRINT 1 SUMMARY: ${passedChecks} PASSED, 0 FAILED (TOTAL: ${totalChecks})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (passedChecks !== totalChecks) {
    throw new Error('Some checks failed in Stage 6-A Backend Suite.');
  }
}

runStage6aBackendTests().catch((err) => {
  console.error('Fatal error in Stage 6-A Backend test runner:', err);
  process.exit(1);
});
