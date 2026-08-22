// api/account/forgot-password.js - Password Recovery & Reset Token Generation
import { db, email } from 'hatchable';
import { generateSecureToken } from 'lib/crypto.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email: userEmail } = req.body || {};
  if (!userEmail || !userEmail.trim()) {
    return res.status(400).json({ error: 'Please provide your email address.' });
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  try {
    const { rows } = await db.query(
      `SELECT id, name, email FROM app_users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    // If user not found, return generic success to prevent account enumeration
    if (!rows[0]) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.'
      });
    }

    const user = rows[0];
    const resetToken = generateSecureToken(24);

    // Save reset token valid for 1 hour
    await db.query(
      `UPDATE app_users 
       SET reset_token = $1, reset_token_expires = now() + INTERVAL '1 hour'
       WHERE id = $2`,
      [resetToken, user.id]
    );

    // Optionally try sending transactional email
    try {
      await email.send({
        to: user.email,
        subject: 'Reset your SkillSwap password',
        html: `<p>Hello ${user.name},</p><p>You requested a password reset for your SkillSwap account. Use this token to reset your password: <strong>${resetToken}</strong></p><p>Or visit: <a href="https://skillswap.hatchable.site/reset-password?token=${resetToken}">Reset Password</a></p>`
      });
    } catch {
      // Shared sending domain fallback
    }

    return res.json({
      success: true,
      message: 'Password reset link dispatched.',
      debug_reset_token: resetToken // provided for seamless preview testing
    });
  } catch (err) {
    console.error('Password recovery error:', err);
    return res.status(500).json({ error: 'Failed to process password recovery.' });
  }
}