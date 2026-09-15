// api/admin/verifications.js - Skill Proof Verification Queue
import { db } from 'hatchable';
import { requireModerator } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireModerator(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT v.*,
                u.name as user_name, u.email as user_email, u.avatar_url as user_avatar, u.headline,
                s.name as skill_name, s.icon as skill_icon,
                c.name as category_name
         FROM skill_verifications v
         JOIN app_users u ON v.user_id = u.id
         JOIN skills s ON v.skill_id = s.id
         LEFT JOIN categories c ON s.category_id = c.id
         ORDER BY (v.status = 'PENDING') DESC, v.created_at DESC`
      );
      return res.json({ verifications: rows });
    } catch (err) {
      console.error('Error fetching verifications:', err);
      return res.status(500).json({ error: 'Failed to fetch verifications queue' });
    }
  }

  if (req.method === 'PUT') {
    const { id, status, admin_notes } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'Verification ID and status required' });
    }

    const { rows: verifRows } = await db.query(
      `UPDATE skill_verifications
       SET status = $1,
           admin_notes = COALESCE($2, admin_notes),
           reviewed_by = $3,
           reviewed_at = now()
       WHERE id = $4
       RETURNING *`,
      [status, admin_notes || '', admin.id, Number(id)]
    );

    if (!verifRows[0]) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const verif = verifRows[0];

    // If APPROVED, mark the corresponding user_skill as verified
    if (status === 'APPROVED') {
      await db.query(
        `UPDATE user_skills 
         SET is_verified = true 
         WHERE user_id = $1 AND skill_id = $2`,
        [verif.user_id, verif.skill_id]
      );
    } else if (status === 'REJECTED') {
      await db.query(
        `UPDATE user_skills 
         SET is_verified = false 
         WHERE user_id = $1 AND skill_id = $2`,
        [verif.user_id, verif.skill_id]
      );
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, 'SKILL_VERIFICATION', $3, $4)`,
      [admin.id, `VERIFY_SKILL_${status}`, String(id), JSON.stringify({ status, admin_notes, user_id: verif.user_id, skill_id: verif.skill_id })]
    );

    return res.json({ success: true, verification: verif });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
