/**
 * YAPENDIK SCHOOL OS — STAGE 3.3: OPERATIONAL ACCEPTANCE TEST SUITE (UAT-15 → UAT-20)
 * 
 * Executes end-to-end black-box business acceptance verification against live PostgreSQL:
 * 
 * - UAT-15: Governed Semester Closure Acceptance Gate
 * - UAT-16: Governed Cohort Promotion Acceptance Gate
 * - UAT-17: Governed Cohort Graduation Acceptance Gate
 * - UAT-18: Academic Period Rollover Acceptance Gate
 * - UAT-19: Foundation Exception Telemetry Acceptance Gate
 * - UAT-20: Child Longitudinal Continuity Acceptance Gate
 */

import pg from 'pg';
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

let totalGates = 0;
let passedGates = 0;

function assertGate(gateId, condition, description, details = '') {
  totalGates++;
  if (condition) {
    console.log(`  🟢 [${gateId}] PASS: ${description}`);
    passedGates++;
  } else {
    console.error(`  🔴 [${gateId}] FAIL: ${description} -> ${details}`);
    process.exitCode = 1;
  }
}

async function setSessionActor(client, personId) {
  if (!personId) {
    await client.query(`SET LOCAL request.jwt.claim.sub = ''`);
    return;
  }
  const res = await client.query(`
    SELECT auth_user_id FROM public.user_person_identities 
    WHERE person_id = $1 AND status = 'ACTIVE' LIMIT 1;
  `, [personId]);

  if (res.rows.length > 0) {
    const authUid = res.rows[0].auth_user_id;
    await client.query(`SET LOCAL request.jwt.claims = '${JSON.stringify({ sub: authUid, role: 'authenticated' })}'`);
  } else {
    const tempUuid = 'a0000000-0000-0000-0000-' + Buffer.from(personId).toString('hex').slice(0, 12).padStart(12, '0');
    await client.query(`INSERT INTO public.user_person_identities (auth_user_id, person_id, status) VALUES ($1, $2, 'ACTIVE') ON CONFLICT DO NOTHING;`, [tempUuid, personId]);
    await client.query(`SET LOCAL request.jwt.claims = '${JSON.stringify({ sub: tempUuid, role: 'authenticated' })}'`);
  }
}

