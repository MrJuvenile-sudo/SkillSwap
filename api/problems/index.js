// api/problems/index.js - List & Create Problem Challenges for Skill Bartering
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { category_id, search, status } = req.query || {};

    let query = `
      SELECT p.*,
             u.name as user_name, u.username as user_username, u.avatar_url as user_avatar, u.headline as user_headline,
             c.name as category_name,
             rs.name as required_skill_name,
             os.name as offered_skill_name
      FROM problems p
      JOIN app_users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN skills rs ON p.required_skill_id = rs.id
      LEFT JOIN skills os ON p.offered_skill_id = os.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      params.push(Number(category_id));
      query += ` AND p.category_id = $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      query += ` AND p.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(p.title) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT 50`;

    try {
      const { rows } = await db.query(query, params);
      return res.json({ success: true, problems: rows });
    } catch (err) {
      console.error('Fetch problems error:', err);
      return res.status(500).json({ error: 'Failed to fetch problems.' });
    }
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { title, description, category_id, required_skill_id, offered_skill_id, urgency, estimated_hours } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
      const { rows } = await db.query(
        `INSERT INTO problems (user_id, title, description, category_id, required_skill_id, offered_skill_id, urgency, estimated_hours, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
         RETURNING *`,
        [
          user.id,
          title.trim(),
          description.trim(),
          category_id ? Number(category_id) : null,
          required_skill_id ? Number(required_skill_id) : null,
          offered_skill_id ? Number(offered_skill_id) : null,
          urgency || 'Medium',
          estimated_hours ? Number(estimated_hours) : 5
        ]
      );

      return res.json({ success: true, problem: rows[0] });
    } catch (err) {
      console.error('Create problem error:', err);
      return res.status(500).json({ error: 'Failed to create problem.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
