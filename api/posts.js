// api/posts.js - Community Forum & Public Swap Proposals Board with Comments
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method === 'GET') {
    try {
      const { rows: posts } = await db.query(
        `SELECT p.*, u.name as user_name, u.avatar_url, u.headline, u.username,
                s1.name as teach_skill, s2.name as learn_skill
         FROM community_posts p
         JOIN app_users u ON p.user_id = u.id
         LEFT JOIN skills s1 ON p.teach_skill_id = s1.id
         LEFT JOIN skills s2 ON p.learn_skill_id = s2.id
         ORDER BY p.created_at DESC`
      );

      const { rows: comments } = await db.query(
        `SELECT c.*, u.name as user_name, u.avatar_url, u.headline, u.username
         FROM post_comments c
         JOIN app_users u ON c.user_id = u.id
         ORDER BY c.created_at ASC`
      );

      const postsWithComments = posts.map(p => ({
        ...p,
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

      const { action, post_id, content, title, teach_skill_id, learn_skill_id } = req.body || {};

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

      // Create new post
      if (!title || !title.trim() || !content || !content.trim()) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      const { rows } = await db.query(
        `INSERT INTO community_posts (user_id, title, content, teach_skill_id, learn_skill_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user.id, title.trim(), content.trim(), teach_skill_id ? Number(teach_skill_id) : null, learn_skill_id ? Number(learn_skill_id) : null]
      );

      return res.json({ success: true, post: rows[0] });
    } catch (err) {
      console.error('Error creating post or comment:', err);
      return res.status(500).json({ error: 'Failed to process request.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
