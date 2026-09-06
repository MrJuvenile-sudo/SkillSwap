// api/exchange/teaching-prefs.js - Teaching Preferences CRUD API for Exchange Hub
import { db } from 'hatchable';

export const access = 'public';

function getUserId(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/skillswap_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function (req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized session' });
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await db.query(
        `SELECT tp.*, s.name as skill_name, c.name as category_name, us.level, us.experience_years, us.is_verified
         FROM teaching_preferences tp
         JOIN skills s ON tp.skill_id = s.id
         LEFT JOIN categories c ON s.category_id = c.id
         LEFT JOIN user_skills us ON (us.user_id = tp.user_id AND us.skill_id = tp.skill_id AND us.type = 'TEACH')
         WHERE tp.user_id = $1
         ORDER BY tp.created_at DESC`,
        [userId]
      );
      return res.json({ preferences: rows || [] });
    }

    if (req.method === 'POST') {
      const { skill_id, skill_name, level_can_teach, format, availability, session_length_preference, teaching_style } = req.body || {};
      
      let targetSkillId = skill_id;
      if (!targetSkillId && skill_name) {
        const { rows: skillRows } = await db.query(`SELECT id FROM skills WHERE LOWER(name) = LOWER($1)`, [skill_name.trim()]);
        if (skillRows && skillRows.length > 0) {
          targetSkillId = skillRows[0].id;
        } else {
          const { rows: catRows } = await db.query(`SELECT id FROM categories LIMIT 1`);
          const catId = (catRows && catRows.length > 0) ? catRows[0].id : 1;
          const { rows: newSkill } = await db.query(`INSERT INTO skills (name, category_id, description) VALUES ($1, $2, $3) RETURNING id`, [skill_name.trim(), catId, 'User teaching preference']);
          targetSkillId = newSkill ? newSkill[0].id : 1;
        }
      }

      if (!targetSkillId) {
        return res.status(400).json({ error: 'Skill ID is required' });
      }

      // Upsert into teaching_preferences
      const { rows } = await db.query(
        `INSERT INTO teaching_preferences (user_id, skill_id, level_can_teach, format, availability, session_length_preference, teaching_style)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, skill_id) DO UPDATE SET
           level_can_teach = EXCLUDED.level_can_teach,
           format = EXCLUDED.format,
           availability = EXCLUDED.availability,
           session_length_preference = EXCLUDED.session_length_preference,
           teaching_style = EXCLUDED.teaching_style,
           updated_at = datetime('now')
         RETURNING *`,
        [
          userId,
          targetSkillId,
          level_can_teach || 'Intermediate',
          format || 'online',
          availability || 'Flexible',
          session_length_preference || '1 hour',
          teaching_style || 'mentoring'
        ]
      );

      // Ensure user_skills has TEACH record
      await db.query(
        `INSERT INTO user_skills (user_id, skill_id, type, level, is_verified)
         VALUES ($1, $2, 'TEACH', $3, false)
         ON CONFLICT DO NOTHING`,
        [userId, skill_id, level_can_teach || 'Intermediate']
      ).catch(() => {});

      return res.json({ success: true, preference: rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Teaching Preferences API error:', err);
    return res.status(500).json({ error: 'Failed to process teaching preferences' });
  }
}
