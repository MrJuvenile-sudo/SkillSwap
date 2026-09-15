// api/ai/history.js - AI Conversation History
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { conversationId } = req.query || {};

    if (conversationId) {
      // Verify this conversation belongs to user
      const { rows: convRows } = await db.query(
        `SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2`,
        [Number(conversationId), user.id]
      );
      if (!convRows.length) return res.status(403).json({ error: 'Unauthorized' });

      const { rows } = await db.query(
        `SELECT m.*, f.rating as feedback_rating
         FROM ai_messages m
         LEFT JOIN ai_feedback f ON f.message_id = m.id AND f.user_id = $2
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC
         LIMIT 50`,
        [Number(conversationId), user.id]
      );
      return res.json({ messages: rows });
    }

    // List recent conversations
    const { rows } = await db.query(
      `SELECT c.*,
              (SELECT content FROM ai_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM ai_conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT 10`,
      [user.id]
    );
    return res.json({ conversations: rows });
  } catch (err) {
    console.error('AI history error:', err);
    return res.status(500).json({ error: 'Failed to load conversation history' });
  }
}
