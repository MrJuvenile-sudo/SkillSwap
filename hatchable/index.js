
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { MASTER_SCHEMA_SQL } from './schema.js';

// Dual-Database Engine: Cloud PostgreSQL (Neon/Supabase/RDS) vs. Local SQLite
const isCloudPostgres = Boolean(
  process.env.DATABASE_URL || 
  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
);

let pgPool = null;
let database = null;
let isCloudSchemaReady = false;
let cloudSchemaPromise = null;

async function ensureCloudSchema() {
  if (isCloudSchemaReady || !pgPool) return;
  if (!cloudSchemaPromise) {
    cloudSchemaPromise = (async () => {
      try {
        const check = await pgPool.query(
          "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_users' LIMIT 1"
        );
        if (check.rows.length === 0) {
          console.log('⚡ Detected uninitialized Cloud PostgreSQL database. Running master schema migration...');
          await pgPool.query(MASTER_SCHEMA_SQL);
          console.log('✓ Master schema & seed catalog successfully created in Cloud PostgreSQL!');
        }
        isCloudSchemaReady = true;
      } catch (err) {
        console.error('Cloud schema auto-init error/notice:', err.message);
        isCloudSchemaReady = true;
      }
    })();
  }
  await cloudSchemaPromise;
}

if (isCloudPostgres) {
  const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'skillswap',
        ssl: { rejectUnauthorized: false }
      };

  pgPool = new pg.Pool(config);
  console.log('✓ Connected to Cloud PostgreSQL database (' + (process.env.DB_HOST || 'via DATABASE_URL') + ')');
} else {
  let dbPath = process.env.DATABASE_PATH;
  if (!dbPath) {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || (process.platform === 'linux' && process.env.NODE_ENV === 'production')) {
      const tmpDbPath = path.join('/tmp', 'skillswap.db');
      const seedDbPath = path.resolve('skillswap.db');
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(seedDbPath)) {
        try {
          fs.copyFileSync(seedDbPath, tmpDbPath);
          console.log('✓ Copied seed database to writable /tmp/skillswap.db');
        } catch (copyErr) {
          console.warn('Could not copy seed database to /tmp:', copyErr.message);
        }
      }
      dbPath = tmpDbPath;
    } else {
      dbPath = path.resolve('skillswap.db');
    }
  } else {
    dbPath = path.resolve(dbPath);
  }

  database = new DatabaseSync(dbPath);
  console.log('✓ Connected to local SQLite database:', dbPath);
}

function translateQuery(sql, params = []) {
  let result = sql;
  const mappedParams = [];

  // 1. Convert $1, $2, ... to ? while mapping params by index
  result = result.replace(/\$(\d+)/g, (match, index) => {
    const paramIdx = parseInt(index, 10) - 1;
    if (params && paramIdx >= 0 && paramIdx < params.length) {
      mappedParams.push(params[paramIdx]);
    } else {
      mappedParams.push(null);
    }
    return '?';
  });

  // 2. Wrap function default values in parentheses for SQLite compatibility
  result = result.replace(/DEFAULT\s+now\(\)/gi, "DEFAULT (datetime('now'))");
  result = result.replace(/DEFAULT\s+CURRENT_DATE/gi, "DEFAULT (date('now'))");

  // 3. Replace now() and CURRENT_DATE/CURRENT_TIMESTAMP functions
  result = result.replace(/now\(\)/gi, "datetime('now')");
  result = result.replace(/CURRENT_DATE/gi, "date('now')");
  result = result.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");

  // 4. Multi-interval expression specific to seed/queries if any
  result = result.replace(/datetime\('now'\)\s*-\s*INTERVAL\s*'(\d+)\s+days?'\s*\+\s*INTERVAL\s*'(\d+)\s+minutes?'/gi, "datetime('now', '-$1 days', '+$2 minutes')");

  // 5. Replace PG types in table creation or other queries
  result = result.replace(/\bBIGSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  result = result.replace(/\bBIGSERIAL\b/gi, 'INTEGER');
  result = result.replace(/\bTIMESTAMPTZ\b/gi, 'TEXT');
  result = result.replace(/\bJSONB\b/gi, 'TEXT');
  result = result.replace(/\bBOOL\b/gi, 'INTEGER');
  result = result.replace(/\bBOOLEAN\b/gi, 'INTEGER');

  // 6. Replace date/timestamp intervals
  result = result.replace(/(datetime\('now'\))\s*-\s*INTERVAL\s*'(\d+)\s+(days?|hours?|minutes?|seconds?)'/gi, "datetime('now', '-$2 $3')");
  result = result.replace(/(datetime\('now'\))\s*\+\s*INTERVAL\s*'(\d+)\s+(days?|hours?|minutes?|seconds?)'/gi, "datetime('now', '+$2 $3')");

  // 7. Remove PostgreSQL casts like ::int or ::numeric
  result = result.replace(/::[a-zA-Z0-9_()]+/g, '');

  // 8. Replace ILIKE with LIKE
  result = result.replace(/\bILIKE\b/gi, 'LIKE');

  const rawParams = (sql.includes('$') && mappedParams.length > 0) ? mappedParams : params;
  const finalParams = (rawParams || []).map(p => {
    if (p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });
  return { sql: result, params: finalParams };
}

function tryParseJson(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(val);
      } catch (err) {
        // ignore and return string
      }
    }
  }
  return val;
}

export const db = {
  query: async (sql, params = []) => {
    // 1. If connected to Cloud PostgreSQL (Neon/Supabase/RDS)
    if (pgPool) {
      await ensureCloudSchema();
      try {
        const res = await pgPool.query(sql, params);
        return {
          rows: res.rows || [],
          rowCount: res.rowCount || 0
        };
      } catch (err) {
        console.error('Cloud PostgreSQL query error:', err.message, 'on SQL:', sql);
        throw err;
      }
    }

    // 2. Local SQLite with query translation
    const { sql: translatedSql, params: translatedParams } = translateQuery(sql, params);
    try {
      const stmt = database.prepare(translatedSql);
      const rows = stmt.all(...translatedParams);
      
      for (const row of rows) {
        for (const key of Object.keys(row)) {
          row[key] = tryParseJson(row[key]);
        }
      }
      
      return {
        rows: rows,
        rowCount: rows.length
      };
    } catch (err) {
      console.error('Database query error:', err.message, 'on SQL:', sql, 'Translated SQL:', translatedSql);
      throw err;
    }
  }
};

export const email = {
  send: async (options) => {
    console.log('[Mock Email Sent]:', options);
    return { success: true };
  }
};

export const events = {
  grant: async (channels, options) => {
    return { token: 'mock-realtime-token', expires_at: new Date(Date.now() + 300 * 1000).toISOString() };
  },
  publish: async (channel, eventName, data) => {
    console.log(`[Mock Event Published] Channel: ${channel}, Event: ${eventName}, Data:`, data);
    return { success: true };
  }
};

export const auth = {
  getUser: async (req) => {
    // Return null so the local authentication auth.js defaults to cookies
    return null;
  }
};
