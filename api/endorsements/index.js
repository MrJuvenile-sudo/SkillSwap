// api/endorsements/index.js - Peer Skill Endorsements
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { user_skill_id } = req.query;
    if (!user_skill_id) {
      return res.status(400).json({ error: 'User skill ID required.' });
    }

    const { rows } = await db.query(
      `SELECT e.*, u.name as endorser_name, u.avatar_url as endorser_avatar, u.headline as endorser_headline
       FROM skill_endorsements e
       JOIN app_users u ON e.endorser_id = u.id
       WHERE e.user_skill_id = $1
       ORDER BY e.created_at DESC`,
      [user_skill_id]
    );

    return res.json({ endorsements: rows });
  }

  if (req.method === 'POST') {
    const user = await requireCurrentUser(req, res);
    if (!user) return;

    const { user_skill_id, workspace_id, comment } = req.body || {};
    if (!user_skill_id) {
      return res.status(400).json({ error: 'User skill ID required.' });
    }

    try {
      const { rows } = await db.query(
        `INSERT INTO skill_endorsements (user_skill_id, endorser_id, workspace_id, comment)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_skill_id, endorser_id) DO UPDATE SET
           comment = EXCLUDED.comment,
           created_at = now()
         RETURNING *`,
        [user_skill_id, user.id, workspace_id || null, comment || 'Verified peer mastery through completed skill exchange.']
      );

      // Increment count on user_skills
      await db.query(
        `UPDATE user_skills 
         SET endorsements_count = (SELECT COUNT(*) FROM skill_endorsements WHERE user_skill_id = $1)
         WHERE id = $1`,
        [user_skill_id]
      );

      return res.json({ success: true, endorsement: rows[0] });
    } catch (err) {
      console.error('Endorsement error:', err);
      return res.status(500).json({ error: 'Failed to submit endorsement.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}