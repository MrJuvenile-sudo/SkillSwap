// api/workspaces/[id]/goals.js - Manage Learning Goals in Workspace
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const workspaceId = req.params.id;
  if (!workspaceId) {
    return res.status(400).json({ error: 'Workspace ID required' });
  }

  if (req.method === 'POST') {
    const { goal_description, skill_id, target_date, user_id } = req.body || {};
    if (!goal_description || !goal_description.trim()) {
      return res.status(400).json({ error: 'Goal description is required' });
    }

    const assignedUserId = user_id || user.id;

    const { rows } = await db.query(
      `INSERT INTO learning_goals (workspace_id, user_id, skill_id, goal_description, target_date, status)
       VALUES ($1, $2, $3, $4, $5, 'IN_PROGRESS')
       RETURNING *`,
      [workspaceId, assignedUserId, skill_id ? Number(skill_id) : null, goal_description.trim(), target_date || null]
    );

    // Update workspace timestamp
    await db.query(`UPDATE exchange_workspaces SET updated_at = now() WHERE id = $1`, [workspaceId]);

    return res.json({ success: true, goal: rows[0] });
  }

  if (req.method === 'PUT') {
    const { goal_id, status, goal_description } = req.body || {};
    if (!goal_id) {
      return res.status(400).json({ error: 'Goal ID required' });
    }

    const { rows } = await db.query(
      `UPDATE learning_goals 
       SET status = COALESCE($1, status),
           goal_description = COALESCE($2, goal_description)
       WHERE id = $3 AND workspace_id = $4
       RETURNING *`,
      [status, goal_description, goal_id, workspaceId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Update workspace timestamp
    await db.query(`UPDATE exchange_workspaces SET updated_at = now() WHERE id = $1`, [workspaceId]);

    return res.json({ success: true, goal: rows[0] });
  }

  if (req.method === 'DELETE') {
    const { goal_id } = req.body || req.query || {};
    if (!goal_id) {
      return res.status(400).json({ error: 'Goal ID required' });
    }

    await db.query(`DELETE FROM learning_goals WHERE id = $1 AND workspace_id = $2`, [goal_id, workspaceId]);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}