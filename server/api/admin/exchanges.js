// api/admin/exchanges.js - Problem-Exchange Aware Exchange Monitoring
import { db } from 'hatchable';
import { requireModerator } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const admin = await requireModerator(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    try {
      // 1. All Problems with their Proposers and status
      const { rows: problems } = await db.query(
        `SELECT p.*,
                u.name as creator_name, u.email as creator_email, u.avatar_url as creator_avatar,
                req_s.name as required_skill_name,
                off_s.name as offered_skill_name,
                c.name as category_name,
                (SELECT COUNT(*)::int FROM proposals WHERE problem_id = p.id) as proposal_count,
                (SELECT COUNT(*)::int FROM proposals WHERE problem_id = p.id AND status = 'ACCEPTED') as accepted_count
         FROM problems p
         JOIN app_users u ON p.user_id = u.id
         LEFT JOIN skills req_s ON p.required_skill_id = req_s.id
         LEFT JOIN skills off_s ON p.offered_skill_id = off_s.id
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY (p.status = 'DISPUTED') DESC, (p.status = 'OPEN') DESC, p.created_at DESC`
      );

      // 2. Proposals submitted against Problems
      const { rows: proposals } = await db.query(
        `SELECT prop.*,
                u.name as proposer_name, u.email as proposer_email, u.avatar_url as proposer_avatar,
                s.name as offered_skill_name,
                p.title as problem_title
         FROM proposals prop
         JOIN app_users u ON prop.proposer_id = u.id
         JOIN problems p ON prop.problem_id = p.id
         LEFT JOIN skills s ON prop.offered_skill_id = s.id
         ORDER BY prop.created_at DESC`
      );

      // 3. Active Exchange Agreements & Workspaces
      const { rows: workspaces } = await db.query(
        `SELECT ew.*, 
                u1.name as user1_name, u1.email as user1_email, u1.avatar_url as user1_avatar,
                u2.name as user2_name, u2.email as user2_email, u2.avatar_url as user2_avatar,
                s1.name as user1_skill_name,
                s2.name as user2_skill_name,
                (SELECT COUNT(*)::int FROM tasks WHERE workspace_id = ew.id) as task_count,
                (SELECT COUNT(*)::int FROM tasks WHERE workspace_id = ew.id AND status = 'COMPLETED') as completed_tasks
         FROM exchange_workspaces ew
         JOIN connections conn ON ew.connection_id = conn.id
         JOIN app_users u1 ON conn.user1_id = u1.id
         JOIN app_users u2 ON conn.user2_id = u2.id
         LEFT JOIN skills s1 ON ew.user1_skill_id = s1.id
         LEFT JOIN skills s2 ON ew.user2_skill_id = s2.id
         ORDER BY (ew.status = 'ACTIVE') DESC, ew.updated_at DESC`
      );

      // 4. Request Pulse (Today vs All-time stats)
      const { rows: requestStats } = await db.query(
        `SELECT 
           COUNT(*)::int as total_requests,
           COUNT(*) FILTER (WHERE date(created_at) = date('now'))::int as requests_today,
           COUNT(*) FILTER (WHERE status = 'ACCEPTED')::int as accepted_requests,
           COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending_requests,
           COUNT(*) FILTER (WHERE status = 'REJECTED')::int as declined_requests
         FROM requests`
      );

      return res.json({
        problems,
        proposals,
        workspaces,
        requestStats: requestStats[0] || {}
      });
    } catch (err) {
      console.error('Error loading exchanges data:', err);
      return res.status(500).json({ error: 'Failed to load exchanges monitoring data' });
    }
  }

  // Intervene in disputed / stalled problems or workspaces
  if (req.method === 'PUT') {
    const { type, id, status, resolution_notes } = req.body || {};
    if (!type || !id || !status) {
      return res.status(400).json({ error: 'Type, ID, and target status required' });
    }

    if (type === 'PROBLEM') {
      await db.query(
        `UPDATE problems SET status = $1, updated_at = now() WHERE id = $2`,
        [status, id]
      );
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'MODERATE_PROBLEM', 'PROBLEM', $2, $3)`,
        [admin.id, String(id), JSON.stringify({ status, resolution_notes })]
      );
    } else if (type === 'WORKSPACE') {
      await db.query(
        `UPDATE exchange_workspaces SET status = $1, updated_at = now() WHERE id = $2`,
        [status, id]
      );
      await db.query(
        `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES ($1, 'MODERATE_WORKSPACE', 'WORKSPACE', $2, $3)`,
        [admin.id, String(id), JSON.stringify({ status, resolution_notes })]
      );
    }

    return res.json({ success: true, message: 'Exchange state updated successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
