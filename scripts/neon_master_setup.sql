-- ==============================================================================
-- SkillSwapX — Master PostgreSQL Schema & Seed Migration for Neon Database
-- Target Database: neon-champagne-cloud (or any Neon / Supabase / Cloud Postgres)
-- Instructions: Copy this ENTIRE script, paste it into your Neon '>_ Query' SQL Editor,
-- and click 'Run'. This will create all tables, indexes, and initial platform data.
-- ==============================================================================

-- 1. App Users Table
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  headline TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT true,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT true,
  portfolio_links JSONB DEFAULT '{}'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  privacy_settings JSONB DEFAULT '{"visibility":"public","allow_proposals":"all"}'::jsonb,
  notification_settings JSONB DEFAULT '{"in_app_requests":true,"in_app_messages":true,"in_app_milestones":true,"email_digest":true}'::jsonb,
  matchmaking_preferences JSONB DEFAULT '{"max_weekly_swaps":3,"timezone_flexibility":true}'::jsonb,
  bookmarked_user_ids JSONB DEFAULT '[]'::jsonb,
  hidden_user_ids JSONB DEFAULT '[]'::jsonb,
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
  bio TEXT,
  location TEXT,
  profile_image TEXT,
  experience TEXT,
  preferred_language TEXT DEFAULT 'English',
  availability TEXT,
  timezone TEXT DEFAULT 'UTC',
  weekly_hours INT DEFAULT 4,
  completion_percentage INT DEFAULT 50,
  availability_schedule JSONB DEFAULT '{"monday":["evening"],"tuesday":["evening"],"wednesday":["evening"],"thursday":["evening"],"friday":["evening"],"saturday":["morning","afternoon"],"sunday":["morning"]}'::jsonb,
  github_url TEXT,
  dribbble_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  endorsements_count INT DEFAULT 0,
  resources_shared INT NOT NULL DEFAULT 0,
  resources_downloads INT NOT NULL DEFAULT 0,
  avg_resource_rating REAL DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Code',
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  icon TEXT DEFAULT 'Sparkles',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_disabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_skill_name_cat UNIQUE(name, category_id)
);

-- 5. User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'TEACH' or 'LEARN'
  level TEXT NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  experience_years NUMERIC(4,1) DEFAULT 1.0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  sub_tags JSONB DEFAULT '[]'::jsonb,
  proof_url TEXT,
  endorsements_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_skill_type UNIQUE(user_id, skill_id, type)
);

-- 6. Swap Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id BIGSERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  teach_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  learn_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  message TEXT,
  proposed_availability TEXT,
  duration_weeks INT DEFAULT 4,
  cadence TEXT DEFAULT 'Weekly (1-2 hrs)',
  preferred_channel TEXT DEFAULT 'In-App Chat & Video',
  decline_reason TEXT,
  counter_proposal JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- 7. Connections Table
