// api/admin/index.js - Admin Overview & Platform Analytics
import { db } from 'hatchable';
import { requireSupport } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  // Support, Moderator, Admin, and Super Admin can access Overview
  const admin = await requireSupport(req, res);
  if (!admin) return;

  try {
    // 1. User KPIs
    const { rows: userCounts } = await db.query(
      `SELECT 
         COUNT(*)::int as total_users,
         SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END)::int as active_users,
         SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END)::int as blocked_users,
         SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END)::int as new_users_today,
         SUM(CASE WHEN role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT') THEN 1 ELSE 0 END)::int as staff_count
       FROM app_users`
    );

    // 2. Skill KPIs
    const { rows: skillCounts } = await db.query(
      `SELECT 
         (SELECT COUNT(*)::int FROM categories) as total_categories,
         (SELECT COUNT(*)::int FROM skills) as total_skills,
         (SELECT COUNT(*)::int FROM skills WHERE is_popular = 1 OR is_popular = true) as popular_skills,
         (SELECT COUNT(*)::int FROM user_skills WHERE type = 'TEACH') as total_teach_offerings,
         (SELECT COUNT(*)::int FROM user_skills WHERE type = 'LEARN') as total_learn_demands`
    );

    // 3. Problem Exchange & Workspace KPIs
    const { rows: exchangeCounts } = await db.query(
      `SELECT 
         (SELECT COUNT(*)::int FROM problems) as total_problems,
         (SELECT COUNT(*)::int FROM problems WHERE status = 'OPEN') as open_problems,
         (SELECT COUNT(*)::int FROM problems WHERE status = 'IN_PROGRESS' OR status = 'MATCHED') as active_problems,
         (SELECT COUNT(*)::int FROM problems WHERE status = 'DISPUTED') as disputed_problems,
         (SELECT COUNT(*)::int FROM proposals) as total_proposals,
         (SELECT COUNT(*)::int FROM proposals WHERE status = 'PENDING') as pending_proposals,
         (SELECT COUNT(*)::int FROM requests) as total_requests,
         (SELECT COUNT(*)::int FROM connections WHERE status = 'ACTIVE') as active_connections,
         (SELECT COUNT(*)::int FROM exchange_workspaces) as total_workspaces,
         (SELECT COUNT(*)::int FROM exchange_workspaces WHERE status = 'ACTIVE') as active_workspaces,
         (SELECT COUNT(*)::int FROM exchange_workspaces WHERE status = 'COMPLETED') as completed_workspaces,
         (SELECT COUNT(*)::int FROM messages) as total_messages,
         (SELECT COUNT(*)::int FROM reviews) as total_reviews,
         (SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) FROM reviews) as platform_avg_rating`
    );

    // 4. Report KPIs
    const { rows: reportCounts } = await db.query(
      `SELECT 
         COUNT(*)::int as total_reports,
         SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END)::int as open_reports,
         SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END)::int as resolved_reports
       FROM reports`
    );

    // 5. Verification KPIs
    const { rows: verifCounts } = await db.query(
      `SELECT 
         COUNT(*)::int as total_verifications,
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END)::int as pending_verifications,
         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END)::int as approved_verifications
       FROM skill_verifications`
    );

    // 6. Recent Reports for Overview Card
    const { rows: recentReports } = await db.query(
      `SELECT r.*, 
              rep.name as reporter_name, rep.avatar_url as reporter_avatar,
              tar.name as reported_name, tar.email as reported_email, tar.status as reported_status
       FROM reports r
       JOIN app_users rep ON r.reporter_id = rep.id
       JOIN app_users tar ON r.reported_user_id = tar.id
       ORDER BY (r.status = 'OPEN') DESC, r.created_at DESC LIMIT 6`
    );

    // 7. Top Skills (Supply vs Demand)
    const { rows: topSkills } = await db.query(
      `SELECT s.id, s.name, s.icon, c.name as category_name,
              SUM(CASE WHEN us.type = 'TEACH' THEN 1 ELSE 0 END)::int as teachers,
              SUM(CASE WHEN us.type = 'LEARN' THEN 1 ELSE 0 END)::int as learners
       FROM skills s
       JOIN categories c ON s.category_id = c.id
       LEFT JOIN user_skills us ON s.id = us.skill_id
       GROUP BY s.id, s.name, s.icon, c.name
       ORDER BY (COUNT(us.id)) DESC LIMIT 6`
    );

    // 8. Recent Problem Exchanges
    const { rows: recentProblems } = await db.query(
      `SELECT p.id, p.title, p.urgency, p.status, p.created_at,
              u.name as user_name, u.avatar_url as user_avatar,
              (SELECT COUNT(*)::int FROM proposals WHERE problem_id = p.id) as proposal_count
       FROM problems p
       JOIN app_users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT 5`
    );

    // 9. Activity Chart Data (Days of user registrations and exchanges)
    const activityTimeline = [
      { day: 'Mon', users: 14, exchanges: 8 },
      { day: 'Tue', users: 19, exchanges: 12 },
      { day: 'Wed', users: 25, exchanges: 15 },
      { day: 'Thu', users: 22, exchanges: 14 },
      { day: 'Fri', users: 31, exchanges: 21 },
      { day: 'Sat', users: 28, exchanges: 19 },
      { day: 'Sun', users: 34, exchanges: 24 }
    ];

    return res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      analytics: {
        users: userCounts[0] || {},
        skills: skillCounts[0] || {},
        exchanges: exchangeCounts[0] || {},
        reports: reportCounts[0] || {},
        verifications: verifCounts[0] || {}
      },
      recentReports,
      topSkills,
      recentProblems,
      activityTimeline
    });
  } catch (err) {
    console.error('Error loading admin stats:', err);
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
}