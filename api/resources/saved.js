// api/resources/saved.js - Save & Unsave Resources
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT r.*, u.name as contributor_name, u.avatar_url as contributor_avatar,
                (SELECT ROUND(AVG((rr.accuracy + rr.completeness + rr.relevance + rr.usefulness) / 4.0), 1)
                 FROM resource_reviews rr WHERE rr.resource_id = r.id) as avg_rating,
                (SELECT COUNT(*) FROM resource_reviews rr WHERE rr.resource_id = r.id) as review_count
         FROM saved_resources sr
         JOIN resources r ON sr.resource_id = r.id
         JOIN app_users u ON r.contributor_id = u.id
         WHERE sr.user_id = $1 AND r.status = 'APPROVED'
         ORDER BY sr.created_at DESC`,
        [user.id]
      );
      return res.json({ saved: rows });
    } catch (err) {
      console.error('Saved resources error:', err);
      return res.status(500).json({ error: 'Failed to fetch saved resources' });
    }
  }

  if (req.method === 'POST') {
    const { resource_id } = req.body || {};
    if (!resource_id) return res.status(400).json({ error: 'resource_id required' });
    try {
      await db.query(
        `INSERT INTO saved_resources (user_id, resource_id) VALUES ($1, $2)`,
        [user.id, Number(resource_id)]
      );
      return res.json({ success: true });
    } catch (err) {
      // Ignore unique constraint errors (already saved)
      return res.json({ success: true });
    }
  }

  if (req.method === 'DELETE') {
    const { resource_id } = req.body || {};
    if (!resource_id) return res.status(400).json({ error: 'resource_id required' });
    try {
      await db.query(
        `DELETE FROM saved_resources WHERE user_id = $1 AND resource_id = $2`,
        [user.id, Number(resource_id)]
      );
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to unsave resource' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
