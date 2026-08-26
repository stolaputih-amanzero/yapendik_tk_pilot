import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function testSchoolCols() {
  console.log('Testing select on schools...');
  const { data, error } = await supabase.from('schools').select('*');
  if (error) {
    console.error('Error querying schools:', error);
    return;
  }
  console.log('Current schools keys:', Object.keys(data[0] || {}));
}

testSchoolCols();
