// api/admin/users.js - User Moderation & Status Management
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar_url, u.headline, u.created_at,
              p.location, p.completion_percentage,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = u.id AND type = 'TEACH')::int as teach_count,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = u.id AND type = 'LEARN')::int as learn_count,
              (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id)::int as reviews_count,
              (SELECT COUNT(*) FROM reports WHERE reported_user_id = u.id)::int as reports_against
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC`
    );
    return res.json({ users: rows });
  }

  if (req.method === 'PUT') {
    const { userId, status, role } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { rows } = await db.query(
      `UPDATE app_users 
       SET status = COALESCE($1, status),
           role = COALESCE($2, role),
           updated_at = now()
       WHERE id = $3
       RETURNING id, name, email, role, status`,
      [status, role, userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, 'USER', $3, $4)`,
      [admin.id, `UPDATE_USER_STATUS_${status || role}`, userId, JSON.stringify({ status, role })]
    );

    return res.json({ success: true, user: rows[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}