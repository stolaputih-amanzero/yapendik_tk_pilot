import pg from 'pg';

async function testSni() {
  const pass = '!V6i#=Qtz54+QpW';
  const pool = new pg.Pool({
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.diliqtfgzxmjvwzczdcx',
    password: pass,
    database: 'postgres',
    ssl: {
      servername: 'db.diliqtfgzxmjvwzczdcx.supabase.co',
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Testing SNI connection...');
    const client = await pool.connect();
    console.log('✅ CONNECTED TO SUPABASE POSTGRESQL VIA POOLER SNI!');
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log('Database details:', res.rows[0]);
    client.release();
    await pool.end();
  } catch (e) {
    console.log('❌ SNI Connection error:', e.message);
    await pool.end();
  }
}

testSni();
