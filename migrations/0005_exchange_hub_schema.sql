-- Migration 0005: Exchange Hub Schema (learning_goals, teaching_preferences, learning_progress)

-- 1. Learning Goals (create or extend)
CREATE TABLE IF NOT EXISTS learning_goals (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT REFERENCES skills(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL DEFAULT 'Beginner',
  target_level TEXT NOT NULL DEFAULT 'Intermediate',
  goal_text TEXT,
  intent TEXT NOT NULL DEFAULT 'career',
  status TEXT NOT NULL DEFAULT 'active',
  preferred_mode TEXT NOT NULL DEFAULT 'one_on_one',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS current_level TEXT DEFAULT 'Beginner';
ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS target_level TEXT DEFAULT 'Intermediate';
ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS goal_text TEXT;
ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'career';
ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS preferred_mode TEXT DEFAULT 'one_on_one';
ALTER TABLE learning_goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Teaching Preferences (extends user skill teaching parameters)
CREATE TABLE IF NOT EXISTS teaching_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level_can_teach TEXT NOT NULL DEFAULT 'Intermediate',
  format TEXT NOT NULL DEFAULT 'online',
  availability TEXT NOT NULL DEFAULT 'Flexible',
  session_length_preference TEXT NOT NULL DEFAULT '1 hour',
  teaching_style TEXT NOT NULL DEFAULT 'mentoring',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- 3. Learning Progress (checklists & session milestones)
CREATE TABLE IF NOT EXISTS learning_progress (
  id BIGSERIAL PRIMARY KEY,
  learning_goal_id BIGINT NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
  agreement_id BIGINT REFERENCES exchange_agreements(id) ON DELETE SET NULL,
  sessions_completed INT NOT NULL DEFAULT 0,
  sessions_total INT NOT NULL DEFAULT 4,
  subskills_json TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
