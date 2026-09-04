/**
 * Yapendik School OS — Genesis Data Ingestion & Auth Seeding Script
 * 
 * Target Institution: TK Yapendik Maranatha Jakarta (NPSN: 69820291)
 * Purpose: Provision Supabase Auth accounts for leadership & teachers, and link them to persons.
 * Compliance: Stage 4.5 Frozen Schema & FB-01 (Zero Individual Exposure).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = process.env.GENESIS_DEFAULT_PASSWORD || process.env.PILOT_SEED_DEFAULT_PASSWORD || 'tkm2026#';

console.log('========================================================================');
console.log('🏛️  YAPENDIK SCHOOL OS — GENESIS AUTH ORCHESTRATION');
console.log('    Target: TK Yapendik Maranatha Jakarta (NPSN: 69820291)');
console.log('========================================================================\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  console.error('   Please define them in .env.local before running this orchestration script.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const genesisStaff = [
  {
    role: 'SUPERADMIN',
    name: 'SHIRLEY A.T.WAKKARY',
    email: 'shirleyumbas@gmail.com',
    personId: 'per_superadmin_shirley',
    phone: '081281310123'
  },
  {
    role: 'HEADMASTER',
    name: 'SHERYL Y N UMBAS, S.IKOM, M.PD',
    email: 'sherylumbas9@gmail.com',
    personId: 'per_headmaster_sheryl',
    phone: '081219748487'
  },
  {
    role: 'TEACHER',
    name: 'ERNA BOYKELA R',
    email: 'yapendikmaranathajkt@gmail.com',
    personId: 'per_teacher_erna',
    phone: '081218641392',
    classAssignment: 'TK_A'
  },
  {
    role: 'ASSISTANT_TEACHER',
    name: 'CHARLOTHA JOVANNCA BLANDINNA R',
    email: 'ratmalajovannca@gmail.com',
    personId: 'per_teacher_charlotha',
    phone: '081385868377',
    classAssignment: 'TK_A'
  },
  {
    role: 'ASSISTANT_TEACHER',
    name: 'EVI TANIA',
    email: 'taniaevi101@gmail.com',
    personId: 'per_teacher_evi',
    phone: '089536851668',
    classAssignment: 'TK_B'
  },
  {
    role: 'GUARDIAN',
    name: 'JULEN PATRICIA',
    email: 'julen.patricia@gmail.com',
    personId: 'per_guard_julen_patricia',
    phone: '081296970087'
  },
  {
    role: 'GUARDIAN',
    name: 'MUTIARA ZEGA',
    email: 'mutiara.zega@gmail.com',
    personId: 'per_guard_mutiara_zega',
    phone: '081394642219'
  }
];

async function orchestrateGenesis() {
  console.log(`[1/3] Fetching existing Supabase Auth accounts...`);
  const { data: usersList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listErr) {
    console.error('❌ Failed to query auth users:', listErr.message);
    process.exit(1);
  }

  const existingUsers = usersList?.users || [];
  console.log(`      Found ${existingUsers.length} existing accounts.\n`);

  console.log(`[2/3] Provisioning Genesis Staff Accounts (${genesisStaff.length} accounts)...`);

  const results = [];

  for (const staff of genesisStaff) {
    let authUser = existingUsers.find(u => u.email?.toLowerCase() === staff.email.toLowerCase());

    if (!authUser) {
      console.log(`  ➕ Creating Auth account: ${staff.email} (${staff.name})`);
      const { data: createdData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: staff.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: staff.name,
          role: staff.role,
          person_id: staff.personId,
          force_password_change: true
        }
      });

      if (createErr) {
        console.error(`     ❌ Creation failed: ${createErr.message}`);
        results.push({ ...staff, status: 'FAILED', error: createErr.message });
        continue;
      }

      authUser = createdData.user;
      console.log(`     ✅ Created auth.users record: ${authUser.id}`);
    } else {
      console.log(`  ℹ️  Auth account exists: ${staff.email} (${authUser.id})`);
    }

    // Map in user_person_identities
    console.log(`     🔗 Linking user_person_identities: ${authUser.id} -> ${staff.personId}`);
    const { error: mapErr } = await supabaseAdmin
      .from('user_person_identities')
      .upsert({
        auth_user_id: authUser.id,
        person_id: staff.personId,
        status: 'ACTIVE',
        updated_at: new Date().toISOString()
      }, { onConflict: 'auth_user_id' });

    if (mapErr) {
      console.error(`     ❌ Mapping failed: ${mapErr.message}`);
      results.push({ ...staff, authId: authUser.id, status: 'MAP_FAILED', error: mapErr.message });
    } else {
      console.log(`     ✅ Identity mapped successfully with status = ACTIVE`);
      results.push({ ...staff, authId: authUser.id, status: 'SUCCESS' });
    }
  }

  console.log('\n[3/3] Genesis Auth Ingestion Summary:');
  console.log('------------------------------------------------------------------------');
  console.table(results.map(r => ({
    Role: r.role,
    Name: r.name,
    Email: r.email,
    PersonID: r.personId,
    Status: r.status
  })));
  console.log('------------------------------------------------------------------------');
  console.log('✨ All Genesis Staff accounts processed.');
  console.log('   Default Temporary Password Policy: Applied (force_password_change = true)');
  console.log('========================================================================\n');
}

orchestrateGenesis().catch(err => {
  console.error('Fatal error during genesis orchestration:', err);
  process.exit(1);
});
