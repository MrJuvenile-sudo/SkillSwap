// api/admin/logs.js - Admin Action Audit Logs Endpoint
import { db } from 'hatchable';
import { requireSupport } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireSupport(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { target_type, limit = 100 } = req.query || {};

      let query = `
        SELECT l.*, u.name as admin_name, u.email as admin_email, u.role as admin_role, u.avatar_url as admin_avatar
        FROM admin_logs l
        JOIN app_users u ON l.admin_id = u.id
      `;
      const params = [];

      if (target_type) {
        query += ` WHERE l.target_type = $1`;
        params.push(target_type);
      }

      query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1}`;
      params.push(Number(limit));

      const { rows } = await db.query(query, params);
      return res.json({ logs: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch admin logs.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
