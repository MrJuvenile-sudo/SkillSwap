// api/admin/reports.js - Review & Resolve User Reports
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { rows } = await db.query(
      `SELECT r.*, 
              rep.name as reporter_name, rep.avatar_url as reporter_avatar,
              tar.name as reported_name, tar.avatar_url as reported_avatar, tar.email as reported_email, tar.status as reported_status
       FROM reports r
       JOIN app_users rep ON r.reporter_id = rep.id
       JOIN app_users tar ON r.reported_user_id = tar.id
       ORDER BY (r.status = 'OPEN') DESC, r.created_at DESC`
    );
    return res.json({ reports: rows });
  }

  if (req.method === 'PUT') {
    const { report_id, status, resolution_notes, block_user } = req.body || {};
    if (!report_id || !status) {
      return res.status(400).json({ error: 'Report ID and status required' });
    }

    const { rows: repRows } = await db.query(
      `UPDATE reports 
       SET status = $1,
           resolution_notes = $2,
           resolved_at = now()
       WHERE id = $3
       RETURNING *`,
      [status, resolution_notes || '', report_id]
    );

    if (!repRows[0]) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = repRows[0];

    // Optional block user directly from report
    if (block_user && report.reported_user_id) {
      await db.query(
        `UPDATE app_users SET status = 'BLOCKED', updated_at = now() WHERE id = $1`,
        [report.reported_user_id]
      );
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'RESOLVE_REPORT', 'REPORT', $2, $3)`,
      [admin.id, report_id, JSON.stringify({ status, resolution_notes, block_user })]
    );

    return res.json({ success: true, report });
  }

  res.status(405).json({ error: 'Method not allowed' });
}