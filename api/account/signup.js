// api/account/signup.js - Multi-Step User Registration
import { db } from 'hatchable';
import { hashPassword } from 'lib/crypto.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, username, email, password, headline, bio, location, teachSkills, learnSkills } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0])
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, '');

    // Check if email or username already exists
    const { rows: existing } = await db.query(
      `SELECT id, email, username FROM app_users WHERE LOWER(email) = $1 OR LOWER(username) = $2`,
      [cleanEmail, cleanUsername]
    );

    if (existing && existing.length > 0) {
      const isEmail = existing.some(u => u.email.toLowerCase() === cleanEmail);
      return res.status(400).json({
        error: isEmail ? 'An account with this email already exists.' : 'This username is already taken. Please choose another.'
      });
    }

    // Hash password with WebCrypto PBKDF2
    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    // 1. Insert User
    const { rows: userRows } = await db.query(
      `INSERT INTO app_users (id, name, username, email, password_hash, role, status, avatar_url, headline, email_verified, onboarding_completed)
       VALUES ($1, $2, $3, $4, $5, 'USER', 'ACTIVE', $6, $7, true, false)
       RETURNING id, name, username, email, role, status, avatar_url, headline, onboarding_completed, theme_preference`,
      [userId, name.trim(), cleanUsername, cleanEmail, passwordHash, avatarUrl, headline || 'Skill Enthusiast & Learner']
    );

    const newUser = userRows[0];

    // 2. Insert Profile
    await db.query(
      `INSERT INTO profiles (user_id, bio, location, preferred_language, availability, timezone, completion_percentage)
       VALUES ($1, $2, $3, 'English', 'Flexible Evenings & Weekends', 'UTC', 60)`,
      [newUser.id, bio || 'Excited to share knowledge and acquire new skills on SkillSwapX!', location || 'Remote / Worldwide']
    );

    // 3. Add initial Teach Skills if provided
    if (Array.isArray(teachSkills)) {
      for (const ts of teachSkills) {
        if (ts.skill_id) {
          await db.query(
            `INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, description)
             VALUES ($1, $2, 'TEACH', $3, $4, $5)
             ON CONFLICT (user_id, skill_id, type) DO NOTHING`,
            [newUser.id, Number(ts.skill_id), ts.level || 'Intermediate', Number(ts.experience_years) || 1.0, ts.description || '']
          );
        }
      }
    }

    // 4. Add initial Learn Skills if provided
    if (Array.isArray(learnSkills)) {
      for (const ls of learnSkills) {
        if (ls.skill_id) {
          await db.query(
            `INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, description)
             VALUES ($1, $2, 'LEARN', $3, $4, $5)
             ON CONFLICT (user_id, skill_id, type) DO NOTHING`,
            [newUser.id, Number(ls.skill_id), ls.level || 'Beginner', Number(ls.experience_years) || 0.0, ls.description || '']
          );
        }
      }
    }

    // 5. Welcome notification
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'SYSTEM', 'Welcome to SkillSwapX! 🎉', 'Complete your quick onboarding to start receiving reciprocal peer matches.', '/onboarding')`,
      [newUser.id]
    );

    // Set auth cookie
    res.setHeader('Set-Cookie', `skillswap_session=${encodeURIComponent(newUser.id)}; Path=/; SameSite=Lax; Max-Age=2592000`);

    return res.json({
      success: true,
      token: newUser.id,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}