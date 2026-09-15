// api/account/settings.js - Comprehensive User Settings Management
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';
import { hashPassword, verifyPassword } from 'lib/crypto.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows: fullUser } = await db.query(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.status, u.avatar_url, u.headline,
              u.privacy_settings, u.notification_settings, u.matchmaking_preferences, u.theme_preference,
              u.portfolio_links, u.certifications,
              p.bio, p.location, p.timezone, p.preferred_language, p.weekly_hours, p.availability_schedule,
              p.github_url, p.dribbble_url, p.website_url, p.linkedin_url
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [user.id]
    );

    return res.json({ settings: fullUser[0] });
  }

  if (req.method === 'PUT') {
    const { section, data } = req.body || {};

    if (!section || !data) {
      return res.status(400).json({ error: 'Settings section and payload required.' });
    }

    try {
      if (section === 'security') {
        const { currentPassword, newPassword, email, username, name } = data;
        
        if (newPassword) {
          if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
          }
          // Verify current password if user has one
          const { rows: currUser } = await db.query(`SELECT password_hash FROM app_users WHERE id = $1`, [user.id]);
          if (currUser[0]?.password_hash && currentPassword) {
            const valid = await verifyPassword(currentPassword, currUser[0].password_hash);
            if (!valid) {
              return res.status(400).json({ error: 'Current password is incorrect.' });
            }
          }

          const newHash = await hashPassword(newPassword);
          await db.query(`UPDATE app_users SET password_hash = $1, updated_at = now() WHERE id = $2`, [newHash, user.id]);
        }

        if (name || email || username) {
          const cleanUsername = username ? username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') : undefined;
          await db.query(
            `UPDATE app_users 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 username = COALESCE($3, username),
                 updated_at = now()
             WHERE id = $4`,
            [name?.trim(), email?.trim()?.toLowerCase(), cleanUsername, user.id]
          );
        }

        return res.json({ success: true, message: 'Security settings updated.' });
      }

      if (section === 'matchmaking') {
        const { max_weekly_swaps, timezone_flexibility, preferred_language, weekly_hours, timezone, availability_schedule } = data;
        
        await db.query(
          `UPDATE app_users 
           SET matchmaking_preferences = $1::jsonb, updated_at = now()
           WHERE id = $2`,
          [JSON.stringify({ max_weekly_swaps, timezone_flexibility }), user.id]
        );

        await db.query(
          `UPDATE profiles 
           SET preferred_language = COALESCE($1, preferred_language),
               weekly_hours = COALESCE($2, weekly_hours),
               timezone = COALESCE($3, timezone),
               availability_schedule = COALESCE($4::jsonb, availability_schedule),
               updated_at = now()
           WHERE user_id = $5`,
          [preferred_language, weekly_hours, timezone, availability_schedule ? JSON.stringify(availability_schedule) : null, user.id]
        );

        return res.json({ success: true, message: 'Matchmaking preferences saved.' });
      }

      if (section === 'privacy') {
        const { visibility, allow_proposals, export_data } = data;
        
        if (export_data) {
          // Export user data bundle
          const { rows: exportBundle } = await db.query(
            `SELECT u.*, p.*,
                    (SELECT json_agg(us.*) FROM user_skills us WHERE us.user_id = u.id) as skills,
                    (SELECT json_agg(r.*) FROM reviews r WHERE r.reviewee_id = u.id) as received_reviews
             FROM app_users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [user.id]
          );
          return res.json({ success: true, export: exportBundle[0] });
        }

        await db.query(
          `UPDATE app_users 
           SET privacy_settings = $1::jsonb, updated_at = now()
           WHERE id = $2`,
          [JSON.stringify({ visibility: visibility || 'public', allow_proposals: allow_proposals || 'all' }), user.id]
        );

        return res.json({ success: true, message: 'Privacy preferences updated.' });
      }

      if (section === 'notifications') {
        await db.query(
          `UPDATE app_users 
           SET notification_settings = $1::jsonb, updated_at = now()
           WHERE id = $2`,
          [JSON.stringify(data), user.id]
        );
        return res.json({ success: true, message: 'Notification settings updated.' });
      }

      if (section === 'theme') {
        const theme = data.theme === 'dark' ? 'dark' : 'light';
        await db.query(
          `UPDATE app_users SET theme_preference = $1, updated_at = now() WHERE id = $2`,
          [theme, user.id]
        );
        return res.json({ success: true, theme });
      }

      if (section === 'portfolio') {
        const { github_url, dribbble_url, website_url, linkedin_url, portfolio_links, certifications } = data;
        
        await db.query(
          `UPDATE app_users 
           SET portfolio_links = COALESCE($1::jsonb, portfolio_links),
               certifications = COALESCE($2::jsonb, certifications),
               updated_at = now()
           WHERE id = $3`,
          [portfolio_links ? JSON.stringify(portfolio_links) : null, certifications ? JSON.stringify(certifications) : null, user.id]
        );

        await db.query(
          `UPDATE profiles 
           SET github_url = COALESCE($1, github_url),
               dribbble_url = COALESCE($2, dribbble_url),
               website_url = COALESCE($3, website_url),
               linkedin_url = COALESCE($4, linkedin_url),
               updated_at = now()
           WHERE user_id = $5`,
          [github_url, dribbble_url, website_url, linkedin_url, user.id]
        );

        return res.json({ success: true, message: 'Portfolio & proof-of-work saved.' });
      }

      return res.status(400).json({ error: 'Unknown settings section.' });
    } catch (err) {
      console.error('Settings update error:', err);
      return res.status(500).json({ error: 'Failed to update settings.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}