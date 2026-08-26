/**
 * Yapendik School OS — Stage 3 Milestone 3.2 Migration Runner
 * Executes m06_governed_lifecycle_rpcs_and_telemetry.sql atomically against live PostgreSQL.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.supabase' });
dotenv.config();

const pool = new pg.Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.diliqtfgzxmjvwzczdcx',
  password: '!V6i#=Qtz54+QpW',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const migrationPath = path.resolve('db_migrations/m06_governed_lifecycle_rpcs_and_telemetry.sql');

async function runM06Migration() {
  console.log(`════════════════════════════════════════════════════════════════════════`);
  console.log(`[STAGE 3.2 MIGRATION] EXECUTING: m06_governed_lifecycle_rpcs_and_telemetry.sql`);
  console.log(`════════════════════════════════════════════════════════════════════════`);

  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Beginning atomic database transaction...');
    await client.query('BEGIN');
    
    // Execute migration SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅ TRANSACTION COMMITTED: Migration M06 executed successfully!\n');

    // Post-migration inspection: Verify functions exist in database
    const funcs = await client.query(`
      SELECT routine_name, routine_type, security_type, specific_name
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name IN (
        'rpc_close_academic_semester',
        'rpc_promote_classroom_cohort',
        'rpc_graduate_student_cohort',
        'rpc_initialize_next_semester',
        'fn_derive_school_health_telemetry',
        'fn_get_student_longitudinal_trajectory'
      );
    `);
    console.log('--- Governed RPCs & Functions Active in PostgreSQL ---');
    console.table(funcs.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ MIGRATION M06 FAILED (ROLLED BACK 100%):', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runM06Migration();
