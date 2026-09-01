// api/account/onboarding.js - Post-Signup Onboarding Wizard
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { bio, location, timezone, preferred_language, weekly_hours, availability_schedule, teachSkills, learnSkills } = req.body || {};

    try {
      // 1. Update Profile
      await db.query(
        `INSERT INTO profiles (user_id, bio, location, timezone, preferred_language, weekly_hours, availability_schedule, completion_percentage, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 100, now())
         ON CONFLICT (user_id) DO UPDATE SET
           bio = COALESCE(EXCLUDED.bio, profiles.bio),
           location = COALESCE(EXCLUDED.location, profiles.location),
           timezone = COALESCE(EXCLUDED.timezone, profiles.timezone),
           preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
           weekly_hours = COALESCE(EXCLUDED.weekly_hours, profiles.weekly_hours),
           availability_schedule = COALESCE(EXCLUDED.availability_schedule, profiles.availability_schedule),
           completion_percentage = 100,
           updated_at = now()`,
        [
          user.id,
          bio || 'Passionate about sharing skills and acquiring new knowledge.',
          location || 'Remote / Worldwide',
          timezone || 'UTC',
          preferred_language || 'English',
          weekly_hours || 4,
          JSON.stringify(availability_schedule || { monday: ['evening'], wednesday: ['evening'], saturday: ['morning'] })
        ]
      );

      // 2. Add Teach Skills
      if (Array.isArray(teachSkills)) {
        for (const ts of teachSkills) {
          if (ts.skill_id) {
            await db.query(
              `INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, description)
               VALUES ($1, $2, 'TEACH', $3, $4, $5)
               ON CONFLICT (user_id, skill_id, type) DO UPDATE SET
                 level = EXCLUDED.level,
                 experience_years = EXCLUDED.experience_years,
                 description = EXCLUDED.description`,
              [user.id, Number(ts.skill_id), ts.level || 'Intermediate', Number(ts.experience_years) || 1.0, ts.description || '']
            );
          }
        }
      }

      // 3. Add Learn Skills
      if (Array.isArray(learnSkills)) {
        for (const ls of learnSkills) {
          if (ls.skill_id) {
            await db.query(
              `INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, description)
               VALUES ($1, $2, 'LEARN', $3, $4, $5)
               ON CONFLICT (user_id, skill_id, type) DO UPDATE SET
                 level = EXCLUDED.level,
                 experience_years = EXCLUDED.experience_years,
                 description = EXCLUDED.description`,
              [user.id, Number(ls.skill_id), ls.level || 'Beginner', Number(ls.experience_years) || 0.0, ls.description || '']
            );
          }
        }
      }

      // 4. Mark Onboarding Completed
      await db.query(
        `UPDATE app_users SET onboarding_completed = true, updated_at = now() WHERE id = $1`,
        [user.id]
      );

      return res.json({ success: true, message: 'Onboarding completed successfully!' });
    } catch (err) {
      console.error('Onboarding save error:', err);
      return res.status(500).json({ error: 'Failed to complete onboarding.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}