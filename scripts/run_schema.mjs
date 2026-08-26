/**
 * Yapendik School OS — Database Schema Runner Script
 * Consumes environment variables securely. NEVER hardcode credentials.
 */

import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL or POSTGRES_URL environment variable is required.');
  console.error('Please configure your database connection string in .env.local without committing credentials.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  console.log('Connecting to PostgreSQL database...');
  try {
    const schemaSql = fs.readFileSync('./supabase_schema.sql', 'utf8');
    
    console.log('Executing schema...');
    await pool.query(schemaSql);
    console.log('Schema executed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await pool.end();
  }
}

runSchema();
