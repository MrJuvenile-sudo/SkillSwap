// api/public/profile.js - Public Shareable Profile View (/u/:username)
import { db } from 'hatchable';

export const access = 'public';

export default async function (req, res) {
  const { username, userId } = req.query;

  if (!username && !userId) {
    return res.status(400).json({ error: 'Username or userId is required.' });
  }

  try {
    let query = `
      SELECT u.id, u.name, u.username, u.avatar_url, u.headline, u.role, u.created_at,
             u.portfolio_links, u.certifications, u.privacy_settings,
             p.bio, p.location, p.timezone, p.preferred_language, p.weekly_hours, p.availability_schedule,
             p.github_url, p.dribbble_url, p.website_url, p.linkedin_url,
             COALESCE(AVG(r.rating), 5.0)::numeric(3,1) as avg_rating,
             COUNT(r.id)::int as reviews_count,
             COALESCE(AVG(r.communication_rating), 5.0)::numeric(3,1) as avg_communication,
             COALESCE(AVG(r.knowledge_rating), 5.0)::numeric(3,1) as avg_knowledge,
             COALESCE(AVG(r.reliability_rating), 5.0)::numeric(3,1) as avg_reliability
      FROM app_users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN reviews r ON u.id = r.reviewee_id
      WHERE u.status = 'ACTIVE'
    `;

    const params = [];
    if (username) {
      query += ` AND LOWER(u.username) = LOWER($1)`;
      params.push(username.trim());
    } else {
      query += ` AND u.id = $1`;
      params.push(userId.trim());
    }

    query += `
      GROUP BY u.id, u.name, u.username, u.avatar_url, u.headline, u.role, u.created_at,
               u.portfolio_links, u.certifications, u.privacy_settings,
               p.bio, p.location, p.timezone, p.preferred_language, p.weekly_hours, p.availability_schedule,
               p.github_url, p.dribbble_url, p.website_url, p.linkedin_url
    `;

    const { rows: userRows } = await db.query(query, params);
    if (!userRows[0]) {
      return res.status(404).json({ error: 'Member profile not found.' });
    }

    const user = userRows[0];

    // Fetch skills with endorsements
    const { rows: userSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.description as skill_desc, 
              c.name as category_name, c.icon as category_icon,
              (SELECT json_agg(json_build_object('id', e.id, 'endorser_id', e.endorser_id, 'comment', e.comment, 'created_at', e.created_at))
               FROM skill_endorsements e WHERE e.user_skill_id = us.id) as endorsements
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1
       ORDER BY us.type ASC, us.experience_years DESC`,
      [user.id]
    );

    // Fetch verified reviews
    const { rows: reviews } = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.headline as reviewer_headline,
              w.title as workspace_title
       FROM reviews r
       JOIN app_users u ON r.reviewer_id = u.id
       LEFT JOIN exchange_workspaces w ON r.workspace_id = w.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC LIMIT 20`,
      [user.id]
    );

    return res.json({
      user: {
        ...user,
        teach_skills: userSkills.filter(s => s.type === 'TEACH'),
        learn_skills: userSkills.filter(s => s.type === 'LEARN'),
        reviews
      }
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: 'Failed to load public profile.' });
  }
}