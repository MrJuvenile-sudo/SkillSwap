-- Seed Master Catalog & System Admin for SkillSwap

-- 1. Insert Categories
INSERT INTO categories (name, description, icon, sort_order)
VALUES 
  ('Programming & Tech', 'Web development, backend architecture, mobile apps, and systems engineering.', 'Code', 1),
  ('Design & Creative', 'UI/UX design, graphic design, motion graphics, and illustration.', 'Palette', 2),
  ('Languages & Culture', 'Foreign languages, conversational fluency, and translation.', 'Globe', 3),
  ('Music & Audio', 'Instruments, vocal training, sound engineering, and music production.', 'Music', 4),
  ('Business & Marketing', 'Growth strategy, product management, SEO, and entrepreneurship.', 'Briefcase', 5),
  ('Writing & Content', 'Copywriting, technical documentation, storytelling, and blogging.', 'PenTool', 6),
  ('Data Science & AI', 'Machine learning, SQL data analytics, and prompt engineering.', 'Cpu', 7),
  ('Lifestyle & Wellness', 'Photography, fitness coaching, meditation, and culinary skills.', 'Heart', 8)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Master Skills Catalog
INSERT INTO skills (name, category_id, description, icon)
SELECT 'Python', id, 'Core Python programming, scripting, and backend development.', 'Code' FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'React', id, 'Modern frontend web development with React, hooks, and component architecture.', 'Layout' FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'TypeScript', id, 'Typed JavaScript for scalable web applications.', 'FileCode' FROM categories WHERE name = 'Programming & Tech'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Photoshop', id, 'Digital image editing, photo manipulation, and visual composition.', 'Image' FROM categories WHERE name = 'Design & Creative'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'UI/UX Design', id, 'User research, wireframing, Figma prototyping, and design systems.', 'Figma' FROM categories WHERE name = 'Design & Creative'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Figma', id, 'Collaborative interface design and interactive component prototyping.', 'Layers' FROM categories WHERE name = 'Design & Creative'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Spanish', id, 'Conversational and professional Spanish language skills.', 'MessageSquare' FROM categories WHERE name = 'Languages & Culture'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Japanese', id, 'Japanese vocabulary, grammar, and conversational practice.', 'MessageCircle' FROM categories WHERE name = 'Languages & Culture'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Machine Learning', id, 'Applied machine learning models, scikit-learn, and deep learning basics.', 'Brain' FROM categories WHERE name = 'Data Science & AI'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'SQL & Analytics', id, 'Relational queries, window functions, and data modeling.', 'Database' FROM categories WHERE name = 'Data Science & AI'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Guitar', id, 'Acoustic and electric guitar techniques, chords, and music theory.', 'Radio' FROM categories WHERE name = 'Music & Audio'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Audio Editing', id, 'Podcast and music production using DAWs, EQ, and mastering.', 'Mic' FROM categories WHERE name = 'Music & Audio'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Photography', id, 'Manual camera controls, natural lighting, and portrait composition.', 'Camera' FROM categories WHERE name = 'Lifestyle & Wellness'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Copywriting', id, 'High-converting landing page copy, email sequences, and branding.', 'Edit3' FROM categories WHERE name = 'Writing & Content'
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category_id, description, icon)
SELECT 'Public Speaking', id, 'Presentation confidence, storytelling, and pitch deck delivery.', 'Award' FROM categories WHERE name = 'Business & Marketing'
ON CONFLICT DO NOTHING;

-- 3. Single System Admin User
-- Email: admin@skillswap.io | Username: admin | Password: Admin123!
INSERT INTO app_users (id, name, username, email, password_hash, role, status, headline, onboarding_completed)
VALUES (
  'user_admin',
  'System Admin',
  'admin',
  'admin@skillswap.io',
  '8e9c0a30e97709d7b6513caea03b9022:4189ef6a298c4f9dd90ad03fa8b46998c51c19668ed8eb68d00f033447873562',
  'SUPER_ADMIN',
  'ACTIVE',
  'SkillSwapX Super Admin & Platform Supervisor',
  1
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 4. Admin Profile
INSERT INTO profiles (user_id, bio, location, experience, preferred_language, availability, timezone, weekly_hours, completion_percentage)
VALUES (
  'user_admin',
  'SkillSwapX platform administrator and community supervisor.',
  'System Office',
  'Platform Management',
  'English',
  'Business Hours',
  'PST (UTC-8)',
  10,
  100
)
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  availability = EXCLUDED.availability;
