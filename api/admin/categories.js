// api/admin/categories.js - Manage Skill Categories
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT c.id, c.name, c.description, c.icon, c.sort_order,
                COALESCE(c.is_featured, false) as is_featured,
                c.created_at,
                COUNT(s.id)::int as skill_count
         FROM categories c
         LEFT JOIN skills s ON c.id = s.category_id
         GROUP BY c.id, c.name, c.description, c.icon, c.sort_order, c.is_featured, c.created_at
         ORDER BY c.sort_order ASC, c.name ASC`
      );
      return res.json({ categories: rows });
    } catch (err) {
      console.error('Error loading categories:', err);
      return res.status(500).json({ error: 'Failed to load categories' });
    }
  }

  if (req.method === 'POST') {
    const { name, description, icon, is_featured, sort_order } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO categories (name, description, icon, is_featured, sort_order)
       VALUES ($1, $2, COALESCE($3, 'Sparkles'), $4, COALESCE($5, 0))
       RETURNING *`,
      [name.trim(), description || '', icon || 'Sparkles', !!is_featured, sort_order || 0]
    );

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'CREATE_CATEGORY', 'CATEGORY', $2, $3)`,
      [admin.id, String(rows[0].id), JSON.stringify({ name, icon })]
    );

    return res.json({ success: true, category: rows[0] });
  }

  if (req.method === 'PUT') {
    const { id, name, description, icon, is_featured, sort_order } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Category ID required' });
    }

    const { rows } = await db.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon = COALESCE($3, icon),
           is_featured = COALESCE($4, is_featured),
           sort_order = COALESCE($5, sort_order)
       WHERE id = $6
       RETURNING *`,
      [
        name ? name.trim() : null,
        description !== undefined ? description : null,
        icon || null,
        is_featured !== undefined ? is_featured : null,
        sort_order !== undefined ? sort_order : null,
        Number(id)
      ]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'UPDATE_CATEGORY', 'CATEGORY', $2, $3)`,
      [admin.id, String(id), JSON.stringify({ name, is_featured })]
    );

    return res.json({ success: true, category: rows[0] });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Category ID required' });
    }

    await db.query(`DELETE FROM categories WHERE id = $1`, [id]);

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'DELETE_CATEGORY', 'CATEGORY', $2, NULL)`,
      [admin.id, String(id)]
    );

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}