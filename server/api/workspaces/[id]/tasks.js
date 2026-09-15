// api/workspaces/[id]/tasks.js - Task Management in Shared Workspace
import { db, events } from 'hatchable';
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
    const { title, description, assigned_to, due_date } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const assignee = assigned_to || user.id;

    const { rows } = await db.query(
      `INSERT INTO tasks (workspace_id, assigned_to, title, description, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'TODO')
       RETURNING *`,
      [workspaceId, assignee, title.trim(), description || '', due_date || null]
    );

    await db.query(`UPDATE exchange_workspaces SET updated_at = now() WHERE id = $1`, [workspaceId]);

    return res.json({ success: true, task: rows[0] });
  }

  if (req.method === 'PUT') {
    const { task_id, status, title, description, due_date, assigned_to } = req.body || {};
    if (!task_id) {
      return res.status(400).json({ error: 'Task ID required' });
    }

    const { rows } = await db.query(
      `UPDATE tasks 
       SET status = COALESCE($1, status),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           due_date = COALESCE($4, due_date),
           assigned_to = COALESCE($5, assigned_to),
           updated_at = now()
       WHERE id = $6 AND workspace_id = $7
       RETURNING *`,
      [status, title, description, due_date, assigned_to, task_id, workspaceId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.query(`UPDATE exchange_workspaces SET updated_at = now() WHERE id = $1`, [workspaceId]);

    return res.json({ success: true, task: rows[0] });
  }

  if (req.method === 'DELETE') {
    const { task_id } = req.body || req.query || {};
    if (!task_id) {
      return res.status(400).json({ error: 'Task ID required' });
    }

    await db.query(`DELETE FROM tasks WHERE id = $1 AND workspace_id = $2`, [task_id, workspaceId]);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}