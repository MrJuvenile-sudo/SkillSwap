// Backend/controllers/userController.js - User Profiles, Skills & Directory
import { getDb } from '../config/db.js';

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const userRes = await db.query(
      `SELECT id, name, username, email, role, status, avatar_url, headline, karma_score, created_at
       FROM app_users WHERE id = ? OR username = ?`,
      [id, id]
    );

    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileRes = await db.query(`SELECT * FROM profiles WHERE user_id = ?`, [user.id]);
    const skillsRes = await db.query(
      `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name
       FROM user_skills us
       LEFT JOIN skills s ON us.skill_id = s.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = ?`,
      [user.id]
    );

    const reviewsRes = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN app_users u ON r.reviewer_id = u.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC LIMIT 10`,
      [user.id]
    );

    return res.json({
      ...user,
      profile: profileRes.rows[0] || {},
      skills: skillsRes.rows || [],
      reviews: reviewsRes.rows || []
    });
  } catch (err) {
    console.error('[userController.getUserProfile] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, headline, avatar_url, bio, location, preferred_language, availability, timezone } = req.body || {};
    const db = await getDb();

    if (name || headline || avatar_url) {
      await db.query(
        `UPDATE app_users 
         SET name = COALESCE(?, name), 
             headline = COALESCE(?, headline),
             avatar_url = COALESCE(?, avatar_url)
         WHERE id = ?`,
        [name, headline, avatar_url, userId]
      );
    }

    await db.query(
      `INSERT INTO profiles (user_id, bio, location, preferred_language, availability, timezone)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = COALESCE(EXCLUDED.bio, profiles.bio),
         location = COALESCE(EXCLUDED.location, profiles.location),
         preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
         availability = COALESCE(EXCLUDED.availability, profiles.availability),
         timezone = COALESCE(EXCLUDED.timezone, profiles.timezone)`,
      [userId, bio, location, preferred_language, availability, timezone]
    );

    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('[userController.updateProfile] Error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function addUserSkill(req, res) {
  try {
    const userId = req.user.id;
    const { skill_name, skill_type, proficiency_level, description, category_name } = req.body || {};

    if (!skill_name || !skill_type) {
      return res.status(400).json({ error: 'Skill name and type (OFFERED/WANTED) are required' });
    }

    const db = await getDb();
    const cleanSkillName = skill_name.trim();

    // Check or insert skill into global skills dictionary
    let skillRes = await db.query(`SELECT id FROM skills WHERE LOWER(name) = LOWER(?)`, [cleanSkillName]);
    let skillId = skillRes.rows[0]?.id;

    if (!skillId) {
      skillId = 'skill_' + Math.random().toString(36).substring(2, 9);
      await db.query(
        `INSERT INTO skills (id, name, description) VALUES (?, ?, ?)`,
        [skillId, cleanSkillName, description || cleanSkillName]
      );
    }

    const userSkillId = 'us_' + Math.random().toString(36).substring(2, 9);
    await db.query(
      `INSERT INTO user_skills (id, user_id, skill_id, skill_type, proficiency_level, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userSkillId, userId, skillId, skill_type.toUpperCase(), proficiency_level || 'INTERMEDIATE', description || '']
    );

    return res.status(201).json({ success: true, id: userSkillId, skillId });
  } catch (err) {
    console.error('[userController.addUserSkill] Error:', err);
    return res.status(500).json({ error: 'Failed to add user skill' });
  }
}

export async function removeUserSkill(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const db = await getDb();

    await db.query(`DELETE FROM user_skills WHERE id = ? AND user_id = ?`, [id, userId]);
    return res.json({ success: true, message: 'Skill removed' });
  } catch (err) {
    console.error('[userController.removeUserSkill] Error:', err);
    return res.status(500).json({ error: 'Failed to remove skill' });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    const db = await getDb();

    let query = `
      SELECT u.id, u.name, u.username, u.avatar_url, u.headline, u.karma_score,
             p.location, p.availability
      FROM app_users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.status = 'ACTIVE'
    `;
    const params = [];

    if (search) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.headline) LIKE ? OR LOWER(p.location) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY u.karma_score DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);
    return res.json({ users: result.rows || [] });
  } catch (err) {
    console.error('[userController.getAllUsers] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
}
