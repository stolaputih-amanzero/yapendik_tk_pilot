/**
 * Yapendik School OS — Database Migration Runner Script
 * Safely executes individual idempotent SQL migrations against PostgreSQL / Supabase Cloud.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.supabase' });
dotenv.config();

const pool = new pg.Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres',
  password: '!V6i#=Qtz54+QpW',
  database: 'postgres',
  ssl: {
    servername: 'db.diliqtfgzxmjvwzczdcx.supabase.co',
    rejectUnauthorized: false
  }
});

const targetFile = process.argv[2] || 'db_migrations/m03_governed_provisioning_rpcs.sql';
const resolvedPath = path.resolve(targetFile);

async function runMigration() {
  console.log(`========================================================================`);
  console.log(`[MIGRATION RUNNER] EXECUTING: ${path.basename(resolvedPath)}`);
  console.log(`========================================================================`);
  
  const client = await pool.connect();
  try {
    const sqlContent = fs.readFileSync(resolvedPath, 'utf8');
    
    console.log('Beginning database transaction...');
    await client.query('BEGIN');
    await client.query(sqlContent);
    await client.query('COMMIT');
    console.log('✅ Migration committed successfully!');

    // Post-migration inspection on schools table
    const result = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'schools' AND column_name IN ('status', 'operational_readiness');
    `);
    console.log('\n--- Schools Table Columns Verification ---');
    console.table(result.rows);

    const schoolRows = await client.query(`
      SELECT id, name, status, operational_readiness 
      FROM schools LIMIT 5;
    `);
    console.log('\n--- Current Schools Rows Preview ---');
    console.table(schoolRows.rows);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed and was rolled back:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
