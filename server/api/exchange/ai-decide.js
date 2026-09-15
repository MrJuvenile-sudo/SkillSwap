// api/exchange/ai-decide.js - Inline '✦ Help Me Decide' AI parsing action
import { db } from 'hatchable';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = prompt.trim().toLowerCase();

    // Query skills for keyword matching
    const { rows: skills } = await db.query(`SELECT id, name FROM skills`);
    let matchedSkill = skills.find(s => text.includes(s.name.toLowerCase()));
    if (!matchedSkill) {
      matchedSkill = skills[0] || { id: 1, name: 'Python' };
    }

    const structuredRecommendation = {
      suggested_skill_id: matchedSkill.id,
      suggested_skill_name: matchedSkill.name,
      goal_text: `Master ${matchedSkill.name} fundamentals to achieve: "${prompt.trim()}"`,
      intent: text.includes('career') || text.includes('job') ? 'career' : text.includes('college') ? 'college' : 'project',
      preferred_mode: 'one_on_one',
      current_level: 'Beginner',
      target_level: 'Intermediate',
      explanation: `SkillSwap AI parsed your goal into a structured Learning Objective for ${matchedSkill.name}. You can confirm to add this goal.`
    };

    return res.json({ success: true, recommendation: structuredRecommendation });
  } catch (err) {
    console.error('AI Help Me Decide error:', err);
    return res.status(500).json({ error: 'Failed to process AI recommendation' });
  }
}
