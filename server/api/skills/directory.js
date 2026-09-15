// api/skills/directory.js - Public SEO-Indexable Skill Directory
import { db } from 'hatchable';

export const access = 'public';

export default async function (req, res) {
  try {
    const { rows: categories } = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM skills WHERE category_id = c.id)::int as skills_count,
              (SELECT COUNT(DISTINCT us.user_id) 
               FROM user_skills us 
               JOIN skills s ON us.skill_id = s.id 
               WHERE s.category_id = c.id)::int as active_members_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    const { rows: skills } = await db.query(
      `SELECT s.*, c.name as category_name, c.icon as category_icon,
              COUNT(us.id) FILTER (WHERE us.type = 'TEACH')::int as teachers_count,
              COUNT(us.id) FILTER (WHERE us.type = 'LEARN')::int as learners_count,
              COUNT(DISTINCT us.user_id)::int as total_members
       FROM skills s
       JOIN categories c ON s.category_id = c.id
       LEFT JOIN user_skills us ON s.id = us.skill_id
       GROUP BY s.id, s.name, s.category_id, s.description, s.icon, c.name, c.icon
       ORDER BY (COUNT(us.id)) DESC, s.name ASC`
    );

    // Group skills by category
    const directory = categories.map(cat => ({
      ...cat,
      skills: skills.filter(s => s.category_id === cat.id)
    }));

    return res.json({
      categories,
      skills,
      directory,
      total_skills: skills.length,
      total_categories: categories.length
    });
  } catch (err) {
    console.error('Directory fetch error:', err);
    res.status(500).json({ error: 'Failed to load skills directory.' });
  }
}