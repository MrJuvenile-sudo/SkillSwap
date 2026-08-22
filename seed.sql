-- Seed Data for SkillSwap

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

-- 2. Insert Skills
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

-- 3. Insert Demo Users
INSERT INTO app_users (id, name, email, role, status, avatar_url, headline)
VALUES
  ('user_alice', 'Alice Chen', 'alice@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', 'Senior Software Engineer | Passionate Python & React Mentor'),
  ('user_bob', 'Bob Martinez', 'bob@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', 'Lead Brand & UI/UX Designer | Adobe Certified Photoshop Expert'),
  ('user_carol', 'Carol Vance', 'carol@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', 'Applied AI Researcher & SQL Data Architect'),
  ('user_david', 'David Kim', 'david@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', 'Polyglot Language Coach & Public Speaking Mentor'),
  ('user_elena', 'Elena Rostova', 'elena@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces', 'Session Guitarist & Independent Music Producer'),
  ('user_frank', 'Frank Miller', 'frank@skillswap.io', 'USER', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces', 'Commercial Photographer & Conversion Copywriter'),
  ('user_admin', 'Sarah Connor (Admin)', 'admin@skillswap.io', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces', 'SkillSwap Trust & Safety Administrator')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  headline = EXCLUDED.headline;

-- 4. Profiles
INSERT INTO profiles (user_id, bio, location, profile_image, experience, preferred_language, availability, timezone, weekly_hours, completion_percentage)
VALUES
  ('user_alice', 'Software engineer with 7+ years in full-stack web and backend architecture. I love turning complex logic into clean code. Looking to master digital art and interface design!', 'San Francisco, CA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', '7 years in tech, mentor for code bootcamps', 'English, Mandarin', 'Weekday Evenings & Saturday Mornings', 'PST (UTC-8)', 4, 100),
  ('user_bob', 'Award-winning visual designer and Photoshop master. I design digital products by day and want to understand code to build my own indie SaaS projects.', 'Austin, TX', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', '8 years in agency and brand design', 'English, Spanish', 'Weekday Evenings & Weekends', 'CST (UTC-6)', 5, 100),
  ('user_carol', 'Data scientist building predictive analytics models. I want to improve my spoken Spanish for international conferences and enhance my stage presence.', 'Seattle, WA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', '5 years in data science & machine learning', 'English', 'Weekend Mornings & Thursdays', 'PST (UTC-8)', 3, 95),
  ('user_david', 'Passionate language coach and speech educator. Ready to dive into database querying and data analytics to measure learning outcomes.', 'New York, NY', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', '10 years language pedagogy', 'English, Spanish, Japanese', 'Flexible Evenings', 'EST (UTC-5)', 6, 95),
  ('user_elena', 'Fingerstyle acoustic guitarist and sound designer. Eager to master photography lighting to shoot my own album covers and write compelling newsletter copy.', 'London, UK', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces', '9 years professional musician', 'English, Russian', 'Weekdays 2pm - 6pm UTC', 'GMT (UTC+0)', 4, 90),
  ('user_frank', 'Editorial and portrait photographer. Wanting to learn guitar chords and basic audio mastering to score my video reels.', 'Chicago, IL', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces', '6 years commercial photography', 'English', 'Evenings & Weekends', 'CST (UTC-6)', 4, 90),
  ('user_admin', 'SkillSwap platform administrator and community supervisor.', 'San Francisco, CA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces', 'Platform operations', 'English', 'Business Hours', 'PST (UTC-8)', 10, 100)
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  availability = EXCLUDED.availability,
  completion_percentage = EXCLUDED.completion_percentage;

-- 5. User Skills (Carefully mapped for reciprocal matches!)
-- Alice: TEACH Python, React | LEARN Photoshop, UI/UX Design
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_alice', id, 'TEACH', 'Expert', 6.0, true, 'Building backend microservices, async APIs, and algorithms.' FROM skills WHERE name = 'Python'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_alice', id, 'TEACH', 'Advanced', 4.5, true, 'Custom hooks, state management, and modern component design.' FROM skills WHERE name = 'React'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_alice', id, 'LEARN', 'Beginner', 0.5, false, 'Wants to master photo retouching, masks, and graphic assets.' FROM skills WHERE name = 'Photoshop'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_alice', id, 'LEARN', 'Beginner', 0.0, false, 'Goal: Design intuitive SaaS interfaces and wireframes in Figma.' FROM skills WHERE name = 'UI/UX Design'
ON CONFLICT DO NOTHING;

-- Bob: TEACH Photoshop, UI/UX Design | LEARN Python, React
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_bob', id, 'TEACH', 'Expert', 8.0, true, 'Layers, composite art, color grading, and commercial assets.' FROM skills WHERE name = 'Photoshop'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_bob', id, 'TEACH', 'Advanced', 5.5, true, 'Figma prototypes, design systems, usability heuristics.' FROM skills WHERE name = 'UI/UX Design'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_bob', id, 'LEARN', 'Beginner', 0.2, false, 'Wants to write automation scripts and web backend APIs.' FROM skills WHERE name = 'Python'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_bob', id, 'LEARN', 'Beginner', 0.4, false, 'Wants to build interactive web apps for design prototypes.' FROM skills WHERE name = 'React'
ON CONFLICT DO NOTHING;

-- Carol: TEACH Machine Learning, SQL | LEARN Spanish, Public Speaking
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_carol', id, 'TEACH', 'Advanced', 4.5, true, 'Data classification, embeddings, model evaluation.' FROM skills WHERE name = 'Machine Learning'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_carol', id, 'TEACH', 'Expert', 6.0, true, 'Complex joins, indexing strategies, analytical aggregations.' FROM skills WHERE name = 'SQL & Analytics'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_carol', id, 'LEARN', 'Beginner', 0.5, false, 'Conversational fluency and travel dialogue.' FROM skills WHERE name = 'Spanish'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_carol', id, 'LEARN', 'Intermediate', 1.0, false, 'Keynote delivery and reducing presentation anxiety.' FROM skills WHERE name = 'Public Speaking'
ON CONFLICT DO NOTHING;

-- David: TEACH Spanish, Public Speaking | LEARN SQL & Analytics, Machine Learning
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_david', id, 'TEACH', 'Expert', 9.0, true, 'Grammar, accent reduction, and business Spanish.' FROM skills WHERE name = 'Spanish'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_david', id, 'TEACH', 'Expert', 7.0, true, 'Vocal pacing, audience engagement, pitch delivery.' FROM skills WHERE name = 'Public Speaking'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_david', id, 'LEARN', 'Beginner', 0.0, false, 'Understand student databases and query course logs.' FROM skills WHERE name = 'SQL & Analytics'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_david', id, 'LEARN', 'Beginner', 0.0, false, 'Curious about how modern AI & LLMs process text.' FROM skills WHERE name = 'Machine Learning'
ON CONFLICT DO NOTHING;

-- Elena: TEACH Guitar, Audio Editing | LEARN Photography, Copywriting
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_elena', id, 'TEACH', 'Expert', 9.0, true, 'Acoustic fingerpicking, chord progressions, and ear training.' FROM skills WHERE name = 'Guitar'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_elena', id, 'TEACH', 'Advanced', 5.0, true, 'Vocal cleaning, compression, reverb, and mastering.' FROM skills WHERE name = 'Audio Editing'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_elena', id, 'LEARN', 'Beginner', 0.0, false, 'Wants to shoot professional album artwork and live shows.' FROM skills WHERE name = 'Photography'
ON CONFLICT DO NOTHING;

-- Frank: TEACH Photography, Copywriting | LEARN Guitar, Audio Editing
INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_frank', id, 'TEACH', 'Expert', 6.5, true, 'Portrait photography, shutter speed, light framing.' FROM skills WHERE name = 'Photography'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_frank', id, 'TEACH', 'Advanced', 4.0, true, 'Engaging storytelling, newsletter copy, hook formulation.' FROM skills WHERE name = 'Copywriting'
ON CONFLICT DO NOTHING;

INSERT INTO user_skills (user_id, skill_id, type, level, experience_years, is_verified, description)
SELECT 'user_frank', id, 'LEARN', 'Beginner', 0.2, false, 'Wants to play folk guitar melodies around the campfire.' FROM skills WHERE name = 'Guitar'
ON CONFLICT DO NOTHING;

-- 6. Demo Connection & Active Exchange Workspace (Alice & Bob)
INSERT INTO requests (id, sender_id, receiver_id, status, message, created_at, responded_at)
VALUES (
  101, 'user_alice', 'user_bob', 'ACCEPTED', 
  'Hi Bob! I would love to teach you Python and backend APIs in exchange for Photoshop and UI/UX design lessons. Our evening schedules match nicely!',
  now() - INTERVAL '7 days', now() - INTERVAL '6 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO connections (id, user1_id, user2_id, request_id, status, created_at)
VALUES (201, 'user_alice', 'user_bob', 101, 'ACTIVE', now() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exchange_workspaces (id, connection_id, title, description, status, start_date, target_date, progress)
VALUES (
  301, 201, 'Python Web APIs ⇄ Photoshop & Figma Mastery', 
  'Bi-weekly exchange session. Alice mentors Bob on Python Flask/FastAPI basics; Bob mentors Alice on Photoshop retouching and Figma auto-layout.',
  'ACTIVE', CURRENT_DATE - 6, CURRENT_DATE + 24, 45
) ON CONFLICT (id) DO NOTHING;

-- Learning goals
INSERT INTO learning_goals (workspace_id, user_id, goal_description, status)
VALUES
  (301, 'user_bob', 'Understand Python variables, functions, and build a simple REST API endpoint.', 'DONE'),
  (301, 'user_bob', 'Connect a Python script to a PostgreSQL database to query records.', 'IN_PROGRESS'),
  (301, 'user_alice', 'Master Photoshop pen tool, layer masks, and non-destructive adjustments.', 'DONE'),
  (301, 'user_alice', 'Build a responsive SaaS dashboard component in Figma with components & variants.', 'IN_PROGRESS')
ON CONFLICT DO NOTHING;

-- Workspace tasks
INSERT INTO tasks (workspace_id, assigned_to, title, description, status, due_date)
VALUES
  (301, 'user_bob', 'Build Python CLI currency converter', 'Practice basic loops, conditionals, and math operations.', 'COMPLETED', CURRENT_DATE - 2),
  (301, 'user_bob', 'Implement JSON endpoint for products catalog', 'Set up simple FastAPI route returning dictionary data.', 'IN_PROGRESS', CURRENT_DATE + 3),
  (301, 'user_alice', 'Design hero banner in Photoshop with clipping mask', 'Create a 1200x600 banner with composite background and typography.', 'COMPLETED', CURRENT_DATE - 3),
  (301, 'user_alice', 'Create Figma interactive button matrix', 'Set up Primary, Secondary, and Ghost variants with hover states.', 'IN_PROGRESS', CURRENT_DATE + 4)
ON CONFLICT DO NOTHING;

-- Chat messages between Alice & Bob
INSERT INTO messages (connection_id, sender_id, message, is_read, created_at)
VALUES
  (201, 'user_alice', 'Hey Bob! Super excited for our skill exchange. Did you get a chance to install Python 3.12?', true, now() - INTERVAL '5 days'),
  (201, 'user_bob', 'Yes! Got it installed with VS Code. I also put together a 3-step Photoshop tutorial for our first lesson on Thursday.', true, now() - INTERVAL '5 days' + INTERVAL '30 minutes'),
  (201, 'user_alice', 'Awesome! That pen tool tutorial was super clear. I uploaded the starter repo for your FastAPI task in the workspace.', true, now() - INTERVAL '2 days'),
  (201, 'user_bob', 'Checking it out right now! Let me know if you want to hop on a voice call tomorrow at 7pm CST.', false, now() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Sample Reviews
INSERT INTO reviews (workspace_id, reviewer_id, reviewee_id, rating, communication_rating, knowledge_rating, reliability_rating, comment, created_at)
VALUES
  (301, 'user_alice', 'user_bob', 5, 5, 5, 5, 'Bob is a phenomenal design mentor! He explained layer blending and typography hierarchy with incredible patience. Highly recommend exchanging with him.', now() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
VALUES
  ('user_alice', 'MESSAGE', 'New message from Bob Martinez', 'Checking it out right now! Let me know if you want to hop on a voice call...', '/chat?connection=201', false, now() - INTERVAL '3 hours'),
  ('user_alice', 'WORKSPACE', 'Task Completed by Bob', 'Bob marked "Build Python CLI currency converter" as Completed.', '/workspaces/301', false, now() - INTERVAL '2 days'),
  ('user_bob', 'ACCEPTED', 'Exchange Request Accepted!', 'Alice Chen accepted your skill swap request. Your shared workspace is ready.', '/workspaces/301', true, now() - INTERVAL '6 days')
ON CONFLICT DO NOTHING;

-- Sample Reports for Admin
INSERT INTO reports (reporter_id, reported_user_id, reason, details, status, created_at)
VALUES
  ('user_carol', 'user_frank', 'Inappropriate profile image placeholder', 'Reported profile image was low quality and unverified.', 'OPEN', now() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;