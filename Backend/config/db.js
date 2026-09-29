// Backend/config/db.js - Unified Database Configuration (SQLite & PostgreSQL)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect environment database (PostgreSQL on Cloud or local SQLite)
const usePostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

let dbClient = null;

// Initialize Database connection
async function getDb() {
  if (dbClient) return dbClient;

  if (usePostgres) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    dbClient = {
      type: 'postgres',
      query: async (sql, params = []) => {
        const client = await pool.connect();
        try {
          // Convert ? placeholders to $1, $2 for postgres if needed
          let paramIdx = 1;
          const pgSql = sql.replace(/\?/g, () => `$${paramIdx++}`);
          const res = await client.query(pgSql, params);
          return { rows: res.rows, rowCount: res.rowCount };
        } finally {
          client.release();
        }
      }
    };
    console.log('✓ Connected to PostgreSQL Database');
  } else {
    // Local SQLite database
    const { DatabaseSync } = await import('node:sqlite');
    const dbFilePath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../skillswap.db');
    const db = new DatabaseSync(dbFilePath);
    
    // Enable WAL mode and foreign keys for high concurrency
    try {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA foreign_keys = ON;');
    } catch (e) {}

    dbClient = {
      type: 'sqlite',
      native: db,
      query: (sql, params = []) => {
        try {
          const trimmed = sql.trim().toUpperCase();
          if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('WITH')) {
            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            return { rows, rowCount: rows.length };
          } else {
            const stmt = db.prepare(sql);
            const info = stmt.run(...params);
            return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
          }
        } catch (err) {
          console.error('[DB Query Error]:', err.message, 'SQL:', sql);
          throw err;
        }
      },
      exec: (sql) => db.exec(sql)
    };
    console.log(`✓ Connected to SQLite Database (${path.basename(dbFilePath)})`);
  }

  return dbClient;
}

export { getDb };
export default getDb;
