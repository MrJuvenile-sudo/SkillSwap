// api/matches/[id].js - In-Depth Match Details & Comparison
import { db } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';
import { calculateMatchScore } from 'lib/matching.js';

export const access = 'public';

export default async function (req, res) {
  try {
    const peerId = req.params.id;
    if (!peerId) {
      return res.status(400).json({ error: 'Peer ID is required' });
    }

    const currentUser = await getCurrentUser(req);
    const currentUserId = currentUser ? currentUser.id : 'user_alice';

    const { rows: users } = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.headline,
              p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone,
              COALESCE(AVG(r.rating), 5.0)::numeric(3,1) as avg_rating,
              COUNT(r.id)::int as reviews_count
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.id IN ($1, $2)
       GROUP BY u.id, u.name, u.email, u.avatar_url, u.headline,
                p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone`,
      [currentUserId, peerId]
    );

    const meRow = users.find(u => u.id === currentUserId);
    const peerRow = users.find(u => u.id === peerId);

    if (!peerRow) {
      return res.status(404).json({ error: 'Peer user not found' });
    }

    const { rows: skills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name 
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id
       WHERE us.user_id IN ($1, $2)`,
      [currentUserId, peerId]
    );

    const meSkills = skills.filter(s => s.user_id === currentUserId);
    const peerSkills = skills.filter(s => s.user_id === peerId);

    const me = {
      id: meRow.id,
      name: meRow.name,
      profile: {
        bio: meRow.bio,
        location: meRow.location,
        availability: meRow.availability,
        preferred_language: meRow.preferred_language,
        completion_percentage: meRow.completion_percentage
      },
      skills: meSkills,
      reviews: { avg_rating: Number(meRow.avg_rating), count: meRow.reviews_count }
    };

    const peer = {
      id: peerRow.id,
      name: peerRow.name,
      avatar_url: peerRow.avatar_url,
      headline: peerRow.headline,
      profile: {
        bio: peerRow.bio,
        location: peerRow.location,
        availability: peerRow.availability,
        preferred_language: peerRow.preferred_language,
        completion_percentage: peerRow.completion_percentage,
        timezone: peerRow.timezone
      },
      skills: peerSkills,
      reviews: { avg_rating: Number(peerRow.avg_rating), count: peerRow.reviews_count }
    };

    const matchResult = calculateMatchScore(me, peer);

    // Check existing connection or request status
    const { rows: existingRequest } = await db.query(
      `SELECT * FROM requests 
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at DESC LIMIT 1`,
      [currentUserId, peerId]
    );

    const { rows: existingConnection } = await db.query(
      `SELECT c.*, w.id as workspace_id FROM connections c
       LEFT JOIN exchange_workspaces w ON w.connection_id = c.id
       WHERE (c.user1_id = $1 AND c.user2_id = $2) OR (c.user1_id = $2 AND c.user2_id = $1)
       ORDER BY c.created_at DESC LIMIT 1`,
      [currentUserId, peerId]
    );

    return res.json({
      peer,
      matchScore: matchResult.matchScore,
      subScores: matchResult.subScores,
      reasons: matchResult.reasons,
      matchedSkills: matchResult.matchedSkills,
      connectionStatus: existingConnection[0] ? 'CONNECTED' : (existingRequest[0]?.status || 'NONE'),
      existingRequest: existingRequest[0] || null,
      existingConnection: existingConnection[0] || null
    });
  } catch (err) {
    console.error('Error fetching match details:', err);
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
}