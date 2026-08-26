import pg from 'pg';

async function testPooler5432() {
  const user = 'postgres.diliqtfgzxmjvwzczdcx';
  const pass = '!V6i#=Qtz54+QpW';
  
  // Test both 5432 and 6543 with different hosts
  const targets = [
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: user },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: user },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres' }
  ];

  for (const t of targets) {
    const connStr = `postgresql://${t.user}:${encodeURIComponent(pass)}@${t.host}:${t.port}/postgres`;
    console.log(`Connecting to ${t.host}:${t.port} with user ${t.user}...`);
    const pool = new pg.Pool({ connectionString: connStr, connectionTimeoutMillis: 4000, ssl: { rejectUnauthorized: false } });
    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESSFUL CONNECTION to ${t.host}:${t.port} with ${t.user}!`);
      const res = await client.query('SELECT current_database(), current_user, version()');
      console.log('Result:', res.rows[0]);
      client.release();
      await pool.end();
      return connStr;
    } catch (e) {
      console.log(`❌ Failed:`, e.message);
      await pool.end();
    }
  }
}

testPooler5432();
