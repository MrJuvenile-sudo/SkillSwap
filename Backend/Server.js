// Backend/Server.js - Main Server Execution Entrypoint
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './App.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env in Backend or Root)
const envBackend = path.resolve(__dirname, '.env');
const envRoot = path.resolve(__dirname, '../.env');

if (fs.existsSync(envBackend) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envBackend);
  } catch (e) {}
} else if (fs.existsSync(envRoot) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envRoot);
  } catch (e) {}
}

const PORT = process.env.PORT || 3005;

// SPA Fallback Handler
const frontendDistIndex = path.resolve(__dirname, '../frontend/dist/index.html');
const frontendPublicIndex = path.resolve(__dirname, '../frontend/index.html');
const rootPublicIndex = path.resolve(__dirname, '../public/index.html');

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  if (fs.existsSync(frontendDistIndex)) {
    return res.sendFile(frontendDistIndex);
  } else if (fs.existsSync(frontendPublicIndex)) {
    return res.sendFile(frontendPublicIndex);
  } else if (fs.existsSync(rootPublicIndex)) {
    return res.sendFile(rootPublicIndex);
  }
  res.status(404).send('SkillSwapX Frontend not found.');
});

// Start listening
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 SkillSwapX Backend Server listening on http://localhost:${PORT}\n`);
  });
}

export default app;
