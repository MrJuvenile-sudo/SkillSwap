// api/posts.js - Community Forum & Rich Multi-Media Feed (Posts, Images, Videos, Blogs, Code)
import { db } from 'hatchable';
import { requireCurrentUser, getCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    try {
      const user = await getCurrentUser(req);
      const currentUserId = user ? user.id : null;

      const { rows: posts } = await db.query(
        `SELECT p.*, u.name as user_name, u.avatar_url, u.headline, u.username,
                s1.name as teach_skill, s2.name as learn_skill,
                COALESCE(p.likes_count, 0) as likes_count,
                COALESCE(p.post_type, 'POST') as post_type,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = $1) as user_liked_count
         FROM community_posts p
         JOIN app_users u ON p.user_id = u.id
         LEFT JOIN skills s1 ON p.teach_skill_id = s1.id
         LEFT JOIN skills s2 ON p.learn_skill_id = s2.id
         ORDER BY p.created_at DESC`,
        [currentUserId]
      );

      const { rows: comments } = await db.query(
        `SELECT c.*, u.name as user_name, u.avatar_url, u.headline, u.username
         FROM post_comments c
         JOIN app_users u ON c.user_id = u.id
         ORDER BY c.created_at ASC`
      );

      const postsWithComments = posts.map(p => ({
        ...p,
        user_liked: Number(p.user_liked_count) > 0,
        comments: comments.filter(c => c.post_id === p.id)
      }));

      return res.json({ posts: postsWithComments });
    } catch (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Failed to fetch community posts.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await requireCurrentUser(req, res);
      if (!user) return;

      const { 
        action, 
        post_id, 
        content, 
        title, 
        teach_skill_id, 
        learn_skill_id, 
        post_type, 
        media_url, 
        thumbnail_url, 
        tags, 
        read_time, 
        cover_image 
      } = req.body || {};

      // 1. Like / Cheer Toggle Action
      if (action === 'like' || action === 'cheer') {
        if (!post_id) {
          return res.status(400).json({ error: 'Post ID required to like.' });
        }

        const { rows: existingLike } = await db.query(
          `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`,
          [Number(post_id), user.id]
        );

        let liked = false;
        if (existingLike && existingLike.length > 0) {
          await db.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [Number(post_id), user.id]);
          await db.query(`UPDATE community_posts SET likes_count = CASE WHEN COALESCE(likes_count, 0) > 0 THEN likes_count - 1 ELSE 0 END WHERE id = $1`, [Number(post_id)]);
          liked = false;
        } else {
          await db.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [Number(post_id), user.id]);
          await db.query(`UPDATE community_posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = $1`, [Number(post_id)]);
          liked = true;
        }

        const { rows: updatedPost } = await db.query(`SELECT likes_count FROM community_posts WHERE id = $1`, [Number(post_id)]);
        return res.json({ success: true, liked, likes_count: updatedPost[0]?.likes_count || 0 });
      }

      // 2. Add Comment Action
      if (action === 'comment') {
        if (!post_id || !content || !content.trim()) {
          return res.status(400).json({ error: 'Post ID and comment content are required.' });
        }

        const { rows } = await db.query(
          `INSERT INTO post_comments (post_id, user_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [Number(post_id), user.id, content.trim()]
        );

        return res.json({ success: true, comment: rows[0] });
      }

      // 3. Delete Post Action
      if (action === 'delete') {
        if (!post_id) return res.status(400).json({ error: 'Post ID required.' });
        const { rows: target } = await db.query(`SELECT user_id FROM community_posts WHERE id = $1`, [Number(post_id)]);
        if (!target[0]) return res.status(404).json({ error: 'Post not found.' });
        if (target[0].user_id !== user.id && !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
          return res.status(403).json({ error: 'Unauthorized to delete this post.' });
        }
        await db.query(`DELETE FROM post_comments WHERE post_id = $1`, [Number(post_id)]);
        await db.query(`DELETE FROM post_likes WHERE post_id = $1`, [Number(post_id)]);
        await db.query(`DELETE FROM community_posts WHERE id = $1`, [Number(post_id)]);
        return res.json({ success: true, deleted_id: post_id });
      }

      // 4. Create New Post (Text, Image, Video, Blog, Code)
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Post title/headline is required.' });
      }
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Post description/content is required.' });
      }

      const pType = (post_type || 'POST').toUpperCase();
      const validTypes = ['POST', 'IMAGE', 'VIDEO', 'BLOG', 'CODE', 'SWAP_OFFER'];
      const finalPostType = validTypes.includes(pType) ? pType : 'POST';

      const { rows } = await db.query(
        `INSERT INTO community_posts (
          user_id, title, content, teach_skill_id, learn_skill_id,
          post_type, media_url, thumbnail_url, tags, read_time, cover_image, likes_count, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, 0, datetime('now')
        ) RETURNING *`,
        [
          user.id,
          title.trim(),
          content.trim(),
          teach_skill_id ? Number(teach_skill_id) : null,
          learn_skill_id ? Number(learn_skill_id) : null,
          finalPostType,
          media_url ? media_url.trim() : null,
          thumbnail_url ? thumbnail_url.trim() : null,
          tags ? (Array.isArray(tags) ? tags.join(', ') : String(tags).trim()) : null,
          read_time ? read_time.trim() : (finalPostType === 'BLOG' ? '4 min read' : null),
          cover_image ? cover_image.trim() : (finalPostType === 'BLOG' ? media_url : null)
        ]
      );

      return res.json({ success: true, post: rows[0] });
    } catch (err) {
      console.error('Error creating post or comment:', err);
      return res.status(500).json({ error: 'Failed to process request: ' + err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
