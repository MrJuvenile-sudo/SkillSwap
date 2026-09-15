// scripts/seed_problems_circles.mjs
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('skillswap.db');

const sampleProblems = [
  {
    user_id: 'user_admin',
    title: 'Building a Real-time Collaborative Canvas with WebSocket & Canvas API',
    description: 'Need assistance architecting low-latency CRDT state synchronization for an interactive collaborative whiteboard canvas. In exchange, I can teach deep PostgreSQL query optimization and indexing strategies.',
    category_id: 1,
    required_skill_id: 19,
    offered_skill_id: 17,
    urgency: 'High',
    estimated_hours: 6
  },
  {
    user_id: 'user_mtps69ho_ah1x8',
    title: 'Designing a Complete Multi-tenant Design System & Token Architecture in Figma',
    description: 'Looking for a senior UI/UX designer to critique and guide modular auto-layout components and color mode tokens in Figma. Happy to teach Python scripting, web scraping, and automation.',
    category_id: 2,
    required_skill_id: 6,
    offered_skill_id: 9,
    urgency: 'Medium',
    estimated_hours: 4
  },
  {
    user_id: 'user_mtpzafdy_f9zhh',
    title: 'Mastering Spanish Conversational Fluency & Business Communication',
    description: 'I am preparing for an international tech conference in Madrid and want to practice conversational fluency. I can teach professional photography composition and Adobe Lightroom workflow in return!',
    category_id: 3,
    required_skill_id: 8,
    offered_skill_id: 13,
    urgency: 'Medium',
    estimated_hours: 8
  },
  {
    user_id: 'user_mtpzem3p_j50g5',
    title: 'Acoustic Guitar Fingerpicking Patterns & Music Theory Fundamentals',
    description: 'Looking for a guitarist to guide intermediate fingerpicking transitions and chord theory. Offering expert technical copywriting and landing page conversion optimization.',
    category_id: 4,
    required_skill_id: 11,
    offered_skill_id: 14,
    urgency: 'Low',
    estimated_hours: 5
  }
];

const sampleCircles = [
  {
    name: 'Fullstack Architecture & Distributed Systems Guild',
    description: 'A dedicated peer study cohort focusing on distributed event streaming, microservices resilience, Kubernetes, and GraphQL APIs. Weekly live code reviews.',
    category_id: 1,
    creator_id: 'user_admin',
    member_count: 28
  },
  {
    name: 'AI Engineering & LLM Application Builders',
    description: 'Peer group dedicated to building RAG pipelines, fine-tuning open-source models, vector embeddings, and LangChain agents. Bi-weekly project demos.',
    category_id: 7,
    creator_id: 'user_admin',
    member_count: 34
  },
  {
    name: 'Product Design, Figma Systems & UX Critique Lab',
    description: 'Interactive peer review circle for design tokens, user research frameworks, component libraries, and interactive prototyping feedback.',
    category_id: 2,
    creator_id: 'user_mtps69ho_ah1x8',
    member_count: 19
  },
  {
    name: 'Multilingual Polyglot Language Exchange Club',
    description: 'Practice speaking Spanish, Japanese, French, German, and Mandarin with native speakers and passionate peers in structured 30-minute tandem sessions.',
    category_id: 3,
    creator_id: 'user_mtpzafdy_f9zhh',
    member_count: 22
  }
];

for (const p of sampleProblems) {
  db.prepare(`
    INSERT INTO problems (user_id, title, description, category_id, required_skill_id, offered_skill_id, urgency, estimated_hours, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
  `).run(p.user_id, p.title, p.description, p.category_id, p.required_skill_id, p.offered_skill_id, p.urgency, p.estimated_hours);
}

for (const c of sampleCircles) {
  db.prepare(`
    INSERT INTO skill_circles (name, description, category_id, creator_id, moderator_id, member_count, status)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
  `).run(c.name, c.description, c.category_id, c.creator_id, c.creator_id, c.member_count);
}

console.log('Seeded sample problems and circles successfully!');
