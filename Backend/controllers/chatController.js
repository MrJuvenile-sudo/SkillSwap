// Backend/controllers/chatController.js - Real-time Peer Chat & Messaging
import { getDb } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    // Query distinct conversation partners
    const convRes = await db.query(
      `SELECT DISTINCT 
         CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as peer_id
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?`,
      [userId, userId, userId]
    );

    const peerIds = convRes.rows.map(r => r.peer_id);
    const conversations = [];

    for (const peerId of peerIds) {
      const userRes = await db.query(
        `SELECT id, name, username, avatar_url, headline, status FROM app_users WHERE id = ?`,
        [peerId]
      );
      const peer = userRes.rows[0];
      if (!peer) continue;

      const lastMsgRes = await db.query(
        `SELECT content, created_at, sender_id, is_read 
         FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1`,
        [userId, peerId, peerId, userId]
      );

      const unreadRes = await db.query(
        `SELECT COUNT(*) as unread_count 
         FROM messages 
         WHERE sender_id = ? AND receiver_id = ? AND (is_read = 0 OR is_read = 'false')`,
        [peerId, userId]
      );

      conversations.push({
        peer,
        lastMessage: lastMsgRes.rows[0] || null,
        unreadCount: Number(unreadRes.rows[0]?.unread_count || 0)
      });
    }

    return res.json({ conversations });
  } catch (err) {
    console.error('[chatController.getConversations] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
}

export async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const { peerId } = req.params;
    const db = await getDb();

    const result = await db.query(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, peerId, peerId, userId]
    );

    // Mark incoming messages as read
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?`,
      [peerId, userId]
    );

    return res.json({ messages: result.rows || [] });
  } catch (err) {
    console.error('[chatController.getMessages] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
}

export async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body || {};

    if (!receiver_id || !content?.trim()) {
      return res.status(400).json({ error: 'Receiver ID and non-empty content are required' });
    }

    const db = await getDb();
    const msgId = 'msg_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [msgId, senderId, receiver_id, content.trim(), now]
    );

    // Create notification for receiver
    await createNotification({
      userId: receiver_id,
      title: `Message from ${req.user.name}`,
      message: content.length > 60 ? content.slice(0, 57) + '...' : content,
      type: 'CHAT',
      link: '/chat'
    });

    return res.status(201).json({
      success: true,
      message: {
        id: msgId,
        sender_id: senderId,
        receiver_id,
        content: content.trim(),
        created_at: now,
        is_read: false
      }
    });
  } catch (err) {
    console.error('[chatController.sendMessage] Error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
