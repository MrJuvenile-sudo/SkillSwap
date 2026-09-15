// api/resources/my.js - My Uploads and Download History
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tab = 'uploads' } = req.query || {};

    if (tab === 'uploads') {
      const { rows } = await db.query(
        `SELECT r.*,
                (SELECT ROUND(AVG((rr.accuracy + rr.completeness + rr.relevance + rr.usefulness) / 4.0), 1)
                 FROM resource_reviews rr WHERE rr.resource_id = r.id) as avg_rating,
                (SELECT COUNT(*) FROM resource_reviews rr WHERE rr.resource_id = r.id) as review_count
         FROM resources r
         WHERE r.contributor_id = $1
         ORDER BY r.created_at DESC`,
        [user.id]
      );
      return res.json({ uploads: rows });
    }

    if (tab === 'downloads') {
      const { rows } = await db.query(
        `SELECT r.*, u.name as contributor_name,
                rd.created_at as downloaded_at
         FROM resource_downloads rd
         JOIN resources r ON rd.resource_id = r.id
         JOIN app_users u ON r.contributor_id = u.id
         WHERE rd.user_id = $1
         ORDER BY rd.created_at DESC
         LIMIT 50`,
        [user.id]
      );
      return res.json({ downloads: rows });
    }

    return res.status(400).json({ error: 'Invalid tab. Use uploads or downloads.' });
  } catch (err) {
    console.error('My resources error:', err);
    return res.status(500).json({ error: 'Failed to load resources' });
  }
}
