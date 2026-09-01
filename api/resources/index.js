// api/resources/index.js - Browse & Search Learning Hub Resources
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, university, semester, subject, q, page = 1, limit = 12 } = req.query || {};
    const offset = (Number(page) - 1) * Number(limit);

    let conditions = [`r.status = 'APPROVED'`];
    let params = [];
    let paramIdx = 1;

    if (type && type !== 'ALL') {
      conditions.push(`r.type = $${paramIdx++}`);
      params.push(type);
    }
    if (university) {
      conditions.push(`r.university LIKE $${paramIdx++}`);
      params.push('%' + university + '%');
    }
    if (semester) {
      conditions.push(`r.semester = $${paramIdx++}`);
      params.push(semester);
    }
    if (subject) {
      conditions.push(`r.subject LIKE $${paramIdx++}`);
      params.push('%' + subject + '%');
    }
    if (q) {
      conditions.push(`(r.title LIKE $${paramIdx} OR r.description LIKE $${paramIdx} OR r.subject LIKE $${paramIdx})`);
      params.push('%' + q + '%');
      paramIdx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows } = await db.query(
      `SELECT r.*,
              u.name as contributor_name, u.avatar_url as contributor_avatar, u.username as contributor_username,
              (SELECT ROUND(AVG((rr.accuracy + rr.completeness + rr.relevance + rr.usefulness) / 4.0), 1)
               FROM resource_reviews rr WHERE rr.resource_id = r.id) as avg_rating,
              (SELECT COUNT(*) FROM resource_reviews rr WHERE rr.resource_id = r.id) as review_count,
              (SELECT COUNT(*) FROM saved_resources sr WHERE sr.resource_id = r.id AND sr.user_id = $${paramIdx}) as is_saved
       FROM resources r
       JOIN app_users u ON r.contributor_id = u.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}`,
      [...params, user.id, Number(limit), offset]
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int as total FROM resources r ${where}`,
      params
    );

    const { rows: typeCounts } = await db.query(
      `SELECT type, COUNT(*)::int as count FROM resources WHERE status = 'APPROVED' GROUP BY type`
    );

    return res.json({
      resources: rows,
      total: countRows[0]?.total || 0,
      page: Number(page),
      limit: Number(limit),
      typeCounts
    });
  } catch (err) {
    console.error('Resources browse error:', err);
    return res.status(500).json({ error: 'Failed to load resources' });
  }
}
