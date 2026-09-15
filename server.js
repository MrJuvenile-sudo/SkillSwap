// server.js - Custom Express server simulating Hatchable runtime environment
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

// ----------------------------------------------------
// 0. Load Environment Configuration (.env)
// ----------------------------------------------------
if (fs.existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
    console.log('✓ Loaded environment variables from .env');
  } catch (err) {
    console.warn('Notice: Failed to load .env file:', err.message);
  }
}

// ----------------------------------------------------
// 1. Express Server Setup & CORS Configuration
// ----------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3005;

// CORS configuration supporting local development and production frontends (e.g. Vercel)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : null);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests or same-origin requests
    if (!origin) return callback(null, true);
    
    // In development or if allowedOrigins is not explicitly set or contains '*', allow origin
    if (!allowedOrigins || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Check if origin matches allowed list or wildcard subdomains (e.g. *.vercel.app)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.startsWith('*.')) {
        return origin.endsWith(allowed.slice(2));
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked]: Origin ${origin} not permitted. Allowed:`, allowedOrigins);
      callback(new Error(`CORS policy: Origin ${origin} not permitted`));
    }
  },
  credentials: true, // Allow session cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'Cookie']
};

app.use(cors(corsOptions));

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
  const apiDir = fs.existsSync(path.resolve('server/api'))
    ? path.resolve('server/api')
    : path.resolve('api');
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

// Start Server if running locally (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 SkillSwapX Server is running locally at http://localhost:${PORT}\n`);
  });
}

export default app;
