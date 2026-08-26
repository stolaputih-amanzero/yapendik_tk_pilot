import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function seedTeachers() {
  console.log('Inserting teacher_profiles into Supabase Cloud...');
  
  const teachers = [
    {
      id: 'tch_siti_01',
      person_id: 'per_teacher_siti',
      school_id: 'sch_tk_yapendik_01',
      nuptk: '1234567890123456',
      employment_type: 'TETAP',
      join_date: '2021-07-01',
      is_active: true
    },
    {
      id: 'tch_maria_02',
      person_id: 'per_teacher_maria',
      school_id: 'sch_tk_yapendik_01',
      nuptk: '2345678901234567',
      employment_type: 'TETAP',
      join_date: '2022-07-01',
      is_active: true
    },
    {
      id: 'tch_diana_03',
      person_id: 'per_teacher_diana',
      school_id: 'sch_tk_yapendik_02',
      nuptk: '3456789012345678',
      employment_type: 'TETAP',
      join_date: '2023-07-01',
      is_active: true
    }
  ];

  const { error } = await supabase.from('teacher_profiles').upsert(teachers, { onConflict: 'id' });
  if (error) {
    console.error('Error inserting teacher profiles:', error);
  } else {
    console.log('Successfully inserted teacher profiles!');
  }
}

seedTeachers();
