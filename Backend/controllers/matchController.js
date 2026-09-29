// Backend/controllers/matchController.js - AI Matching Engine & Peer Discovery
import { getDb } from '../config/db.js';
import { calculateMatchesForUser } from '../services/aiMatchingService.js';

export async function getAiMatches(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 15 } = req.query;

    const matches = await calculateMatchesForUser(userId, Number(limit));
    return res.json({
      success: true,
      matches,
      count: matches.length
    });
  } catch (err) {
    console.error('[matchController.getAiMatches] Error:', err);
    return res.status(500).json({ error: 'Failed to compute AI matches' });
  }
}

export async function getRecommendedPeers(req, res) {
  try {
    const userId = req.user?.id;
    const db = await getDb();

    // Query active users with high karma and complementary skills
    const result = await db.query(
      `SELECT u.id, u.name, u.avatar_url, u.headline, u.karma_score,
              p.location, p.availability
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.status = 'ACTIVE' AND u.id != ?
       ORDER BY u.karma_score DESC LIMIT 10`,
      [userId || '']
    );

    return res.json({
      success: true,
      peers: result.rows || []
    });
  } catch (err) {
    console.error('[matchController.getRecommendedPeers] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch peer recommendations' });
  }
}

export async function getMatchHistory(req, res) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const result = await db.query(
      `SELECT m.*, 
              u.name as peer_name, u.avatar_url as peer_avatar, u.headline as peer_headline
       FROM matches m
       JOIN app_users u ON (CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END) = u.id
       WHERE m.user1_id = ? OR m.user2_id = ?
       ORDER BY m.created_at DESC`,
      [userId, userId, userId]
    );

    return res.json({
      success: true,
      matches: result.rows || []
    });
  } catch (err) {
    console.error('[matchController.getMatchHistory] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch match history' });
  }
}
