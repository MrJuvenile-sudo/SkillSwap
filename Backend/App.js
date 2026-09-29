// Backend/App.js - Express Application Configuration
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express Application Instance
const app = express();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : null);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.startsWith('*.')) return origin.endsWith(allowed.slice(2));
      return allowed === origin;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not permitted`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'Cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Frontend Static Build or Public Directory
const frontendDist = path.resolve(__dirname, '../frontend/dist');
const frontendPublic = path.resolve(__dirname, '../frontend/public');
const rootPublic = path.resolve(__dirname, '../public');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}
if (fs.existsSync(frontendPublic)) {
  app.use(express.static(frontendPublic));
}
if (fs.existsSync(rootPublic)) {
  app.use(express.static(rootPublic));
}

// Mount Unified API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
