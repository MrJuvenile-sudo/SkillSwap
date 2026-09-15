// api/circles/index.js - List & Create Group Peer Learning Skill Circles
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { category_id, search, status } = req.query || {};

    let query = `
      SELECT sc.*,
             u.name as creator_name, u.username as creator_username, u.avatar_url as creator_avatar,
             c.name as category_name
      FROM skill_circles sc
      JOIN app_users u ON sc.creator_id = u.id
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      params.push(Number(category_id));
      query += ` AND sc.category_id = $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND sc.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(sc.name) LIKE $${params.length} OR LOWER(sc.description) LIKE $${params.length})`;
    }

    query += ` ORDER BY sc.created_at DESC LIMIT 50`;

    try {
      const { rows } = await db.query(query, params);
      return res.json({ success: true, circles: rows });
    } catch (err) {
      console.error('Fetch skill circles error:', err);
      return res.status(500).json({ error: 'Failed to fetch skill circles.' });
    }
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { name, description, category_id } = req.body || {};

    if (!name || !description) {
      return res.status(400).json({ error: 'Circle name and description are required.' });
    }

    try {
      const { rows } = await db.query(
        `INSERT INTO skill_circles (name, description, category_id, creator_id, moderator_id, member_count, status)
         VALUES ($1, $2, $3, $4, $4, 1, 'ACTIVE')
         RETURNING *`,
        [
          name.trim(),
          description.trim(),
          category_id ? Number(category_id) : null,
          user.id
        ]
      );

      return res.json({ success: true, circle: rows[0] });
    } catch (err) {
      console.error('Create skill circle error:', err);
      return res.status(500).json({ error: 'Failed to create skill circle.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
