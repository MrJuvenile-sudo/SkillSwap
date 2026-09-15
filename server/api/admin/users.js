// api/admin/users.js - User Moderation & Status Management
import { db } from 'hatchable';
import { requireSupport, requireSuperAdmin } from 'lib/auth.js';


export const access = 'public';

export default async function (req, res) {
  // Support, Moderator, Admin, and Super Admin can view/moderate users
  const admin = await requireSupport(req, res);

  if (!admin) return;

  if (req.method === 'GET') {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.status, u.avatar_url, u.headline, u.created_at,
              u.email_verified,
              p.location, p.bio, p.preferred_language, p.weekly_hours, p.completion_percentage,
              (SELECT COUNT(*)::int FROM user_skills WHERE user_id = u.id AND type = 'TEACH') as teach_count,
              (SELECT COUNT(*)::int FROM user_skills WHERE user_id = u.id AND type = 'LEARN') as learn_count,
              (SELECT COUNT(*)::int FROM user_skills WHERE user_id = u.id AND (is_verified = 1 OR is_verified = true)) as verified_skills_count,
              (SELECT COUNT(*)::int FROM exchange_workspaces ew 
               JOIN connections c ON ew.connection_id = c.id 
               WHERE (c.user1_id = u.id OR c.user2_id = u.id) AND ew.status = 'COMPLETED') as completed_exchanges,
              (SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) FROM reviews WHERE reviewee_id = u.id) as avg_rating,
              (SELECT COUNT(*)::int FROM reviews WHERE reviewee_id = u.id) as reviews_count,
              (SELECT COUNT(*)::int FROM reports WHERE reported_user_id = u.id) as reports_against

       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC`
    );
    return res.json({ users: rows });
  }

  if (req.method === 'PUT') {
    const { userId, name, headline, status, role, email_verified } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Role modification requires ADMIN or SUPER_ADMIN
    if (role && admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Administrators can change user roles.' });
    }

    // Single Admin Policy Enforcement: Only ONE admin account allowed on the platform
    if (role && (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MODERATOR' || role === 'SUPPORT')) {
      const { rows: existingAdmins } = await db.query(
        `SELECT id FROM app_users WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT') AND id != $1`,
        [userId]
      );
      if (existingAdmins.length > 0) {
        return res.status(400).json({
          error: 'Platform Rule: Only ONE Admin account ("Super Admin") is permitted on SkillSwapX.'
        });
      }
    }

    const { rows } = await db.query(
      `UPDATE app_users 
       SET name = COALESCE($1, name),
           headline = COALESCE($2, headline),
           status = COALESCE($3, status),
           role = COALESCE($4, role),
           email_verified = COALESCE($5, email_verified),
           updated_at = now()
       WHERE id = $6
       RETURNING id, name, username, email, role, status, email_verified`,
      [name || null, headline || null, status || null, role || null, email_verified !== undefined ? email_verified : null, userId]

    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, 'USER', $3, $4)`,
      [admin.id, `UPDATE_USER_${status || role || 'PROFILE'}`, userId, JSON.stringify({ status, role, name, headline })]

    );

    return res.json({ success: true, user: rows[0] });
  }

  if (req.method === 'DELETE') {
    // Delete requires SUPER_ADMIN or ADMIN
    if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Super Admin or Admin privileges required to delete accounts.' });
    }

    const { userId } = req.query || req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (userId === admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account.' });
    }

    await db.query(`DELETE FROM app_users WHERE id = $1`, [userId]);

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'DELETE_USER', 'USER', $2, $3)`,
      [admin.id, userId, JSON.stringify({ deleted_at: new Date().toISOString() })]
    );

    return res.json({ success: true, message: 'User account permanently removed.' });
  }


  res.status(405).json({ error: 'Method not allowed' });
}