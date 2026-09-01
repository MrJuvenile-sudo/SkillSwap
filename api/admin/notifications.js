// api/admin/notifications.js - Targeted Platform Announcements
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT n.id, n.title, n.message, n.type, n.created_at,
                COUNT(n.id)::int as recipient_count
         FROM notifications n
         WHERE n.type IN ('ANNOUNCEMENT', 'SYSTEM', 'MAINTENANCE', 'FEATURE', 'SAFETY', 'COMMUNITY')
         GROUP BY n.id, n.title, n.message, n.type, n.created_at
         ORDER BY n.created_at DESC LIMIT 20`
      );
      return res.json({ announcements: rows });
    } catch (err) {
      console.error('Error fetching announcements history:', err);
      return res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }

  if (req.method === 'POST') {
    const { title, message, type = 'ANNOUNCEMENT', target_segment = 'ALL', target_category_id, target_user_id } = req.body || {};
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    try {
      // Determine target user IDs
      let targetUserIds = [];

      if (target_segment === 'SPECIFIC_USER' && target_user_id) {
        targetUserIds = [target_user_id];
      } else if (target_segment === 'NEW_USERS') {
        const { rows } = await db.query(`SELECT id FROM app_users WHERE datetime(created_at) >= datetime('now', '-7 days')`);
        targetUserIds = rows.map(r => r.id);
      } else if (target_segment === 'VERIFIED_USERS') {
        const { rows } = await db.query(`SELECT DISTINCT user_id as id FROM user_skills WHERE is_verified = true`);
        targetUserIds = rows.map(r => r.id);
      } else if (target_segment === 'SPECIFIC_CATEGORY' && target_category_id) {
        const { rows } = await db.query(
          `SELECT DISTINCT us.user_id as id 
           FROM user_skills us 
           JOIN skills s ON us.skill_id = s.id 
           WHERE s.category_id = $1`,
          [Number(target_category_id)]
        );
        targetUserIds = rows.map(r => r.id);
      } else {
        // 'ALL' users
        const { rows } = await db.query(`SELECT id FROM app_users WHERE status = 'ACTIVE'`);
        targetUserIds = rows.map(r => r.id);
      }

      // Insert notification for each target user
      let insertedCount = 0;
      for (const uid of targetUserIds) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, link, is_read)
           VALUES ($1, $2, $3, $4, '/dashboard', false)`,
          [uid, type, title.trim(), message.trim()]
        );
        insertedCount++;
      }

      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'BROADCAST_ANNOUNCEMENT', 'NOTIFICATION', NULL, $2)`,
        [admin.id, JSON.stringify({ title, type, target_segment, recipients_count: insertedCount })]
      );

      return res.json({ success: true, count: insertedCount, message: `Announcement delivered to ${insertedCount} members.` });
    } catch (err) {
      console.error('Error broadcasting notification:', err);
      return res.status(500).json({ error: 'Failed to broadcast announcement' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
