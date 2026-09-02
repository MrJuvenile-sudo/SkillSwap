// api/resources/[id].js - Resource Detail, Reviews, Peer Teacher Matching
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const resourceId = req.params?.id || (req.url || '').split('/').filter(Boolean).pop();
  if (!resourceId || isNaN(Number(resourceId))) {
    return res.status(400).json({ error: 'Invalid resource ID' });
  }
  const rId = Number(resourceId);

  if (req.method === 'GET') {
    try {
      // Place $1, $2, $3 in exact numerical sequence as they appear in the SQL string
      const { rows } = await db.query(
        `SELECT r.*,
                u.name as contributor_name, u.avatar_url as contributor_avatar,
                u.username as contributor_username, u.headline as contributor_headline,
                (SELECT ROUND(AVG((rr.accuracy + rr.completeness + rr.relevance + rr.usefulness) / 4.0), 1)
                 FROM resource_reviews rr WHERE rr.resource_id = r.id) as avg_rating,
                (SELECT COUNT(*) FROM resource_reviews rr WHERE rr.resource_id = r.id) as review_count,
                (SELECT COUNT(*) FROM saved_resources sr WHERE sr.resource_id = r.id AND sr.user_id = $1) as is_saved,
                (SELECT AVG(accuracy) FROM resource_reviews WHERE resource_id = r.id) as avg_accuracy,
                (SELECT AVG(completeness) FROM resource_reviews WHERE resource_id = r.id) as avg_completeness,
                (SELECT AVG(relevance) FROM resource_reviews WHERE resource_id = r.id) as avg_relevance,
                (SELECT AVG(usefulness) FROM resource_reviews WHERE resource_id = r.id) as avg_usefulness
         FROM resources r
         JOIN app_users u ON r.contributor_id = u.id
         WHERE r.id = $2 AND (r.status = 'APPROVED' OR r.contributor_id = $3)`,
        [String(user.id), rId, String(user.id)]
      );

      if (!rows.length) return res.status(404).json({ error: 'Resource not found' });
      const resource = rows[0];

      // Key-point entries for KEY_POINTS type
      let keyPoints = [];
      if (resource.type === 'KEY_POINTS') {
        const { rows: kpRows } = await db.query(
          `SELECT * FROM key_point_entries WHERE resource_id = $1 ORDER BY order_index ASC`,
          [rId]
        );
        keyPoints = kpRows;
      }

      // Reviews
      const { rows: reviews } = await db.query(
        `SELECT rr.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
         FROM resource_reviews rr
         JOIN app_users u ON rr.reviewer_id = u.id
         WHERE rr.resource_id = $1
         ORDER BY rr.created_at DESC
         LIMIT 10`,
        [rId]
      );

      // Peer teachers who can teach this subject
      const subjTerm = '%' + resource.subject + '%';
      const topicTerm = '%' + (resource.unit_topic || resource.subject).split(' ')[0] + '%';
      const { rows: peerTeachers } = await db.query(
        `SELECT u.id, u.name, u.avatar_url, u.username, u.headline,
                s.name as skill_name,
                ROUND(COALESCE(AVG(rv.rating), 5.0), 1) as avg_rating,
                COUNT(rv.id) as reviews_count,
                us.level
         FROM user_skills us
         JOIN app_users u ON us.user_id = u.id
         JOIN skills s ON us.skill_id = s.id
         LEFT JOIN reviews rv ON rv.reviewee_id = u.id
         WHERE us.type = 'TEACH'
           AND u.status = 'ACTIVE'
           AND u.id != $1
           AND (LOWER(s.name) LIKE LOWER($2) OR LOWER(s.name) LIKE LOWER($3))
         GROUP BY u.id, u.name, u.avatar_url, u.username, u.headline, s.name, us.level
         ORDER BY avg_rating DESC
         LIMIT 4`,
        [String(user.id), subjTerm, topicTerm]
      );

      return res.json({ resource, keyPoints, reviews, peerTeachers });
    } catch (err) {
      console.error('Resource detail error:', err);
      return res.status(500).json({ error: 'Failed to load resource' });
    }
  }

  // POST - Submit quality review
  if (req.method === 'POST') {
    try {
      const { accuracy, completeness, relevance, usefulness, comment } = req.body || {};
      if (!accuracy || !completeness || !relevance || !usefulness) {
        return res.status(400).json({ error: 'All four rating fields are required (1-5).' });
      }

      const { rows: existing } = await db.query(
        `SELECT id FROM resource_reviews WHERE resource_id = $1 AND reviewer_id = $2`,
        [rId, String(user.id)]
      );
      if (existing.length) {
        return res.status(409).json({ error: 'You have already reviewed this resource.' });
      }

      const { rows: rRows } = await db.query(
        `SELECT contributor_id FROM resources WHERE id = $1`, [rId]
      );
      if (rRows[0]?.contributor_id === user.id) {
        return res.status(403).json({ error: 'You cannot review your own resource.' });
      }

      await db.query(
        `INSERT INTO resource_reviews (resource_id, reviewer_id, accuracy, completeness, relevance, usefulness, comment)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [rId, String(user.id),
         Math.min(5, Math.max(1, Number(accuracy))),
         Math.min(5, Math.max(1, Number(completeness))),
         Math.min(5, Math.max(1, Number(relevance))),
         Math.min(5, Math.max(1, Number(usefulness))),
         comment || null]
      );

      // Recalculate quality_score
      await db.query(
        `UPDATE resources SET quality_score =
           (SELECT ROUND(AVG((rr.accuracy + rr.completeness + rr.relevance + rr.usefulness) / 4.0), 2)
            FROM resource_reviews rr WHERE rr.resource_id = $1)
         WHERE id = $1`,
        [rId]
      );

      return res.json({ success: true });
    } catch (err) {
      console.error('Resource review error:', err);
      return res.status(500).json({ error: 'Failed to submit review' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
