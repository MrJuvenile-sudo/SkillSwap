// api/ai/chat.js - SkillSwap AI Chat with Intent Routing
import { db } from 'hatchable';
import { requireAuth } from 'lib/auth.js';

export const access = 'public';

// Intent detection using keyword mapping
function detectIntent(message) {
  const msg = message.toLowerCase();
  const intents = [
    { intent: 'AUTHENTICATION', keywords: ['login', 'sign in', 'sign up', 'register', 'password', 'forgot', 'logout', 'account'] },
    { intent: 'PROFILE', keywords: ['profile', 'bio', 'avatar', 'headline', 'edit profile', 'update profile', 'settings'] },
    { intent: 'SKILLS', keywords: ['skill', 'teach', 'learn', 'add skill', 'remove skill', 'skill matrix'] },
    { intent: 'EXPLORE', keywords: ['explore', 'discover', 'browse', 'find people', 'search users', 'skill directory'] },
    { intent: 'MATCHING', keywords: ['match', 'compatibility', 'synergy', 'score', 'match score', 'percentage', 'why is my match'] },
    { intent: 'REQUESTS', keywords: ['request', 'swap request', 'proposal', 'send request', 'pending request'] },
    { intent: 'CHAT', keywords: ['message', 'chat', 'conversation', 'inbox', 'talk to'] },
    { intent: 'UPLOAD_RESOURCE', keywords: ['upload', 'share notes', 'submit resource', 'add resource', 'share resource', 'contribute'] },
    { intent: 'LEARNING_RESOURCES', keywords: ['notes', 'resource', 'learning hub', 'study', 'materials', 'pyq', 'previous year', 'assignment', 'lab manual', 'question bank', 'exam prep'] },
    { intent: 'DOWNLOAD_RESOURCE', keywords: ['download', 'get notes', 'access resource', 'open resource'] },
    { intent: 'REVIEWS', keywords: ['review', 'rating', 'feedback', 'rate', 'stars'] },
    { intent: 'NOTIFICATIONS', keywords: ['notification', 'alert', 'unread', 'bell'] },
    { intent: 'COMMUNITY', keywords: ['community', 'circle', 'group', 'post', 'feed', 'skill circle'] },
    { intent: 'REPORTS', keywords: ['report', 'abuse', 'flag', 'inappropriate', 'block'] },
    { intent: 'ADMIN', keywords: ['admin', 'moderate', 'ban', 'suspend', 'admin panel'] },
  ];
  for (const { intent, keywords } of intents) {
    if (keywords.some(kw => msg.includes(kw))) return intent;
  }
  return 'GENERAL';
}

// Gather real platform context for the intent
async function gatherContext(intent, userId) {
  const ctx = {};
  try {
    if (intent === 'MATCHING' || intent === 'SKILLS') {
      const { rows: uRows } = await db.query(
        `SELECT u.id, u.name,
                (SELECT GROUP_CONCAT(s.name, ', ') FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id AND us.type = 'TEACH') as teach_skills,
                (SELECT GROUP_CONCAT(s.name, ', ') FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id AND us.type = 'LEARN') as learn_skills
         FROM app_users u WHERE u.id = $1`, [userId]
      );
      ctx.user = uRows[0] || {};
      const { rows: matchRows } = await db.query(
        `SELECT u.name, u.username, m.synergy_score
         FROM matches m
         JOIN app_users u ON (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) = u.id
         WHERE (m.user1_id = $1 OR m.user2_id = $1) AND m.status = 'ACTIVE'
         ORDER BY m.synergy_score DESC LIMIT 3`, [userId]
      ).catch(() => ({ rows: [] }));
      ctx.topMatches = matchRows;
    }
    if (intent === 'LEARNING_RESOURCES' || intent === 'UPLOAD_RESOURCE' || intent === 'DOWNLOAD_RESOURCE') {
      const { rows } = await db.query(
        `SELECT COUNT(*)::int as my_uploads FROM resources WHERE contributor_id = $1`, [userId]
      ).catch(() => ({ rows: [{ my_uploads: 0 }] }));
      const { rows: savedRows } = await db.query(
        `SELECT COUNT(*)::int as saved FROM saved_resources WHERE user_id = $1`, [userId]
      ).catch(() => ({ rows: [{ saved: 0 }] }));
      ctx.resourceStats = { my_uploads: rows[0]?.my_uploads || 0, saved: savedRows[0]?.saved || 0 };
    }
    if (intent === 'PROFILE') {
      const { rows } = await db.query(
        `SELECT u.name, u.headline, p.bio, p.location
         FROM app_users u LEFT JOIN profiles p ON u.id = p.user_id
         WHERE u.id = $1`, [userId]
      );
      ctx.profile = rows[0] || {};
    }
  } catch (e) { /* best-effort */ }
  return ctx;
}

