// Backend/middleware/authMiddleware.js - Authentication & Role Authorization Middleware
import { getDb } from '../config/db.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const headerUserId = req.headers['x-user-id'];
    const cookieToken = req.cookies?.skillswap_token;
    const cookieUserId = req.cookies?.skillswap_user_id;

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (cookieToken || null);
    const userId = headerUserId || cookieUserId;

    if (!userId && !token) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const db = await getDb();
    let user = null;

    if (userId) {
      const result = await db.query('SELECT id, name, email, role, status, avatar_url, karma_score FROM app_users WHERE id = ?', [userId]);
      user = result.rows[0];
    }

    if (!user && token) {
      // Decode simple token or verify JWT payload
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload && payload.userId) {
            const result = await db.query('SELECT id, name, email, role, status, avatar_url, karma_score FROM app_users WHERE id = ?', [payload.userId]);
            user = result.rows[0];
          }
        } catch (e) {}
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid user credentials.' });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Access denied: Your account has been suspended by administration.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    res.status(500).json({ error: 'Internal server error in authentication verification.' });
  }
}

export function requireRole(allowedRoles = ['ADMIN', 'SUPER_ADMIN']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges for administrative action.' });
    }
    next();
  };
}
