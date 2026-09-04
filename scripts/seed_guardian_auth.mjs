import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = process.env.GENESIS_DEFAULT_PASSWORD || process.env.PILOT_SEED_DEFAULT_PASSWORD || 'tkm2026#';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const guardiansToSeed = [
  {
    email: 'julen.patricia@gmail.com',
    name: 'JULEN PATRICIA',
    role: 'GUARDIAN',
    personId: 'per_guard_julen_patricia',
    phone: '081296970087'
  },
  {
    email: 'mutiara.zega@gmail.com',
    name: 'MUTIARA ZEGA',
    role: 'GUARDIAN',
    personId: 'per_guard_mutiara_zega',
    phone: '081394642219'
  }
];

async function seedGuardians() {
  console.log('=== PROVISIONING GUARDIAN AUTH ACCOUNTS IN SUPABASE ===');

  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr);
    process.exit(1);
  }

  for (const g of guardiansToSeed) {
    let authUser = users.find(u => u.email?.toLowerCase() === g.email.toLowerCase());

    if (!authUser) {
      console.log(`Creating auth user for ${g.name} (${g.email})...`);
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: g.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: g.name,
          role: g.role,
          person_id: g.personId,
          force_password_change: false
        }
      });

      if (createErr) {
        console.error(`❌ Failed to create user ${g.email}:`, createErr.message);
        continue;
      }

      authUser = created.user;
      console.log(`✅ User created successfully: ${authUser.id}`);
    } else {
      console.log(`ℹ️ Auth user already exists: ${g.email} (${authUser.id}). Ensuring password is set...`);
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: DEFAULT_PASSWORD,
        email_confirm: true
      });
      if (updateErr) {
        console.error(`❌ Failed to update password:`, updateErr.message);
      } else {
        console.log(`✅ Password set to default password.`);
      }
    }

    // Map into user_person_identities
    console.log(`Linking to user_person_identities: ${authUser.id} -> ${g.personId}...`);
    const { error: mapErr } = await supabaseAdmin
      .from('user_person_identities')
      .upsert({
        auth_user_id: authUser.id,
        person_id: g.personId,
        status: 'ACTIVE',
        updated_at: new Date().toISOString()
      }, { onConflict: 'auth_user_id' });

    if (mapErr) {
      console.error(`❌ Mapping error:`, mapErr.message);
    } else {
      console.log(`✅ user_person_identities linked!`);
    }
  }

  console.log('\n=== TESTING SIGN-IN WITH SUPABASE CLIENT ===');
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  for (const g of guardiansToSeed) {
    const { data: signData, error: signErr } = await anonClient.auth.signInWithPassword({
      email: g.email,
      password: DEFAULT_PASSWORD
    });

    if (signErr) {
      console.error(`❌ Login test failed for ${g.email}:`, signErr.message);
    } else {
      console.log(`🎉 Login test SUCCESS for ${g.email}! User ID: ${signData.user.id}, Session active.`);
    }
  }
}

seedGuardians().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
