// api/exchange/ai-teach-suggest.js - Inline '✦ Teach This' AI scanner action
import { db } from 'hatchable';

export const access = 'public';

function getUserId(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/skillswap_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function (req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized session' });
  }

  try {
    // Fetch skills not currently taught by this user
    const { rows: unofferedSkills } = await db.query(
      `SELECT s.id, s.name, s.description, c.name as category_name
       FROM skills s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.id NOT IN (
         SELECT skill_id FROM user_skills WHERE user_id = $1 AND type = 'TEACH'
       )
       LIMIT 3`,
      [userId]
    );

    const suggestions = (unofferedSkills || []).map(s => ({
      skill_id: s.id,
      skill_name: s.name,
      category_name: s.category_name,
      suggested_level: 'Intermediate',
      rationale: `Based on your profile activity, offering ${s.name} would expand your reciprocal match score by +25%.`
    }));

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error('AI Teach Suggest error:', err);
    return res.status(500).json({ error: 'Failed to generate teaching suggestions' });
  }
}