// Generate intent-matched response
function generateResponse(intent, message, ctx) {
  const responses = {
    UPLOAD_RESOURCE: {
      reply: 'To share a resource, go to **Learning Hub → Share Resource**. Choose the resource type (Notes, Key-Point Notes, PYQ, etc.), fill in academic details (subject, university, semester), add a file URL (Google Drive / GitHub link), and submit for review. It will appear in Browse once approved — usually within 24 hours.',
      suggestions: ['Browse Learning Hub', 'View My Uploads', 'What types can I upload?']
    },
    LEARNING_RESOURCES: {
      reply: `The Learning Hub has Notes, Assignments, Key-Point Notes, Previous Year Papers, Lab Manuals, Question Banks, and more.${ctx.resourceStats ? ` You have shared ${ctx.resourceStats.my_uploads} resource(s) and saved ${ctx.resourceStats.saved}.` : ''} Use the search bar and type filters to find what you need, or try **Exam Mode** for a focused subject study session.`,
      suggestions: ['Browse All Resources', 'Share a Resource', 'Open Exam Mode']
    },
    DOWNLOAD_RESOURCE: {
      reply: 'To download or access a resource, open it from the Learning Hub and click the **Download / Open** button. This opens the contributor\'s link (Google Drive, GitHub, etc.) in a new tab. Your download is logged to your history.',
      suggestions: ['Browse Learning Hub', 'My Download History']
    },
    MATCHING: {
      reply: ctx.topMatches?.length
        ? `Your top matches: ${ctx.topMatches.map(m => `**${m.name}** (${m.synergy_score}% synergy)`).join(', ')}. Match scores are based on 6 factors: skill complementarity (35%), proficiency balance (25%), timezone overlap (15%), schedule alignment (10%), milestone timeline (10%), and trust karma (5%).`
        : 'Match scores are based on 6 factors: skill complementarity (35%), proficiency balance (25%), timezone overlap (15%), schedule alignment (10%), milestone timeline (10%), and trust karma (5%). Add more skills to improve your matches!',
      suggestions: ['View My Matches', 'Add Skills', 'Explore Skill Directory']
    },
    SKILLS: {
      reply: ctx.user?.teach_skills
        ? `You can teach: **${ctx.user.teach_skills}**. You want to learn: **${ctx.user.learn_skills || 'nothing set yet'}**. Go to **My Skills** in the sidebar to add or edit your skill matrix.`
        : 'Go to **My Skills** in the sidebar to add your skills. Add at least one skill to teach and one to learn to activate the matching engine.',
      suggestions: ['Manage My Skills', 'View My Matches', 'Explore Skill Directory']
    },
    PROFILE: {
      reply: ctx.profile?.bio
        ? `Your profile is set up with a bio and headline. Keep your skills and availability up to date for better matches. A complete profile gets 3x more match requests.`
        : 'Your profile looks incomplete. Add a bio, headline, and location in **Settings → Profile** to improve visibility and get better match suggestions.',
      suggestions: ['Edit Profile Settings', 'Update Skills', 'View My Profile']
    },
    REQUESTS: {
      reply: 'To send a swap request: find a peer on **Matches** or **Skill Directory**, click their card, and hit **Propose Swap**. Fill in your proposal — what you offer, what you want, and a cover note. They will get a notification immediately.',
      suggestions: ['Browse Matches', 'View Incoming Requests', 'Explore Skill Directory']
    },
    CHAT: {
      reply: 'Your messages are in the **Chat** section (sidebar). You can message any peer you have an active connection or workspace with. Messages are delivered through the platform inbox in real time.',
      suggestions: ['Open Chat', 'View Workspaces']
    },
    COMMUNITY: {
      reply: 'The **Community Feed** lets peers share updates, questions, and learnings. You can post, react (👏), comment, and propose swaps directly from posts. Join **Skill Circles** — study groups organized around skills and subjects.',
      suggestions: ['Open Community Feed', 'Browse Skill Circles']
    },
    NOTIFICATIONS: {
      reply: 'Notifications appear in the bell icon in the top navbar. They cover new swap requests, resource approvals, match suggestions, and workspace milestones. You can manage notification preferences in **Settings**.',
      suggestions: ['Open Settings', 'View Notifications']
    },
    AUTHENTICATION: {
      reply: 'To sign in, click **Login** at the top right. Use your registered email and password. Demo accounts: **alice@skillswap.io** (regular user) or **admin@skillswap.io** (admin), both with password **password123**.',
      suggestions: ['Go to Login', 'Create Account']
    },
    REVIEWS: {
      reply: 'You can leave a quality review on any Learning Hub resource you did not contribute. Open the resource detail page and click **Write Review**. Rate accuracy, completeness, relevance, and usefulness (1-5 stars). Resources with 3+ reviews and avg ≥ 4.0 get a ✓ Community Reviewed badge.',
      suggestions: ['Browse Learning Hub', 'My Download History']
    },
    EXPLORE: {
      reply: 'Browse the **Skill Directory** to discover experts and learners across 100+ categories. Filter by skill, level, or category. Click any person\'s card to view their profile and propose a skill swap.',
      suggestions: ['Open Skill Directory', 'Browse Community Feed', 'View Matches']
    },
    ADMIN: {
      reply: 'The Admin Panel is accessible to staff roles (Super Admin, Admin, Moderator, Support). It includes: user management, resource moderation, exchange oversight, reports, analytics, AI settings, and platform configuration.',
      suggestions: ['Open Admin Panel']
    },
    REPORTS: {
      reply: 'To report abusive or inappropriate content, click the **Report** button on the user\'s profile or post. Your report is reviewed by the moderation team. For urgent issues, contact support through the Help Center.',
      suggestions: ['Help Center', 'Community Guidelines']
    },
    GENERAL: {
      reply: 'I\'m the SkillSwapX AI assistant! I can help you with:\n• **Learning Hub** — finding or sharing resources, exam mode\n• **Matching** — understanding your match scores\n• **Skills** — managing your teach/learn matrix\n• **Navigation** — finding any feature in the app\n\nWhat would you like help with?',
      suggestions: ['How do I upload notes?', 'How does matching work?', 'Browse Learning Hub', 'View my matches']
    }
  };
  return responses[intent] || responses.GENERAL;
}

