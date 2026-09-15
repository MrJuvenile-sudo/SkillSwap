// api/ai/feedback.js - AI Message Feedback (thumbs up/down)
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message_id, rating, comment } = req.body || {};
  if (!message_id || !['UP', 'DOWN'].includes(rating)) {
    return res.status(400).json({ error: 'message_id and rating (UP or DOWN) are required' });
  }

  try {
    // Upsert feedback
    const { rows: existing } = await db.query(
      `SELECT id FROM ai_feedback WHERE message_id = $1 AND user_id = $2`,
      [Number(message_id), user.id]
    );

    if (existing.length) {
      await db.query(
        `UPDATE ai_feedback SET rating = $1, comment = $2 WHERE message_id = $3 AND user_id = $4`,
        [rating, comment || null, Number(message_id), user.id]
      );
    } else {
      await db.query(
        `INSERT INTO ai_feedback (message_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
        [Number(message_id), user.id, rating, comment || null]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('AI feedback error:', err);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }
}
