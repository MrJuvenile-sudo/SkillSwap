// api/search.js - Search & Filter Skills and Peers
import { db } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  try {
    const { q, category, type, level, min_rating, availability } = req.query;
    const currentUser = await getCurrentUser(req);
    const currentUserId = currentUser ? currentUser.id : null;

    let query = `
      SELECT u.id, u.name, u.email, u.avatar_url, u.headline,
             p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage,
             COALESCE(AVG(r.rating), 5.0) as avg_rating,
             COUNT(r.id) as reviews_count

      FROM app_users u
      JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN reviews r ON u.id = r.reviewee_id
      WHERE u.status = 'ACTIVE' AND u.role = 'USER'
    `;

    const params = [];
    let paramIdx = 1;

    if (currentUserId) {
      query += ` AND u.id != $${paramIdx++}`;
      params.push(currentUserId);
    }

    if (category) {
      query += ` AND (c.name LIKE $${paramIdx} OR CAST(c.id AS TEXT) = $${paramIdx})`;

      params.push(`%${category}%`);
      paramIdx++;
    }

    if (type) {
      query += ` AND us.type = $${paramIdx++}`;
      params.push(type.toUpperCase());
    }

    if (level) {
      query += ` AND us.level = $${paramIdx++}`;
      params.push(level);
    }

    if (availability) {
      query += ` AND p.availability LIKE $${paramIdx++}`;

      params.push(`%${availability}%`);
    }

    if (q && q.trim()) {
      query += ` AND (
        u.name LIKE $${paramIdx} OR 
        u.headline LIKE $${paramIdx} OR 
        s.name LIKE $${paramIdx} OR 
        c.name LIKE $${paramIdx} OR
        p.bio LIKE $${paramIdx}

      )`;
      params.push(`%${q.trim()}%`);
      paramIdx++;
    }

    query += `
      GROUP BY u.id, u.name, u.email, u.avatar_url, u.headline,
               p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage
    `;

    if (min_rating) {
      query += ` HAVING COALESCE(AVG(r.rating), 5.0) >= $${paramIdx++}`;
      params.push(Number(min_rating));
    }

    query += ` ORDER BY COALESCE(AVG(r.rating), 5.0) DESC, u.name ASC LIMIT 50`;

    const { rows: matchedUsers } = await db.query(query, params);

    // If we have matched users, fetch their user_skills and map them
    let allUserSkills = [];
    if (matchedUsers.length > 0) {
      const userIds = matchedUsers.map(u => u.id);
      const { rows: skillsRows } = await db.query(
        `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name 
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         JOIN categories c ON s.category_id = c.id
         WHERE us.user_id IN (${userIds.map((_, i) => '$' + (i + 1)).join(',')})`,
        userIds
      );
      allUserSkills = skillsRows;
    }

    // Format output
    const results = matchedUsers.map(r => {
      const allSkills = allUserSkills.filter(s => s.user_id === r.id);

      return {
        id: r.id,
        name: r.name,
        avatar_url: r.avatar_url,
        headline: r.headline,
        bio: r.bio,
        location: r.location,
        availability: r.availability,
        preferred_language: r.preferred_language,
        rating: Number(r.avg_rating || 5.0),
        reviews_count: r.reviews_count || 0,
        teach_skills: allSkills.filter(s => s.type === 'TEACH'),
        learn_skills: allSkills.filter(s => s.type === 'LEARN')
      };
    });

    return res.json({ count: results.length, results });
  } catch (err) {
    console.error('Error in search:', err);
    res.status(500).json({ error: 'Search failed' });
  }
}