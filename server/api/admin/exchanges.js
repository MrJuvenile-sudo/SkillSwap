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
      let problems = [];
      try {
        const res = await db.query(
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
           ORDER BY (CASE WHEN p.status = 'DISPUTED' THEN 1 ELSE 0 END) DESC, (CASE WHEN p.status = 'OPEN' THEN 1 ELSE 0 END) DESC, p.created_at DESC`
        );
        problems = res.rows || [];
      } catch (err) {
        console.warn('Admin Exchanges: problems query notice:', err.message);
      }

      // 2. Proposals submitted against Problems
      let proposals = [];
      try {
        const res = await db.query(
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
        proposals = res.rows || [];
      } catch (err) {
        console.warn('Admin Exchanges: proposals query notice:', err.message);
      }

      // 3. Active Exchange Agreements & Workspaces
      let workspaces = [];
      try {
        const res = await db.query(
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
           ORDER BY (CASE WHEN ew.status = 'ACTIVE' THEN 1 ELSE 0 END) DESC, ew.updated_at DESC`
        );
        workspaces = res.rows || [];
      } catch (err) {
        console.warn('Admin Exchanges: workspaces query notice:', err.message);
      }

      // 4. Request Pulse (Today vs All-time stats)
      let requestStats = [{ total_requests: 0, requests_today: 0, accepted_requests: 0, pending_requests: 0, declined_requests: 0 }];
      try {
        const res = await db.query(
          `SELECT 
             COUNT(*)::int as total_requests,
             SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END)::int as requests_today,
             SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END)::int as accepted_requests,
             SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END)::int as pending_requests,
             SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END)::int as declined_requests
           FROM requests`
        );
        if (res.rows && res.rows.length > 0) requestStats = res.rows;
      } catch (err) {
        console.warn('Admin Exchanges: requestStats query notice:', err.message);
      }

      return res.json({
        problems,
        proposals,
        workspaces,
        requestStats: requestStats[0] || {}
      });
    } catch (err) {
      console.error('Critical fallback in exchanges data:', err);
      return res.json({
        problems: [],
        proposals: [],
        workspaces: [],
        requestStats: {}
      });
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
