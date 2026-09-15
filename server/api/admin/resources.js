// api/admin/resources.js - Admin Resource Moderation
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { status = 'ALL', type = 'ALL', page = 1, limit = 20 } = req.query || {};
      const offset = (Number(page) - 1) * Number(limit);

      let conditions = [];
      let params = [];
      let paramIdx = 1;

      if (status !== 'ALL') {
        conditions.push(`r.status = $${paramIdx++}`);
        params.push(status);
      }
      if (type !== 'ALL') {
        conditions.push(`r.type = $${paramIdx++}`);
        params.push(type);
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const { rows } = await db.query(
        `SELECT r.*, u.name as contributor_name, u.email as contributor_email, u.avatar_url as contributor_avatar,
                (SELECT COUNT(*) FROM resource_reviews rr WHERE rr.resource_id = r.id)::int as review_count,
                (SELECT COUNT(*) FROM key_point_entries kpe WHERE kpe.resource_id = r.id)::int as key_points_count
         FROM resources r
         JOIN app_users u ON r.contributor_id = u.id
         ${where}
         ORDER BY CASE r.status WHEN 'PENDING' THEN 0 WHEN 'REPORTED' THEN 1 ELSE 2 END, r.created_at DESC
         LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        [...params, Number(limit), offset]
      );

      const { rows: statusCounts } = await db.query(
        `SELECT status, COUNT(*)::int as count FROM resources GROUP BY status`
      );
      const { rows: typeCounts } = await db.query(
        `SELECT type, COUNT(*)::int as count, SUM(downloads)::int as downloads FROM resources GROUP BY type`
      );

      return res.json({ resources: rows, statusCounts, typeCounts });
    } catch (err) {
      console.error('Admin resources error:', err);
      return res.status(500).json({ error: 'Failed to load resources' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { resourceId, action, admin_notes } = req.body || {};
      if (!resourceId || !action) {
        return res.status(400).json({ error: 'resourceId and action required' });
      }

      const STATUS_MAP = { approve: 'APPROVED', reject: 'REJECTED', report: 'REPORTED', pending: 'PENDING' };
      const newStatus = STATUS_MAP[action];
      if (!newStatus) return res.status(400).json({ error: 'Invalid action' });

      await db.query(
        `UPDATE resources
         SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = datetime('now')
         WHERE id = $4`,
        [newStatus, admin_notes || null, admin.id, Number(resourceId)]
      );

      // Notify contributor
      const { rows: rRows } = await db.query(
        `SELECT contributor_id, title FROM resources WHERE id = $1`, [Number(resourceId)]
      );
      if (rRows.length) {
        const msgMap = {
          APPROVED: 'Your resource has been approved and is now visible in the Learning Hub.',
          REJECTED: 'Your resource submission was not approved.' + (admin_notes ? ' Reason: ' + admin_notes : ''),
          REPORTED: 'Your resource has been flagged for review.'
        };
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, 'SYSTEM', $2, $3)`,
          [rRows[0].contributor_id, 'Resource Update: ' + rRows[0].title, msgMap[newStatus] || 'Status updated.']
        ).catch(() => {});
      }

      // Audit log
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, $2, 'RESOURCE', $3, $4)`,
        [admin.id, action.toUpperCase() + '_RESOURCE', String(resourceId),
         JSON.stringify({ action, admin_notes })]
      ).catch(() => {});

      return res.json({ success: true, status: newStatus });
    } catch (err) {
      console.error('Admin resource update error:', err);
      return res.status(500).json({ error: 'Failed to update resource' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
