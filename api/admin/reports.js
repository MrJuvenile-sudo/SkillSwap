// api/admin/reports.js - Review & Resolve User Reports (Report-Triggered Moderation)
import { db } from 'hatchable';
import { requireModerator } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  // Support, Moderator, Admin, and Super Admin can manage reports
  const admin = await requireModerator(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { id } = req.query || {};

    if (id) {
      // Single report deep-dive (Report-triggered access to flagged content)
      const { rows } = await db.query(
        `SELECT r.*, 
                rep.name as reporter_name, rep.avatar_url as reporter_avatar, rep.email as reporter_email,
                tar.name as reported_name, tar.avatar_url as reported_avatar, tar.email as reported_email, tar.status as reported_status, tar.headline as reported_headline,
                p.bio as reported_bio
         FROM reports r
         JOIN app_users rep ON r.reporter_id = rep.id
         JOIN app_users tar ON r.reported_user_id = tar.id
         LEFT JOIN profiles p ON tar.id = p.user_id
         WHERE r.id = $1`,
        [id]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // If report flagged a workspace / message, pull ONLY the flagged context
      let contextualMessages = [];
      if (rows[0].target_type === 'MESSAGE' || rows[0].target_type === 'WORKSPACE') {
        const { rows: msgs } = await db.query(
          `SELECT m.id, m.sender_id, m.message, m.created_at, u.name as sender_name
           FROM messages m
           JOIN app_users u ON m.sender_id = u.id
           JOIN connections c ON m.connection_id = c.id
           WHERE (c.user1_id = $1 AND c.user2_id = $2) OR (c.user1_id = $2 AND c.user2_id = $1)
           ORDER BY m.created_at DESC LIMIT 5`,
          [rows[0].reporter_id, rows[0].reported_user_id]
        );
        contextualMessages = msgs;
      }

      return res.json({ report: rows[0], contextualMessages });
    }

    const { rows } = await db.query(
      `SELECT r.*, 
              rep.name as reporter_name, rep.avatar_url as reporter_avatar,
              tar.name as reported_name, tar.avatar_url as reported_avatar, tar.email as reported_email, tar.status as reported_status
       FROM reports r
       JOIN app_users rep ON r.reporter_id = rep.id
       JOIN app_users tar ON r.reported_user_id = tar.id
       ORDER BY (r.status = 'OPEN') DESC, (r.status = 'UNDER_INVESTIGATION') DESC, r.created_at DESC`
    );
    return res.json({ reports: rows });
  }

  if (req.method === 'PUT') {
    const { report_id, status, resolution_notes, block_user, priority } = req.body || {};
    if (!report_id || !status) {
      return res.status(400).json({ error: 'Report ID and status required' });
    }

    const { rows: repRows } = await db.query(
      `UPDATE reports 
       SET status = $1,
           resolution_notes = COALESCE($2, resolution_notes),
           resolved_at = CASE WHEN $1 IN ('RESOLVED', 'DISMISSED') THEN now() ELSE resolved_at END
       WHERE id = $3
       RETURNING *`,
      [status, resolution_notes || '', report_id]
    );

    if (!repRows[0]) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = repRows[0];

    // Suspend user directly if requested
    if (block_user && report.reported_user_id) {
      await db.query(
        `UPDATE app_users SET status = 'BLOCKED', updated_at = now() WHERE id = $1`,
        [report.reported_user_id]
      );
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, 'REPORT', $3, $4)`,
      [admin.id, `MODERATE_REPORT_${status}`, report_id, JSON.stringify({ status, resolution_notes, block_user })]
    );

    return res.json({ success: true, report });
  }

  res.status(405).json({ error: 'Method not allowed' });
}