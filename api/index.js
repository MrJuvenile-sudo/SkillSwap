// Single Catch-All Entry Point for Vercel Serverless Function (Hobby Plan Limit Fix)
import app from '../server.js';

export default function handler(req, res) {
  return app(req, res);
}
