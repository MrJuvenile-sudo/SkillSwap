// lib/auth.js - Shared Authentication & Session Resolver
import { auth, db } from 'hatchable';

/**
 * Resolves current user from Hatchable auth session or custom session header/cookie
 * Returns { id, name, email, role, status, avatar_url, headline } or null
 */
export async function getCurrentUser(req) {
  try {
    // 1. First check Hatchable platform auth session
    let platformUser = null;
    try {
      platformUser = await auth.getUser(req);
    } catch {
      // ignore
    }

    if (platformUser && platformUser.id) {
      const email = platformUser.email || `${platformUser.id}@skillswap.local`;
      const name = platformUser.name || email.split('@')[0] || 'Member';
      const avatar = platformUser.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(platformUser.id)}`;

      // Ensure user exists in app_users
      const { rows } = await db.query(
        `INSERT INTO app_users (id, name, email, avatar_url, role, status)
         VALUES ($1, $2, $3, $4, 'USER', 'ACTIVE')
         ON CONFLICT (id) DO UPDATE SET 
           name = COALESCE(EXCLUDED.name, app_users.name),
           avatar_url = COALESCE(EXCLUDED.avatar_url, app_users.avatar_url),
           updated_at = now()
         RETURNING id, name, email, role, status, avatar_url, headline`,
        [String(platformUser.id), name, email, avatar]
      );

      // Ensure profile exists
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

    // 2. Check x-user-id header or cookie (allows seamless demo switching & testing)
    const customUserId = req.headers['x-user-id'] || req.cookies?.user_id || req.query?.as_user;
    if (customUserId && typeof customUserId === 'string' && customUserId.trim()) {
      const trimmedId = customUserId.trim();
      const { rows } = await db.query(
        `SELECT id, name, email, role, status, avatar_url, headline 
         FROM app_users 
         WHERE id = $1`,
        [trimmedId]
      );
      if (rows && rows[0]) {
        return rows[0];
      }
    }

    // 3. Fallback default for unauthenticated exploratory view (Alice Chen by default if requested)
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
    res.status(401).json({ error: 'Authentication required. Please sign in or select a demo profile.' });
    return null;
  }
  if (user.status === 'BLOCKED') {
    res.status(403).json({ error: 'Your account has been suspended. Please contact platform support.' });
    return null;
  }
  return user;
}

/**
 * Enforces admin authorization, sends 403 if not admin
 */
export async function requireAdmin(req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return null;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin privileges required for this action.' });
    return null;
  }
  return user;
}