// Backend/controllers/hubController.js - Learning Hub, Circles, Resources & Community Posts
import { getDb } from '../config/db.js';

export async function getLearningCircles(req, res) {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id) as member_count
       FROM circles c
       ORDER BY c.created_at DESC`
    );
    return res.json({ circles: result.rows || [] });
  } catch (err) {
    console.error('[hubController.getLearningCircles] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch learning circles' });
  }
}

export async function joinLearningCircle(req, res) {
  try {
    const userId = req.user.id;
    const { circleId } = req.params;
    const db = await getDb();

    await db.query(
      `INSERT INTO circle_members (circle_id, user_id, joined_at)
       VALUES (?, ?, ?)
       ON CONFLICT (circle_id, user_id) DO NOTHING`,
      [circleId, userId, new Date().toISOString()]
    );

    return res.json({ success: true, message: 'Joined circle successfully' });
  } catch (err) {
    console.error('[hubController.joinLearningCircle] Error:', err);
    return res.status(500).json({ error: 'Failed to join circle' });
  }
}

export async function getResources(req, res) {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
       FROM resources r
       LEFT JOIN app_users u ON r.author_id = u.id
       ORDER BY r.created_at DESC LIMIT 50`
    );
    return res.json({ resources: result.rows || [] });
  } catch (err) {
    console.error('[hubController.getResources] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
}

export async function getCommunityPosts(req, res) {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, u.headline as author_headline
       FROM posts p
       JOIN app_users u ON p.author_id = u.id
       ORDER BY p.created_at DESC LIMIT 50`
    );
    return res.json({ posts: result.rows || [] });
  } catch (err) {
    console.error('[hubController.getCommunityPosts] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch community feed' });
  }
}

export async function createCommunityPost(req, res) {
  try {
    const authorId = req.user.id;
    const { title, content, tags, category } = req.body || {};

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    const db = await getDb();
    const postId = 'post_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO posts (id, author_id, title, content, tags, category, upvotes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [postId, authorId, title || '', content.trim(), tags || '', category || 'GENERAL', now]
    );

    return res.status(201).json({
      success: true,
      postId,
      message: 'Post created successfully'
    });
  } catch (err) {
    console.error('[hubController.createCommunityPost] Error:', err);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}
