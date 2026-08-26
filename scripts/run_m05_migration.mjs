/**
 * Yapendik School OS — Stage 3 Milestone 3.1 Migration Runner
 * Executes m05_temporal_lineage_and_protection_triggers.sql atomically against live PostgreSQL.
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

const migrationPath = path.resolve('db_migrations/m05_temporal_lineage_and_protection_triggers.sql');

async function runM05Migration() {
  console.log(`════════════════════════════════════════════════════════════════════════`);
  console.log(`[STAGE 3.1 MIGRATION] EXECUTING: m05_temporal_lineage_and_protection_triggers.sql`);
  console.log(`════════════════════════════════════════════════════════════════════════`);

  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Beginning atomic database transaction...');
    await client.query('BEGIN');
    
    // Execute migration SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅ TRANSACTION COMMITTED: Migration M05 executed successfully!\n');

    // Post-migration inspection 1: Verify student_placement_records table
    const tableCols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'student_placement_records'
      ORDER BY ordinal_position;
    `);
    console.log('--- student_placement_records Columns ---');
    console.table(tableCols.rows);

    // Post-migration inspection 2: Verify backfill counts
    const backfillCount = await client.query(`
      SELECT COUNT(*) as total_placements,
             COUNT(*) FILTER (WHERE placement_status = 'ACTIVE') as active_placements
      FROM public.student_placement_records;
    `);
    console.log('\n--- Placement Records Backfill Summary ---');
    console.table(backfillCount.rows);

    // Post-migration inspection 3: View sample backfilled placements
    const samplePlacements = await client.query(`
      SELECT spr.id, spr.student_id, s.nis, spr.class_id, c.name as class_name, 
             spr.academic_year_id, spr.placement_status, spr.entry_date
      FROM public.student_placement_records spr
      JOIN public.students s ON s.id = spr.student_id
      JOIN public.classes c ON c.id = spr.class_id
      LIMIT 5;
    `);
    console.log('\n--- Sample Placement Records Lineage ---');
    console.table(samplePlacements.rows);

    // Post-migration inspection 4: Verify triggers created
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_name IN (
        'trg_guard_closed_semester_obs',
        'trg_guard_closed_semester_att',
        'trg_guard_closed_semester_lppa',
        'trg_placement_terminalization_guard',
        'trg_sync_student_current_class'
      );
    `);
    console.log('\n--- Protection & Immutability Triggers Active ---');
    console.table(triggers.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ MIGRATION M05 FAILED (ROLLED BACK 100%):', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runM05Migration();
