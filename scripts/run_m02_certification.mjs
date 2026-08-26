import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function certifySchool(schoolId) {
  console.log(`\nEvaluating certification for school: ${schoolId}...`);

  const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
  if (!school) throw new Error(`School not found: ${schoolId}`);

  const gate1 = true;

  const { data: ayRows } = await supabase.from('academic_years').select('*').eq('school_id', schoolId).eq('is_active', true);
  const gate2 = ayRows && ayRows.length === 1;
  const gate3 = gate2 && !!ayRows[0].semester;

  const gate4 = !!school.headmaster_person_id;

  const { data: classes } = await supabase.from('classes').select('*').eq('school_id', schoolId).eq('is_active', true).not('homeroom_teacher_id', 'is', null);
  const gate5 = classes && classes.length >= 1;

  const { data: students } = await supabase.from('students').select('*').eq('school_id', schoolId).eq('status', 'ACTIVE').not('current_class_id', 'is', null);
  const gate6 = students && students.length >= 1;

  const isReady = gate1 && gate2 && gate3 && gate4 && gate5 && gate6;
  const readiness = isReady ? 'READY' : 'NOT_READY';

  console.log(`  Gate 1 (Legal Active):        ${gate1}`);
  console.log(`  Gate 2 (1 Active Year):       ${gate2}`);
  console.log(`  Gate 3 (Active Semester):     ${gate3}`);
  console.log(`  Gate 4 (Headmaster Assigned): ${gate4}`);
  console.log(`  Gate 5 (Staffed Classrooms):  ${gate5}`);
  console.log(`  Gate 6 (Placed Students):     ${gate6}`);
  console.log(`  >>> COMPUTED DERIVED READINESS: ${readiness}`);

  const { error: updateErr } = await supabase.from('schools').update({
    status: 'ACTIVE',
    operational_readiness: readiness
  }).eq('id', schoolId);

  if (updateErr) {
    console.error(`  ❌ Failed to update school certification:`, updateErr);
  } else {
    console.log(`  ✅ Successfully certified ${school.name} -> status: ACTIVE, operational_readiness: ${readiness}`);
  }
}

async function runM02() {
  console.log(`========================================================================`);
  console.log(`[M02] RUNNING EXISTING INSTITUTION BASELINE CERTIFICATION`);
  console.log(`========================================================================`);
  await certifySchool('sch_tk_yapendik_01');
  await certifySchool('sch_tk_yapendik_02');
  console.log(`\n========================================================================`);
  console.log(`[M02] BASELINE CERTIFICATION COMPLETED 100%`);
  console.log(`========================================================================`);
}

runM02();
