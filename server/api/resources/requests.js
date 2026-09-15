// api/resources/requests.js - Resource Requests Board
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT rq.*, u.name as requester_name, u.avatar_url as requester_avatar
         FROM resource_requests rq
         JOIN app_users u ON rq.requester_id = u.id
         WHERE rq.status = 'OPEN'
         ORDER BY rq.created_at DESC
         LIMIT 30`
      );
      return res.json({ requests: rows });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }

  if (req.method === 'POST') {
    const { subject, university, course, semester, description } = req.body || {};
    if (!subject || !description) return res.status(400).json({ error: 'Subject and description required.' });
    try {
      const { rows } = await db.query(
        `INSERT INTO resource_requests (requester_id, subject, university, course, semester, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [user.id, subject.trim(), university || null, course || null, semester || null, description.trim()]
      );
      return res.json({ success: true, request: rows[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
