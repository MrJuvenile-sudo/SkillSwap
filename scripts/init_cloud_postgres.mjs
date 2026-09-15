// scripts/init_cloud_postgres.mjs - One-command cloud PostgreSQL migration runner (Neon/Supabase/RDS)
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Load .env if present
if (fs.existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch (err) {
    // ignore
  }
}

const connectionString = process.env.DATABASE_URL;
const host = process.env.DB_HOST;

if (!connectionString && (!host || host === 'localhost' || host === '127.0.0.1')) {
  console.error('\n❌ Error: No cloud PostgreSQL configuration found in environment variables!');
  console.error('Please specify DATABASE_URL (e.g. from Neon / Supabase) or DB_HOST, DB_USER, DB_PASSWORD in your .env or cloud dashboard.\n');
  console.error('Example:');
  console.error('  DATABASE_URL=postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require\n');
  process.exit(1);
}

const config = connectionString
  ? {
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'skillswap',
      ssl: { rejectUnauthorized: false }
    };

console.log('\n🚀 Connecting to Cloud PostgreSQL Database...');
const pool = new pg.Pool(config);

async function run() {
  try {
    const client = await pool.connect();
    console.log('✓ Successfully connected to Cloud PostgreSQL database!\n');

    const migrations = [
      'migrations/0001_initial_schema.sql',
      'migrations/0002_update_features_schema.sql',
      'migrations/0003_admin_suite_schema.sql',
      'migrations/0004_learning_hub_ai_schema.sql',
      'migrations/0005_exchange_hub_schema.sql',
      'seed.sql'
    ];

    for (const file of migrations) {
      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) continue;
      console.log(`Running ${file} on cloud PostgreSQL...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✓ Successfully completed ${file}.`);
    }

    client.release();
    console.log('\n🎉 Cloud PostgreSQL database initialization and schema setup completed!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database migration error:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
