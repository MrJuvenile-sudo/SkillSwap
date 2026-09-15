// api/circles/join.js - Join a Group Skill Circle
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireCurrentUser(req, res);
  if (!user) return;

  const { circle_id } = req.body || {};
  if (!circle_id) {
    return res.status(400).json({ error: 'Circle ID is required.' });
  }

  try {
    const { rows } = await db.query(
      `UPDATE skill_circles
       SET member_count = member_count + 1
       WHERE id = $1
       RETURNING *`,
      [Number(circle_id)]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Skill Circle not found.' });
    }

    return res.json({ success: true, circle: rows[0], message: 'Joined circle successfully!' });
  } catch (err) {
    console.error('Join circle error:', err);
    return res.status(500).json({ error: 'Failed to join circle.' });
  }
}
