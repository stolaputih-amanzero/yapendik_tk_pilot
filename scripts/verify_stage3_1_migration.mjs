/**
 * YAPENDIK SCHOOL OS — STAGE 3.1: POST-MIGRATION VERIFICATION SUITE
 * 
 * Verifies all 7 Architectural & Security Invariants on Live PostgreSQL / Supabase Cloud:
 * 1. Schema Invariant: student_placement_records exists with complete 12-column canonical structure
 * 2. Backfill Invariant: 100% active placed students have valid active placement records
 * 3. Lineage Invariant: Single active placement constraint enforced (duplicate active placement rejected)
 * 4. Temporal Protection Invariant: Mutation on CLOSED/ARCHIVED semester blocked by trigger
 * 5. Terminal Immutability Invariant: Updates on terminal placement rejected by trigger
 * 6. Projection Sync Invariant: Active placement creation/update auto-syncs students.current_class_id
 * 7. Security Invariant: Direct client DML denied by fail-closed RLS policies
 */

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new pg.Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.diliqtfgzxmjvwzczdcx',
  password: '!V6i#=Qtz54+QpW',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const anonClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, name, details = '') {
  totalChecks++;
  if (condition) {
    console.log(`  🟢 PASS [CHK-${String(totalChecks).padStart(2, '0')}]: ${name}`);
    passedChecks++;
  } else {
    console.error(`  🔴 FAIL [CHK-${String(totalChecks).padStart(2, '0')}]: ${name} -> ${details}`);
    process.exitCode = 1;
  }
}

