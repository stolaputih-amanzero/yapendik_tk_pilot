import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.diliqtfgzxmjvwzczdcx',
  password: '!V6i#=Qtz54+QpW',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function testHendra() {
  const client = await pool.connect();
  try {
    const ident = await client.query("SELECT * FROM user_person_identities WHERE person_id = 'per_parent_hendra'");
    console.log('User person identity for hendra:', ident.rows);

    await client.query('BEGIN');
    const authUid = ident.rows.length > 0 ? ident.rows[0].auth_user_id : 'per_parent_hendra';
    await client.query(`SET LOCAL request.jwt.claims = '${JSON.stringify({ sub: authUid, role: 'authenticated' })}'`);

    const authPer = await client.query('SELECT public.get_auth_person_id() as person_id');
    console.log('Auth person resolved for hendra:', authPer.rows[0]);

    try {
      const traj = await client.query("SELECT public.fn_get_student_longitudinal_trajectory('stu_kenzo_01')");
      console.log('Trajectory returned unexpectedly:', traj.rows[0]);
    } catch (err) {
      console.log('Caught expected error from trajectory:', err.message);
    }
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}

testHendra().catch(console.error);
