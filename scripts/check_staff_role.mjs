import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.diliqtfgzxmjvwzczdcx',
  password: '!V6i#=Qtz54+QpW',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkAndSeedSuperadmin() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'public.staff_profiles'::regclass;
    `);
    console.log('staff_profiles constraints:', res.rows);

    // Update constraint to include SUPERADMIN if needed
    console.log('Ensuring SUPERADMIN is allowed in staff_profiles.role...');
    await client.query(`
      ALTER TABLE public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_role_check;
      ALTER TABLE public.staff_profiles 
        ADD CONSTRAINT staff_profiles_role_check 
        CHECK (role IN ('SUPERADMIN', 'HEADMASTER', 'ADMIN', 'COUNSELOR', 'LIBRARIAN', 'OTHER'));
    `);

    // Insert Andreas as SUPERADMIN
    await client.query(`
      INSERT INTO public.staff_profiles (id, person_id, school_id, role, employment_type, is_active)
      VALUES ('stf_superadmin_andreas', 'per_superadmin_andreas', 'sch_tk_yapendik_01', 'SUPERADMIN', 'TETAP', true)
      ON CONFLICT (id) DO UPDATE SET role = 'SUPERADMIN', is_active = true;
    `);
    console.log('✅ Superadmin Andreas registered in staff_profiles successfully!');

  } finally {
    client.release();
    await pool.end();
  }
}

checkAndSeedSuperadmin().catch(console.error);
