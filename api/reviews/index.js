// api/reviews/index.js - Two-Way Blind Reviews & Trust Scoring
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { userId, workspaceId } = req.query;
    
    if (workspaceId) {
      const { rows } = await db.query(
        `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
         FROM reviews r
         JOIN app_users u ON r.reviewer_id = u.id
         WHERE r.workspace_id = $1`,
        [workspaceId]
      );
      return res.json({ reviews: rows });
    }

    if (userId) {
      const { rows: reviews } = await db.query(
        `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.headline as reviewer_headline,
                w.title as workspace_title
         FROM reviews r
         JOIN app_users u ON r.reviewer_id = u.id
         LEFT JOIN exchange_workspaces w ON r.workspace_id = w.id
         WHERE r.reviewee_id = $1 AND (r.is_blind = false OR r.revealed_at <= now())
         ORDER BY r.created_at DESC`,
        [userId]
      );

      const { rows: summary } = await db.query(
        `SELECT 
           COUNT(*)::int as total_reviews,
           COALESCE(AVG(rating), 5.0)::numeric(3,2) as avg_rating,
           COALESCE(AVG(communication_rating), 5.0)::numeric(3,2) as avg_communication,
           COALESCE(AVG(knowledge_rating), 5.0)::numeric(3,2) as avg_knowledge,
           COALESCE(AVG(reliability_rating), 5.0)::numeric(3,2) as avg_reliability
         FROM reviews
         WHERE reviewee_id = $1 AND (is_blind = false OR revealed_at <= now())`,
        [userId]
      );

      return res.json({ reviews, summary: summary[0] });
    }

    return res.status(400).json({ error: 'userId or workspaceId is required' });
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { workspace_id, rating, communication_rating, knowledge_rating, reliability_rating, comment } = req.body || {};

    if (!workspace_id || !rating) {
      return res.status(400).json({ error: 'Workspace ID and rating are required' });
    }

    const { rows: wsRows } = await db.query(
      `SELECT w.*, c.user1_id, c.user2_id 
       FROM exchange_workspaces w
       JOIN connections c ON w.connection_id = c.id
       WHERE w.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
      [workspace_id, user.id]
    );

    if (!wsRows[0]) {
      return res.status(404).json({ error: 'Workspace not found or unauthorized' });
    }

    const ws = wsRows[0];
    const revieweeId = ws.user1_id === user.id ? ws.user2_id : ws.user1_id;

    try {
      // Check if partner has already reviewed this workspace
      const { rows: partnerReviews } = await db.query(
        `SELECT id FROM reviews WHERE workspace_id = $1 AND reviewer_id = $2`,
        [workspace_id, revieweeId]
      );

      const isBothReviewed = partnerReviews.length > 0;

      const { rows } = await db.query(
        `INSERT INTO reviews (workspace_id, reviewer_id, reviewee_id, rating, communication_rating, knowledge_rating, reliability_rating, comment, is_blind, revealed_at)
         VALUES ($1, $2, $3, $4, COALESCE($5, 5), COALESCE($6, 5), COALESCE($7, 5), $8, $9, $10)
         ON CONFLICT (workspace_id, reviewer_id) DO UPDATE SET
           rating = EXCLUDED.rating,
           communication_rating = EXCLUDED.communication_rating,
           knowledge_rating = EXCLUDED.knowledge_rating,
           reliability_rating = EXCLUDED.reliability_rating,
           comment = EXCLUDED.comment,
           created_at = now()
         RETURNING *`,
        [
          workspace_id, 
          user.id, 
          revieweeId, 
          Math.min(5, Math.max(1, Number(rating))),
          Math.min(5, Math.max(1, Number(communication_rating || 5))),
          Math.min(5, Math.max(1, Number(knowledge_rating || 5))),
          Math.min(5, Math.max(1, Number(reliability_rating || 5))),
          comment || '',
          !isBothReviewed,
          isBothReviewed ? new Date() : new Date(Date.now() + 7 * 86400 * 1000)
        ]
      );

      // If both have reviewed, reveal both reviews immediately!
      if (isBothReviewed) {
        await db.query(
          `UPDATE reviews SET is_blind = false, revealed_at = now() WHERE workspace_id = $1`,
          [workspace_id]
        );
      }

      // Notify reviewee
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'REVIEW', 'Mutual Review Submitted ⭐', $2, $3)`,
        [revieweeId, isBothReviewed ? `${user.name} submitted their review — both reviews are now revealed on your profile!` : `${user.name} submitted their exchange review. Leave yours to reveal both!`, `/profile?userId=${revieweeId}`]
      );

      return res.json({ success: true, review: rows[0], isBothReviewed });
    } catch (err) {
      console.error('Error submitting review:', err);
      return res.status(500).json({ error: 'Failed to submit review' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}