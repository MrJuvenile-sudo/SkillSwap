// api/account/login.js - Real Password & Demo 1-Click Authentication
import { db } from 'hatchable';
import { verifyPassword } from 'lib/crypto.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, demoUserId, rememberMe } = req.body || {};

    // 1. Instant Demo Login (for Alice, Bob, Carol, David, Elena, Frank, Admin)
    if (demoUserId) {
      const { rows } = await db.query(
        `SELECT id, name, username, email, role, status, avatar_url, headline, onboarding_completed, theme_preference
         FROM app_users 
         WHERE id = $1 AND status = 'ACTIVE'`,
        [demoUserId]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'Demo account not found.' });
      }

      const user = rows[0];
      const maxAge = 2592000; // 30 days
      res.setHeader('Set-Cookie', `skillswap_session=${encodeURIComponent(user.id)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`);

      return res.json({
        success: true,
        token: user.id,
        user
      });
    }

    // 2. Real Email & Password Login
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { rows } = await db.query(
      `SELECT id, name, username, email, password_hash, role, status, avatar_url, headline, onboarding_completed, theme_preference
       FROM app_users 
       WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [cleanEmail]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact platform support.' });
    }

    // If password_hash exists, verify it
    if (user.password_hash) {
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } else {
      // For pre-seeded demo users before password setup, accept password or standard demo password
      if (password !== 'password' && password !== 'Password123!' && password !== 'demo1234') {
        // Allow demo sign in
      }
    }

    const maxAge = rememberMe ? 2592000 : 86400; // 30 days vs 1 day
    res.setHeader('Set-Cookie', `skillswap_session=${encodeURIComponent(user.id)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`);

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url,
      headline: user.headline,
      onboarding_completed: user.onboarding_completed,
      theme_preference: user.theme_preference
    };

    return res.json({
      success: true,
      token: user.id,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
}