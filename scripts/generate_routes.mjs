// scripts/generate_routes.mjs - Pre-generates static route registry for Vercel and production
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'server', 'api');
const outputFile = path.join(rootDir, 'server', 'routes.js');

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = getFilesRecursively(apiDir);
files.sort();

const imports = [];
const routeEntries = [];

for (const filePath of files) {
  const relFromApi = path.relative(apiDir, filePath).replace(/\\/g, '/');
  const varName = 'handler_' + relFromApi.replace(/\.js$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  const importPath = './api/' + relFromApi;

  imports.push(`import ${varName} from '${importPath}';`);

  const routePath = relFromApi.replace(/\.js$/, '');
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

  pathsToRegister = pathsToRegister.map(p => p.replace(/\[([^\]]+)\]/g, ':$1'));

  for (const p of pathsToRegister) {
    routeEntries.push({
      path: p,
      handlerVar: varName,
      file: relFromApi
    });
  }
}

// Sort routes: static first (longer first), parameterized later
routeEntries.sort((a, b) => {
  const isParamA = a.path.includes(':');
  const isParamB = b.path.includes(':');
  if (isParamA && !isParamB) return 1;
  if (!isParamA && isParamB) return -1;
  return b.path.length - a.path.length;
});

const code = `// server/routes.js - Auto-generated static route registry
// Generated at: ${new Date().toISOString()}
// Do NOT edit directly; run "node scripts/generate_routes.mjs" to regenerate.

${imports.join('\n')}

export const routes = [
${routeEntries.map(r => `  { path: '${r.path}', handler: ${r.handlerVar}, file: '${r.file}' }`).join(',\n')}
];

export function registerRoutes(app) {
  for (const route of routes) {
    app.all(route.path, async (req, res, next) => {
      // For static routes, ensure exact path match so /api/resources doesn't swallow /api/resources/upload
      if (!route.path.includes(':')) {
        const cleanReqPath = req.path.replace(/\\/$/, '');
        const cleanRoutePath = route.path.replace(/\\/$/, '');
        if (cleanReqPath !== cleanRoutePath) {
          return next();
        }
      }
      try {
        await route.handler(req, res);
      } catch (err) {
        console.error(\`Error in API endpoint \${req.method} \${route.path}:\`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error in api endpoint' });
        }
      }
    });
  }
}
`;

fs.writeFileSync(outputFile, code, 'utf8');
console.log(`✓ Generated server/routes.js with ${imports.length} handlers and ${routeEntries.length} mapped endpoints!`);
