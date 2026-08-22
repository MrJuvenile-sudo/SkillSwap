-- Migration 0002: Extended Schema for Real Auth, Public Profiles, Scheduling, Endorsements & Settings

-- 1. Extend app_users table
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS portfolio_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"visibility":"public","allow_proposals":"all"}'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"in_app_requests":true,"in_app_messages":true,"in_app_milestones":true,"email_digest":true}'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS matchmaking_preferences JSONB DEFAULT '{"max_weekly_swaps":3,"timezone_flexibility":true}'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS bookmarked_user_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS hidden_user_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light';

-- Add unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_users_username ON app_users(LOWER(username)) WHERE username IS NOT NULL;

-- 2. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{"monday":["evening"],"tuesday":["evening"],"wednesday":["evening"],"thursday":["evening"],"friday":["evening"],"saturday":["morning","afternoon"],"sunday":["morning"]}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dribbble_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS endorsements_count INT DEFAULT 0;

-- 3. Extend user_skills table
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS sub_tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS endorsements_count INT DEFAULT 0;

-- 4. Extend requests table with proposal details & counter-proposals
ALTER TABLE requests ADD COLUMN IF NOT EXISTS duration_weeks INT DEFAULT 4;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS cadence TEXT DEFAULT 'Weekly (1-2 hrs)';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'In-App Chat & Video';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS counter_proposal JSONB;

-- 5. Extend exchange_workspaces table with active session hub & exchange agreement
ALTER TABLE exchange_workspaces ADD COLUMN IF NOT EXISTS exchange_agreement JSONB DEFAULT '{"cadence":"Weekly (1-2 hrs)","duration":"4 weeks","channel":"In-App Video","agreed_topics":"Reciprocal skill sharing"}'::jsonb;
ALTER TABLE exchange_workspaces ADD COLUMN IF NOT EXISTS shared_notes TEXT DEFAULT '# Shared Workspace Notes & Agenda\n\n- [x] Initial kickoff & roadmap agreed\n- [ ] Week 1: First live session & tooling setup\n- [ ] Week 2: Intermediate practical exercises\n- [ ] Week 3: Capstone project review\n- [ ] Week 4: Final feedback and mutual verification review';

-- 6. Scheduled Sessions table
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  proposer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  timezone TEXT DEFAULT 'UTC',
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_ws ON scheduled_sessions(workspace_id);

-- 7. Skill Endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id BIGSERIAL PRIMARY KEY,
  user_skill_id BIGINT NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
  endorser_id TEXT NOT NULL,
  workspace_id BIGINT REFERENCES exchange_workspaces(id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_skill_endorser UNIQUE(user_skill_id, endorser_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON skill_endorsements(user_skill_id);

-- 8. Two-Way Blind Reviews support
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_blind BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ DEFAULT now();

-- 9. Backfill usernames for demo users
UPDATE app_users SET username = 'alice' WHERE id = 'user_alice' AND username IS NULL;
UPDATE app_users SET username = 'bob' WHERE id = 'user_bob' AND username IS NULL;
UPDATE app_users SET username = 'carol' WHERE id = 'user_carol' AND username IS NULL;
UPDATE app_users SET username = 'david' WHERE id = 'user_david' AND username IS NULL;
UPDATE app_users SET username = 'elena' WHERE id = 'user_elena' AND username IS NULL;
UPDATE app_users SET username = 'frank' WHERE id = 'user_frank' AND username IS NULL;
UPDATE app_users SET username = 'admin' WHERE id = 'user_admin' AND username IS NULL;