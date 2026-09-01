// api/admin/skills.js - Skill Management Endpoint
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT s.id, s.name, s.description, s.icon, s.category_id,
                COALESCE(s.is_popular, false) as is_popular,
                COALESCE(s.is_trending, false) as is_trending,
                COALESCE(s.is_disabled, false) as is_disabled,
                s.created_at,
                c.name as category_name,
                COUNT(us.id) FILTER (WHERE us.type = 'TEACH')::int as teacher_count,
                COUNT(us.id) FILTER (WHERE us.type = 'LEARN')::int as learner_count,
                CASE 
                  WHEN COUNT(us.id) FILTER (WHERE us.type = 'LEARN') > COUNT(us.id) FILTER (WHERE us.type = 'TEACH') THEN 'High Demand'
                  WHEN COUNT(us.id) FILTER (WHERE us.type = 'TEACH') > COUNT(us.id) FILTER (WHERE us.type = 'LEARN') THEN 'High Supply'
                  ELSE 'Balanced'
                END as demand_level
         FROM skills s
         LEFT JOIN categories c ON s.category_id = c.id
         LEFT JOIN user_skills us ON s.id = us.skill_id
         GROUP BY s.id, s.name, s.description, s.icon, s.category_id, s.is_popular, s.is_trending, s.is_disabled, s.created_at, c.name
         ORDER BY s.name ASC`
      );
      return res.json({ skills: rows });
    } catch (err) {
      console.error('Error fetching admin skills:', err);
      return res.status(500).json({ error: 'Failed to fetch skills list' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, category_id, description, is_popular, is_trending } = req.body || {};
      if (!name || !category_id) {
        return res.status(400).json({ error: 'Skill name and Category ID are required.' });
      }

      const { rows } = await db.query(
        `INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
         VALUES ($1, $2, $3, 'Sparkles', $4, $5)
         RETURNING *`,
        [name.trim(), Number(category_id), description || '', is_popular ? 1 : 0, is_trending ? 1 : 0]
      );

      // Log admin action
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'CREATE_SKILL', 'SKILL', $2, $3)`,
        [admin.id, String(rows[0].id), JSON.stringify({ name, category_id })]
      );

      return res.json({ success: true, skill: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create skill.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, category_id, description, is_popular, is_trending, is_disabled, merge_target_id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Skill ID required.' });
      }

      // Handle duplicate merge into another skill
      if (merge_target_id) {
        await db.query(`UPDATE user_skills SET skill_id = $1 WHERE skill_id = $2`, [Number(merge_target_id), Number(id)]);
        await db.query(`DELETE FROM skills WHERE id = $1`, [Number(id)]);
        
        await db.query(
          `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
           VALUES ($1, 'MERGE_SKILLS', 'SKILL', $2, $3)`,
          [admin.id, String(id), JSON.stringify({ source_id: id, target_id: merge_target_id })]
        );
        return res.json({ success: true, message: 'Skills merged successfully' });
      }

      const { rows } = await db.query(
        `UPDATE skills 
         SET name = COALESCE($1, name),
             category_id = COALESCE($2, category_id),
             description = COALESCE($3, description),
             is_popular = COALESCE($4, is_popular),
             is_trending = COALESCE($5, is_trending),
             is_disabled = COALESCE($6, is_disabled)
         WHERE id = $7
         RETURNING *`,
        [
          name ? name.trim() : null,
          category_id ? Number(category_id) : null,
          description !== undefined ? description : null,
          is_popular !== undefined ? (is_popular ? 1 : 0) : null,
          is_trending !== undefined ? (is_trending ? 1 : 0) : null,
          is_disabled !== undefined ? (is_disabled ? 1 : 0) : null,
          Number(id)
        ]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'UPDATE_SKILL', 'SKILL', $2, $3)`,
        [admin.id, String(id), JSON.stringify({ name, is_popular, is_trending, is_disabled })]
      );

      return res.json({ success: true, skill: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update skill' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body || req.query || {};
      if (!id) {
        return res.status(400).json({ error: 'Skill ID is required.' });
      }

      await db.query(`DELETE FROM skills WHERE id = $1`, [id]);

      // Log admin action
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'DELETE_SKILL', 'SKILL', $2, NULL)`,
        [admin.id, String(id)]
      );

      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete skill.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
