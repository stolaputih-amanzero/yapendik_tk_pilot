import pg from 'pg';

const regions = [
  'ap-southeast-1',
  'ap-southeast-3',
  'ap-northeast-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2'
];

const user = 'postgres.diliqtfgzxmjvwzczdcx';
const pass = encodeURIComponent('!V6i#=Qtz54+QpW');

async function testRegions() {
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const connStr = `postgresql://${user}:${pass}@${host}:6543/postgres`;
    const pool = new pg.Pool({ connectionString: connStr, connectionTimeoutMillis: 3000, ssl: { rejectUnauthorized: false } });
    try {
      console.log(`Testing host: ${host}...`);
      const client = await pool.connect();
      console.log(`✅ CONNECTED TO: ${host}`);
      const res = await client.query('SELECT current_database(), version();');
      console.log('Result:', res.rows[0]);
      client.release();
      await pool.end();
      return host;
    } catch (e) {
      console.log(`❌ Failed on ${host}:`, e.message);
      await pool.end();
    }
  }
}

testRegions();
