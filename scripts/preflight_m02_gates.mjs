import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function inspect6Gates(schoolId) {
  console.log(`\n========================================================`);
  console.log(`EVALUATING 6 READINESS GATES FOR: ${schoolId}`);
  console.log(`========================================================`);

  // Gate 1: School exists
  const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
  const gate1 = !!school;
  console.log(`Gate 1 (School Legal Active):`, gate1, school ? `(${school.name})` : 'NOT FOUND');

  // Gate 2 & 3: Academic Year & Period
  const { data: ayRows } = await supabase.from('academic_years').select('*').eq('school_id', schoolId).eq('is_active', true);
  const gate2 = ayRows && ayRows.length === 1;
  const gate3 = gate2 && !!ayRows[0].semester;
  console.log(`Gate 2 (Exactly 1 Active Year):`, gate2, ayRows ? ayRows.map(y => y.name) : []);
  console.log(`Gate 3 (Active Semester Defined):`, gate3, ayRows && ayRows[0] ? ayRows[0].semester : 'NONE');

  // Gate 4: Headmaster Assigned
  const gate4 = school && !!school.headmaster_person_id;
  console.log(`Gate 4 (Headmaster Assigned):`, gate4, school ? school.headmaster_person_id : 'NONE');

  // Gate 5: Staffed Classroom
  const { data: classes } = await supabase.from('classes').select('*').eq('school_id', schoolId).eq('is_active', true).not('homeroom_teacher_id', 'is', null);
  const gate5 = classes && classes.length >= 1;
  console.log(`Gate 5 (Staffed Classroom >= 1):`, gate5, classes ? classes.map(c => `${c.name} (Teacher: ${c.homeroom_teacher_id})`) : []);

  // Gate 6: Placed Students
  const { data: students } = await supabase.from('students').select('*').eq('school_id', schoolId).eq('status', 'ACTIVE').not('current_class_id', 'is', null);
  const gate6 = students && students.length >= 1;
  console.log(`Gate 6 (Placed Students >= 1):`, gate6, students ? students.map(s => `${s.nis} in class ${s.current_class_id}`) : []);

  const allPass = gate1 && gate2 && gate3 && gate4 && gate5 && gate6;
  console.log(`\n>>> FINAL CERTIFICATION VERDICT: ${allPass ? '🟢 6/6 GATES PASS — READY' : '🔴 FAILED GATES'}`);
  return { schoolId, gate1, gate2, gate3, gate4, gate5, gate6, allPass };
}

async function run() {
  await inspect6Gates('sch_tk_yapendik_01');
  await inspect6Gates('sch_tk_yapendik_02');
}

run();
