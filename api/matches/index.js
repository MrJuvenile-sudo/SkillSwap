// api/matches/index.js - Ranked Reciprocal Matching Feed with Filtering, Sorting & Bookmarks
import { db } from 'hatchable';
import { getCurrentUser } from 'lib/auth.js';
import { calculateMatchScore } from 'lib/matching.js';

export const access = 'public';

export default async function (req, res) {
  try {
    const currentUser = await getCurrentUser(req);
    const currentUserId = currentUser ? currentUser.id : 'user_alice';

    const { sort = 'highest_synergy', language, timezone, category, verified_only, bookmarked_only } = req.query;

    // Fetch current user bookmarks & hidden lists
    const { rows: meDb } = await db.query(
      `SELECT bookmarked_user_ids, hidden_user_ids FROM app_users WHERE id = $1`,
      [currentUserId]
    );

    const bookmarkedIds = new Set(meDb[0]?.bookmarked_user_ids || []);
    const hiddenIds = new Set(meDb[0]?.hidden_user_ids || []);

    // Fetch all active users
    const { rows: allUsers } = await db.query(
      `SELECT u.id, u.name, u.username, u.email, u.avatar_url, u.headline,
              p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone,
              COALESCE(AVG(r.rating), 5.0) as avg_rating,
              COUNT(r.id) as reviews_count
       FROM app_users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN reviews r ON u.id = r.reviewee_id
       WHERE u.status = 'ACTIVE'
       GROUP BY u.id, u.name, u.username, u.email, u.avatar_url, u.headline,
                p.bio, p.location, p.availability, p.preferred_language, p.completion_percentage, p.timezone`
    );

    // Fetch skills for all users
    const { rows: allUserSkills } = await db.query(
      `SELECT us.*, s.name as skill_name, s.category_id, c.name as category_name 
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       JOIN categories c ON s.category_id = c.id`
    );

    const skillsMap = {};
    for (const us of allUserSkills) {
      if (!skillsMap[us.user_id]) skillsMap[us.user_id] = [];
      skillsMap[us.user_id].push(us);
    }

    const hydratedUsers = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
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
    let peers = hydratedUsers.filter(u => u.id !== currentUserId && u.id !== 'user_admin');

    // Filter out hidden peers unless bookmarked
    peers = peers.filter(p => !hiddenIds.has(p.id));

    // Optional filters
    if (bookmarked_only === 'true') {
      peers = peers.filter(p => bookmarkedIds.has(p.id));
    }
    if (language) {
      peers = peers.filter(p => (p.profile?.preferred_language || '').toLowerCase().includes(language.toLowerCase()));
    }
    if (timezone) {
      peers = peers.filter(p => (p.profile?.timezone || '').toLowerCase().includes(timezone.toLowerCase()));
    }
    if (category) {
      peers = peers.filter(p => (p.skills || []).some(s => s.category_name?.toLowerCase().includes(category.toLowerCase())));
    }
    if (verified_only === 'true') {
      peers = peers.filter(p => (p.skills || []).some(s => s.is_verified));
    }

    // Compute matches using matching module
    let matches = peers.map(peer => {
      const matchResult = calculateMatchScore(me, peer);
      const peerTeach = (peer.skills || []).filter(s => s.type === 'TEACH');
      const peerLearn = (peer.skills || []).filter(s => s.type === 'LEARN');

      return {
        user: {
          id: peer.id,
          name: peer.name,
          username: peer.username,
          avatar_url: peer.avatar_url,
          headline: peer.headline,
          location: peer.profile.location,
          availability: peer.profile.availability,
          preferred_language: peer.profile.preferred_language,
          timezone: peer.profile.timezone,
          rating: peer.reviews.avg_rating,
          reviews_count: peer.reviews.count,
          teach_skills: peerTeach,
          learn_skills: peerLearn,
          is_bookmarked: bookmarkedIds.has(peer.id)
        },
        score: matchResult.matchScore,
        matchScore: matchResult.matchScore,
        subScores: matchResult.subScores,
        reasons: matchResult.reasons,
        matchedSkills: matchResult.matchedSkills
      };
    });

    // Sorting
    if (sort === 'most_reviewed') {
      matches.sort((a, b) => b.user.reviews_count - a.user.reviews_count || b.matchScore - a.matchScore);
    } else if (sort === 'highest_rating') {
      matches.sort((a, b) => b.user.rating - a.user.rating || b.matchScore - a.matchScore);
    } else if (sort === 'nearest_timezone') {
      const meTz = (me.profile?.timezone || '').toLowerCase();
      matches.sort((a, b) => {
        const aMatch = (a.user.timezone || '').toLowerCase() === meTz ? 1 : 0;
        const bMatch = (b.user.timezone || '').toLowerCase() === meTz ? 1 : 0;
        return bMatch - aMatch || b.matchScore - a.matchScore;
      });
    } else {
      // Default: highest_synergy
      matches.sort((a, b) => b.matchScore - a.matchScore);
    }

    return res.json({
      currentUser: {
        id: me.id,
        name: me.name,
        username: me.username,
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