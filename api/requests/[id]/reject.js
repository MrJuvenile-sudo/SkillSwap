// api/requests/[id]/reject.js - Decline with Reason or Counter-Propose
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const requestId = req.params.id;
  const { action, decline_reason, counter_proposal } = req.body || {}; // 'REJECT', 'CANCEL', or 'COUNTER'

  if (!requestId) {
    return res.status(400).json({ error: 'Request ID required' });
  }

  try {
    const { rows } = await db.query(
      `SELECT * FROM requests WHERE id = $1`,
      [requestId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = rows[0];

    if (action === 'CANCEL' && request.sender_id === user.id) {
      await db.query(
        `UPDATE requests SET status = 'CANCELLED', responded_at = now() WHERE id = $1`,
        [requestId]
      );
      return res.json({ success: true, message: 'Request cancelled.' });
    }

    if (action === 'COUNTER' && request.receiver_id === user.id) {
      await db.query(
        `UPDATE requests 
         SET counter_proposal = $1::jsonb,
             decline_reason = $2,
             responded_at = now()
         WHERE id = $3`,
        [JSON.stringify(counter_proposal || {}), decline_reason || 'Proposed alternative terms', requestId]
      );

      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'REQUEST', 'Counter-Proposal Received 🔄', $2, '/requests')`,
        [request.sender_id, `${user.name} proposed modified terms for your skill swap.`]
      );

      return res.json({ success: true, message: 'Counter-proposal sent.' });
    }

    if (request.receiver_id === user.id) {
      await db.query(
        `UPDATE requests 
         SET status = 'REJECTED', 
             decline_reason = $1,
             responded_at = now() 
         WHERE id = $2`,
        [decline_reason || 'Scheduling conflict or skill mismatch', requestId]
      );

      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'REQUEST', 'Proposal Update', $2, '/requests')`,
        [request.sender_id, `${user.name} declined the swap proposal (${decline_reason || 'no reason provided'}).`]
      );

      return res.json({ success: true, message: 'Request declined.' });
    }

    return res.status(403).json({ error: 'Unauthorized to modify this request.' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'Operation failed.' });
  }
}