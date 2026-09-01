// init-db.js - Manage SQLite database initialization and seeding
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

function translateQuery(sql) {
  let result = sql;
  
  // Replace PG types
  result = result.replace(/\bBIGSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  result = result.replace(/\bBIGSERIAL\b/gi, 'INTEGER');
  result = result.replace(/\bTIMESTAMPTZ\b/gi, 'TEXT');
  result = result.replace(/\bJSONB\b/gi, 'TEXT');
  result = result.replace(/\bBOOL\b/gi, 'INTEGER');
  result = result.replace(/\bBOOLEAN\b/gi, 'INTEGER');
  
  // Replace now() and date intervals
  result = result.replace(/now\(\)\s*-\s*INTERVAL\s*'(\d+)\s+days?'\s*\+\s*INTERVAL\s*'(\d+)\s+minutes?'/gi, "datetime('now', '-$1 days', '+$2 minutes')");
  result = result.replace(/DEFAULT\s+now\(\)/gi, "DEFAULT (datetime('now'))");
  result = result.replace(/DEFAULT\s+CURRENT_DATE/gi, "DEFAULT (date('now'))");
  result = result.replace(/now\(\)/gi, "datetime('now')");
  result = result.replace(/CURRENT_DATE/gi, "date('now')");
  result = result.replace(/(datetime\('now'\)|CURRENT_TIMESTAMP)\s*-\s*INTERVAL\s*'(\d+)\s+days?'/gi, "datetime('now', '-$2 days')");
  result = result.replace(/(datetime\('now'\)|CURRENT_TIMESTAMP)\s*-\s*INTERVAL\s*'(\d+)\s+hours?'/gi, "datetime('now', '-$2 hours')");
  result = result.replace(/(datetime\('now'\)|CURRENT_TIMESTAMP)\s*\+\s*INTERVAL\s*'(\d+)\s+days?'/gi, "datetime('now', '+$2 days')");
  
  // Remove PostgreSQL casts like ::int or ::numeric
  result = result.replace(/::[a-zA-Z0-9_()]+/g, '');

  // Remove IF NOT EXISTS from ALTER TABLE ADD COLUMN since SQLite doesn't support it
  result = result.replace(/ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS (\w+) ([^;]+);/gi, (match, table, col, type) => {
    return `ALTER TABLE ${table} ADD COLUMN ${col} ${type};`;
  });

  return result;
}

function main() {
  console.log('--- SQLite Database Setup & Migration ---');
  
  const dbFile = path.resolve('skillswap.db');
  if (fs.existsSync(dbFile)) {
    try {
      fs.unlinkSync(dbFile);
      console.log('Deleted existing database for a clean start...');
    } catch (e) {
      console.log('Database file locked by running server, applying migrations incrementally...');
    }
  }
  
  const db = new DatabaseSync(dbFile);
  console.log('Created local SQLite database file: skillswap.db');

  const migrations = [
    'migrations/0001_initial_schema.sql',
    'migrations/0002_update_features_schema.sql',
    'migrations/0003_admin_suite_schema.sql',
    'migrations/0004_learning_hub_ai_schema.sql',
    'seed.sql'
  ];

  for (const file of migrations) {
    console.log(`Running ${file}...`);
    let sql = fs.readFileSync(path.resolve(file), 'utf8');
    sql = translateQuery(sql);
    
    // Split statements respecting single/double quoted strings
    const statements = [];
    let current = '';
    let inString = false;
    let quoteChar = '';

    const sqlNoComments = sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    for (let i = 0; i < sqlNoComments.length; i++) {
      const char = sqlNoComments[i];
      if (inString) {
        current += char;
        if (char === quoteChar) {
          if (sqlNoComments[i + 1] === quoteChar) {
            current += sqlNoComments[i + 1];
            i++;
          } else {
            inString = false;
          }
        }
      } else {
        if (char === "'" || char === '"') {
          inString = true;
          quoteChar = char;
          current += char;
        } else if (char === ';') {
          statements.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    if (current.trim().length > 0) {
      statements.push(current.trim());
    }

    const filteredStatements = statements.filter(s => s.length > 0);

    for (const stmt of filteredStatements) {
      try {
        db.exec(stmt);
      } catch (err) {
        if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
          // Idempotent column or index addition, continue
          continue;
        }
        console.error(`Error executing statement in ${file}:\n${stmt}\n`, err.message);
        process.exit(1);
      }
    }
    console.log(`Successfully completed ${file}.`);
  }

  db.close();
  console.log('--- Database Setup Completed Successfully! ---');
}

main();
