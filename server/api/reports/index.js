// api/reports/index.js - Safety & Trust Reports
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { reported_user_id, reason, details } = req.body || {};
    if (!reported_user_id || !reason) {
      return res.status(400).json({ error: 'Reported user ID and reason are required' });
    }

    const { rows } = await db.query(
      `INSERT INTO reports (reporter_id, reported_user_id, reason, details, status)
       VALUES ($1, $2, $3, $4, 'OPEN')
       RETURNING *`,
      [user.id, reported_user_id, reason.trim(), details || '']
    );

    // Notify admin
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ('user_admin', 'SYSTEM', 'New User Report Filed', $1, '/admin')`,
      [`Report filed against ${reported_user_id}: ${reason}`]
    );

    return res.json({ success: true, report: rows[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}