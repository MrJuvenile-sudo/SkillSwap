-- ====================================================================
-- SkillSwapX - Master Database Schema (SQL)
-- Comprehensive Schema for Peer-to-Peer Reciprocal Barter Platform
-- Compatible with SQLite & PostgreSQL
-- ====================================================================

-- 1. User & Authentication
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'USER', -- 'USER', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'BANNED'
  avatar_url TEXT,
  headline TEXT,
  karma_score NUMERIC(3,1) DEFAULT 4.9,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Extended Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
  bio TEXT,
  location TEXT DEFAULT 'India',
  profile_image TEXT,
  experience TEXT,
  preferred_language TEXT DEFAULT 'English',
  availability TEXT DEFAULT 'Weekends & Evenings',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  weekly_hours INT DEFAULT 4,
  completion_percentage INT DEFAULT 85,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skill Taxonomies & Categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Code',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  icon TEXT DEFAULT 'Sparkles',
  popularity_score INT DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_skill_name_cat UNIQUE(name, category_id)
);

CREATE TABLE IF NOT EXISTS user_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'TEACH' or 'LEARN'
  level TEXT NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  experience_years NUMERIC(4,1) DEFAULT 1.0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_skill_type UNIQUE(user_id, skill_id, type)
);

-- 4. Barter Swap Requests & Bilateral Connections
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  teach_skill_id INT REFERENCES skills(id) ON DELETE SET NULL,
  learn_skill_id INT REFERENCES skills(id) ON DELETE SET NULL,
  message TEXT,
  proposed_availability TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  request_id INT REFERENCES requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ENDED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ
);

-- 5. Exchange Agreements & Workspaces (Escrow Protected)
CREATE TABLE IF NOT EXISTS exchange_workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
  start_date DATE DEFAULT (date('now')),
  target_date DATE,
  progress INT NOT NULL DEFAULT 0,
  user1_skill_id INT REFERENCES skills(id) ON DELETE SET NULL,
  user2_skill_id INT REFERENCES skills(id) ON DELETE SET NULL,
  escrow_status TEXT NOT NULL DEFAULT 'PLEDGED', -- 'PLEDGED', 'IN_PROGRESS', 'RELEASED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL REFERENCES app_users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO', -- 'TODO', 'IN_PROGRESS', 'COMPLETED'
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Direct Messaging & Chat
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES app_users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews, Ratings & Peer Karma
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INT NOT NULL REFERENCES exchange_workspaces(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES app_users(id),
  reviewee_id TEXT NOT NULL REFERENCES app_users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  communication_rating INT NOT NULL DEFAULT 5,
  knowledge_rating INT NOT NULL DEFAULT 5,
  reliability_rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_workspace_reviewer UNIQUE(workspace_id, reviewer_id)
);

-- 8. Notifications Center
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'REQUEST', 'ACCEPTED', 'MESSAGE', 'WORKSPACE', 'REVIEW', 'SYSTEM'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Community Posts, Circles & Problem Challenges
CREATE TABLE IF NOT EXISTS community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT, -- JSON or comma separated
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_circles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  creator_id TEXT NOT NULL REFERENCES app_users(id),
  members_count INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_needed TEXT NOT NULL,
  reward_skill TEXT,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Platform Administration & Governance Audit Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL REFERENCES app_users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
