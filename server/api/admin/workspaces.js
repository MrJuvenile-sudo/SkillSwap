// api/admin/workspaces.js - Workspace Audit & Termination Endpoint
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT w.*, c.user1_id, c.user2_id,
                u1.name as user1_name, u2.name as user2_name
         FROM exchange_workspaces w
         JOIN connections c ON w.connection_id = c.id
         JOIN app_users u1 ON c.user1_id = u1.id
         JOIN app_users u2 ON c.user2_id = u2.id
         ORDER BY w.created_at DESC`
      );
      return res.json({ workspaces: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch workspaces.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { workspace_id, status } = req.body || {};
      if (!workspace_id || !status) {
        return res.status(400).json({ error: 'Workspace ID and status are required.' });
      }

      const { rows } = await db.query(
        `UPDATE exchange_workspaces 
         SET status = $1, updated_at = now() 
         WHERE id = $2 
         RETURNING *`,
        [status, workspace_id]
      );

      // Log admin action
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'UPDATE_WORKSPACE_STATUS', 'WORKSPACE', $2, $3)`,
        [admin.id, String(workspace_id), JSON.stringify({ status })]
      );

      return res.json({ success: true, workspace: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update workspace.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
