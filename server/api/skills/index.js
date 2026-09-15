// api/skills/index.js - Categories & Global Skills Catalog
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { rows: categories } = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM skills WHERE category_id = c.id)::int as skills_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    const { rows: skills } = await db.query(
      `SELECT s.*, c.name as category_name, c.icon as category_icon,
              (SELECT COUNT(*) FROM user_skills WHERE skill_id = s.id AND type = 'TEACH')::int as teachers_count,
              (SELECT COUNT(*) FROM user_skills WHERE skill_id = s.id AND type = 'LEARN')::int as learners_count
       FROM skills s
       JOIN categories c ON s.category_id = c.id
       ORDER BY s.name ASC`
    );

    return res.json({ categories, skills });
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { name, category_id, description, icon } = req.body || {};
    if (!name || !category_id) {
      return res.status(400).json({ error: 'Skill name and category are required' });
    }

    try {
      const { rows } = await db.query(
        `INSERT INTO skills (name, category_id, description, icon)
         VALUES ($1, $2, $3, COALESCE($4, 'Sparkles'))
         RETURNING *`,
        [name.trim(), category_id, description || '', icon || 'Sparkles']
      );
      return res.json({ success: true, skill: rows[0] });
    } catch (err) {
      return res.status(400).json({ error: 'Skill already exists in this category' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}