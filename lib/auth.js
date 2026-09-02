// lib/auth.js - Real Session & RBAC Authentication Resolver
import { auth, db } from 'hatchable';

/**
 * Resolves current authenticated user from session cookie or Bearer token
 * Returns app_users record or null
 */
export async function getCurrentUser(req) {
  try {
    // 1. Check Hatchable platform auth session if active
    let platformUser = null;
    try {
      platformUser = await auth.getUser(req);
    } catch {
      // ignore
    }

    if (platformUser && platformUser.id) {
      const email = platformUser.email || `${platformUser.id}@skillswap.local`;
      const name = platformUser.name || email.split('@')[0] || 'Member';
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `user_${Date.now().toString(36)}`;
      const avatar = platformUser.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(platformUser.id)}`;

      const { rows } = await db.query(
        `INSERT INTO app_users (id, name, username, email, avatar_url, role, status, email_verified, onboarding_completed)
         VALUES ($1, $2, $3, $4, $5, 'USER', 'ACTIVE', true, true)
         ON CONFLICT (id) DO UPDATE SET 
           name = COALESCE(EXCLUDED.name, app_users.name),
           avatar_url = COALESCE(EXCLUDED.avatar_url, app_users.avatar_url),
           updated_at = now()
         RETURNING id, name, username, email, role, status, avatar_url, headline, onboarding_completed, theme_preference`,
        [String(platformUser.id), name, username, email, avatar]
      );

      if (rows[0]) {
        await db.query(
          `INSERT INTO profiles (user_id, bio, preferred_language, availability, timezone)
           VALUES ($1, 'Passionate learner and skill exchanger.', 'English', 'Flexible Evenings', 'UTC')
           ON CONFLICT (user_id) DO NOTHING`,
          [rows[0].id]
        );
        return rows[0];
      }
    }

    // 2. Check Custom Persistent Session Token / Cookie / Header
    // Extracts session user ID from skillswap_session cookie or Authorization header or x-user-id
    const authHeader = req.headers['authorization'];
    let sessionToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.slice(7).trim();
    } else if (req.cookies?.skillswap_session) {
      sessionToken = req.cookies.skillswap_session;
    } else if (req.cookies?.user_id) {
      sessionToken = req.cookies.user_id;
    } else if (req.headers['x-user-id']) {
      sessionToken = req.headers['x-user-id'];
    }

    if (sessionToken && typeof sessionToken === 'string' && sessionToken.trim()) {
      const tokenVal = decodeURIComponent(sessionToken.trim());
      
      // Token format can be user ID directly or signed session string
      const userId = tokenVal.includes('::') ? tokenVal.split('::')[0] : tokenVal;

      const { rows } = await db.query(
        `SELECT id, name, username, email, role, status, avatar_url, headline, onboarding_completed, theme_preference
         FROM app_users 
         WHERE id = $1`,
        [userId]
      );

      if (rows && rows[0]) {
        if (rows[0].status === 'BLOCKED') {
          return null;
        }
        return rows[0];
      }
    }

    // Logged out visitor
    return null;
  } catch (err) {
    console.error('Error resolving current user:', err);
    return null;
  }
}

/**
 * Enforces user authentication, sends 401 if missing
 */
export async function requireCurrentUser(req, res) {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return null;
  }
  if (user.status === 'BLOCKED') {
    res.status(403).json({ error: 'Your account has been suspended. Please contact platform support.' });
    return null;
  }
  return user;
}

/**
 * Enforces specific RBAC roles, sends 403 if unauthorized
 */
export async function requireRole(req, res, allowedRoles = ['SUPER_ADMIN', 'ADMIN']) {
  const user = await requireCurrentUser(req, res);
  if (!user) return null;
  
  const role = user.role || 'USER';
  if (role === 'SUPER_ADMIN') {
    return user; // Super Admin has access to all admin operations
  }
  
  if (!allowedRoles.includes(role)) {
    res.status(403).json({ 
      error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${role}` 
    });
    return null;
  }
  return user;
}

/**
 * Enforces admin authorization (SUPER_ADMIN or ADMIN)
 */
export async function requireAdmin(req, res) {
  return requireRole(req, res, ['SUPER_ADMIN', 'ADMIN']);
}

/**
 * Enforces moderation authorization (SUPER_ADMIN, ADMIN, or MODERATOR)
 */
export async function requireModerator(req, res) {
  return requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);
}

/**
 * Enforces support authorization (SUPER_ADMIN, ADMIN, MODERATOR, or SUPPORT)
 */
export async function requireSupport(req, res) {
  return requireRole(req, res, ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']);
}

/**
 * Enforces Super Admin authorization only
 */
export async function requireSuperAdmin(req, res) {
  return requireRole(req, res, ['SUPER_ADMIN']);
}

// Alias for convenience
export const requireAuth = requireCurrentUser;

