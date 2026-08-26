import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectSchema() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('🔍 STAGE 3 MIGRATION READINESS - LIVE SCHEMA RECONCILIATION');
  console.log('══════════════════════════════════════════════════════════');

  const tables = [
    'academic_years',
    'academic_periods',
    'students',
    'classes',
    'people',
    'staff_profiles',
    'guardian_relationships',
    'student_progress_reports',
    'daily_attendance_records',
    'observations',
    'audit_logs'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table [${table}]: ERROR ${error.message}`);
    } else {
      const sample = data?.[0] || {};
      console.log(`✅ Table [${table}]: (${Object.keys(sample).length} columns) -> [${Object.keys(sample).join(', ')}]`);
    }
  }

  console.log('\nChecking if student_placement_records exists...');
  const { data: plcData, error: plcErr } = await supabase.from('student_placement_records').select('*').limit(1);
  if (plcErr) {
    console.log(`ℹ️ student_placement_records does not exist yet (expected): ${plcErr.message}`);
  } else {
    console.log(`⚠️ student_placement_records ALREADY exists: [${Object.keys(plcData?.[0] || {}).join(', ')}]`);
  }

  console.log('\nChecking existing active academic years and periods...');
  const { data: ayData } = await supabase.from('academic_years').select('id, school_id, name, status, start_date, end_date');
  console.log('Academic years sample:', ayData?.slice(0, 3));

  const { data: apData } = await supabase.from('academic_periods').select('id, academic_year_id, school_id, name, type, status, start_date, end_date');
  console.log('Academic periods sample:', apData?.slice(0, 3));

  const { data: stuData } = await supabase.from('students').select('id, school_id, current_class_id, status, nis').limit(3);
  console.log('Students sample:', stuData);
}

inspectSchema().catch(console.error);
