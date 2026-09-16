// api/requests/index.js - Create & List Proposals with Duration, Cadence & Channel
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows: incoming } = await db.query(
      `SELECT r.*, 
              s.name as sender_name, s.username as sender_username, s.avatar_url as sender_avatar, s.headline as sender_headline,
              ts.name as teach_skill_name, ls.name as learn_skill_name,
              w.id as workspace_id
       FROM requests r
       JOIN app_users s ON r.sender_id = s.id
       LEFT JOIN skills ts ON r.teach_skill_id = ts.id
       LEFT JOIN skills ls ON r.learn_skill_id = ls.id
       LEFT JOIN connections c ON c.request_id = r.id
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE r.receiver_id = $1
       ORDER BY r.created_at DESC`,
      [user.id]
    );

    const { rows: outgoing } = await db.query(
      `SELECT r.*, 
              rc.name as receiver_name, rc.username as receiver_username, rc.avatar_url as receiver_avatar, rc.headline as receiver_headline,
              ts.name as teach_skill_name, ls.name as learn_skill_name,
              w.id as workspace_id
       FROM requests r
       JOIN app_users rc ON r.receiver_id = rc.id
       LEFT JOIN skills ts ON r.teach_skill_id = ts.id
       LEFT JOIN skills ls ON r.learn_skill_id = ls.id
       LEFT JOIN connections c ON c.request_id = r.id
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE r.sender_id = $1
       ORDER BY r.created_at DESC`,
      [user.id]
    );

    return res.json({ incoming, outgoing });
  }

  if (req.method === 'POST') {
    const { receiver_id, teach_skill_id, learn_skill_id, message, proposed_availability, duration_weeks, cadence, preferred_channel } = req.body || {};

    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver user ID is required' });
    }
    if (receiver_id === user.id) {
      return res.status(400).json({ error: 'You cannot send a request to yourself' });
    }


    const { rows: requestRows } = await db.query(
      `INSERT INTO requests (sender_id, receiver_id, teach_skill_id, learn_skill_id, message, proposed_availability, duration_weeks, cadence, preferred_channel, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 4), COALESCE($8, 'Weekly (1-2 hrs)'), COALESCE($9, 'In-App Video'), 'PENDING')
       RETURNING *`,
      [
        user.id, 
        receiver_id, 
        teach_skill_id ? Number(teach_skill_id) : null, 
        learn_skill_id ? Number(learn_skill_id) : null, 
        message || 'Hi! I would love to exchange skills with you.',
        proposed_availability || null,
        duration_weeks || 4,
        cadence || 'Weekly (1-2 hrs)',
        preferred_channel || 'In-App Video'
      ]
    );

    const newRequest = requestRows[0];

    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'REQUEST', 'New Skill Proposal Received! 🤝', $2, '/requests')`,
      [receiver_id, `${user.name} sent you a skill exchange proposal for ${cadence || 'weekly sessions'}.`]
    );

    try {
      await events.publish(`requests:${receiver_id}`, 'new_request', {
        requestId: newRequest.id,
        senderId: user.id,
        senderName: user.name
      });
    } catch {
      // ignore
    }

    return res.json({ success: true, request: newRequest });
  }

  res.status(405).json({ error: 'Method not allowed' });
}