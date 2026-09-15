// api/admin/reviews.js - Reviews Moderation & Anomaly Detection
import { db } from 'hatchable';
import { requireModerator } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireModerator(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT r.*,
                rev_u.name as reviewer_name, rev_u.email as reviewer_email, rev_u.avatar_url as reviewer_avatar,
                tar_u.name as reviewee_name, tar_u.email as reviewee_email, tar_u.avatar_url as reviewee_avatar,
                ew.title as workspace_title, ew.status as workspace_status,
                CASE WHEN ew.status = 'COMPLETED' THEN true ELSE false END as is_verified_exchange
         FROM reviews r
         JOIN app_users rev_u ON r.reviewer_id = rev_u.id
         JOIN app_users tar_u ON r.reviewee_id = tar_u.id
         LEFT JOIN exchange_workspaces ew ON r.workspace_id = ew.id
         ORDER BY (r.rating <= 2) DESC, (COALESCE(r.is_flagged, false)) DESC, r.created_at DESC`
      );
      return res.json({ reviews: rows });
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  if (req.method === 'PUT') {
    const { id, is_flagged, flag_reason } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const { rows } = await db.query(
      `UPDATE reviews
       SET is_flagged = $1,
           flag_reason = COALESCE($2, flag_reason)
       WHERE id = $3
       RETURNING *`,
      [!!is_flagged, flag_reason || '', Number(id)]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, 'REVIEW', $3, $4)`,
      [admin.id, is_flagged ? 'FLAG_REVIEW' : 'UNFLAG_REVIEW', String(id), JSON.stringify({ flag_reason })]
    );

    return res.json({ success: true, review: rows[0] });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query || {};
    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    await db.query(`DELETE FROM reviews WHERE id = $1`, [Number(id)]);

    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'DELETE_ABUSIVE_REVIEW', 'REVIEW', $2, NULL)`,
      [admin.id, String(id)]
    );

    return res.json({ success: true, message: 'Review removed from platform' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
