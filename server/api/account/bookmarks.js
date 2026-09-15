// api/account/bookmarks.js - Saved / Bookmarked & Hidden Peers
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows } = await db.query(
      `SELECT bookmarked_user_ids, hidden_user_ids FROM app_users WHERE id = $1`,
      [user.id]
    );

    const bookmarkedIds = rows[0]?.bookmarked_user_ids || [];
    const hiddenIds = rows[0]?.hidden_user_ids || [];

    // Fetch full profiles for bookmarked peers
    let bookmarkedUsers = [];
    if (bookmarkedIds.length > 0) {
      const { rows: bookmarkedRows } = await db.query(
        `SELECT u.id, u.name, u.username, u.avatar_url, u.headline,
                p.location, p.availability, p.preferred_language,
                COALESCE(AVG(r.rating), 5.0)::numeric(3,1) as avg_rating,
                COUNT(r.id)::int as reviews_count
         FROM app_users u
         LEFT JOIN profiles p ON u.id = p.user_id
         LEFT JOIN reviews r ON u.id = r.reviewee_id
         WHERE u.id = ANY($1::text[])
         GROUP BY u.id, u.name, u.username, u.avatar_url, u.headline, p.location, p.availability, p.preferred_language`,
        [bookmarkedIds]
      );
      bookmarkedUsers = bookmarkedRows;
    }

    return res.json({
      bookmarked_ids: bookmarkedIds,
      hidden_ids: hiddenIds,
      bookmarked_users: bookmarkedUsers
    });
  }

  if (req.method === 'POST') {
    const { action, targetUserId } = req.body || {};
    if (!action || !targetUserId) {
      return res.status(400).json({ error: 'Action (bookmark/unbookmark/hide/unhide) and targetUserId required.' });
    }

    const { rows } = await db.query(
      `SELECT bookmarked_user_ids, hidden_user_ids FROM app_users WHERE id = $1`,
      [user.id]
    );

    let bookmarked = Array.isArray(rows[0]?.bookmarked_user_ids) ? [...rows[0].bookmarked_user_ids] : [];
    let hidden = Array.isArray(rows[0]?.hidden_user_ids) ? [...rows[0].hidden_user_ids] : [];

    if (action === 'bookmark') {
      if (!bookmarked.includes(targetUserId)) bookmarked.push(targetUserId);
    } else if (action === 'unbookmark') {
      bookmarked = bookmarked.filter(id => id !== targetUserId);
    } else if (action === 'hide') {
      if (!hidden.includes(targetUserId)) hidden.push(targetUserId);
    } else if (action === 'unhide') {
      hidden = hidden.filter(id => id !== targetUserId);
    }

    await db.query(
      `UPDATE app_users 
       SET bookmarked_user_ids = $1::jsonb, hidden_user_ids = $2::jsonb, updated_at = now()
       WHERE id = $3`,
      [JSON.stringify(bookmarked), JSON.stringify(hidden), user.id]
    );

    return res.json({ success: true, bookmarked_ids: bookmarked, hidden_ids: hidden });
  }

  res.status(405).json({ error: 'Method not allowed' });
}