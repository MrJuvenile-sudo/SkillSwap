import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('skillswap.db');

db.prepare("UPDATE profiles SET timezone = 'IST (UTC+5:30)', location = 'Bengaluru, Karnataka, India' WHERE location IS NULL OR location = 'Remote / Worldwide' OR location = 'UTC'").run();

const users = db.prepare('SELECT id, name FROM app_users').all();
const indianLocations = [
  'Bengaluru, Karnataka, India',
  'Mumbai, Maharashtra, India',
  'Delhi NCR, India',
  'Hyderabad, Telangana, India',
  'Pune, Maharashtra, India',
  'Chennai, Tamil Nadu, India',
  'Kolkata, West Bengal, India',
  'Ahmedabad, Gujarat, India',
  'Jaipur, Rajasthan, India'
];

users.forEach((u, i) => {
  const loc = indianLocations[i % indianLocations.length];
  db.prepare('UPDATE profiles SET location = ?, timezone = ? WHERE user_id = ?').run(loc, 'IST (UTC+5:30)', u.id);
});

console.log('Updated user profiles to India timezone and locations.');

const problems = [
  {
    title: 'Architecting High-Throughput UPI & Instant Payment Gateway Webhooks in Node.js',
    description: 'Looking to optimize double-entry ledger consistency and idempotent webhook retries for high-volume UPI transactions. Happy to teach Advanced PostgreSQL Indexing and Redis Caching architectures.',
    category_id: 1,
    required_skill_id: 19,
    offered_skill_id: 17,
    urgency: 'High',
    estimated_hours: 6
  },
  {
    title: 'GATE Computer Science & DSA: Advanced Dynamic Programming & Graph Theory',
    description: 'Preparing for GATECS / Tech Interviews at top product companies in Bengaluru. Need deep mentoring on DP on Trees and Network Flow. Offering full-stack Next.js and TypeScript training in return.',
    category_id: 2,
    required_skill_id: 6,
    offered_skill_id: 9,
    urgency: 'Medium',
    estimated_hours: 8
  },
  {
    title: 'Fine-tuning Indic Language Models (Hindi, Tamil, Telugu) with LoRA & HuggingFace',
    description: 'Collaborating on domain-adapted open-source LLMs for Indian legal and governance documents. Seeking PyTorch GPU optimization guidance. Offering comprehensive UI/UX Design System mentorship in Figma.',
    category_id: 1,
    required_skill_id: 18,
    offered_skill_id: 6,
    urgency: 'High',
    estimated_hours: 10
  },
  {
    title: 'System Design for IRCTC-Scale High-Concurrency Ticket Booking Engine',
    description: 'Looking to review distributed locking, Kafka event sourcing, and Redis rate-limiting architectures for peak tatkal-scale load. In exchange, can teach Python Automation, FastAPI, and Docker CI/CD.',
    category_id: 1,
    required_skill_id: 19,
    offered_skill_id: 9,
    urgency: 'Medium',
    estimated_hours: 6
  }
];

problems.forEach(p => {
  const exists = db.prepare('SELECT id FROM problems WHERE title = ?').get(p.title);
  if (!exists) {
    db.prepare("INSERT INTO problems (user_id, title, description, category_id, required_skill_id, offered_skill_id, urgency, estimated_hours, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', datetime('now'))").run(users[0]?.id || 'user_admin', p.title, p.description, p.category_id, p.required_skill_id, p.offered_skill_id, p.urgency, p.estimated_hours);
  }
});
console.log('Seeded India-specific Problem Challenges.');

const circles = [
  {
    name: 'Bengaluru Tech Builders: Full-Stack React & Node.js',
    description: 'Weekly peer code reviews, startup architecture discussions, and production deployments for developers in Bengaluru and across India.',
    category_id: 1,
    schedule: 'Saturdays 5:00 PM - 7:00 PM IST',
    max_members: 12,
    current_members: 8,
    meeting_link: 'https://meet.google.com/blr-tech-swap'
  },
  {
    name: 'DSA & Competitive Coding Masterminds (India)',
    description: 'Intensive LeetCode Hard, Codeforces, and System Design prep for product company interviews in India (Bengaluru, Hyderabad, Gurgaon).',
    category_id: 1,
    schedule: 'Sundays 11:00 AM - 1:00 PM IST',
    max_members: 15,
    current_members: 11,
    meeting_link: 'https://meet.google.com/dsa-india-swap'
  },
  {
    name: 'Indian Startups UI/UX & Product Design Circle',
    description: 'Design critiques, Figma token workflows, and product teardowns for mobile-first apps targeting Bharat and Tier 1/2 users.',
    category_id: 2,
    schedule: 'Wednesdays 8:00 PM - 9:30 PM IST',
    max_members: 10,
    current_members: 7,
    meeting_link: 'https://meet.google.com/design-india-swap'
  },
  {
    name: 'GATE 2026 & National Tech Placements Study Cohort',
    description: 'Collaborative peer learning cohort covering Operating Systems, DBMS, Computer Networks, and Theory of Computation.',
    category_id: 1,
    schedule: 'Tuesdays & Thursdays 7:00 PM - 8:30 PM IST',
    max_members: 20,
    current_members: 14,
    meeting_link: 'https://meet.google.com/gate-study-swap'
  }
];

circles.forEach(c => {
  const exists = db.prepare('SELECT id FROM skill_circles WHERE name = ?').get(c.name);
  if (!exists) {
    db.prepare("INSERT INTO skill_circles (name, description, category_id, creator_id, moderator_id, member_count, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')").run(c.name, c.description, c.category_id, users[0]?.id || 'user_admin', users[0]?.id || 'user_admin', c.current_members);
  }
});
console.log('Seeded India-specific Skill Circles.');