CREATE TABLE IF NOT EXISTS connections (
  id BIGSERIAL PRIMARY KEY,
  user1_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  request_id BIGINT REFERENCES requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ENDED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 8. Exchange Workspaces Table
CREATE TABLE IF NOT EXISTS exchange_workspaces (
  id BIGSERIAL PRIMARY KEY,
  connection_id BIGINT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  progress INT NOT NULL DEFAULT 0,
  user1_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  user2_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  exchange_agreement JSONB DEFAULT '{"cadence":"Weekly (1-2 hrs)","duration":"4 weeks","channel":"In-App Video","agreed_topics":"Reciprocal skill sharing"}'::jsonb,
  shared_notes TEXT DEFAULT '# Shared Workspace Notes & Agenda

- [x] Initial kickoff & roadmap agreed
- [ ] Week 1: First live session & tooling setup
- [ ] Week 2: Intermediate practical exercises
- [ ] Week 3: Capstone project review
- [ ] Week 4: Final feedback and mutual verification review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Exchange Agreements Table
CREATE TABLE IF NOT EXISTS exchange_agreements (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ACTIVE',
  terms JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Learning Goals Table
CREATE TABLE IF NOT EXISTS learning_goals (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  current_level TEXT NOT NULL DEFAULT 'Beginner',
  target_level TEXT NOT NULL DEFAULT 'Intermediate',
  goal_text TEXT,
  goal_description TEXT DEFAULT '',
  intent TEXT NOT NULL DEFAULT 'career',
  preferred_mode TEXT NOT NULL DEFAULT 'one_on_one',
  status TEXT NOT NULL DEFAULT 'PENDING',
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO', -- 'TODO', 'IN_PROGRESS', 'COMPLETED'
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  connection_id BIGINT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  communication_rating INT NOT NULL DEFAULT 5 CHECK (communication_rating >= 1 AND communication_rating <= 5),
  knowledge_rating INT NOT NULL DEFAULT 5 CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  reliability_rating INT NOT NULL DEFAULT 5 CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  comment TEXT,
  is_blind BOOLEAN NOT NULL DEFAULT false,
  revealed_at TIMESTAMPTZ DEFAULT now(),
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_workspace_reviewer UNIQUE(workspace_id, reviewer_id)
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- 16. Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Scheduled Sessions Table
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  proposer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  timezone TEXT DEFAULT 'UTC',
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Skill Endorsements Table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id BIGSERIAL PRIMARY KEY,
  user_skill_id BIGINT NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
  endorser_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  workspace_id BIGINT REFERENCES exchange_workspaces(id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_skill_endorser UNIQUE(user_skill_id, endorser_id)
);

-- 19. Community Posts & Multi-Media Feed
CREATE TABLE IF NOT EXISTS community_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  teach_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  learn_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  post_type TEXT DEFAULT 'POST',
  media_url TEXT,
  thumbnail_url TEXT,
  tags TEXT,
  likes_count INT DEFAULT 0,
  read_time TEXT DEFAULT '3 min read',
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_post_user_like UNIQUE(post_id, user_id)
);

-- 22. Problems Table (Problem-First Exchange Model)
CREATE TABLE IF NOT EXISTS problems (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  required_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  offered_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  urgency TEXT DEFAULT 'Medium',
  estimated_hours INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  proposer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  offered_skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL,
  cover_note TEXT,
  proposed_terms TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. Skill Verification Requests
CREATE TABLE IF NOT EXISTS skill_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'Intermediate',
  proof_type TEXT NOT NULL,
  proof_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  admin_notes TEXT,
  reviewed_by TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. Community Skill Circles
CREATE TABLE IF NOT EXISTS skill_circles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  creator_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  moderator_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  member_count INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 26. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. Academic Resources & Learning Hub
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'NOTES',
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  university TEXT,
  course TEXT,
  semester TEXT,
  unit_topic TEXT,
  description TEXT,
  file_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'EVERYONE',
  status TEXT NOT NULL DEFAULT 'APPROVED',
  downloads INT NOT NULL DEFAULT 0,
  quality_score REAL DEFAULT NULL,
  admin_notes TEXT,
  reviewed_by TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS key_point_entries (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'CONCEPT',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resource_reviews (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  accuracy INT NOT NULL DEFAULT 5,
  completeness INT NOT NULL DEFAULT 5,
  relevance INT NOT NULL DEFAULT 5,
  usefulness INT NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS saved_resources (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS resource_downloads (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  university TEXT,
  course TEXT,
  semester TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 28. AI Conversations & Feedback
CREATE TABLE IF NOT EXISTS ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'USER',
  content TEXT NOT NULL,
  intent TEXT,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL DEFAULT 'UP',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  resolved INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 29. Teaching Preferences & Progress
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

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_type ON user_skills(type);
CREATE INDEX IF NOT EXISTS idx_requests_sender ON requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_ws ON scheduled_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON skill_endorsements(user_skill_id);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO categories (name, description, icon, sort_order, is_featured)
VALUES 
  ('Programming & Tech', 'Web development, backend architecture, mobile apps, and systems engineering.', 'Code', 1, true),
  ('Design & Creative', 'UI/UX design, graphic design, motion graphics, and illustration.', 'Palette', 2, true),
  ('Languages & Culture', 'Foreign languages, conversational fluency, and translation.', 'Globe', 3, false),
  ('Music & Audio', 'Instruments, vocal training, sound engineering, and music production.', 'Music', 4, false),
  ('Business & Marketing', 'Growth strategy, product management, SEO, and entrepreneurship.', 'Briefcase', 5, false),
  ('Writing & Content', 'Copywriting, technical documentation, storytelling, and blogging.', 'PenTool', 6, false),
  ('Data Science & AI', 'Machine learning, SQL data analytics, and prompt engineering.', 'Cpu', 7, true),
  ('Lifestyle & Wellness', 'Photography, fitness coaching, meditation, and culinary skills.', 'Heart', 8, false)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Skills
INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Python', id, 'Core Python programming, scripting, and backend development.', 'Code', true, true FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'React', id, 'Modern frontend web development with React, hooks, and component architecture.', 'Layout', true, true FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'TypeScript', id, 'Typed JavaScript for scalable web applications.', 'FileCode', true, true FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Photoshop', id, 'Digital image editing, photo manipulation, and visual composition.', 'Image', false, false FROM categories WHERE name = 'Design & Creative'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'UI/UX Design', id, 'User research, wireframing, Figma prototyping, and design systems.', 'Figma', true, true FROM categories WHERE name = 'Design & Creative'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Figma', id, 'Collaborative interface design and interactive component prototyping.', 'Layers', true, false FROM categories WHERE name = 'Design & Creative'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Spanish', id, 'Conversational and professional Spanish language skills.', 'MessageSquare', false, false FROM categories WHERE name = 'Languages & Culture'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Japanese', id, 'Japanese vocabulary, grammar, and conversational practice.', 'MessageCircle', false, false FROM categories WHERE name = 'Languages & Culture'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Machine Learning', id, 'Applied machine learning models, scikit-learn, and deep learning basics.', 'Brain', true, true FROM categories WHERE name = 'Data Science & AI'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'SQL & Analytics', id, 'Relational queries, window functions, and data modeling.', 'Database', true, false FROM categories WHERE name = 'Data Science & AI'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Guitar', id, 'Acoustic and electric guitar techniques, chords, and music theory.', 'Radio', false, false FROM categories WHERE name = 'Music & Audio'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Audio Editing', id, 'Podcast and music production using DAWs, EQ, and mastering.', 'Mic', false, false FROM categories WHERE name = 'Music & Audio'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Photography', id, 'Manual camera controls, natural lighting, and portrait composition.', 'Camera', false, false FROM categories WHERE name = 'Lifestyle & Wellness'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Copywriting', id, 'High-converting landing page copy, email sequences, and branding.', 'Edit3', false, false FROM categories WHERE name = 'Writing & Content'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO skills (name, category_id, description, icon, is_popular, is_trending)
SELECT 'Public Speaking', id, 'Presentation confidence, storytelling, and pitch deck delivery.', 'Award', false, false FROM categories WHERE name = 'Business & Marketing'
ON CONFLICT (name, category_id) DO NOTHING;

-- 3. Insert Master System Admin User
-- Email: admin@skillswap.io | Username: admin | Password: Admin123!
INSERT INTO app_users (
  id, name, username, email, password_hash, role, status, avatar_url, headline, email_verified, onboarding_completed
) VALUES (
  'user_admin',
  'System Admin',
  'admin',
  'admin@skillswap.io',
  '8e9c0a30e97709d7b6513caea03b9022:4189ef6a298c4f9dd90ad03fa8b46998c51c19668ed8eb68d00f033447873562',
  'SUPER_ADMIN',
  'ACTIVE',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
  'SkillSwapX Super Admin & Platform Supervisor',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

INSERT INTO profiles (user_id, bio, location, experience, preferred_language, availability, timezone, weekly_hours, completion_percentage)
VALUES (
  'user_admin',
  'SkillSwapX platform administrator and community supervisor.',
  'Jabalpur Engineering College, MP',
  'Platform Engineering & Distributed Systems',
  'English, Hindi',
  'Weekdays 10:00 - 18:00 IST',
  'Asia/Kolkata (IST)',
  10,
  100
)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Demo Indian Tech Swappers (Priya Sharma & Aarav Sharma)
INSERT INTO app_users (
  id, name, username, email, password_hash, role, status, avatar_url, headline, email_verified, onboarding_completed
) VALUES (
  'user_priya_sharma',
  'Priya Sharma',
  'priya_architect',
  'priya.sharma@techindia.io',
  '8e9c0a30e97709d7b6513caea03b9022:4189ef6a298c4f9dd90ad03fa8b46998c51c19668ed8eb68d00f033447873562',
  'USER',
  'ACTIVE',
  'https://api.dicebear.com/7.x/bottts/svg?seed=priya_architect',
  'Senior Cloud Architect & Distributed Systems Specialist (Bengaluru)',
  true,
  true
), (
  'user_aarav_sharma',
  'Aarav Sharma',
  'aarav_ml',
  'aarav.sharma@example.in',
  '8e9c0a30e97709d7b6513caea03b9022:4189ef6a298c4f9dd90ad03fa8b46998c51c19668ed8eb68d00f033447873562',
  'USER',
  'ACTIVE',
  'https://api.dicebear.com/7.x/bottts/svg?seed=aarav_ml',
  'Full-Stack Developer & AI Researcher (Jabalpur)',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (user_id, bio, location, preferred_language, availability, timezone, weekly_hours, completion_percentage)
VALUES (
  'user_priya_sharma',
  'Building high-throughput payment pipelines and cloud infrastructure. Want to teach Kafka & AWS and learn advanced React 19.',
  'Bengaluru, Karnataka',
  'English, Hindi',
  'Weekends & Evenings',
  'Asia/Kolkata (IST)',
  6,
  95
), (
  'user_aarav_sharma',
  'MCA student at Jabalpur Engineering College building peer learning algorithms. Teaching Python & FastApi, learning Next.js.',
  'Jabalpur, Madhya Pradesh',
  'Hindi, English',
  'Evenings 6-9 PM IST',
  'Asia/Kolkata (IST)',
  8,
  90
)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Seed Skills for Priya and Aarav
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_priya_sharma', s.id, 'TEACH', 'Expert', 5.0, true, 'Microservices, Docker, Kubernetes, and high availability system design.'
FROM skills s WHERE s.name = 'Python'
ON CONFLICT (user_id, skill_id, type) DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_priya_sharma', s.id, 'LEARN', 'Intermediate', 1.0, false, 'Looking to master component memoization and state hydration.'
FROM skills s WHERE s.name = 'React'
ON CONFLICT (user_id, skill_id, type) DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_aarav_sharma', s.id, 'TEACH', 'Advanced', 3.0, true, 'Building React webapps, hooks, state management, and full-stack integration.'
FROM skills s WHERE s.name = 'React'
ON CONFLICT (user_id, skill_id, type) DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_aarav_sharma', s.id, 'LEARN', 'Beginner', 0.5, false, 'Eager to learn high-scale database query optimization and indexing.'
FROM skills s WHERE s.name = 'SQL & Analytics'
ON CONFLICT (user_id, skill_id, type) DO NOTHING;

-- 6. Initial Community Feed Post
INSERT INTO community_posts (user_id, title, content, post_type, tags, likes_count, read_time)
VALUES (
  'user_admin',
  'Welcome to SkillSwapX — The Peer-to-Peer Knowledge Exchange Network!',
  'We are thrilled to launch SkillSwapX at Jabalpur Engineering College! List skills you want to teach, discover skills you wish to learn, and collaborate in real-time with shared notes, live code runners, and interactive whiteboards.',
  'POST',
  '#Welcome,#SkillSwapX,#MCA,#JEC,#PeerLearning',
  12,
  '2 min read'
);
