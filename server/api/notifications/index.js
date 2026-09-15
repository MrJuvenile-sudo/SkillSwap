// api/notifications/index.js - In-App Notification Feed
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows } = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    );

    const unreadCount = rows.filter(n => !n.is_read).length;
    return res.json({ notifications: rows, unread_count: unreadCount });
  }

  if (req.method === 'PUT') {
    const { id, mark_all_read } = req.body || {};

    if (mark_all_read) {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1`,
        [user.id]
      );
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
        [id, user.id]
      );
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Notification ID or mark_all_read required' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}