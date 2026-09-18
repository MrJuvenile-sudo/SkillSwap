// Single Catch-All Entry Point for Vercel Serverless Function (Hobby Plan Limit Fix)
import app from '../server.js';

export default function handler(req, res) {
  // If Vercel rewrote /api/(.*) to /api/index.js, restore the original requested API path
  if (req.url === '/api/index.js' || req.url === '/api/index' || req.url === '/api') {
    const originalPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (originalPath && originalPath.startsWith('/api')) {
      req.url = originalPath;
    }
  }
  return app(req, res);
}
