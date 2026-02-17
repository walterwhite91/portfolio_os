-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 1. Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  tech_stack text[] not null default '{}',
  role text,
  repo_url text,
  live_url text,
  start_date date,
  end_date date,
  is_featured boolean default false,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Experience Table
create table experience (
  id uuid default uuid_generate_v4() primary key,
  company text not null,
  role text not null,
  start_date date not null,
  end_date date, -- null means present
  description text not null,
  skills_used text[] default '{}',
  location text,
  type text check (type in ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Education Table
create table education (
  id uuid default uuid_generate_v4() primary key,
  institution text not null,
  degree text not null,
  field_of_study text,
  start_date date not null,
  end_date date,
  grade text,
  activities text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Skills Table
create table skills (
  id uuid default uuid_generate_v4() primary key,
  category text not null unique, -- e.g., 'Languages', 'Frameworks', 'Tools'
  items text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Achievements Table
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  organization text,
  date date not null,
  description text,
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Socials / Certifications (Optional but useful)
create table socials (
  id uuid default uuid_generate_v4() primary key,
  platform text not null,
  username text not null,
  url text not null,
  icon text, -- lucide icon name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Resume Versions
create table resume_versions (
  id uuid default uuid_generate_v4() primary key,
  version_number int not null,
  file_url text not null,
  changelog text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Profile / Settings (Singleton idea)
create table profile (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  headline text,
  bio text,
  email text,
  location text,
  avatar_url text,
  website_url text,
  custom_css jsonb, -- for theme overrides
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Row Level Security)
alter table projects enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table skills enable row level security;
alter table achievements enable row level security;
alter table socials enable row level security;
alter table resume_versions enable row level security;
alter table profile enable row level security;

-- Create policy to allow read access to everyone
create policy "Public profiles are viewable by everyone" on projects for select using (true);
create policy "Public experience are viewable by everyone" on experience for select using (true);
create policy "Public education are viewable by everyone" on education for select using (true);
create policy "Public skills are viewable by everyone" on skills for select using (true);
create policy "Public achievements are viewable by everyone" on achievements for select using (true);
create policy "Public socials are viewable by everyone" on socials for select using (true);
create policy "Public profile is viewable by everyone" on profile for select using (true);

-- Create policy to allow insert/update/delete only for authenticated admin (user logic to be implemented via Supabase Auth)
-- For simplicity, we assume the owner is the only authenticated user.
create policy "Enable all access for authenticated users" on projects for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on experience for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on education for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on skills for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on achievements for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on socials for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on resume_versions for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on profile for all using (auth.role() = 'authenticated');

-- Seed Data (Initial Population based on Prompt)

insert into profile (full_name, headline, bio, email, location, website_url)
values (
  'Mimansh Neupane Pokharel',
  'Computer Science Student & System Architect',
  'Results-driven Computer Science student focused on machine learning, AI systems, networking, and system architecture. Combines technical execution with leadership experience in managing cross-functional teams and large-scale tech events.',
  'mimansh_np@proton.me',
  'Nepal',
  'https://github.com/walterwhite91'
);

insert into skills (category, items) values 
('Programming', ARRAY['Python', 'C++', 'JavaScript']),
('Database', ARRAY['SQLite', 'MongoDB', 'Supabase']),
('Web & Backend', ARRAY['Flask', 'Nginx', 'Next.js', 'React', 'Oracle Cloud']),
('AI & Tools', ARRAY['Generative AI', 'AI Agents', 'n8n', 'Workflow Automation']),
('Dev Tools', ARRAY['Git', 'VS Code', 'Docker']),
('Design', ARRAY['Canva', 'Figma']),
('Networking & Linux', ARRAY['Raspberry Pi', 'DNS', 'NAS', 'Pi-hole', 'Bash Scripting']);

insert into projects (title, slug, description, tech_stack, role, start_date) values
('Ask-M', 'ask-m', 'Academic search and summarization system tailored to Kathmandu University syllabus. Focus on syllabus mapping, data indexing, summarizing algorithms, and structured retrieval.', ARRAY['Python', 'JavaScript', 'MongoDB', 'Flask'], 'Team Lead', '2025-11-01'),
('Healthcare Database Management System', 'hdbms', 'Built modular hospital workflow system: Patient registration, Appointment management, Medical records, Role-based auth.', ARRAY['C++', 'Qt', 'Qt SQL', 'Raspberry Pi'], 'Team Lead', '2025-05-01'), 
('Linux-Based Network Projects', 'linux-infra', 'Pi-hole ad blocking, NAS system, DNS management, Oracle Cloud hosted n8n, Nginx deployment.', ARRAY['Linux', 'Networking', 'Bash', 'Docker'], 'Solo', '2025-02-01');

insert into experience (company, role, start_date, end_date, description) values
('Blueprint Marketing Pvt. Ltd.', 'Content Developer & Tech Consultant', '2024-07-01', null, 'Created AI-assisted marketing workflows, Built AI agents for automation, Produced marketing videos.'),
('Tears of Happiness', 'Social Media Manager', '2024-08-01', '2025-04-01', 'Managed content scheduling, Designed graphics, Edited short-form videos, AI-assisted content strategy.');

insert into education (institution, degree, start_date, end_date, field_of_study) values
('Kathmandu University', 'B.Sc. Computer Science', '2024-08-01', '2028-08-01', 'Software Project Management, Data Structures, Networks'),
('British Grammar School', '+2 Science', '2022-01-01', '2024-01-01', 'Physics & Computer Science');

insert into achievements (title, organization, date, description) values
('Executive Member', 'Kathmandu University Computer Club', '2025-01-01', '2025/2026 tenure'),
('Best Volunteer', 'IT Meet 2025', '2025-01-01', ''),
('Event Executive', 'Aavishkar 25', '2025-01-01', ''),
('Event Lead', 'Namaste Creative Fest', '2024-01-01', 'Managed NPR 500,000 budget, 1000+ attendees');
-- Create a table for tracking visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (record their visit)
CREATE POLICY "Enable insert for everyone" ON visitors FOR INSERT WITH CHECK (true);

-- Allow only authenticated admins to view visitors
CREATE POLICY "Enable select for admins" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
