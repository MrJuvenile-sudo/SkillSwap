// api/users/list.js - Lists Demo Users & Community Members
import { db } from 'hatchable';

export const access = 'public';

export default async function (req, res) {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar_url, u.headline,
              p.location, p.availability, p.preferred_language, p.completion_percentage,
              COALESCE(AVG(r.rating), 5.0) as avg_rating,
              COUNT(r.id) as reviews_count,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = u.id AND type = 'TEACH') as teach_count,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = u.id AND type = 'LEARN') as learn_count

       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.status = 'ACTIVE'
       GROUP BY u.id, u.name, u.email, u.role, u.status, u.avatar_url, u.headline,
                p.location, p.availability, p.preferred_language, p.completion_percentage
       ORDER BY (u.role = 'ADMIN') DESC, u.created_at ASC`
    );

    res.json({ users: rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
}