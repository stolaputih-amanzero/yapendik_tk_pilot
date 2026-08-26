import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkProfiles() {
  const { data: persons } = await supabase.from('persons').select('id, full_name');
  console.log('Persons:', persons);

  const { data: teachers } = await supabase.from('teacher_profiles').select('*');
  console.log('Teacher profiles:', teachers);

  const { data: staff } = await supabase.from('staff_profiles').select('*');
  console.log('Staff profiles:', staff);

  const { data: identities } = await supabase.from('user_person_identities').select('*');
  console.log('Identities:', identities);
}

checkProfiles();
