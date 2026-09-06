// api/exchange/progress.js - Learning Progress & Subskill Checklist API
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
      const goalId = req.query.goal_id;
      if (goalId) {
        const { rows } = await db.query(
          `SELECT lp.*
           FROM learning_progress lp
           JOIN learning_goals lg ON lp.learning_goal_id = lg.id
           WHERE lg.id = $1 AND lg.user_id = $2`,
          [goalId, userId]
        );

        if (!rows[0]) {
          // Initialize default progress row if not present
          const init = await db.query(
            `INSERT INTO learning_progress (learning_goal_id, sessions_completed, sessions_total, subskills_json)
             VALUES ($1, 0, 4, $2)
             RETURNING *`,
            [goalId, JSON.stringify([
              { id: 1, title: 'Core Concepts & Fundamentals', done: false },
              { id: 2, title: 'Hands-on Practice & Exercises', done: false },
              { id: 3, title: 'Project / Real-world Application', done: false },
              { id: 4, title: 'Peer Review & Feedback Session', done: false }
            ])]
          );
          return res.json({ progress: [init.rows[0]] });
        }

        return res.json({ progress: rows });
      }

      // Return all progress entries for current user's goals
      const { rows } = await db.query(
        `SELECT lp.*, lg.skill_id
         FROM learning_progress lp
         JOIN learning_goals lg ON lp.learning_goal_id = lg.id
         WHERE lg.user_id = $1`,
        [userId]
      );
      return res.json({ progress: rows || [] });
    }

    if (req.method === 'PUT') {
      const { id, goal_id, sessions_completed, sessions_total, subskills } = req.body || {};
      if (!id && !goal_id) return res.status(400).json({ error: 'Goal ID or Progress ID required' });

      const subskillsJson = Array.isArray(subskills) ? JSON.stringify(subskills) : undefined;

      let query = '';
      let params = [];

      if (id) {
        query = `UPDATE learning_progress
                 SET sessions_completed = COALESCE($1, sessions_completed),
                     sessions_total = COALESCE($2, sessions_total),
                     subskills_json = COALESCE($3, subskills_json),
                     updated_at = datetime('now')
                 WHERE id = $4 RETURNING *`;
        params = [sessions_completed, sessions_total, subskillsJson, id];
      } else {
        query = `UPDATE learning_progress
                 SET sessions_completed = COALESCE($1, sessions_completed),
                     sessions_total = COALESCE($2, sessions_total),
                     subskills_json = COALESCE($3, subskills_json),
                     updated_at = datetime('now')
                 WHERE learning_goal_id = $4 RETURNING *`;
        params = [sessions_completed, sessions_total, subskillsJson, goal_id];
      }

      const { rows } = await db.query(query, params);
      return res.json({ success: true, progress: rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Learning Progress API error:', err);
    return res.status(500).json({ error: 'Failed to update learning progress' });
  }
}
