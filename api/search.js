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
             COALESCE(AVG(r.rating), 5.0)::numeric(3,1) as avg_rating,
             COUNT(r.id)::int as reviews_count,
             json_agg(
               json_build_object(
                 'id', us.id,
                 'skill_id', s.id,
                 'skill_name', s.name,
                 'category_id', c.id,
                 'category_name', c.name,
                 'type', us.type,
                 'level', us.level,
                 'experience_years', us.experience_years,
                 'description', us.description
               )
             ) as skills
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
      query += ` AND (c.name ILIKE $${paramIdx} OR c.id::text = $${paramIdx})`;
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
      query += ` AND p.availability ILIKE $${paramIdx++}`;
      params.push(`%${availability}%`);
    }

    if (q && q.trim()) {
      query += ` AND (
        u.name ILIKE $${paramIdx} OR 
        u.headline ILIKE $${paramIdx} OR 
        s.name ILIKE $${paramIdx} OR 
        c.name ILIKE $${paramIdx} OR
        p.bio ILIKE $${paramIdx}
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

    const { rows } = await db.query(query, params);

    // Format output
    const results = rows.map(r => {
      const allSkills = (r.skills || []).filter(s => s && s.skill_name);
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