export default async function (req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, conversationId } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { rows } = await db.query(
        `INSERT INTO ai_conversations (user_id, title) VALUES ($1, $2) RETURNING id`,
        [user.id, message.trim().substring(0, 60)]
      );
      convId = rows[0].id;
    }

    const intent = detectIntent(message);
    const context = await gatherContext(intent, user.id);
    const { reply, suggestions } = generateResponse(intent, message, context);

    // Store user message
    await db.query(
      `INSERT INTO ai_messages (conversation_id, role, content, intent) VALUES ($1, 'USER', $2, $3)`,
      [convId, message.trim(), intent]
    );

    // Store assistant message
    const { rows: asstRows } = await db.query(
      `INSERT INTO ai_messages (conversation_id, role, content, intent) VALUES ($1, 'ASSISTANT', $2, $3) RETURNING id`,
      [convId, reply, intent]
    );

    // Log usage
    await db.query(
      `INSERT INTO ai_usage (user_id, intent, resolved) VALUES ($1, $2, 1)`,
      [user.id, intent]
    ).catch(() => {});

    // Update conversation timestamp
    await db.query(
      `UPDATE ai_conversations SET updated_at = datetime('now') WHERE id = $1`, [convId]
    ).catch(() => {});

    return res.json({
      reply,
      intent,
      suggestions: suggestions || [],
      conversationId: convId,
      messageId: asstRows[0]?.id,
      confidence: 0.85
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({ error: 'AI assistant is temporarily unavailable. Please try again.' });
  }
}
