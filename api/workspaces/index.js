// api/workspaces/index.js - List Active and Completed Workspaces
import { db } from 'hatchable';
import { requireCurrentUser } from 'lib/auth.js';

export const access = 'public';

export default async function (req, res) {
  const user = await requireCurrentUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { rows: workspaces } = await db.query(
      `SELECT w.*, 
              c.user1_id, c.user2_id,
              u1.name as user1_name, u1.avatar_url as user1_avatar, u1.headline as user1_headline,
              u2.name as user2_name, u2.avatar_url as user2_avatar, u2.headline as user2_headline,
              s1.name as user1_skill_name, s2.name as user2_skill_name,
              (SELECT COUNT(*) FROM tasks WHERE workspace_id = w.id)::int as total_tasks,
              (SELECT COUNT(*) FROM tasks WHERE workspace_id = w.id AND status = 'COMPLETED')::int as completed_tasks,
              (SELECT COUNT(*) FROM learning_goals WHERE workspace_id = w.id)::int as total_goals,
              (SELECT COUNT(*) FROM learning_goals WHERE workspace_id = w.id AND status = 'DONE')::int as done_goals,
              (SELECT COUNT(*) FROM reviews WHERE workspace_id = w.id AND reviewer_id = $1)::int as user_reviewed
       FROM exchange_workspaces w
       JOIN connections c ON w.connection_id = c.id
       JOIN app_users u1 ON c.user1_id = u1.id
       JOIN app_users u2 ON c.user2_id = u2.id
       LEFT JOIN skills s1 ON w.user1_skill_id = s1.id
       LEFT JOIN skills s2 ON w.user2_skill_id = s2.id
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY (w.status = 'ACTIVE') DESC, w.updated_at DESC`,
      [user.id]
    );

    const formatted = workspaces.map(ws => {
      const isUser1 = ws.user1_id === user.id;
      const partner = {
        id: isUser1 ? ws.user2_id : ws.user1_id,
        name: isUser1 ? ws.user2_name : ws.user1_name,
        avatar_url: isUser1 ? ws.user2_avatar : ws.user1_avatar,
        headline: isUser1 ? ws.user2_headline : ws.user1_headline,
      };

      return {
        ...ws,
        partner,
        user_reviewed: ws.user_reviewed > 0
      };
    });

    return res.json({ workspaces: formatted });
  }

  res.status(405).json({ error: 'Method not allowed' });
}