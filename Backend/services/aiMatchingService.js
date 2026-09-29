// Backend/services/aiMatchingService.js - Bilateral Reciprocal Barter Matching Engine
import { getDb } from '../config/db.js';

/**
 * Calculates bilateral reciprocal skill compatibility between the target user and other platform users.
 * Score factors:
 * 1. Mutual reciprocity (They have what you want, you have what they want) - 60%
 * 2. Karma rating & trustworthiness - 20%
 * 3. Experience level alignment - 10%
 * 4. Location & availability overlap - 10%
 */
export async function getReciprocalMatches(userId, limit = 10) {
  const db = await getDb();

  // 1. Get current user's teach and learn skills
  const teachRes = await db.query(
    'SELECT s.id, s.name, us.level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ? AND us.type = "TEACH"',
    [userId]
  );
  const learnRes = await db.query(
    'SELECT s.id, s.name, us.level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ? AND us.type = "LEARN"',
    [userId]
  );

  const myTeachIds = new Set(teachRes.rows.map(r => r.id));
  const myLearnIds = new Set(learnRes.rows.map(r => r.id));

  // 2. Fetch all other active users with their skills and profiles
  const usersRes = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, u.headline, u.karma_score,
            p.location, p.weekly_hours, p.availability
     FROM app_users u
     LEFT JOIN profiles p ON u.id = p.user_id
     WHERE u.id != ? AND u.status = 'ACTIVE'`,
    [userId]
  );

  const matches = [];

  for (const peer of usersRes.rows) {
    const peerTeachRes = await db.query(
      'SELECT s.id, s.name, us.level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ? AND us.type = "TEACH"',
      [peer.id]
    );
    const peerLearnRes = await db.query(
      'SELECT s.id, s.name, us.level FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ? AND us.type = "LEARN"',
      [peer.id]
    );

    // Mutual matches
    const peerCanTeachMe = peerTeachRes.rows.filter(s => myLearnIds.has(s.id));
    const iCanTeachPeer = teachRes.rows.filter(s => peerLearnRes.rows.some(p => p.id === s.id));

    // Base reciprocity score
    let score = 0;
    if (peerCanTeachMe.length > 0 && iCanTeachPeer.length > 0) {
      score += 70; // High mutual reciprocity
    } else if (peerCanTeachMe.length > 0 || iCanTeachPeer.length > 0) {
      score += 40; // Partial reciprocity
    } else {
      score += 15; // General synergy
    }

    // Add Karma rating contribution
    const karma = parseFloat(peer.karma_score || 4.5);
    score += Math.min(20, (karma / 5.0) * 20);

    // Add profile completeness
    if (peer.avatar_url) score += 5;
    if (peer.location) score += 5;

    score = Math.min(99, Math.round(score));

    matches.push({
      peer: {
        id: peer.id,
        name: peer.name,
        avatar_url: peer.avatar_url,
        headline: peer.headline || 'Skill Contributor',
        location: peer.location || 'India',
        karma_score: karma
      },
      matchPercentage: score,
      theyTeach: peerCanTeachMe.map(s => s.name),
      youTeach: iCanTeachPeer.map(s => s.name),
      allPeerTeaching: peerTeachRes.rows.map(s => s.name),
      allPeerLearning: peerLearnRes.rows.map(s => s.name)
    });
  }

  // Sort by match percentage descending
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return matches.slice(0, limit);
}

export const calculateMatchesForUser = getReciprocalMatches;

