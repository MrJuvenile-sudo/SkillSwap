// api/skills/user.js - Manage Current User's Teach & Learn Skills
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

    const { rows } = await db.query(
      `SELECT us.*, s.name as skill_name, s.description as skill_desc, 
              c.name as category_name, c.icon as category_icon
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id = $1
       ORDER BY us.type ASC, us.experience_years DESC`,
      [userId]
    );

    return res.json({
      skills: rows,
      teach: rows.filter(r => r.type === 'TEACH'),
      learn: rows.filter(r => r.type === 'LEARN')
    });
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { skill_id, skill_name, category_id, type, level, experience_years, description } = req.body || {};

    if (!type || !['TEACH', 'LEARN'].includes(type)) {
      return res.status(400).json({ error: 'Skill type must be TEACH or LEARN' });
    }

    let resolvedSkillId = skill_id;

    // Auto-create skill if custom name provided with category
    if (!resolvedSkillId && skill_name && category_id) {
      const { rows: existing } = await db.query(
        `SELECT id FROM skills WHERE LOWER(name) = LOWER($1) AND category_id = $2`,
        [skill_name.trim(), category_id]
      );
      if (existing[0]) {
        resolvedSkillId = existing[0].id;
      } else {
        const { rows: created } = await db.query(
          `INSERT INTO skills (name, category_id, description)
           VALUES ($1, $2, 'Community added skill')
           RETURNING id`,
          [skill_name.trim(), category_id]
        );
        resolvedSkillId = created[0].id;
      }
    }

    if (!resolvedSkillId) {
      return res.status(400).json({ error: 'Skill selection is required' });
    }

    try {
      const { rows } = await db.query(
        `INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, description)
         VALUES ($1, $2, $3, COALESCE($4, 'Intermediate'), COALESCE($5, 1.0), $6)
         ON CONFLICT (user_id, skill_id, type) DO UPDATE SET
           level = EXCLUDED.level,
           experience_years = EXCLUDED.experience_years,
           description = EXCLUDED.description
         RETURNING *`,
        [user.id, resolvedSkillId, type, level || 'Intermediate', Number(experience_years) || 1.0, description || '']
      );

      return res.json({ success: true, user_skill: rows[0] });
    } catch (err) {
      console.error('Error adding user skill:', err);
      return res.status(500).json({ error: 'Failed to add user skill' });
    }
  }

  if (req.method === 'PUT') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { id, level, experience_years, description } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Skill ID required' });
    }

    const { rows } = await db.query(
      `UPDATE user_skills
       SET level = COALESCE($1, level),
           experience_years = COALESCE($2, experience_years),
           description = COALESCE($3, description)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [level, experience_years ? Number(experience_years) : null, description, id, user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Skill entry not found' });
    }

    return res.json({ success: true, user_skill: rows[0] });
  }

  if (req.method === 'DELETE') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const id = req.query?.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ error: 'Skill record ID required' });
    }

    await db.query(
      `DELETE FROM user_skills WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}