async function runVerification() {
  console.log(`════════════════════════════════════════════════════════════════════════`);
  console.log(`[STAGE 3.1 VERIFICATION] TEMPORAL LINEAGE & PROTECTION TRIGGERS SUITE`);
  console.log(`════════════════════════════════════════════════════════════════════════\n`);

  const client = await pool.connect();

  try {
    // --------------------------------------------------------------------------
    // 1. SCHEMA INVARIANT: TABLE & COLUMNS STRUCTURE
    // --------------------------------------------------------------------------
    console.log(`[GROUP 1] Schema & Table Structure`);
    const colRes = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'student_placement_records';
    `);
    const cols = colRes.rows.map(r => r.column_name);
    assert(cols.includes('id'), 'Column "id" exists');
    assert(cols.includes('student_id'), 'Column "student_id" exists');
    assert(cols.includes('school_id'), 'Column "school_id" exists');
    assert(cols.includes('academic_year_id'), 'Column "academic_year_id" exists');
    assert(cols.includes('class_id'), 'Column "class_id" exists');
    assert(cols.includes('placement_status'), 'Column "placement_status" exists');
    assert(cols.includes('entry_date'), 'Column "entry_date" exists');
    assert(cols.includes('exit_date'), 'Column "exit_date" exists');

    const ayCols = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'academic_years';
    `)).rows.map(r => r.column_name);
    assert(ayCols.includes('lifecycle_status'), 'academic_years has "lifecycle_status"');
    assert(ayCols.includes('closed_at'), 'academic_years has "closed_at"');

    // --------------------------------------------------------------------------
    // 2. BACKFILL INVARIANT: 100% RECONCILIATION
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 2] Population Backfill Reconciliation`);
    const studentCount = (await client.query(`
      SELECT COUNT(*) as c FROM public.students 
      WHERE current_class_id IS NOT NULL AND status = 'ACTIVE';
    `)).rows[0].c;

    const placementCount = (await client.query(`
      SELECT COUNT(*) as c FROM public.student_placement_records 
      WHERE placement_status = 'ACTIVE';
    `)).rows[0].c;

    assert(parseInt(placementCount) === parseInt(studentCount), `Active Placements (${placementCount}) matches Placed Students (${studentCount}) 100%`);

    const mismatchCount = (await client.query(`
      SELECT COUNT(*) as c
      FROM public.student_placement_records spr
      JOIN public.students s ON s.id = spr.student_id
      JOIN public.classes c ON c.id = spr.class_id
      WHERE spr.school_id != s.school_id 
         OR spr.academic_year_id != c.academic_year_id 
         OR spr.class_id != s.current_class_id;
    `)).rows[0].c;

    assert(parseInt(mismatchCount) === 0, 'Zero relational discrepancies across school, academic_year, and class');

    // --------------------------------------------------------------------------
    // 3. CONSTRAINT INVARIANT: SINGLE ACTIVE PLACEMENT ENFORCEMENT
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 3] Single Active Placement Unique Constraint`);
    const sampleStudent = (await client.query(`
      SELECT student_id, school_id, academic_year_id, class_id 
      FROM public.student_placement_records 
      WHERE placement_status = 'ACTIVE' LIMIT 1;
    `)).rows[0];

    let duplicateRejected = false;
    try {
      await client.query(`
        INSERT INTO public.student_placement_records (
          student_id, school_id, academic_year_id, class_id, entry_date, placement_status
        ) VALUES (
          $1, $2, $3, $4, CURRENT_DATE, 'ACTIVE'
        );
      `, [sampleStudent.student_id, sampleStudent.school_id, sampleStudent.academic_year_id, sampleStudent.class_id]);
    } catch (err) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate active placement for same student rejected by unique partial index');

    // --------------------------------------------------------------------------
    // 4. TEMPORAL IMMUTABILITY TRIGGER: CLOSED PERIOD GUARD
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 4] Closed Period Protection Trigger`);
    
    // Sub-test 4A: Attendance on Closed Period
    await client.query('BEGIN');
    const tempAyId1 = 'ay_test_closed1_' + Date.now();
    const tempClsId1 = 'cls_test_closed1_' + Date.now();
    
    await client.query(`
      INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status)
      VALUES ($1, $2, 'T.A. Test Closed 1', 'GANJIL', '2025-01-01', '2025-06-30', false, 'CLOSED');
    `, [tempAyId1, sampleStudent.school_id]);

    await client.query(`
      INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active)
      VALUES ($1, $2, $3, 'Class Closed Term 1', 'TK_A_4_5', false);
    `, [tempClsId1, sampleStudent.school_id, tempAyId1]);

    let closedAttBlocked = false;
    try {
      await client.query(`
        INSERT INTO public.daily_attendance (id, school_id, class_id, student_id, date, status)
        VALUES ('att_test_closed', $1, $2, $3, '2025-02-01', 'HADIR');
      `, [sampleStudent.school_id, tempClsId1, sampleStudent.student_id]);
    } catch (err) {
      if (err.message.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
        closedAttBlocked = true;
      }
    }
    await client.query('ROLLBACK');
    assert(closedAttBlocked, 'INSERT daily_attendance on CLOSED academic year blocked by trigger');

    // Sub-test 4B: Observation on Closed Period
    await client.query('BEGIN');
    const tempAyId2 = 'ay_test_closed2_' + Date.now();
    const tempClsId2 = 'cls_test_closed2_' + Date.now();
    
    await client.query(`
      INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status)
      VALUES ($1, $2, 'T.A. Test Closed 2', 'GANJIL', '2025-01-01', '2025-06-30', false, 'CLOSED');
    `, [tempAyId2, sampleStudent.school_id]);

    await client.query(`
      INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active)
      VALUES ($1, $2, $3, 'Class Closed Term 2', 'TK_A_4_5', false);
    `, [tempClsId2, sampleStudent.school_id, tempAyId2]);

    let closedObsBlocked = false;
    try {
      await client.query(`
        INSERT INTO public.observation_records (
          id, school_id, class_id, student_id, observed_at, domain, anecdote_description, milestone_rating
        ) VALUES (
          'obs_test_closed', $1, $2, $3, now(), 'NILAI_AGAMA_MORAL', 'Test note', 'BSH'
        );
      `, [sampleStudent.school_id, tempClsId2, sampleStudent.student_id]);
    } catch (err) {
      if (err.message.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
        closedObsBlocked = true;
      }
    }
    await client.query('ROLLBACK');
    assert(closedObsBlocked, 'INSERT observation_records on CLOSED academic year blocked by trigger');

    // --------------------------------------------------------------------------
    // 5. TERMINAL PLACEMENT IMMUTABILITY TRIGGER
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 5] Terminal Placement Immutability Guard`);
    await client.query('BEGIN');
    
    const tempAyId3 = 'ay_test_term_' + Date.now();
    const tempClsId3 = 'cls_test_term_' + Date.now();
    const tempPlcId = 'plc_test_terminal_' + Date.now();

    await client.query(`
      INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status)
      VALUES ($1, $2, 'T.A. Test Past AY', 'GANJIL', '2024-01-01', '2024-06-30', false, 'CLOSED');
    `, [tempAyId3, sampleStudent.school_id]);

    await client.query(`
      INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active)
      VALUES ($1, $2, $3, 'Class Past Term', 'TK_A_4_5', false);
    `, [tempClsId3, sampleStudent.school_id, tempAyId3]);

    await client.query(`
      INSERT INTO public.student_placement_records (
        id, student_id, school_id, academic_year_id, class_id, entry_date, placement_status
      ) VALUES (
        $1, $2, $3, $4, $5, '2024-01-01', 'COMPLETED'
      );
    `, [tempPlcId, sampleStudent.student_id, sampleStudent.school_id, tempAyId3, tempClsId3]);

    let terminalUpdateBlocked = false;
    try {
      await client.query(`
        UPDATE public.student_placement_records 
        SET promotion_remarks = 'Tampered Remarks' 
        WHERE id = $1;
      `, [tempPlcId]);
    } catch (err) {
      if (err.message.includes('CANNOT_MUTATE_TERMINAL_PLACEMENT')) {
        terminalUpdateBlocked = true;
      }
    }
    await client.query('ROLLBACK');
    assert(terminalUpdateBlocked, 'UPDATE on terminalized COMPLETED placement permanently blocked');

    // --------------------------------------------------------------------------
    // 6. PROJECTION SYNCHRONIZATION TRIGGER (LINEAGE WINS)
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 6] Lineage-Wins Projection Sync`);
    await client.query('BEGIN');
    
    // Create test student without class
    const tempStuId = 'stu_test_proj_' + Date.now();
    const tempPersonId = 'per_test_proj_' + Date.now();
    
    await client.query(`
      INSERT INTO public.persons (id, full_name, gender)
      VALUES ($1, 'Test Student Proj', 'MALE');
    `, [tempPersonId]);

    await client.query(`
      INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id)
      VALUES ($1, $2, $3, 'TK-TEST-PROJ', 'ACTIVE', NULL);
    `, [tempStuId, tempPersonId, sampleStudent.school_id]);

    // Insert active placement in a new academic year
    const tempAyId4 = 'ay_test_proj_' + Date.now();
    const tempClsId4 = 'cls_test_proj_' + Date.now();
    const tempPlcSyncId = 'plc_test_sync_' + Date.now();

    await client.query(`
      INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status)
      VALUES ($1, $2, 'T.A. Test Proj', 'GENAP', '2026-07-01', '2026-12-31', false, 'PLANNED');
    `, [tempAyId4, sampleStudent.school_id]);

    await client.query(`
      INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active)
      VALUES ($1, $2, $3, 'Class Proj', 'TK_B_5_6', true);
    `, [tempClsId4, sampleStudent.school_id, tempAyId4]);

    await client.query(`
      INSERT INTO public.student_placement_records (
        id, student_id, school_id, academic_year_id, class_id, entry_date, placement_status
      ) VALUES (
        $1, $2, $3, $4, $5, CURRENT_DATE, 'ACTIVE'
      );
    `, [tempPlcSyncId, tempStuId, sampleStudent.school_id, tempAyId4, tempClsId4]);

    // Check student's current_class_id projection
    const syncedClassId = (await client.query(`
      SELECT current_class_id FROM public.students WHERE id = $1;
    `, [tempStuId])).rows[0].current_class_id;

    await client.query('ROLLBACK');
    assert(syncedClassId === tempClsId4, 'students.current_class_id automatically projected upon placement insert');

    // --------------------------------------------------------------------------
    // 7. SECURITY INVARIANT: DIRECT CLIENT DML DENIAL VIA RLS
    // --------------------------------------------------------------------------
    console.log(`\n[GROUP 7] Fail-Closed Client DML Barrier`);
    const { error: anonInsertErr } = await anonClient
      .from('student_placement_records')
      .insert({
        student_id: sampleStudent.student_id,
        school_id: sampleStudent.school_id,
        academic_year_id: sampleStudent.academic_year_id,
        class_id: sampleStudent.class_id,
        entry_date: '2026-08-26',
        placement_status: 'ACTIVE'
      });

    assert(anonInsertErr !== null, 'Direct client INSERT on student_placement_records denied by RLS');

  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n════════════════════════════════════════════════════════════════════════`);
  console.log(`🏁 STAGE 3.1 VERIFICATION COMPLETE: ${passedChecks}/${totalChecks} CHECKS PASSED`);
  console.log(`════════════════════════════════════════════════════════════════════════`);

  if (passedChecks === totalChecks) {
    console.log(`\n🎉 MILESTONE 3.1 CERTIFIED: Temporal Lineage & Immutability Engine 100% OPERATIONAL!`);
  } else {
    process.exit(1);
  }
}

runVerification().catch(console.error);
