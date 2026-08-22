// api/requests/[id]/accept.js - Accept Request & Initialize Workspace
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const requestId = req.params.id;
  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  try {
    // 1. Fetch request and ensure current user is receiver
    const { rows: reqRows } = await db.query(
      `SELECT r.*, 
              s.name as sender_name, ts.name as teach_skill_name, ls.name as learn_skill_name
       FROM requests r
       JOIN app_users s ON r.sender_id = s.id
       LEFT JOIN skills ts ON r.teach_skill_id = ts.id
       LEFT JOIN skills ls ON r.learn_skill_id = ls.id
       WHERE r.id = $1 AND r.receiver_id = $2`,
      [requestId, user.id]
    );

    if (!reqRows[0]) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    const request = reqRows[0];
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}` });
    }

    // 2. Mark request as ACCEPTED
    await db.query(
      `UPDATE requests 
       SET status = 'ACCEPTED', responded_at = now() 
       WHERE id = $1`,
      [requestId]
    );

    // 3. Create Connection
    const { rows: connRows } = await db.query(
      `INSERT INTO connections (user1_id, user2_id, request_id, status)
       VALUES ($1, $2, $3, 'ACTIVE')
       RETURNING *`,
      [request.sender_id, user.id, requestId]
    );

    const connection = connRows[0];

    // 4. Initialize Exchange Workspace
    const teachName = request.teach_skill_name || 'Skill Mentorship';
    const learnName = request.learn_skill_name || 'Skill Learning';
    const wsTitle = `${teachName} ⇄ ${learnName}`;
    const wsDesc = `Peer exchange between ${request.sender_name} and ${user.name}. Track your shared milestones, scheduled practice sessions, and learning goals here.`;

    const { rows: wsRows } = await db.query(
      `INSERT INTO exchange_workspaces (connection_id, title, description, status, start_date, target_date, progress, user1_skill_id, user2_skill_id)
       VALUES ($1, $2, $3, 'ACTIVE', CURRENT_DATE, CURRENT_DATE + 30, 0, $4, $5)
       RETURNING *`,
      [connection.id, wsTitle, wsDesc, request.teach_skill_id, request.learn_skill_id]
    );

    const workspace = wsRows[0];

    // 5. Create default initial goals & tasks for both users
    await db.query(
      `INSERT INTO learning_goals (workspace_id, user_id, goal_description, status)
       VALUES 
         ($1, $2, 'Define curriculum roadmap and complete initial kickoff session', 'IN_PROGRESS'),
         ($1, $3, 'Set up tooling and prepare first lesson practice exercises', 'IN_PROGRESS')`,
      [workspace.id, request.sender_id, user.id]
    );

    await db.query(
      `INSERT INTO tasks (workspace_id, assigned_to, title, description, status, due_date)
       VALUES 
         ($1, $2, 'Kickoff Video/Chat & Outline Goals', 'Introduce skill backgrounds and agree on weekly meeting time.', 'TODO', CURRENT_DATE + 3),
         ($1, $3, 'Share Resources & First Exercise', 'Share recommended starter docs, repos, or tutorial files.', 'TODO', CURRENT_DATE + 5)`,
      [workspace.id, request.sender_id, user.id]
    );

    // Initial greeting chat message
    await db.query(
      `INSERT INTO messages (connection_id, sender_id, message, is_read)
       VALUES ($1, $2, $3, false)`,
      [connection.id, user.id, `Hi ${request.sender_name}! I accepted your skill swap request. Our shared learning workspace "${wsTitle}" is ready! Let's get started.`]
    );

    // 6. Notify the sender
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'ACCEPTED', 'Exchange Request Accepted! 🎉', $2, $3)`,
      [request.sender_id, `${user.name} accepted your skill exchange request! Your workspace is ready.`, `/workspaces/${workspace.id}`]
    );

    // 7. Fire realtime event
    try {
      await events.publish(`requests:${request.sender_id}`, 'request_accepted', {
        requestId,
        workspaceId: workspace.id,
        connectionId: connection.id,
        acceptedByName: user.name
      });
    } catch {
      // ignore
    }

    return res.json({
      success: true,
      connection,
      workspace
    });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: 'Failed to accept exchange request' });
  }
}