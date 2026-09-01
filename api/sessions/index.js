// api/sessions/index.js - Active Session Hub & Meeting Scheduler with Timezone Support
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { workspace_id } = req.query;

    if (workspace_id) {
      const { rows } = await db.query(
        `SELECT s.*, u.name as proposer_name, u.avatar_url as proposer_avatar
         FROM scheduled_sessions s
         JOIN app_users u ON s.proposer_id = u.id
         WHERE s.workspace_id = $1
         ORDER BY s.session_date ASC`,
        [workspace_id]
      );
      return res.json({ sessions: rows });
    }

    // List all upcoming sessions across all user workspaces
    const { rows: allSessions } = await db.query(
      `SELECT s.*, w.title as workspace_title, w.id as workspace_id,
              c.user1_id, c.user2_id,
              u.name as proposer_name, u.avatar_url as proposer_avatar
       FROM scheduled_sessions s
       JOIN exchange_workspaces w ON s.workspace_id = w.id
       JOIN connections c ON w.connection_id = c.id
       JOIN app_users u ON s.proposer_id = u.id
       WHERE (c.user1_id = $1 OR c.user2_id = $1)
       ORDER BY s.session_date ASC LIMIT 20`,
      [user.id]
    );

    return res.json({ sessions: allSessions });
  }

  if (req.method === 'POST') {
    const { workspace_id, title, session_date, duration_minutes, timezone, meeting_link, agenda, notes } = req.body || {};

    if (!workspace_id || !title || !session_date) {
      return res.status(400).json({ error: 'Workspace ID, session title, and date/time are required.' });
    }

    // Verify workspace membership
    const { rows: wsRows } = await db.query(
      `SELECT w.*, c.user1_id, c.user2_id 
       FROM exchange_workspaces w
       JOIN connections c ON w.connection_id = c.id
       WHERE w.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
      [workspace_id, user.id]
    );

    if (!wsRows[0]) {
      return res.status(404).json({ error: 'Workspace not found or unauthorized.' });
    }

    const ws = wsRows[0];
    const partnerId = ws.user1_id === user.id ? ws.user2_id : ws.user1_id;

    const { rows } = await db.query(
      `INSERT INTO scheduled_sessions (workspace_id, proposer_id, title, session_date, duration_minutes, timezone, meeting_link, agenda, notes, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 60), COALESCE($6, 'UTC'), $7, $8, $9, 'CONFIRMED')
       RETURNING *`,
      [workspace_id, user.id, title.trim(), session_date, duration_minutes || 60, timezone || 'UTC', meeting_link || '', agenda || '', notes || '']
    );

    const createdSession = rows[0];

    // Notification for partner
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'WORKSPACE', 'New Session Scheduled 📅', $2, $3)`,
      [partnerId, `${user.name} scheduled a practice session "${title}" for ${new Date(session_date).toLocaleString()}.`, `/workspaces/${workspace_id}`]
    );

    return res.json({ success: true, session: createdSession });
  }

  if (req.method === 'PUT') {
    const { session_id, status, notes, agenda } = req.body || {};
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required.' });
    }

    const { rows } = await db.query(
      `UPDATE scheduled_sessions
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           agenda = COALESCE($3, agenda),
           updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, notes, agenda, session_id]
    );

    return res.json({ success: true, session: rows[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}