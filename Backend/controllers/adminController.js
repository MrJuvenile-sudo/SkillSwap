// Backend/controllers/adminController.js - Platform Administration & Moderation
import { getDb } from '../config/db.js';

export async function getAdminAnalytics(req, res) {
  try {
    const db = await getDb();

    const userCountRes = await db.query(`SELECT COUNT(*) as count FROM app_users`);
    const activeExchangesRes = await db.query(`SELECT COUNT(*) as count FROM requests WHERE status = 'ACCEPTED'`);
    const completedRes = await db.query(`SELECT COUNT(*) as count FROM requests WHERE status = 'COMPLETED'`);
    const pendingReportsRes = await db.query(`SELECT COUNT(*) as count FROM reports WHERE status = 'PENDING'`);
    const totalSkillsRes = await db.query(`SELECT COUNT(*) as count FROM skills`);
    const ratingRes = await db.query(`SELECT AVG(rating) as avg_rating FROM reviews`);

    const topSkillsRes = await db.query(
      `SELECT s.name, COUNT(us.id) as user_count 
       FROM skills s 
       JOIN user_skills us ON s.id = us.skill_id 
       GROUP BY s.name 
       ORDER BY user_count DESC LIMIT 5`
    );

    return res.json({
      metrics: {
        totalUsers: Number(userCountRes.rows[0]?.count || 0),
        activeExchanges: Number(activeExchangesRes.rows[0]?.count || 0),
        completedSwaps: Number(completedRes.rows[0]?.count || 0),
        pendingReports: Number(pendingReportsRes.rows[0]?.count || 0),
        totalSkills: Number(totalSkillsRes.rows[0]?.count || 0),
        averageRating: Number(ratingRes.rows[0]?.avg_rating || 4.8).toFixed(1)
      },
      topSkills: topSkillsRes.rows || []
    });
  } catch (err) {
    console.error('[adminController.getAdminAnalytics] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
}

export async function getAllUsersAdmin(req, res) {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT id, name, username, email, role, status, karma_score, created_at
       FROM app_users
       ORDER BY created_at DESC`
    );
    return res.json({ users: result.rows || [] });
  } catch (err) {
    console.error('[adminController.getAllUsersAdmin] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user list' });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, role } = req.body || {};
    const db = await getDb();

    if (status) {
      await db.query(`UPDATE app_users SET status = ? WHERE id = ?`, [status, id]);
    }
    if (role) {
      await db.query(`UPDATE app_users SET role = ? WHERE id = ?`, [role, id]);
    }

    return res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('[adminController.updateUserStatus] Error:', err);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
}

export async function getReports(req, res) {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT r.*, 
              u.name as reporter_name,
              t.name as target_name
       FROM reports r
       LEFT JOIN app_users u ON r.reporter_id = u.id
       LEFT JOIN app_users t ON r.target_user_id = t.id
       ORDER BY r.created_at DESC`
    );
    return res.json({ reports: result.rows || [] });
  } catch (err) {
    console.error('[adminController.getReports] Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve reports' });
  }
}

export async function resolveReport(req, res) {
  try {
    const { id } = req.params;
    const { resolution_status = 'RESOLVED', action_notes } = req.body || {};
    const db = await getDb();

    await db.query(
      `UPDATE reports SET status = ?, resolution_notes = ? WHERE id = ?`,
      [resolution_status, action_notes || '', id]
    );

    return res.json({ success: true, message: 'Report resolved' });
  } catch (err) {
    console.error('[adminController.resolveReport] Error:', err);
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
}
