// server.js - Custom Express server simulating Hatchable runtime environment
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

// ----------------------------------------------------
// 1. Boot-time Setup: Mocks and Symlinks
// ----------------------------------------------------
const nodeModulesDir = path.resolve('node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir);
}

// Setup hatchable mock package
const hatchableDir = path.join(nodeModulesDir, 'hatchable');
if (!fs.existsSync(hatchableDir)) {
  fs.mkdirSync(hatchableDir, { recursive: true });
}
fs.writeFileSync(path.join(hatchableDir, 'package.json'), JSON.stringify({
  name: 'hatchable',
  version: '1.0.0',
  type: 'module',
  main: './index.js'
}, null, 2));
fs.writeFileSync(path.join(hatchableDir, 'index.js'), `
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const database = new DatabaseSync(path.resolve('skillswap.db'));

function translateQuery(sql) {
  let result = sql;
  
  // 1. Convert $1, $2, ... to ?
  result = result.replace(/\\$\\d+/g, '?');

  // 2. Wrap function default values in parentheses for SQLite compatibility
  result = result.replace(/DEFAULT\\s+now\\(\\)/gi, "DEFAULT (datetime('now'))");
  result = result.replace(/DEFAULT\\s+CURRENT_DATE/gi, "DEFAULT (date('now'))");

  // 3. Replace now() and CURRENT_DATE/CURRENT_TIMESTAMP functions
  result = result.replace(/now\\(\\)/gi, "datetime('now')");
  result = result.replace(/CURRENT_DATE/gi, "date('now')");
  result = result.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");

  // 4. Multi-interval expression specific to seed/queries if any
  result = result.replace(/datetime\\('now'\\)\\s*-\\s*INTERVAL\\s*'(\\d+)\\s+days?'\\s*\\+\\s*INTERVAL\\s*'(\\d+)\\s+minutes?'/gi, "datetime('now', '-$1 days', '+$2 minutes')");

  // 5. Replace PG types in table creation or other queries
  result = result.replace(/\\bBIGSERIAL PRIMARY KEY\\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  result = result.replace(/\\bBIGSERIAL\\b/gi, 'INTEGER');
  result = result.replace(/\\bTIMESTAMPTZ\\b/gi, 'TEXT');
  result = result.replace(/\\bJSONB\\b/gi, 'TEXT');
  result = result.replace(/\\bBOOL\\b/gi, 'INTEGER');
  result = result.replace(/\\bBOOLEAN\\b/gi, 'INTEGER');

  // 6. Replace date/timestamp intervals
  result = result.replace(/(datetime\\('now'\\))\\s*-\\s*INTERVAL\\s*'(\\d+)\\s+days?'/gi, "datetime('now', '-$2 days')");
  result = result.replace(/(datetime\\('now'\\))\\s*-\\s*INTERVAL\\s*'(\\d+)\\s+hours?'/gi, "datetime('now', '-$2 hours')");
  result = result.replace(/(datetime\\('now'\\))\\s*\\+\\s*INTERVAL\\s*'(\\d+)\\s+days?'/gi, "datetime('now', '+$2 days')");

  // 7. Remove PostgreSQL casts like ::int or ::numeric
  result = result.replace(/::[a-zA-Z0-9_()]+/g, '');

  // 8. Replace ILIKE with LIKE
  result = result.replace(/\\bILIKE\\b/gi, 'LIKE');

  return result;
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
    const translatedSql = translateQuery(sql);
    try {
      const stmt = database.prepare(translatedSql);
      const rows = stmt.all(...params);
      
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
    console.log(\`[Mock Event Published] Channel: \${channel}, Event: \${eventName}, Data:\`, data);
    return { success: true };
  }
};

export const auth = {
  getUser: async (req) => {
    // Return null so the local authentication auth.js defaults to cookies
    return null;
  }
};
`);
console.log('Hatchable mock runtime package verified.');

// Setup node_modules/lib symlink / junction
const libLink = path.join(nodeModulesDir, 'lib');
if (!fs.existsSync(libLink)) {
  try {
    fs.symlinkSync(path.resolve('lib'), libLink, process.platform === 'win32' ? 'junction' : 'dir');
    console.log('Created node_modules/lib directory symlink.');
  } catch (err) {
    console.error('Error creating node_modules/lib symlink:', err);
  }
}

// ----------------------------------------------------
// 2. Express Server Setup
// ----------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend assets
app.use(express.static(path.resolve('public')));

// ----------------------------------------------------
// 3. Dynamic File-System API Router
// ----------------------------------------------------
function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      if (file.endsWith('.js')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

async function loadRoutes() {
  const apiDir = path.resolve('api');
  const files = getFilesRecursively(apiDir);
  const routes = [];

  for (const filePath of files) {
    const relativePath = path.relative(apiDir, filePath);
    const routePath = relativePath
      .replace(/\\/g, '/')
      .replace(/\.js$/, '');

    let pathsToRegister = [];
    if (routePath.endsWith('/index')) {
      const parentRoute = routePath.slice(0, -6);
      pathsToRegister.push('/api/' + parentRoute);
      pathsToRegister.push('/api/' + routePath);
    } else if (routePath === 'index') {
      pathsToRegister.push('/api');
      pathsToRegister.push('/api/index');
    } else {
      pathsToRegister.push('/api/' + routePath);
    }

    // Map parameterized routes: [param] -> :param
    pathsToRegister = pathsToRegister.map(p => p.replace(/\[([^\]]+)\]/g, ':$1'));

    const fileUrl = pathToFileURL(filePath).href;
    try {
      const handlerModule = await import(fileUrl);
      const handler = handlerModule.default;

      if (typeof handler === 'function') {
        for (const p of pathsToRegister) {
          routes.push({
            path: p,
            handler: handler,
            file: relativePath
          });
        }
      }
    } catch (err) {
      console.error(`Failed to load route file: ${filePath}`, err);
    }
  }

  // Sort routes: static routes first (longer first), parameterized routes later
  routes.sort((a, b) => {
    const isParamA = a.path.includes(':');
    const isParamB = b.path.includes(':');
    if (isParamA && !isParamB) return 1;
    if (!isParamA && isParamB) return -1;
    return b.path.length - a.path.length;
  });

  // Register routes in Express
  for (const route of routes) {
    app.all(route.path, async (req, res, next) => {
      // For static routes, ensure exact path match so /api/resources doesn't swallow /api/resources/upload
      if (!route.path.includes(':')) {
        const cleanReqPath = req.path.replace(/\/$/, '');
        const cleanRoutePath = route.path.replace(/\/$/, '');
        if (cleanReqPath !== cleanRoutePath) {
          return next();
        }
      }
      try {
        await route.handler(req, res);
      } catch (err) {
        console.error(`Error in API endpoint ${req.method} ${route.path}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error in api endpoint' });
        }
      }
    });
  }
}

await loadRoutes();

// Fallback to serving SPA index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 SkillSwapX Server is running locally at http://localhost:${PORT}\n`);
});
