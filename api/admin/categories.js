// api/admin/categories.js - Manage Skill Categories
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'POST') {
    const { name, description, icon } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO categories (name, description, icon)
       VALUES ($1, $2, COALESCE($3, 'Sparkles'))
       RETURNING *`,
      [name.trim(), description || '', icon || 'Sparkles']
    );

    return res.json({ success: true, category: rows[0] });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Category ID required' });
    }

    await db.query(`DELETE FROM categories WHERE id = $1`, [id]);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}