// api/admin/community.js - Skill Circles & Community Management
import { db } from 'hatchable';
import { requireModerator } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireModerator(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      // 1. Skill Circles
      const { rows: circles } = await db.query(
        `SELECT sc.*,
                c.name as category_name,
                creator.name as creator_name, creator.avatar_url as creator_avatar,
                mod.name as moderator_name
         FROM skill_circles sc
         LEFT JOIN categories c ON sc.category_id = c.id
         JOIN app_users creator ON sc.creator_id = creator.id
         LEFT JOIN app_users mod ON sc.moderator_id = mod.id
         ORDER BY (sc.status = 'PENDING_APPROVAL') DESC, sc.created_at DESC`
      );

      // 2. Recent Community Posts
      const { rows: posts } = await db.query(
        `SELECT cp.*,
                u.name as author_name, u.avatar_url as author_avatar, u.email as author_email,
                t_sk.name as teach_skill_name,
                l_sk.name as learn_skill_name,
                (SELECT COUNT(*)::int FROM post_comments WHERE post_id = cp.id) as comment_count
         FROM community_posts cp
         JOIN app_users u ON cp.user_id = u.id
         LEFT JOIN skills t_sk ON cp.teach_skill_id = t_sk.id
         LEFT JOIN skills l_sk ON cp.learn_skill_id = l_sk.id
         ORDER BY cp.created_at DESC LIMIT 20`
      );

      return res.json({ circles, posts });
    } catch (err) {
      console.error('Error fetching community data:', err);
      return res.status(500).json({ error: 'Failed to fetch community data' });
    }
  }

  // Create Skill Circle
  if (req.method === 'POST') {
    const { name, description, category_id, moderator_id, status } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Circle name is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO skill_circles (name, description, category_id, creator_id, moderator_id, status)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'ACTIVE'))
       RETURNING *`,
      [name.trim(), description || '', category_id ? Number(category_id) : null, admin.id, moderator_id || admin.id, status || 'ACTIVE']
    );

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'CREATE_CIRCLE', 'SKILL_CIRCLE', $2, $3)`,
      [admin.id, String(rows[0].id), JSON.stringify({ name })]
    );

    return res.json({ success: true, circle: rows[0] });
  }

  // Edit / Approve Circle
  if (req.method === 'PUT') {
    const { id, name, description, category_id, moderator_id, status } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Circle ID is required' });
    }

    const { rows } = await db.query(
      `UPDATE skill_circles
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           moderator_id = COALESCE($4, moderator_id),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [name ? name.trim() : null, description !== undefined ? description : null, category_id ? Number(category_id) : null, moderator_id || null, status || null, Number(id)]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Skill Circle not found' });
    }

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'UPDATE_CIRCLE', 'SKILL_CIRCLE', $2, $3)`,
      [admin.id, String(id), JSON.stringify({ status, name })]
    );

    return res.json({ success: true, circle: rows[0] });
  }

  // Delete Circle or Moderate Post
  if (req.method === 'DELETE') {
    const { type, id } = req.query || req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Target ID required' });
    }

    if (type === 'POST') {
      await db.query(`DELETE FROM community_posts WHERE id = $1`, [Number(id)]);
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'MODERATE_DELETE_POST', 'COMMUNITY_POST', $2, NULL)`,
        [admin.id, String(id)]
      );
    } else {
      await db.query(`DELETE FROM skill_circles WHERE id = $1`, [Number(id)]);
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'DELETE_CIRCLE', 'SKILL_CIRCLE', $2, NULL)`,
        [admin.id, String(id)]
      );
    }

    return res.json({ success: true, message: 'Item deleted successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
