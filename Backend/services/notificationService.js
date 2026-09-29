// Backend/services/notificationService.js - Real-time & Persistent Notifications Service
import { getDb } from '../config/db.js';

/**
 * Creates an in-app notification for a specific user
 */
export async function createNotification({ userId, title, message, type = 'SYSTEM', link = '' }) {
  try {
    const db = await getDb();
    const id = 'notif_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, message, type, link, 0, now]
    );

    return { id, userId, title, message, type, link, is_read: false, created_at: now };
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err);
    throw err;
  }
}

/**
 * Fetch latest notifications for a user with unread count
 */
export async function getUserNotifications(userId, limit = 50) {
  const db = await getDb();
  const res = await db.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  const rows = res.rows || [];
  const unreadCount = rows.filter(n => !n.is_read || n.is_read === 0 || n.is_read === 'false').length;
  return { notifications: rows, unreadCount };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(id, userId) {
  const db = await getDb();
  await db.query(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId) {
  const db = await getDb();
  await db.query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
    [userId]
  );
  return { success: true };
}

/**
 * Broadcast an announcement or alert to all active users
 */
export async function broadcastSystemNotification({ title, message, type = 'BROADCAST' }) {
  const db = await getDb();
  const usersRes = await db.query(`SELECT id FROM app_users WHERE status = 'ACTIVE'`);
  const users = usersRes.rows || [];

  for (const user of users) {
    await createNotification({
      userId: user.id,
      title,
      message,
      type
    });
  }
  return { count: users.length };
}
