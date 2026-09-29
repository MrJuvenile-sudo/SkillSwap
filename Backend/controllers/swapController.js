// Backend/controllers/swapController.js - Skill Swap Requests, Sessions & Reviews
import { getDb } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';

export async function createRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiver_id, offered_skill_id, requested_skill_id, message } = req.body || {};

    if (!receiver_id) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    if (senderId === receiver_id) {
      return res.status(400).json({ error: 'You cannot initiate a skill swap with yourself' });
    }

    const db = await getDb();
    const requestId = 'req_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO requests (id, sender_id, receiver_id, offered_skill_id, requested_skill_id, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [requestId, senderId, receiver_id, offered_skill_id || null, requested_skill_id || null, message || '', now]
    );

    // Notify recipient
    await createNotification({
      userId: receiver_id,
      title: 'New Skill Swap Request! 🤝',
      message: `${req.user.name} proposed a skill exchange with you.`,
      type: 'REQUEST',
      link: '/exchange'
    });

    return res.status(201).json({ success: true, requestId, message: 'Swap request sent successfully' });
  } catch (err) {
    console.error('[swapController.createRequest] Error:', err);
    return res.status(500).json({ error: 'Failed to send swap proposal' });
  }
}

export async function getUserRequests(req, res) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const incoming = await db.query(
      `SELECT r.*, u.name as sender_name, u.avatar_url as sender_avatar, u.headline as sender_headline
       FROM requests r
       JOIN app_users u ON r.sender_id = u.id
       WHERE r.receiver_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const outgoing = await db.query(
      `SELECT r.*, u.name as receiver_name, u.avatar_url as receiver_avatar, u.headline as receiver_headline
       FROM requests r
       JOIN app_users u ON r.receiver_id = u.id
       WHERE r.sender_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return res.json({
      incoming: incoming.rows || [],
      outgoing: outgoing.rows || []
    });
  } catch (err) {
    console.error('[swapController.getUserRequests] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
}

export async function respondRequest(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body || {}; // ACCEPTED, REJECTED, CANCELLED

    if (!['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status response' });
    }

    const db = await getDb();
    const reqRes = await db.query(`SELECT * FROM requests WHERE id = ?`, [id]);
    const request = reqRes.rows[0];

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.receiver_id !== userId && request.sender_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this request' });
    }

    await db.query(`UPDATE requests SET status = ? WHERE id = ?`, [status, id]);

    // If accepted, generate match & swap session
    if (status === 'ACCEPTED') {
      const matchId = 'match_' + Math.random().toString(36).substring(2, 10);
      const now = new Date().toISOString();

      await db.query(
        `INSERT INTO matches (id, user1_id, user2_id, match_score, status, created_at)
         VALUES (?, ?, ?, 95.0, 'ACCEPTED', ?)`,
        [matchId, request.sender_id, request.receiver_id, now]
      );

      await createNotification({
        userId: request.sender_id,
        title: 'Swap Request Accepted! 🎉',
        message: `${req.user.name} accepted your skill exchange proposal. You can now chat and schedule your session.`,
        type: 'ACCEPTANCE',
        link: '/chat'
      });
    }

    return res.json({ success: true, message: `Request status updated to ${status}` });
  } catch (err) {
    console.error('[swapController.respondRequest] Error:', err);
    return res.status(500).json({ error: 'Failed to process request response' });
  }
}

export async function submitReview(req, res) {
  try {
    const reviewerId = req.user.id;
    const { reviewee_id, rating, feedback, session_id } = req.body || {};

    if (!reviewee_id || !rating) {
      return res.status(400).json({ error: 'Reviewee ID and rating are required' });
    }

    const db = await getDb();
    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO reviews (id, reviewer_id, reviewee_id, rating, feedback, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reviewId, reviewerId, reviewee_id, Number(rating), feedback || '', now]
    );

    // Increase reviewee's karma score (+15 for review)
    await db.query(`UPDATE app_users SET karma_score = karma_score + 15 WHERE id = ?`, [reviewee_id]);

    await createNotification({
      userId: reviewee_id,
      title: 'New Review Received! ⭐',
      message: `${req.user.name} left you a ${rating}-star feedback and you earned +15 Karma!`,
      type: 'REVIEW',
      link: '/profile'
    });

    return res.status(201).json({ success: true, reviewId, message: 'Review submitted successfully' });
  } catch (err) {
    console.error('[swapController.submitReview] Error:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
}
