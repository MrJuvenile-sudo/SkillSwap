// api/messages/index.js - Complete Chat & Messaging API
import { db, events } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  // ----------------------------------------------------
  // GET: Threads, Contact list, or Specific Conversation
  // ----------------------------------------------------
  if (req.method === 'GET') {
    const { connection_id, partner_id, user_id, recipient_id, type } = req.query;

    // A. Return contacts for "+ New Chat" picker
    if (type === 'contacts' || req.query.contacts === 'true') {
      const { rows: contactRows } = await db.query(
        `SELECT id, name, username, email, avatar_url, headline, role
         FROM app_users
         WHERE id != $1 AND (status IS NULL OR status != 'SUSPENDED')
         ORDER BY name ASC
         LIMIT 40`,
        [user.id]
      );
      return res.json({ contacts: contactRows });
    }

    // B. If partner_id is provided, find or create connection and return messages
    const targetPartnerId = partner_id || user_id || recipient_id;
    let selectedConnId = connection_id;

    if (targetPartnerId && !selectedConnId) {
      if (targetPartnerId === user.id) {
        return res.status(400).json({ error: 'Cannot start chat with yourself.' });
      }

      // Check for existing connection
      const { rows: existingConns } = await db.query(
        `SELECT id FROM connections
         WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
         ORDER BY id ASC LIMIT 1`,
        [user.id, targetPartnerId]
      );

      if (existingConns[0]) {
        selectedConnId = existingConns[0].id;
      } else {
        // Create a new connection
        const { rows: newConnRows } = await db.query(
          `INSERT INTO connections (user1_id, user2_id, status)
           VALUES ($1, $2, 'ACTIVE')
           RETURNING id`,
          [user.id, targetPartnerId]
        );
        selectedConnId = newConnRows[0].id;
      }
    }

    // C. Specific connection requested
    if (selectedConnId) {
      const { rows: connectionRows } = await db.query(
        `SELECT c.*, 
                u1.name as user1_name, u1.username as user1_username, u1.avatar_url as user1_avatar, u1.headline as user1_headline,
                u2.name as user2_name, u2.username as user2_username, u2.avatar_url as user2_avatar, u2.headline as user2_headline,
                w.id as workspace_id, w.title as workspace_title, w.exchange_agreement
         FROM connections c
         JOIN app_users u1 ON c.user1_id = u1.id
         JOIN app_users u2 ON c.user2_id = u2.id
         LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
         WHERE c.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
        [selectedConnId, user.id]
      );

      if (!connectionRows[0]) {
        return res.status(404).json({ error: 'Conversation not found or unauthorized.' });
      }

      const conn = connectionRows[0];
      const isUser1 = conn.user1_id === user.id;
      const partnerId = isUser1 ? conn.user2_id : conn.user1_id;
      const partner = {
        id: partnerId,
        name: isUser1 ? conn.user2_name : conn.user1_name,
        username: isUser1 ? conn.user2_username : conn.user1_username,
        avatar_url: isUser1 ? conn.user2_avatar : conn.user1_avatar,
        headline: isUser1 ? conn.user2_headline : conn.user1_headline
      };

      // Partner Skills for context
      let partnerTeach = [];
      let partnerLearn = [];
      try {
        const { rows: partnerSkills } = await db.query(
          `SELECT us.*, s.name as skill_name, c.name as category_name
           FROM user_skills us
           JOIN skills s ON us.skill_id = s.id
           JOIN categories c ON s.category_id = c.id
           WHERE us.user_id = $1`,
          [partnerId]
        );
        partnerTeach = partnerSkills.filter(s => s.type === 'TEACH');
        partnerLearn = partnerSkills.filter(s => s.type === 'LEARN');
      } catch (err) {
        // ignore
      }

      const { rows: messages } = await db.query(
        `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
         FROM messages m
         JOIN app_users u ON m.sender_id = u.id
         WHERE m.connection_id = $1
         ORDER BY m.created_at ASC`,
        [selectedConnId]
      );

      // Auto mark incoming messages as read
      try {
        await db.query(
          `UPDATE messages SET is_read = true 
           WHERE connection_id = $1 AND sender_id != $2 AND is_read = false`,
          [selectedConnId, user.id]
        );
      } catch (err) {
        // ignore
      }

      return res.json({
        connection: {
          id: conn.id,
          connection_id: conn.id,
          workspace_id: conn.workspace_id,
          workspace_title: conn.workspace_title,
          exchange_agreement: conn.exchange_agreement,
          partner,
          partner_name: partner.name,
          partner_avatar: partner.avatar_url,
          partnerSkills: {
            teach: partnerTeach,
            learn: partnerLearn
          }
        },
        messages
      });
    }

    // D. Return all active conversation threads for currentUser
    const { rows: threads } = await db.query(
      `SELECT c.id as connection_id, c.status, c.created_at,
              u1.id as user1_id, u1.name as user1_name, u1.username as user1_username, u1.avatar_url as user1_avatar, u1.headline as user1_headline,
              u2.id as user2_id, u2.name as user2_name, u2.username as user2_username, u2.avatar_url as user2_avatar, u2.headline as user2_headline,
              w.id as workspace_id, w.title as workspace_title, w.exchange_agreement,
              (SELECT message FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
              (SELECT sender_id FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender_id,
              (SELECT COUNT(*) FROM messages WHERE connection_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
       FROM connections c
       JOIN app_users u1 ON c.user1_id = u1.id
       JOIN app_users u2 ON c.user2_id = u2.id
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY last_message_at DESC, c.created_at DESC`,
      [user.id]
    );

    const formatted = threads.map(t => {
      const isUser1 = t.user1_id === user.id;
      const partner = {
        id: isUser1 ? t.user2_id : t.user1_id,
        name: isUser1 ? t.user2_name : t.user1_name,
        username: isUser1 ? t.user2_username : t.user1_username,
        avatar_url: isUser1 ? t.user2_avatar : t.user1_avatar,
        headline: isUser1 ? t.user2_headline : t.user1_headline
      };
      return {
        id: t.connection_id,
        connection_id: t.connection_id,
        workspace_id: t.workspace_id,
        workspace_title: t.workspace_title,
        exchange_agreement: t.exchange_agreement,
        partner,
        partner_name: partner.name,
        partner_avatar: partner.avatar_url,
        partner_headline: partner.headline,
        last_message: t.last_message,
        last_message_at: t.last_message_at,
        unread_count: Number(t.unread_count) || 0
      };
    });

    return res.json({
      threads: formatted,
      connections: formatted
    });
  }

  // ----------------------------------------------------
  // POST: Send a message (by connection_id or recipient_id)
  // ----------------------------------------------------
  if (req.method === 'POST') {
    let { connection_id, recipient_id, partner_id, user_id, message, content } = req.body || {};
    const text = (message || content || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    // Resolve or create connection if recipient_id provided
    const targetUserId = recipient_id || partner_id || user_id;
    if (!connection_id && targetUserId) {
      if (targetUserId === user.id) {
        return res.status(400).json({ error: 'Cannot send message to yourself.' });
      }

      const { rows: existingConns } = await db.query(
        `SELECT id FROM connections
         WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
         ORDER BY id ASC LIMIT 1`,
        [user.id, targetUserId]
      );

      if (existingConns[0]) {
        connection_id = existingConns[0].id;
      } else {
        const { rows: newConnRows } = await db.query(
          `INSERT INTO connections (user1_id, user2_id, status)
           VALUES ($1, $2, 'ACTIVE')
           RETURNING id`,
          [user.id, targetUserId]
        );
        connection_id = newConnRows[0].id;
      }
    }

    if (!connection_id) {
      return res.status(400).json({ error: 'Connection ID or Recipient ID is required.' });
    }

    const { rows: connRows } = await db.query(
      `SELECT * FROM connections WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [connection_id, user.id]
    );

    if (!connRows[0]) {
      return res.status(404).json({ error: 'Connection not found or unauthorized.' });
    }

    const conn = connRows[0];
    const targetRecipientId = conn.user1_id === user.id ? conn.user2_id : conn.user1_id;

    const { rows: msgRows } = await db.query(
      `INSERT INTO messages (connection_id, sender_id, message, is_read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [connection_id, user.id, text]
    );

    const createdMsg = msgRows[0];

    // Notification for recipient
    try {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'MESSAGE', $2, $3, $4)`,
        [targetRecipientId, `Message from ${user.name}`, text.slice(0, 80), `/chat?connection=${connection_id}`]
      );
    } catch {
      // ignore
    }

    try {
      if (events && events.publish) {
        await events.publish(`user:${targetRecipientId}`, 'new_message', {
          connectionId: connection_id,
          senderId: user.id,
          senderName: user.name,
          message: text
        });
        await events.publish(`chat:${connection_id}`, 'chat_message', {
          ...createdMsg,
          sender_name: user.name,
          sender_avatar: user.avatar_url
        });
      }
    } catch {
      // ignore
    }

    return res.json({
      success: true,
      connection_id,
      message: {
        ...createdMsg,
        sender_name: user.name,
        sender_avatar: user.avatar_url
      }
    });
  }

  // ----------------------------------------------------
  // PUT: Mark messages in connection as read
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const { connection_id } = req.body || {};
    if (connection_id) {
      await db.query(
        `UPDATE messages SET is_read = true 
         WHERE connection_id = $1 AND sender_id != $2 AND is_read = false`,
        [connection_id, user.id]
      );
      return res.json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}