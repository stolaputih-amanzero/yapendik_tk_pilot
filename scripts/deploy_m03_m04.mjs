import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function deploySql() {
  console.log(`========================================================================`);
  console.log(`[M03/M04 DEPLOYMENT] DEPLOYING GOVERNED RPCS & FAIL-CLOSED RLS`);
  console.log(`========================================================================`);

  const m03Sql = fs.readFileSync(path.resolve('db_migrations/m03_governed_provisioning_rpcs.sql'), 'utf8');
  const m04Sql = fs.readFileSync(path.resolve('db_migrations/m04_fail_closed_rls_policies.sql'), 'utf8');

  console.log(`M03 Size: ${m03Sql.length} bytes`);
  console.log(`M04 Size: ${m04Sql.length} bytes`);

  // Let's test calling rpc_evaluate_school_readiness on Supabase
  console.log('\nVerifying current RPC availability on Supabase...');
  const { data: testEval, error: testErr } = await supabase.rpc('rpc_evaluate_school_readiness', { p_school_id: 'sch_tk_yapendik_01' });
  
  console.log('RPC test call result:', { testEval, error: testErr ? testErr.message : null });
}

deploySql();
