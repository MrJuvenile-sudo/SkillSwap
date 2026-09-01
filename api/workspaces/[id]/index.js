// api/workspaces/[id]/index.js - Workspace Detail, Notes, Agreement & Sessions Hub
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

  if (req.method === 'GET') {
    const { rows: wsRows } = await db.query(
      `SELECT w.*, 
              c.id as connection_id, c.user1_id, c.user2_id,
              u1.name as user1_name, u1.username as user1_username, u1.avatar_url as user1_avatar, u1.headline as user1_headline,
              u2.name as user2_name, u2.username as user2_username, u2.avatar_url as user2_avatar, u2.headline as user2_headline,
              s1.name as user1_skill_name, s2.name as user2_skill_name
       FROM exchange_workspaces w
       JOIN connections c ON w.connection_id = c.id
       JOIN app_users u1 ON c.user1_id = u1.id
       JOIN app_users u2 ON c.user2_id = u2.id
       LEFT JOIN skills s1 ON w.user1_skill_id = s1.id
       LEFT JOIN skills s2 ON w.user2_skill_id = s2.id
       WHERE w.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
      [workspaceId, user.id]
    );

    if (!wsRows[0]) {
      return res.status(404).json({ error: 'Workspace not found or unauthorized' });
    }

    const ws = wsRows[0];
    const isUser1 = ws.user1_id === user.id;
    const partnerId = isUser1 ? ws.user2_id : ws.user1_id;
    const partner = {
      id: partnerId,
      name: isUser1 ? ws.user2_name : ws.user1_name,
      username: isUser1 ? ws.user2_username : ws.user1_username,
      avatar_url: isUser1 ? ws.user2_avatar : ws.user1_avatar,
      headline: isUser1 ? ws.user2_headline : ws.user1_headline
    };

    // Goals
    const { rows: goals } = await db.query(
      `SELECT g.*, u.name as user_name, u.avatar_url as user_avatar, s.name as skill_name
       FROM learning_goals g
       JOIN app_users u ON g.user_id = u.id
       LEFT JOIN skills s ON g.skill_id = s.id
       WHERE g.workspace_id = $1
       ORDER BY (g.status = 'DONE') ASC, g.created_at ASC`,
      [workspaceId]
    );

    // Tasks
    const { rows: tasks } = await db.query(
      `SELECT t.*, u.name as assignee_name, u.avatar_url as assignee_avatar
       FROM tasks t
       JOIN app_users u ON t.assigned_to = u.id
       WHERE t.workspace_id = $1
       ORDER BY (t.status = 'COMPLETED') ASC, t.due_date ASC NULLS LAST, t.created_at ASC`,
      [workspaceId]
    );

    // Scheduled Sessions
    const { rows: sessions } = await db.query(
      `SELECT s.*, u.name as proposer_name, u.avatar_url as proposer_avatar
       FROM scheduled_sessions s
       JOIN app_users u ON s.proposer_id = u.id
       WHERE s.workspace_id = $1
       ORDER BY s.session_date ASC`,
      [workspaceId]
    );

    // Reviews
    const { rows: reviews } = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN app_users u ON r.reviewer_id = u.id
       WHERE r.workspace_id = $1`,
      [workspaceId]
    );

    // Partner Skills for Context Sidebar
    const { rows: partnerSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, c.name as category_name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1`,
      [partnerId]
    );

    // Dynamic progress computation
    const totalItems = goals.length + tasks.length;
    let computedProgress = 0;
    if (totalItems > 0) {
      const completedGoals = goals.filter(g => g.status === 'DONE').length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
      const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      
      const weightedScore = (completedGoals + completedTasks) * 1.0 + (inProgressGoals + inProgressTasks) * 0.4;
      computedProgress = Math.min(100, Math.round((weightedScore / totalItems) * 100));
    }

    return res.json({
      workspace: {
        ...ws,
        partner,
        goals,
        tasks,
        sessions,
        reviews,
        partnerSkills,
        computedProgress: totalItems > 0 ? computedProgress : ws.progress,
        my_review: reviews.find(r => r.reviewer_id === user.id) || null
      }
    });
  }

  if (req.method === 'PUT') {
    const { title, description, target_date, status, progress, shared_notes, exchange_agreement } = req.body || {};

    const { rows: updated } = await db.query(
      `UPDATE exchange_workspaces 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           target_date = COALESCE($3, target_date),
           status = COALESCE($4, status),
           progress = COALESCE($5, progress),
           shared_notes = COALESCE($6, shared_notes),
           exchange_agreement = COALESCE($7::jsonb, exchange_agreement),
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [title, description, target_date, status, progress, shared_notes, exchange_agreement ? JSON.stringify(exchange_agreement) : null, workspaceId]
    );

    if (!updated[0]) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    return res.json({ success: true, workspace: updated[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}