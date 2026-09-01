// api/profile.js - View & Update User Profile
import { db } from 'hatchable';
import { requireCurrentUser, getCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const targetUserId = req.query.userId;
    let userId = targetUserId;
    
    if (!userId) {
      const currentUser = await getCurrentUser(req);
      userId = currentUser ? currentUser.id : 'user_alice';
    }

    const { rows: userRows } = await db.query(
      `SELECT id, name, email, role, status, avatar_url, headline, created_at 
       FROM app_users 
       WHERE id = $1`,
      [userId]
    );

    if (!userRows[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const user = userRows[0];

    const { rows: profileRows } = await db.query(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [userId]
    );

    const { rows: teachSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.description as skill_desc, c.name as category_name, c.icon as category_icon
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1 AND us.type = 'TEACH'
       ORDER BY us.experience_years DESC`,
      [userId]
    );

    const { rows: learnSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.description as skill_desc, c.name as category_name, c.icon as category_icon
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1 AND us.type = 'LEARN'
       ORDER BY us.id ASC`,
      [userId]
    );

    const { rows: reviewRows } = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.headline as reviewer_headline,
              w.title as workspace_title
       FROM reviews r
       JOIN app_users u ON r.reviewer_id = u.id
       LEFT JOIN exchange_workspaces w ON r.workspace_id = w.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const { rows: ratingStats } = await db.query(
      `SELECT 
         COUNT(*)::int as total_reviews,
         COALESCE(AVG(rating), 5.0)::numeric(3,2) as avg_rating,
         COALESCE(AVG(communication_rating), 5.0)::numeric(3,2) as avg_comm,
         COALESCE(AVG(knowledge_rating), 5.0)::numeric(3,2) as avg_know,
         COALESCE(AVG(reliability_rating), 5.0)::numeric(3,2) as avg_rel
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );

    const { rows: workspaceStats } = await db.query(
      `SELECT 
         COUNT(DISTINCT c.id)::int as total_connections,
         COUNT(DISTINCT w.id) FILTER (WHERE w.status = 'COMPLETED')::int as completed_workspaces
       FROM connections c
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE (c.user1_id = $1 OR c.user2_id = $1)`,
      [userId]
    );

    return res.json({
      user: {
        ...user,
        profile: profileRows[0] || {},
        teach_skills: teachSkills,
        learn_skills: learnSkills,
        reviews: reviewRows,
        ratings: ratingStats[0],
        stats: workspaceStats[0]
      }
    });
  }

  if (req.method === 'PUT') {
    const currentUser = await requireCurrentUser(req, res);
    if (!currentUser) return;

    const { name, headline, avatar_url, bio, location, preferred_language, availability, timezone, weekly_hours } = req.body || {};

    // Update app_users
    if (name || headline || avatar_url) {
      await db.query(
        `UPDATE app_users 
         SET name = COALESCE($1, name),
             headline = COALESCE($2, headline),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = now()
         WHERE id = $4`,
        [name, headline, avatar_url, currentUser.id]
      );
    }

    // Calculate profile completion percentage
    let completion = 40;
    if (bio && bio.length > 20) completion += 20;
    if (location) completion += 15;
    if (availability) completion += 15;
    if (preferred_language) completion += 10;

    // Update profiles
    const { rows: updatedProfile } = await db.query(
      `INSERT INTO profiles (user_id, bio, location, preferred_language, availability, timezone, weekly_hours, completion_percentage, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       ON CONFLICT (user_id) DO UPDATE SET
         bio = COALESCE(EXCLUDED.bio, profiles.bio),
         location = COALESCE(EXCLUDED.location, profiles.location),
         preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
         availability = COALESCE(EXCLUDED.availability, profiles.availability),
         timezone = COALESCE(EXCLUDED.timezone, profiles.timezone),
         weekly_hours = COALESCE(EXCLUDED.weekly_hours, profiles.weekly_hours),
         completion_percentage = $8,
         updated_at = now()
       RETURNING *`,
      [currentUser.id, bio, location, preferred_language, availability, timezone || 'UTC', weekly_hours || 4, completion]
    );

    return res.json({ success: true, profile: updatedProfile[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
}