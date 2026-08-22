// api/admin/index.js - Admin Overview & Platform Analytics
import { db } from 'hatchable';
import { requireAdmin } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    // Platform Counts
    const { rows: userCounts } = await db.query(
      `SELECT 
         COUNT(*)::int as total_users,
         COUNT(*) FILTER (WHERE status = 'ACTIVE')::int as active_users,
         COUNT(*) FILTER (WHERE status = 'BLOCKED')::int as blocked_users
       FROM app_users WHERE role != 'ADMIN'`
    );

    const { rows: skillCounts } = await db.query(
      `SELECT 
         (SELECT COUNT(*)::int FROM categories) as total_categories,
         (SELECT COUNT(*)::int FROM skills) as total_skills,
         (SELECT COUNT(*)::int FROM user_skills WHERE type = 'TEACH') as total_teach_offerings,
         (SELECT COUNT(*)::int FROM user_skills WHERE type = 'LEARN') as total_learn_demands`
    );

    const { rows: exchangeCounts } = await db.query(
      `SELECT 
         (SELECT COUNT(*)::int FROM requests) as total_requests,
         (SELECT COUNT(*)::int FROM connections WHERE status = 'ACTIVE') as active_connections,
         (SELECT COUNT(*)::int FROM exchange_workspaces) as total_workspaces,
         (SELECT COUNT(*)::int FROM exchange_workspaces WHERE status = 'COMPLETED') as completed_workspaces,
         (SELECT COUNT(*)::int FROM messages) as total_messages,
         (SELECT COUNT(*)::int FROM reviews) as total_reviews,
         (SELECT COALESCE(AVG(rating), 5.0)::numeric(3,2) FROM reviews) as platform_avg_rating`
    );

    const { rows: reportCounts } = await db.query(
      `SELECT 
         COUNT(*)::int as total_reports,
         COUNT(*) FILTER (WHERE status = 'OPEN')::int as open_reports
       FROM reports`
    );

    // Recent Users
    const { rows: recentUsers } = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar_url, u.created_at,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = u.id)::int as skills_count,
              (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id)::int as reviews_count
       FROM app_users u
       ORDER BY u.created_at DESC LIMIT 10`
    );

    // Recent Reports
    const { rows: recentReports } = await db.query(
      `SELECT r.*, 
              rep.name as reporter_name,
              tar.name as reported_name, tar.email as reported_email, tar.status as reported_status
       FROM reports r
       JOIN app_users rep ON r.reporter_id = rep.id
       JOIN app_users tar ON r.reported_user_id = tar.id
       ORDER BY (r.status = 'OPEN') DESC, r.created_at DESC LIMIT 10`
    );

    // Popular Skills
    const { rows: topSkills } = await db.query(
      `SELECT s.name, c.name as category_name,
              COUNT(us.id) FILTER (WHERE us.type = 'TEACH')::int as teachers,
              COUNT(us.id) FILTER (WHERE us.type = 'LEARN')::int as learners
       FROM skills s
       JOIN categories c ON s.category_id = c.id
       LEFT JOIN user_skills us ON s.id = us.skill_id
       GROUP BY s.id, s.name, c.name
       ORDER BY (COUNT(us.id)) DESC LIMIT 6`
    );

    return res.json({
      analytics: {
        users: userCounts[0],
        skills: skillCounts[0],
        exchanges: exchangeCounts[0],
        reports: reportCounts[0]
      },
      recentUsers,
      recentReports,
      topSkills
    });
  } catch (err) {
    console.error('Error loading admin stats:', err);
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
}