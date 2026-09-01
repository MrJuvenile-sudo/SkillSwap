-- Migration 0004: Learning Hub + SkillSwap AI Schema

-- 1. Resources table (peer-shared academic resources)
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'NOTES',
  -- NOTES, ASSIGNMENT, KEY_POINTS, PYQ, LAB, QUESTION_BANK, EXAM_PREP, PROJECT, PRESENTATION
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  university TEXT,
  course TEXT,
  semester TEXT,
  unit_topic TEXT,
  description TEXT,
  file_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'EVERYONE',
  -- EVERYONE, UNIVERSITY, COURSE, DEPARTMENT, CONNECTIONS
  status TEXT NOT NULL DEFAULT 'PENDING',
  -- PENDING, APPROVED, REJECTED, REPORTED
  downloads INT NOT NULL DEFAULT 0,
  quality_score REAL DEFAULT NULL,
  admin_notes TEXT,
  reviewed_by TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Key-Point Note Entries (structured editor content)
CREATE TABLE IF NOT EXISTS key_point_entries (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'CONCEPT',
  -- CONCEPT, QUESTION, DEFINITION, DIAGRAM_NOTE
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0
);

-- 3. Resource quality reviews
CREATE TABLE IF NOT EXISTS resource_reviews (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  accuracy INT NOT NULL DEFAULT 3,
  completeness INT NOT NULL DEFAULT 3,
  relevance INT NOT NULL DEFAULT 3,
  usefulness INT NOT NULL DEFAULT 3,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_id, reviewer_id)
);

-- 4. Saved resources (bookmarks)
CREATE TABLE IF NOT EXISTS saved_resources (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- 5. Resource download history
CREATE TABLE IF NOT EXISTS resource_downloads (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Resource requests (users requesting specific content)
CREATE TABLE IF NOT EXISTS resource_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  university TEXT,
  course TEXT,
  semester TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  -- OPEN, FULFILLED, CLOSED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Extend profiles with resource contributor stats
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resources_shared INT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resources_downloads INT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_resource_rating REAL DEFAULT NULL;

-- 8. AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'USER',
  -- USER, ASSISTANT
  content TEXT NOT NULL,
  intent TEXT,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AI Feedback on messages
CREATE TABLE IF NOT EXISTS ai_feedback (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL DEFAULT 'UP',
  -- UP, DOWN
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- 11. AI Usage tracking (for analytics)
CREATE TABLE IF NOT EXISTS ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. AI Platform Settings (extends platform_settings)
INSERT INTO platform_settings (key, value, updated_at)
VALUES
  ('ai_enabled', 'true', now()),
  ('ai_response_length', 'concise', now()),
  ('ai_resource_search', 'true', now()),
  ('ai_profile_access', 'true', now()),
  ('ai_matching_explanations', 'true', now())
ON CONFLICT (key) DO NOTHING;
