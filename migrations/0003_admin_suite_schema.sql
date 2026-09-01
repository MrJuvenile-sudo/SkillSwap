-- Migration 0003: Full Problem Exchange, Skill Verifications, Community Circles, and Platform Settings

-- 1. Extend skills table with admin metadata
ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

-- 2. Extend categories table with featured flags
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 3. Problems table (Real-world Problem Exchange Model)
CREATE TABLE IF NOT EXISTS problems (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  required_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  offered_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  urgency TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
  estimated_hours INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Proposals table (Proposals submitted against Problems)
CREATE TABLE IF NOT EXISTS proposals (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  proposer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  offered_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  cover_note TEXT,
  proposed_terms TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Skill Verification Requests Queue
CREATE TABLE IF NOT EXISTS skill_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'Intermediate',
  proof_type TEXT NOT NULL, -- 'GITHUB', 'PORTFOLIO', 'CERTIFICATE', 'WORK_SAMPLE'
  proof_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'MORE_PROOF_REQUESTED'
  admin_notes TEXT,
  reviewed_by TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Community Skill Circles / Groups
CREATE TABLE IF NOT EXISTS skill_circles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  creator_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  moderator_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  member_count INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING_APPROVAL', 'ARCHIVED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Platform Configuration Key-Value Store
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Extend reviews table with moderation flags
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flag_reason TEXT;
