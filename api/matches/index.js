// api/matches/index.js - Ranked Reciprocal Matching Feed
import { db } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';
import { calculateMatchScore } from 'lib/matching.js';

export const access = 'public';

export default async function (req, res) {
  try {
    const currentUser = await getCurrentUser(req);
    const currentUserId = currentUser ? currentUser.id : 'user_alice';

    // Fetch all users with active status
    const { rows: allUsers } = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.headline,
              p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone,
              COALESCE(AVG(r.rating), 5.0)::numeric(3,1) as avg_rating,
              COUNT(r.id)::int as reviews_count
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.status = 'ACTIVE'
       GROUP BY u.id, u.name, u.email, u.avatar_url, u.headline,
                p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone`
    );

    // Fetch skills for all users
    const { rows: allUserSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name 
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id`
    );

    // Map skills by user_id
    const skillsMap = {};
    for (const us of allUserSkills) {
      if (!skillsMap[us.user_id]) skillsMap[us.user_id] = [];
      skillsMap[us.user_id].push(us);
    }

    // Build hydrated user structures
    const hydratedUsers = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar_url: u.avatar_url,
      headline: u.headline,
      profile: {
        bio: u.bio,
        location: u.location,
        availability: u.availability,
        preferred_language: u.preferred_language,
        completion_percentage: u.completion_percentage,
        timezone: u.timezone
      },
      skills: skillsMap[u.id] || [],
      reviews: {
        avg_rating: Number(u.avg_rating || 5.0),
        count: u.reviews_count || 0
      }
    }));

    const me = hydratedUsers.find(u => u.id === currentUserId) || hydratedUsers[0];
    const peers = hydratedUsers.filter(u => u.id !== currentUserId && u.id !== 'user_admin');

    // Compute matches using matching module
    const matches = peers.map(peer => {
      const matchResult = calculateMatchScore(me, peer);
      const peerTeach = (peer.skills || []).filter(s => s.type === 'TEACH');
      const peerLearn = (peer.skills || []).filter(s => s.type === 'LEARN');

      return {
        user: {
          id: peer.id,
          name: peer.name,
          avatar_url: peer.avatar_url,
          headline: peer.headline,
          location: peer.profile.location,
          availability: peer.profile.availability,
          preferred_language: peer.profile.preferred_language,
          rating: peer.reviews.avg_rating,
          reviews_count: peer.reviews.count,
          teach_skills: peerTeach,
          learn_skills: peerLearn
        },
        matchScore: matchResult.matchScore,
        subScores: matchResult.subScores,
        reasons: matchResult.reasons,
        matchedSkills: matchResult.matchedSkills
      };
    });

    // Sort descending by matchScore
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      currentUser: {
        id: me.id,
        name: me.name,
        teach_count: (me.skills || []).filter(s => s.type === 'TEACH').length,
        learn_count: (me.skills || []).filter(s => s.type === 'LEARN').length
      },
      matches
    });
  } catch (err) {
    console.error('Error computing matches:', err);
    res.status(500).json({ error: 'Failed to compute matches' });
  }
}