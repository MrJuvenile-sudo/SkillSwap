// api/session.js - Current User Session & Demo Switcher
import { db } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.json({ user: null, authenticated: false });
    }

    // Fetch profile and skill summary
    const { rows: profileRows } = await db.query(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [user.id]
    );

    const { rows: skillRows } = await db.query(
      `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name 
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1`,
      [user.id]
    );

    const { rows: notifRows } = await db.query(
      `SELECT COUNT(*)::int as unread_count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [user.id]
    );

    const { rows: requestRows } = await db.query(
      `SELECT COUNT(*)::int as pending_requests 
       FROM requests 
       WHERE receiver_id = $1 AND status = 'PENDING'`,
      [user.id]
    );

    return res.json({
      user: {
        ...user,
        profile: profileRows[0] || {},
        skills: skillRows || [],
        unread_notifications: notifRows[0]?.unread_count || 0,
        pending_requests: requestRows[0]?.pending_requests || 0
      },
      authenticated: true
    });
  }

  if (req.method === 'POST') {
    const { action, userId, name, email, headline, role } = req.body || {};

    if (action === 'switch' && userId) {
      // Find or switch to user
      const { rows } = await db.query(
        `SELECT id, name, email, role, status, avatar_url, headline 
         FROM app_users 
         WHERE id = $1`,
        [userId]
      );
      if (!rows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.setHeader('Set-Cookie', `user_id=${encodeURIComponent(rows[0].id)}; Path=/; SameSite=Lax; Max-Age=2592000`);
      return res.json({ success: true, user: rows[0] });
    }

    if (action === 'register') {
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      const newId = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
      
      const { rows: userRows } = await db.query(
        `INSERT INTO app_users (id, name, email, role, status, avatar_url, headline)
         VALUES ($1, $2, $3, COALESCE($4, 'USER'), 'ACTIVE', $5, $6)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, headline = EXCLUDED.headline
         RETURNING id, name, email, role, status, avatar_url, headline`,
        [newId, name.trim(), email.trim().toLowerCase(), role || 'USER', avatar, headline || 'New SkillSwap Member']
      );

      const createdUser = userRows[0];
      await db.query(
        `INSERT INTO profiles (user_id, bio, location, preferred_language, availability, timezone)
         VALUES ($1, 'Excited to share and acquire new practical skills!', 'Remote / Worldwide', 'English', 'Flexible Evenings', 'UTC')
         ON CONFLICT (user_id) DO NOTHING`,
        [createdUser.id]
      );

      // Create welcome notification
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'SYSTEM', 'Welcome to SkillSwap! 🎉', 'Add the skills you can teach and what you want to learn to get matched instantly.', '/skills')`,
        [createdUser.id]
      );

      res.setHeader('Set-Cookie', `user_id=${encodeURIComponent(createdUser.id)}; Path=/; SameSite=Lax; Max-Age=2592000`);
      return res.json({ success: true, user: createdUser });
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', `user_id=; Path=/; SameSite=Lax; Max-Age=0`);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}