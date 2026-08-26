import pg from 'pg';

const allRegions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'sa-east-1'
];

const user = 'postgres.diliqtfgzxmjvwzczdcx';
const pass = '!V6i#=Qtz54+QpW';

async function scan() {
  for (const reg of allRegions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const pool = new pg.Pool({
      host,
      port: 6543,
      user,
      password: pass,
      database: 'postgres',
      connectionTimeoutMillis: 2000,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      console.log(`🎉 SUCCESS! Connected to pooler at: ${host}`);
      const res = await client.query('SELECT current_database(), version();');
      console.log('Result:', res.rows[0]);
      client.release();
      await pool.end();
      return host;
    } catch (e) {
      console.log(`[${reg}] failed: ${e.message.split('\n')[0]}`);
      await pool.end();
    }
  }
}

scan();
