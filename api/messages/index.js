// api/messages/index.js - One-to-One Chat Messaging per Connection
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { connection_id } = req.query;
    if (!connection_id) {
      // List all recent chat threads/conversations for user
      const { rows: threads } = await db.query(
        `SELECT c.id as connection_id, c.status, c.created_at,
                u1.id as user1_id, u1.name as user1_name, u1.avatar_url as user1_avatar, u1.headline as user1_headline,
                u2.id as user2_id, u2.name as user2_name, u2.avatar_url as user2_avatar, u2.headline as user2_headline,
                w.id as workspace_id, w.title as workspace_title,
                (SELECT message FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                (SELECT sender_id FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender_id,
                (SELECT COUNT(*)::int FROM messages WHERE connection_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
         FROM connections c
         JOIN app_users u1 ON c.user1_id = u1.id
         JOIN app_users u2 ON c.user2_id = u2.id
         LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
         WHERE c.user1_id = $1 OR c.user2_id = $1
         ORDER BY last_message_at DESC NULLS LAST, c.created_at DESC`,
        [user.id]
      );

      const formatted = threads.map(t => {
        const isUser1 = t.user1_id === user.id;
        const partner = {
          id: isUser1 ? t.user2_id : t.user1_id,
          name: isUser1 ? t.user2_name : t.user1_name,
          avatar_url: isUser1 ? t.user2_avatar : t.user1_avatar,
          headline: isUser1 ? t.user2_headline : t.user1_headline
        };
        return {
          connection_id: t.connection_id,
          workspace_id: t.workspace_id,
          workspace_title: t.workspace_title,
          partner,
          last_message: t.last_message,
          last_message_at: t.last_message_at,
          unread_count: t.unread_count || 0
        };
      });

      return res.json({ threads: formatted });
    }

    // Fetch messages for specific connection
    const { rows: connectionRows } = await db.query(
      `SELECT c.*, 
              u1.name as user1_name, u1.avatar_url as user1_avatar,
              u2.name as user2_name, u2.avatar_url as user2_avatar,
              w.id as workspace_id, w.title as workspace_title
       FROM connections c
       JOIN app_users u1 ON c.user1_id = u1.id
       JOIN app_users u2 ON c.user2_id = u2.id
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE c.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
      [connection_id, user.id]
    );

    if (!connectionRows[0]) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }

    const conn = connectionRows[0];
    const isUser1 = conn.user1_id === user.id;
    const partnerId = isUser1 ? conn.user2_id : conn.user1_id;
    const partner = {
      id: partnerId,
      name: isUser1 ? conn.user2_name : conn.user1_name,
      avatar_url: isUser1 ? conn.user2_avatar : conn.user1_avatar
    };

    const { rows: messages } = await db.query(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN app_users u ON m.sender_id = u.id
       WHERE m.connection_id = $1
       ORDER BY m.created_at ASC`,
      [connection_id]
    );

    // Auto mark partner messages as read
    await db.query(
      `UPDATE messages SET is_read = true 
       WHERE connection_id = $1 AND sender_id != $2 AND is_read = false`,
      [connection_id, user.id]
    );

    return res.json({
      connection: {
        id: conn.id,
        workspace_id: conn.workspace_id,
        workspace_title: conn.workspace_title,
        partner
      },
      messages
    });
  }

  if (req.method === 'POST') {
    const { connection_id, message } = req.body || {};
    if (!connection_id || !message || !message.trim()) {
      return res.status(400).json({ error: 'Connection ID and non-empty message are required' });
    }

    const { rows: connRows } = await db.query(
      `SELECT * FROM connections WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [connection_id, user.id]
    );

    if (!connRows[0]) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }

    const conn = connRows[0];
    const recipientId = conn.user1_id === user.id ? conn.user2_id : conn.user1_id;

    const { rows: msgRows } = await db.query(
      `INSERT INTO messages (connection_id, sender_id, message, is_read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [connection_id, user.id, message.trim()]
    );

    const createdMsg = msgRows[0];

    // Notification for recipient
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'MESSAGE', $2, $3, $4)`,
      [recipientId, `Message from ${user.name}`, message.trim().slice(0, 80), `/chat?connection=${connection_id}`]
    );

    // Fire realtime events to user and connection
    try {
      await events.publish(`user:${recipientId}`, 'new_message', {
        connectionId: connection_id,
        senderId: user.id,
        senderName: user.name,
        message: message.trim()
      });
      await events.publish(`chat:${connection_id}`, 'chat_message', {
        ...createdMsg,
        sender_name: user.name,
        sender_avatar: user.avatar_url
      });
    } catch {
      // ignore
    }

    return res.json({
      success: true,
      message: {
        ...createdMsg,
        sender_name: user.name,
        sender_avatar: user.avatar_url
      }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}