// api/exchange/goals.js - Learning Goals CRUD API for Exchange Hub
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
        `SELECT lg.*, s.name as skill_name, s.description as skill_description, c.name as category_name
         FROM learning_goals lg
         JOIN skills s ON lg.skill_id = s.id
         LEFT JOIN categories c ON s.category_id = c.id
         WHERE lg.user_id = $1
         ORDER BY lg.created_at DESC`,
        [userId]
      );
      return res.json({ goals: rows || [] });
    }

    if (req.method === 'POST') {
      const { skill_id, skill_name, current_level, target_level, goal_text, intent, preferred_mode } = req.body || {};
      
      let targetSkillId = skill_id;
      if (!targetSkillId && skill_name) {
        const { rows: skillRows } = await db.query(`SELECT id FROM skills WHERE LOWER(name) = LOWER($1)`, [skill_name.trim()]);
        if (skillRows && skillRows.length > 0) {
          targetSkillId = skillRows[0].id;
        } else {
          const { rows: catRows } = await db.query(`SELECT id FROM categories LIMIT 1`);
          const catId = (catRows && catRows.length > 0) ? catRows[0].id : 1;
          const { rows: newSkill } = await db.query(`INSERT INTO skills (name, category_id, description) VALUES ($1, $2, $3) RETURNING id`, [skill_name.trim(), catId, 'User specified learning goal']);
          targetSkillId = newSkill ? newSkill[0].id : 1;
        }
      }

      if (!targetSkillId) {
        return res.status(400).json({ error: 'Skill selection is required' });
      }

      const { rows } = await db.query(
        `INSERT INTO learning_goals (user_id, skill_id, current_level, target_level, goal_text, goal_description, intent, preferred_mode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          userId,
          targetSkillId,
          current_level || 'Beginner',
          target_level || 'Intermediate',
          goal_text || '',
          goal_text || '',
          intent || 'career',
          preferred_mode || 'one_on_one'
        ]
      );

      // Also ensure skill is registered in user_skills as LEARN
      await db.query(
        `INSERT INTO user_skills (user_id, skill_id, type, level, is_verified, description)
         VALUES ($1, $2, 'LEARN', $3, false, $4)
         ON CONFLICT DO NOTHING`,
        [userId, Number(targetSkillId), current_level || 'Beginner', goal_text || '']
      ).catch(() => {});

      return res.json({ success: true, goal: rows[0] });
    }

    if (req.method === 'PUT') {
      const { id, status, current_level, target_level, goal_text } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Goal ID is required' });

      const { rows } = await db.query(
        `UPDATE learning_goals
         SET status = COALESCE($1, status),
             current_level = COALESCE($2, current_level),
             target_level = COALESCE($3, target_level),
             goal_text = COALESCE($4, goal_text),
             updated_at = datetime('now')
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [status, current_level, target_level, goal_text, id, userId]
      );

      return res.json({ success: true, goal: rows[0] });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'Goal ID is required' });

      await db.query(`DELETE FROM learning_goals WHERE id = $1 AND user_id = $2`, [id, userId]);
      return res.json({ success: true, deleted_id: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Learning Goals API error:', err);
    return res.status(500).json({ error: 'Failed to process learning goal request' });
  }
}
