// api/requests/[id]/reject.js - Reject or Cancel Request
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const requestId = req.params.id;
  const { action } = req.body || {}; // 'REJECT' or 'CANCEL'

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

    if (action === 'CANCEL' || request.sender_id === user.id) {
      // Sender cancelling
      await db.query(
        `UPDATE requests SET status = 'CANCELLED', responded_at = now() WHERE id = $1`,
        [requestId]
      );
      return res.json({ success: true, message: 'Request cancelled' });
    } else if (request.receiver_id === user.id) {
      // Receiver rejecting
      await db.query(
        `UPDATE requests SET status = 'REJECTED', responded_at = now() WHERE id = $1`,
        [requestId]
      );
      return res.json({ success: true, message: 'Request declined' });
    } else {
      return res.status(403).json({ error: 'Unauthorized to modify this request' });
    }
  } catch (err) {
    console.error('Error rejecting/cancelling request:', err);
    res.status(500).json({ error: 'Operation failed' });
  }
}