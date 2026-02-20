-- Portfolio OS v1.0.0 — Production Schema
-- Combined Master Script
-- This script initializes the entire database for Portfolio OS Stealth Edition.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE PORTFOLIO TABLES
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    role TEXT,
    repo_url TEXT,
    live_url TEXT,
    start_date DATE,
    end_date DATE,
    is_featured BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT NOT NULL,
    skills_used TEXT[] DEFAULT '{}',
    location TEXT,
    type TEXT CHECK (type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    grade TEXT,
    activities TEXT,
    description TEXT, -- Added for schema completeness
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    items TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    organization TEXT,
    date DATE NOT NULL,
    description TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS socials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    version_number INT NOT NULL,
    file_url TEXT NOT NULL,
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    email TEXT,
    location TEXT,
    avatar_url TEXT,
    website_url TEXT,
    custom_css JSONB,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. ANALYTICS TABLES
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_name TEXT,
    mode TEXT CHECK (mode IN ('cli', 'gui')),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    page_views INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS command_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    ip_address TEXT,
    details JSONB,
    admin_username TEXT,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cv_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version_number SERIAL,
    data JSONB NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT now(),
    applied_by TEXT
);

-- 4. CONFIG TABLES
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_name TEXT DEFAULT 'MIMANSH',
    background_name_text TEXT DEFAULT 'MIMANSH',
    matrix_enabled BOOLEAN DEFAULT true,
    matrix_speed REAL DEFAULT 1.0,
    matrix_density REAL DEFAULT 0.8,
    matrix_color TEXT DEFAULT '#22c55e',
    matrix_opacity REAL DEFAULT 0.3,
    background_mode TEXT DEFAULT 'matrix' CHECK (background_mode IN ('matrix','minimal','custom')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visual_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    terminal_color TEXT DEFAULT '#22c55e',
    accent_color TEXT DEFAULT '#06b6d4',
    font_family TEXT DEFAULT 'JetBrains Mono, monospace',
    dark_mode BOOLEAN DEFAULT true,
    ascii_header TEXT DEFAULT 'PORTFOLIO OS',
    boot_enabled BOOLEAN DEFAULT true,
    visitor_form_enabled BOOLEAN DEFAULT true,
    default_mode TEXT DEFAULT 'cli' CHECK (default_mode IN ('cli','gui')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ENABLE RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (v1.0.0 Production Fixes)
-- Note: Security is enforced at the application layer via session HMAC and middleware.
-- The anon role is granted write access to allow the server-side custom auth to function.

-- Core Tables Read
DO $$ BEGIN
    CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON experience FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON education FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON achievements FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON socials FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON profile FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON resume_versions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin Write (Anon role for custom session auth)
CREATE POLICY "projects_anon_all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "experience_anon_all" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "education_anon_all" ON education FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "skills_anon_all" ON skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "achievements_anon_all" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "profile_anon_all" ON profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "socials_anon_all" ON socials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "resume_versions_anon_all" ON resume_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "visitors_anon_all" ON visitors FOR ALL USING (true) WITH CHECK (true);

-- Analytics & Audit
CREATE POLICY "sessions_anon_all" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "command_logs_anon_all" ON command_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "resume_downloads_anon_all" ON resume_downloads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "audit_logs_anon_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cv_versions_anon_all" ON cv_versions FOR ALL USING (true) WITH CHECK (true);

-- Config
CREATE POLICY "branding_config_anon_all" ON branding_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "visual_config_anon_all" ON visual_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "system_config_anon_all" ON system_config FOR ALL USING (true) WITH CHECK (true);

-- 7. SEED DATA
INSERT INTO profile (full_name, headline, bio, email, location, website_url)
VALUES (
    'Mimansh Neupane Pokharel',
    'Computer Science Student & System Architect',
    'Results-driven Computer Science student focused on machine learning, AI systems, networking, and system architecture. Combines technical execution with leadership experience in managing cross-functional teams and large-scale tech events.',
    'mimansh_np@proton.me',
    'Nepal',
    'https://github.com/walterwhite91'
) ON CONFLICT DO NOTHING;

INSERT INTO skills (category, items) VALUES 
('Programming', ARRAY['Python', 'C++', 'JavaScript']),
('Database', ARRAY['SQLite', 'MongoDB', 'Supabase']),
('Web & Backend', ARRAY['Flask', 'Nginx', 'Next.js', 'React', 'Oracle Cloud']),
('AI & Tools', ARRAY['Generative AI', 'AI Agents', 'n8n', 'Workflow Automation']),
('Dev Tools', ARRAY['Git', 'VS Code', 'Docker']),
('Design', ARRAY['Canva', 'Figma']),
('Networking & Linux', ARRAY['Raspberry Pi', 'DNS', 'NAS', 'Pi-hole', 'Bash Scripting'])
ON CONFLICT (category) DO NOTHING;

INSERT INTO projects (title, slug, description, tech_stack, role, start_date) VALUES
('Ask-M', 'ask-m', 'Academic search and summarization system tailored to Kathmandu University syllabus. Focus on syllabus mapping, data indexing, summarizing algorithms, and structured retrieval.', ARRAY['Python', 'JavaScript', 'MongoDB', 'Flask'], 'Team Lead', '2025-11-01'),
('Healthcare Database Management System', 'hdbms', 'Built modular hospital workflow system: Patient registration, Appointment management, Medical records, Role-based auth.', ARRAY['C++', 'Qt', 'Qt SQL', 'Raspberry Pi'], 'Team Lead', '2025-05-01'), 
('Linux-Based Network Projects', 'linux-infra', 'Pi-hole ad blocking, NAS system, DNS management, Oracle Cloud hosted n8n, Nginx deployment.', ARRAY['Linux', 'Networking', 'Bash', 'Docker'], 'Solo', '2025-02-01')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experience (company, role, start_date, end_date, description) VALUES
('Blueprint Marketing Pvt. Ltd.', 'Content Developer & Tech Consultant', '2024-07-01', null, 'Created AI-assisted marketing workflows, Built AI agents for automation, Produced marketing videos.'),
('Tears of Happiness', 'Social Media Manager', '2024-08-01', '2025-04-01', 'Managed content scheduling, Designed graphics, Edited short-form videos, AI-assisted content strategy.')
ON CONFLICT DO NOTHING;

INSERT INTO education (institution, degree, start_date, end_date, field_of_study) VALUES
('Kathmandu University', 'B.Sc. Computer Science', '2024-08-01', '2028-08-01', 'Software Project Management, Data Structures, Networks'),
('British Grammar School', '+2 Science', '2022-01-01', '2024-01-01', 'Physics & Computer Science')
ON CONFLICT DO NOTHING;

INSERT INTO achievements (title, organization, date, description) VALUES
('Executive Member', 'Kathmandu University Computer Club', '2025-01-01', '2025/2026 tenure'),
('Best Volunteer', 'IT Meet 2025', '2025-01-01', ''),
('Event Executive', 'Aavishkar 25', '2025-01-01', ''),
('Event Lead', 'Namaste Creative Fest', '2024-01-01', 'Managed NPR 500,000 budget, 1000+ attendees')
ON CONFLICT DO NOTHING;

INSERT INTO branding_config (id) VALUES ('321e7b92-1c3e-4385-aa45-3b101b58bd06') ON CONFLICT DO NOTHING;
INSERT INTO visual_config (id) VALUES ('64ff37da-673d-4e67-8ba3-1ef3edf81652') ON CONFLICT DO NOTHING;
INSERT INTO system_config (key, value) VALUES ('initialized', 'true') ON CONFLICT (key) DO NOTHING;