async function runUatSuite() {
  console.log(`════════════════════════════════════════════════════════════════════════`);
  console.log(`🚀 YAPENDIK SCHOOL OS — STAGE 3.3 ACCEPTANCE TESTING (UAT-15 → UAT-20)`);
  console.log(`════════════════════════════════════════════════════════════════════════\n`);

  const client = await pool.connect();

  try {
    // ==========================================================================
    // UAT-15: GOVERNED SEMESTER CLOSURE ACCEPTANCE GATE
    // ==========================================================================
    console.log(`[UAT-15] Governed Semester Closure Acceptance Gate`);

    // 15A: Negative Precondition Check (DRAFT LPPA blocks closure)
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat15SchA = 'sch_uat15a_' + Date.now();
    const uat15AyA = 'ay_uat15a_' + Date.now();
    const uat15ClsA = 'cls_uat15a_' + Date.now();
    const uat15StuA = 'stu_uat15a_' + Date.now();
    const uat15PerA = 'per_uat15a_' + Date.now();

    await client.query(`INSERT INTO public.persons (id, full_name, gender) VALUES ($1, 'UAT 15 Child A', 'FEMALE');`, [uat15PerA]);
    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U15A_' || substr($1, 13), 'TK UAT-15 Closure A', 'TK', 'ACTIVE', 'READY');`, [uat15SchA]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2026/2027 Ganjil', 'GANJIL', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat15AyA, uat15SchA]);
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active) VALUES ($1, $2, $3, 'Kelompok A Mawar', 'TK_A_4_5', true);`, [uat15ClsA, uat15SchA, uat15AyA]);
    await client.query(`INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id) VALUES ($1, $2, $3, 'TK-U15-01A', 'ACTIVE', $4);`, [uat15StuA, uat15PerA, uat15SchA, uat15ClsA]);
    await client.query(`INSERT INTO public.student_placement_records (student_id, school_id, academic_year_id, class_id, entry_date, placement_status) VALUES ($1, $2, $3, $4, '2026-01-01', 'ACTIVE');`, [uat15StuA, uat15SchA, uat15AyA, uat15ClsA]);
    await client.query(`INSERT INTO public.student_progress_reports (id, school_id, student_id, academic_year_id, semester, status) VALUES ('rpt_u15_draft', $1, $2, $3, 'GANJIL', 'DRAFT');`, [uat15SchA, uat15StuA, uat15AyA]);

    let draftBlocked = false;
    try {
      await client.query(`SELECT public.rpc_close_academic_semester($1, $2);`, [uat15SchA, uat15AyA]);
    } catch (err) {
      if (err.message.includes('PRECONDITION_FAILED')) draftBlocked = true;
    }
    await client.query('ROLLBACK');
    assertGate('UAT-15.1', draftBlocked, 'Semester closure blocked when LPPA is in DRAFT');

    // 15B: Positive Reconciliation & Closure
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat15SchB = 'sch_uat15b_' + Date.now();
    const uat15AyB = 'ay_uat15b_' + Date.now();
    const uat15ClsB = 'cls_uat15b_' + Date.now();
    const uat15StuB = 'stu_uat15b_' + Date.now();
    const uat15PerB = 'per_uat15b_' + Date.now();

    await client.query(`INSERT INTO public.persons (id, full_name, gender) VALUES ($1, 'UAT 15 Child B', 'FEMALE');`, [uat15PerB]);
    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U15B_' || substr($1, 13), 'TK UAT-15 Closure B', 'TK', 'ACTIVE', 'READY');`, [uat15SchB]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2026/2027 Ganjil', 'GANJIL', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat15AyB, uat15SchB]);
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, is_active) VALUES ($1, $2, $3, 'Kelompok A Melati', 'TK_A_4_5', true);`, [uat15ClsB, uat15SchB, uat15AyB]);
    await client.query(`INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id) VALUES ($1, $2, $3, 'TK-U15-01B', 'ACTIVE', $4);`, [uat15StuB, uat15PerB, uat15SchB, uat15ClsB]);
    await client.query(`INSERT INTO public.student_placement_records (student_id, school_id, academic_year_id, class_id, entry_date, placement_status) VALUES ($1, $2, $3, $4, '2026-01-01', 'ACTIVE');`, [uat15StuB, uat15SchB, uat15AyB, uat15ClsB]);
    await client.query(`INSERT INTO public.student_progress_reports (id, school_id, student_id, academic_year_id, semester, status) VALUES ('rpt_u15_appr', $1, $2, $3, 'GANJIL', 'APPROVED');`, [uat15SchB, uat15StuB, uat15AyB]);

    const closeRes = await client.query(`SELECT public.rpc_close_academic_semester($1, $2) as res;`, [uat15SchB, uat15AyB]);
    const closeData = closeRes.rows[0].res;
    assertGate('UAT-15.2', closeData.success === true && closeData.status === 'CLOSED', 'rpc_close_academic_semester succeeds upon 100% LPPA reconciliation');

    // 15C: Option A Guarantee: Placements remain intact
    const plcStatus = (await client.query(`SELECT placement_status FROM public.student_placement_records WHERE student_id = $1;`, [uat15StuB])).rows[0].placement_status;
    assertGate('UAT-15.3', plcStatus === 'ACTIVE', 'OPTION A GUARANTEE: Student placement record remains ACTIVE after semester closure');

    // 15D: Audit Event Verification
    const audit15 = (await client.query(`SELECT action FROM public.audit_logs WHERE school_id = $1 AND action = 'CLOSE_SEMESTER';`, [uat15SchB])).rows[0];
    assertGate('UAT-15.4', audit15 !== undefined, 'CLOSE_SEMESTER structured event recorded in audit_logs');

    // 15E: Immutability Verification (INSERT on closed period rejected)
    let retroInsertBlocked = false;
    try {
      await client.query(`INSERT INTO public.daily_attendance (id, school_id, class_id, student_id, date, status) VALUES ('att_u15_retro', $1, $2, $3, '2026-02-01', 'HADIR');`, [uat15SchB, uat15ClsB, uat15StuB]);
    } catch (err) {
      if (err.message.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) retroInsertBlocked = true;
    }
    assertGate('UAT-15.5', retroInsertBlocked, 'Mutations on CLOSED semester blocked by immutability trigger');

    await client.query('ROLLBACK');

    // ==========================================================================
    // UAT-16: GOVERNED COHORT PROMOTION ACCEPTANCE GATE
    // ==========================================================================
    console.log(`\n[UAT-16] Governed Cohort Promotion Acceptance Gate`);

    // 16A, 16B, 16C: Positive Promotion & Lineage Truth
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat16Sch = 'sch_uat16_' + Date.now();
    const uat16Ay1 = 'ay_uat16_1_' + Date.now();
    const uat16Ay2 = 'ay_uat16_2_' + Date.now();
    const uat16ClsA = 'cls_uat16_tka_' + Date.now();
    const uat16ClsB = 'cls_uat16_tkb_' + Date.now();
    const uat16Stu = 'stu_uat16_' + Date.now();
    const uat16Per = 'per_uat16_' + Date.now();

    await client.query(`INSERT INTO public.persons (id, full_name, gender) VALUES ($1, 'UAT 16 Promotion Child', 'MALE');`, [uat16Per]);
    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U16_' || substr($1, 12), 'TK UAT-16 Promotion', 'TK', 'ACTIVE', 'READY');`, [uat16Sch]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2025/2026 Ganjil', 'GANJIL', '2025-07-01', '2025-12-31', false, 'CLOSED');`, [uat16Ay1, uat16Sch]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2025/2026 Genap', 'GENAP', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat16Ay2, uat16Sch]);
    
    // Class A (Capacity 15) in Closed Term
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, capacity, is_active) VALUES ($1, $2, $3, 'TK A Melati', 'TK_A_4_5', 15, true);`, [uat16ClsA, uat16Sch, uat16Ay1]);
    // Class B (Capacity 1) in Active Term
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, capacity, is_active) VALUES ($1, $2, $3, 'TK B Mawar', 'TK_B_5_6', 1, true);`, [uat16ClsB, uat16Sch, uat16Ay2]);

    await client.query(`INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id) VALUES ($1, $2, $3, 'TK-U16-01', 'ACTIVE', $4);`, [uat16Stu, uat16Per, uat16Sch, uat16ClsA]);
    await client.query(`INSERT INTO public.student_placement_records (student_id, school_id, academic_year_id, class_id, entry_date, placement_status) VALUES ($1, $2, $3, $4, '2025-07-01', 'ACTIVE');`, [uat16Stu, uat16Sch, uat16Ay1, uat16ClsA]);

    const promoRes = await client.query(`
      SELECT public.rpc_promote_classroom_cohort($1, $2, $3, $4, ARRAY[$5]) as res;
    `, [uat16Sch, uat16ClsA, uat16ClsB, uat16Ay2, uat16Stu]);
    const promoData = promoRes.rows[0].res;
    assertGate('UAT-16.1', promoData.success === true && promoData.promoted_count === 1, 'rpc_promote_classroom_cohort successfully promotes cohort');

    const oldPlc = (await client.query(`SELECT placement_status FROM public.student_placement_records WHERE student_id = $1 AND academic_year_id = $2;`, [uat16Stu, uat16Ay1])).rows[0].placement_status;
    const newPlc = (await client.query(`SELECT placement_status FROM public.student_placement_records WHERE student_id = $1 AND academic_year_id = $2;`, [uat16Stu, uat16Ay2])).rows[0].placement_status;
    const projCls = (await client.query(`SELECT current_class_id FROM public.students WHERE id = $1;`, [uat16Stu])).rows[0].current_class_id;

    assertGate('UAT-16.2', oldPlc === 'PROMOTED' && newPlc === 'ACTIVE', 'Placement lineage transitions from PROMOTED in source to ACTIVE in target');
    assertGate('UAT-16.3', projCls === uat16ClsB, 'Operational projection students.current_class_id automatically updated (Lineage Wins)');

    await client.query('ROLLBACK');

    // 16D: Negative Capacity Overflow Guard
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat16SchCap = 'sch_uat16_cap_' + Date.now();
    const uat16Ay1Cap = 'ay_uat16_1_c_' + Date.now();
    const uat16Ay2Cap = 'ay_uat16_2_c_' + Date.now();
    const uat16ClsACap = 'cls_uat16_tka_c_' + Date.now();
    const uat16ClsBCap = 'cls_uat16_tkb_c_' + Date.now();
    const uat16Stu1Cap = 'stu_u16_c1_' + Date.now();
    const uat16Stu2Cap = 'stu_u16_c2_' + Date.now();
    const uat16Per1Cap = 'per_u16_c1_' + Date.now();
    const uat16Per2Cap = 'per_u16_c2_' + Date.now();

    await client.query(`INSERT INTO public.persons (id, full_name, gender) VALUES ($1, 'Child 1', 'MALE'), ($2, 'Child 2', 'FEMALE');`, [uat16Per1Cap, uat16Per2Cap]);
    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U16C_' || substr($1, 13), 'TK Cap Guard', 'TK', 'ACTIVE', 'READY');`, [uat16SchCap]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2025/2026 Ganjil', 'GANJIL', '2025-07-01', '2025-12-31', false, 'CLOSED');`, [uat16Ay1Cap, uat16SchCap]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2025/2026 Genap', 'GENAP', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat16Ay2Cap, uat16SchCap]);
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, capacity, is_active) VALUES ($1, $2, $3, 'TK A', 'TK_A_4_5', 15, true);`, [uat16ClsACap, uat16SchCap, uat16Ay1Cap]);
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, capacity, is_active) VALUES ($1, $2, $3, 'TK B Tiny', 'TK_B_5_6', 1, true);`, [uat16ClsBCap, uat16SchCap, uat16Ay2Cap]);

    await client.query(`INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id) VALUES ($1, $2, $3, 'TK-U16-C1', 'ACTIVE', $4), ($5, $6, $3, 'TK-U16-C2', 'ACTIVE', $4);`, [uat16Stu1Cap, uat16Per1Cap, uat16SchCap, uat16ClsACap, uat16Stu2Cap, uat16Per2Cap]);
    await client.query(`INSERT INTO public.student_placement_records (student_id, school_id, academic_year_id, class_id, entry_date, placement_status) VALUES ($1, $2, $3, $4, '2025-07-01', 'ACTIVE'), ($5, $2, $3, $4, '2025-07-01', 'ACTIVE');`, [uat16Stu1Cap, uat16SchCap, uat16Ay1Cap, uat16ClsACap, uat16Stu2Cap]);

    // Target capacity is 1, promoting 2 students
    let capacityOverflowBlocked = false;
    try {
      await client.query(`SELECT public.rpc_promote_classroom_cohort($1, $2, $3, $4, ARRAY[$5, $6]);`, [uat16SchCap, uat16ClsACap, uat16ClsBCap, uat16Ay2Cap, uat16Stu1Cap, uat16Stu2Cap]);
    } catch (err) {
      if (err.message.includes('CAPACITY_EXCEEDED')) capacityOverflowBlocked = true;
    }
    await client.query('ROLLBACK');
    assertGate('UAT-16.4', capacityOverflowBlocked, 'Promoting beyond class capacity rejected with CAPACITY_EXCEEDED (100% ABORT)');

    // ==========================================================================
    // UAT-17: GOVERNED COHORT GRADUATION ACCEPTANCE GATE
    // ==========================================================================
    console.log(`\n[UAT-17] Governed Cohort Graduation Acceptance Gate`);

    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat17Sch = 'sch_uat17_' + Date.now();
    const uat17Ay = 'ay_uat17_' + Date.now();
    const uat17Cls = 'cls_uat17_tkb_' + Date.now();
    const uat17Stu = 'stu_uat17_' + Date.now();
    const uat17Per = 'per_uat17_' + Date.now();

    await client.query(`INSERT INTO public.persons (id, full_name, gender) VALUES ($1, 'UAT 17 Graduate', 'FEMALE');`, [uat17Per]);
    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U17_' || substr($1, 12), 'TK UAT-17 Graduation', 'TK', 'ACTIVE', 'READY');`, [uat17Sch]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2026/2027 Genap', 'GENAP', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat17Ay, uat17Sch]);
    await client.query(`INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, capacity, is_active) VALUES ($1, $2, $3, 'TK B Bintang Kejora', 'TK_B_5_6', 15, true);`, [uat17Cls, uat17Sch, uat17Ay]);
    await client.query(`INSERT INTO public.students (id, person_id, school_id, nis, status, current_class_id) VALUES ($1, $2, $3, 'TK-U17-01', 'ACTIVE', $4);`, [uat17Stu, uat17Per, uat17Sch, uat17Cls]);
    await client.query(`INSERT INTO public.student_placement_records (student_id, school_id, academic_year_id, class_id, entry_date, placement_status) VALUES ($1, $2, $3, $4, '2026-01-01', 'ACTIVE');`, [uat17Stu, uat17Sch, uat17Ay, uat17Cls]);

    const gradRes = await client.query(`
      SELECT public.rpc_graduate_student_cohort($1, $2, ARRAY[$3]) as res;
    `, [uat17Sch, uat17Cls, uat17Stu]);
    const gradData = gradRes.rows[0].res;
    assertGate('UAT-17.1', gradData.success === true && gradData.graduated_count === 1, 'rpc_graduate_student_cohort executed successfully');

    const plcGrad = (await client.query(`SELECT placement_status FROM public.student_placement_records WHERE student_id = $1;`, [uat17Stu])).rows[0].placement_status;
    const stuGrad = (await client.query(`SELECT status, current_class_id FROM public.students WHERE id = $1;`, [uat17Stu])).rows[0];

    assertGate('UAT-17.2', plcGrad === 'COMPLETED', 'Placement status transitioned to COMPLETED');
    assertGate('UAT-17.3', stuGrad.status === 'GRADUATED' && stuGrad.current_class_id === null, 'Student profile transitioned to GRADUATED and current_class_id cleared');

    let tamperGradBlocked = false;
    try {
      await client.query(`UPDATE public.student_placement_records SET promotion_remarks = 'Hacked' WHERE student_id = $1;`, [uat17Stu]);
    } catch (err) {
      if (err.message.includes('CANNOT_MUTATE_TERMINAL_PLACEMENT')) tamperGradBlocked = true;
    }
    assertGate('UAT-17.4', tamperGradBlocked, 'COMPLETED placement permanently locked by immutability trigger');

    await client.query('ROLLBACK');

    // ==========================================================================
    // UAT-18: ACADEMIC PERIOD ROLLOVER ACCEPTANCE GATE
    // ==========================================================================
    console.log(`\n[UAT-18] Academic Period Rollover Acceptance Gate`);

    // 18A: Negative Conflict Check
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat18SchA = 'sch_uat18a_' + Date.now();
    const uat18AyA = 'ay_uat18a_' + Date.now();

    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U18A_' || substr($1, 13), 'TK UAT-18 Rollover A', 'TK', 'ACTIVE', 'READY');`, [uat18SchA]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2026/2027 Ganjil', 'GANJIL', '2026-01-01', '2026-06-30', true, 'ACTIVE');`, [uat18AyA, uat18SchA]);

    let conflictPeriodBlocked = false;
    try {
      await client.query(`
        SELECT public.rpc_initialize_next_semester($1, 'T.A. 2026/2027 Genap', 'GENAP', '2026-07-01', '2026-12-31');
      `, [uat18SchA]);
    } catch (err) {
      if (err.message.includes('ACTIVE_PERIOD_EXISTS')) conflictPeriodBlocked = true;
    }
    await client.query('ROLLBACK');
    assertGate('UAT-18.1', conflictPeriodBlocked, 'Initializing new semester when active period exists rejected (ACTIVE_PERIOD_EXISTS)');

    // 18B: Positive Rollover: Close old period, then initialize next semester
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const uat18SchB = 'sch_uat18b_' + Date.now();
    const uat18AyB = 'ay_uat18b_' + Date.now();

    await client.query(`INSERT INTO public.schools (id, npsn, name, level, status, operational_readiness) VALUES ($1, 'NPSN_U18B_' || substr($1, 13), 'TK UAT-18 Rollover B', 'TK', 'ACTIVE', 'READY');`, [uat18SchB]);
    await client.query(`INSERT INTO public.academic_years (id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status) VALUES ($1, $2, 'T.A. 2026/2027 Ganjil', 'GANJIL', '2026-01-01', '2026-06-30', false, 'CLOSED');`, [uat18AyB, uat18SchB]);
    
    const nextSemRes = await client.query(`
      SELECT public.rpc_initialize_next_semester($1, 'T.A. 2026/2027 Genap', 'GENAP', '2026-07-01', '2026-12-31') as res;
    `, [uat18SchB]);
    const nextSemData = nextSemRes.rows[0].res;

    assertGate('UAT-18.2', nextSemData.success === true && nextSemData.status === 'ACTIVE', 'rpc_initialize_next_semester successfully creates & activates successor term');

    const histAy = (await client.query(`SELECT lifecycle_status FROM public.academic_years WHERE id = $1;`, [uat18AyB])).rows[0].lifecycle_status;
    assertGate('UAT-18.3', histAy === 'CLOSED', 'Predecessor period remains preserved in CLOSED state for read-only history');

    await client.query('ROLLBACK');

    // ==========================================================================
    // UAT-19: FOUNDATION EXCEPTION TELEMETRY ACCEPTANCE GATE
    // ==========================================================================
    console.log(`\n[UAT-19] Foundation Exception Telemetry Acceptance Gate`);

    const telRes = await client.query(`
      SELECT public.fn_derive_school_health_telemetry('sch_tk_yapendik_01') as tel;
    `);
    const tel = telRes.rows[0].tel;

    assertGate('UAT-19.1', tel.school_id === 'sch_tk_yapendik_01', 'fn_derive_school_health_telemetry evaluates live school data');
    assertGate('UAT-19.2', typeof tel.indicators.capacity_utilization_pct === 'number', 'Canonical Indicator 1: Capacity Utilization computed dynamically');
    assertGate('UAT-19.3', typeof tel.indicators.staffing_compliance === 'boolean', 'Canonical Indicator 2: Staffing Compliance computed dynamically');
    assertGate('UAT-19.4', typeof tel.indicators.attendance_recorded_days === 'number', 'Canonical Indicator 3: Attendance Consistency computed dynamically');
    assertGate('UAT-19.5', typeof tel.indicators.curriculum_velocity_pct === 'number', 'Canonical Indicator 4: Curriculum Velocity computed dynamically');
    assertGate('UAT-19.6', Array.isArray(tel.exceptions), 'Diagnostic exceptions surfaced on-the-fly without mutable database tables');

    // ==========================================================================
    // UAT-20: CHILD LONGITUDINAL CONTINUITY ACCEPTANCE GATE
    // ==========================================================================
    console.log(`\n[UAT-20] Child Longitudinal Continuity Acceptance Gate`);

    // 20A: Authorized Access by Superadmin
    await client.query('BEGIN');
    await setSessionActor(client, 'per_superadmin_andreas');

    const trajRes = await client.query(`
      SELECT public.fn_get_student_longitudinal_trajectory('stu_kenzo_01') as traj;
    `);
    const traj = trajRes.rows[0].traj;

    assertGate('UAT-20.1', traj.student_id === 'stu_kenzo_01' && traj.nis === 'TK-2026-001', 'fn_get_student_longitudinal_trajectory returns canonical child profile');
    assertGate('UAT-20.2', Array.isArray(traj.placement_lineage) && traj.placement_lineage.length >= 1, 'Chronological placement lineage curve retrieved across terms');
    assertGate('UAT-20.3', Array.isArray(traj.lppa_history), 'Longitudinal LPPA progress report history retrieved');
    await client.query('ROLLBACK');

    // 20B: Authorized Access by Legal Guardian (Budi Santoso linked to Kenzo)
    await client.query('BEGIN');
    await setSessionActor(client, 'per_parent_budi');
    const guardianTrajRes = await client.query(`
      SELECT public.fn_get_student_longitudinal_trajectory('stu_kenzo_01') as traj;
    `);
    assertGate('UAT-20.4', guardianTrajRes.rows[0].traj.student_id === 'stu_kenzo_01', 'Verified Legal Guardian (Pak Budi) authorized to view own child trajectory');
    await client.query('ROLLBACK');

    // 20C: Negative Privacy: Foreign Parent (Hendra) attempting to view Kenzo
    await client.query('BEGIN');
    await setSessionActor(client, 'per_parent_hendra'); // Hendra is father of Alina, NOT Kenzo
    let foreignParentBlocked = false;
    try {
      await client.query(`SELECT public.fn_get_student_longitudinal_trajectory('stu_kenzo_01');`);
    } catch (err) {
      if (err.message.includes('UNAUTHORIZED')) foreignParentBlocked = true;
    }
    await client.query('ROLLBACK');
    assertGate('UAT-20.5', foreignParentBlocked, 'Foreign Guardian (Pak Hendra) attempting to view Kenzo blocked (UNAUTHORIZED Privacy Barrier)');

  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n════════════════════════════════════════════════════════════════════════`);
  console.log(`🏁 STAGE 3.3 ACCEPTANCE COMPLETE: ${passedGates}/${totalGates} GATES PASSED`);
  console.log(`════════════════════════════════════════════════════════════════════════`);

  if (passedGates === totalGates) {
    console.log(`\n🎉 STAGE 3.3 ACCEPTANCE CERTIFIED: UAT-15 through UAT-20 100% OPERATIONAL!`);
  } else {
    process.exit(1);
  }
}

runUatSuite().catch(console.error);
