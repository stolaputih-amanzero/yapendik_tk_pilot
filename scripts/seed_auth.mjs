/**
 * Yapendik School OS — Auth User Seeding Utility
 * Consumes environment variables securely. NEVER hardcode service role keys or credentials.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('Configure them in .env.local without committing secrets to the repository.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultPassword = process.env.PILOT_SEED_DEFAULT_PASSWORD;
if (!defaultPassword) {
  console.error('ERROR: PILOT_SEED_DEFAULT_PASSWORD environment variable is required for creating seed user accounts.');
  process.exit(1);
}

const personas = [
  { id: 'user_teacher_siti', personId: 'per_teacher_siti', email: 'siti@yapendik.sch.id', name: 'Siti Rahmawati, S.Pd' },
  { id: 'user_teacher_maria', personId: 'per_teacher_maria', email: 'maria@yapendik.sch.id', name: 'Maria Magdalena, S.Pd.Aud' },
  { id: 'user_headmaster_esther', personId: 'per_headmaster_esther', email: 'esther@yapendik.sch.id', name: 'Dra. Esther Nugroho, M.Pd' },
  { id: 'user_parent_budi', personId: 'per_parent_budi', email: 'budi@yapendik.sch.id', name: 'Budi Santoso, S.T.' },
  { id: 'user_teacher_diana_tk2', personId: 'per_teacher_diana', email: 'diana@yapendik.sch.id', name: 'Diana Sari, S.Pd' },
  { id: 'user_superadmin_yapendik', personId: 'per_superadmin_andreas', email: 'andreas@yapendik.sch.id', name: 'Dr. Andreas Hendrawan' }
];

async function seedAuth() {
  console.log('Starting Auth Seeding with environment-based credentials...');
  
  for (const p of personas) {
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Failed to list users:', listError.message);
      break;
    }

    let authUser = existingUsers?.users?.find(u => u.email === p.email);
    
    if (!authUser) {
      console.log(`Creating user: ${p.email}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: p.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { name: p.name, persona_id: p.id }
      });
      
      if (error) {
        console.error(`Failed to create ${p.email}:`, error.message);
        continue;
      }
      authUser = data.user;
      console.log(`Created auth.user: ${authUser.id}`);
    } else {
      console.log(`User ${p.email} already exists: ${authUser.id}`);
    }

    // Map in user_person_identities
    console.log(`Mapping ${authUser.id} to person ${p.personId}`);
    const { error: mapError } = await supabase
      .from('user_person_identities')
      .upsert({
        auth_user_id: authUser.id,
        person_id: p.personId,
        status: 'ACTIVE'
      }, { onConflict: 'auth_user_id' });
      
    if (mapError) {
      console.error(`Failed to map ${p.email}:`, mapError.message);
    } else {
      console.log(`Mapped successfully!`);
    }
  }
  
  console.log('Seeding complete.');
}

seedAuth();
