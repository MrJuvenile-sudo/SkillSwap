// api/account/reset-password.js - Execute Password Reset
import { db } from 'hatchable';
import { hashPassword } from 'lib/crypto.js';

export const access = 'public';

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body || {};
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid reset token and new password (min 6 chars) are required.' });
  }

  try {
    const { rows } = await db.query(
      `SELECT id, name, email FROM app_users 
       WHERE reset_token = $1 AND reset_token_expires > now()`,
      [token.trim()]
    );

    if (!rows[0]) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const user = rows[0];
    const passwordHash = await hashPassword(newPassword);

    await db.query(
      `UPDATE app_users 
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = now()
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return res.json({ success: true, message: 'Password has been successfully updated. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}