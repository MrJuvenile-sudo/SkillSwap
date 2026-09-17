// scratch/seed_admin_live_data.mjs
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('d:/Mine/SkillSwapX-main/SkillSwapX-main/skillswap.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding live admin telemetry data into:', dbPath);

// 1. Seed Reports if empty
const repCount = db.prepare('SELECT COUNT(*) as c FROM reports').get();
if (Number(repCount.c) === 0) {
  console.log('Seeding sample reports...');
  const insertRep = db.prepare(`
    INSERT INTO reports (reporter_id, reported_user_id, reason, details, status, created_at, resolved_at, resolution_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRep.run(
    'user_shubhank_parihar',
    'user_mtps69ho_ah1x8',
    'Unresponsive during agreed exchange',
    'Agreed to trade Python for SQL concepts, but missed two scheduled sessions without notice.',
    'OPEN',
    new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    null,
    null
  );
  insertRep.run(
    'user_priya_sharma',
    'user_mtps69ho_ah1x8',
    'Suspicious skill level claims',
    'Claimed Senior level in Kubernetes but unable to explain container fundamentals during initial review.',
    'OPEN',
    new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    null,
    null
  );
  insertRep.run(
    'user_anushka_patel',
    'user_shubhank_parihar',
    'Duplicate skill tags test',
    'Tested skill tagging report functionality.',
    'RESOLVED',
    new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    'Verified resolved by moderator'
  );
}

// 2. Seed Skill Verifications if empty
const verifCount = db.prepare('SELECT COUNT(*) as c FROM skill_verifications').get();
if (Number(verifCount.c) === 0) {
  console.log('Seeding sample skill verifications...');
  const pySkill = db.prepare("SELECT id FROM skills WHERE name LIKE '%Python%' LIMIT 1").get();
  const figmaSkill = db.prepare("SELECT id FROM skills WHERE name LIKE '%Figma%' OR name LIKE '%UI%' LIMIT 1").get();
  const cloudSkill = db.prepare("SELECT id FROM skills WHERE name LIKE '%Cloud%' OR name LIKE '%AWS%' OR name LIKE '%DevOps%' OR name LIKE '%GraphQL%' LIMIT 1").get();

  const pyId = pySkill?.id || 16;
  const figmaId = figmaSkill?.id || 6;
  const cloudId = cloudSkill?.id || 12;

  const insertVerif = db.prepare(`
    INSERT INTO skill_verifications (user_id, skill_id, level, proof_type, proof_url, notes, status, admin_notes, reviewed_by, reviewed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVerif.run(
    'user_shubhank_parihar',
    pyId,
    'ADVANCED',
    'GITHUB_REPO',
    'https://github.com/shubhank/cloud-portfolio',
    'Built production microservice architectures at Jabalpur Engineering College.',
    'PENDING',
    null,
    null,
    null,
    new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  );

  insertVerif.run(
    'user_anushka_patel',
    figmaId,
    'EXPERT',
    'PORTFOLIO_LINK',
    'https://www.behance.net/anushka_jec',
    'Lead designer for 5+ college technical fests and open-source design systems.',
    'PENDING',
    null,
    null,
    null,
    new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  );

  insertVerif.run(
    'user_priya_sharma',
    cloudId,
    'EXPERT',
    'CERTIFICATION',
    'https://aws.amazon.com/verification/architect',
    'AWS Solutions Architect Professional certified with 8+ years industry experience.',
    'APPROVED',
    'Verified via AWS Credly digital badge verification ID.',
    'user_admin',
    new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  );
}

// 3. Seed Proposals if empty
const propCount = db.prepare('SELECT COUNT(*) as c FROM proposals').get();
if (Number(propCount.c) === 0) {
  console.log('Seeding sample proposals...');
  const problems = db.prepare('SELECT id, user_id FROM problems LIMIT 3').all();
  const skills = db.prepare('SELECT id FROM skills LIMIT 3').all();

  if (problems.length > 0 && skills.length > 0) {
    const insertProp = db.prepare(`
      INSERT INTO proposals (problem_id, proposer_id, offered_skill_id, cover_note, proposed_terms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProp.run(
      problems[0].id,
      'user_priya_sharma',
      skills[0].id,
      'I can help architect your distributed backend with Kafka & Redis.',
      '2 sessions per week, 1 hour each',
      'PENDING',
      new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    );

    insertProp.run(
      problems[1]?.id || problems[0].id,
      'user_anushka_patel',
      skills[1]?.id || skills[0].id,
      'I can review your UX wireframes and provide a Figma component system.',
      'Exchange for Python API tutoring',
      'ACCEPTED',
      new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    );
  }
}

// 4. Seed Requests if empty
const reqCount = db.prepare('SELECT COUNT(*) as c FROM requests').get();
if (Number(reqCount.c) === 0) {
  console.log('Seeding sample requests...');
  const skills = db.prepare('SELECT id FROM skills LIMIT 2').all();
  const insertReq = db.prepare(`
    INSERT INTO requests (sender_id, receiver_id, teach_skill_id, learn_skill_id, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReq.run(
    'user_shubhank_parihar',
    'user_priya_sharma',
    skills[0]?.id || 6,
    skills[1]?.id || 16,
    'Would love to swap Node.js system architecture for AWS Cloud mentorship!',
    'PENDING',
    new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  );

  insertReq.run(
    'user_anushka_patel',
    'user_shubhank_parihar',
    skills[1]?.id || 16,
    skills[0]?.id || 6,
    'Let us swap Figma design tokens for React clean architecture!',
    'ACCEPTED',
    new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  );
}

// 5. Seed Reviews if count <= 1
const revCount = db.prepare('SELECT COUNT(*) as c FROM reviews').get();
if (Number(revCount.c) <= 1) {
  console.log('Seeding sample reviews...');
  const ws = db.prepare('SELECT id FROM exchange_workspaces LIMIT 1').get();
  const wsId = ws?.id || 1;

  const insertRev = db.prepare(`
    INSERT INTO reviews (workspace_id, reviewer_id, reviewee_id, rating, communication_rating, knowledge_rating, reliability_rating, comment, created_at, is_blind)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRev.run(
    wsId,
    'user_shubhank_parihar',
    'user_priya_sharma',
    5, 5, 5, 5,
    'Exceptional mentor! Explained distributed caching and Redis read-replicas with extreme clarity. Highly recommended.',
    new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    0
  );

  insertRev.run(
    wsId,
    'user_priya_sharma',
    'user_shubhank_parihar',
    5, 5, 5, 5,
    'Shubhank is a brilliant full-stack engineer from JEC. His Node.js architecture and clean code principles are top-tier.',
    new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    0
  );

  insertRev.run(
    wsId,
    'user_anushka_patel',
    'user_shubhank_parihar',
    5, 5, 5, 5,
    'Great collaboration on the UI system and component taxonomy.',
    new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    0
  );
}

console.log('✓ Seeding complete! Database counts:');
console.log('Reports:', db.prepare('SELECT COUNT(*) as c FROM reports').get().c);
console.log('Verifications:', db.prepare('SELECT COUNT(*) as c FROM skill_verifications').get().c);
console.log('Proposals:', db.prepare('SELECT COUNT(*) as c FROM proposals').get().c);
console.log('Requests:', db.prepare('SELECT COUNT(*) as c FROM requests').get().c);
console.log('Reviews:', db.prepare('SELECT COUNT(*) as c FROM reviews').get().c);
