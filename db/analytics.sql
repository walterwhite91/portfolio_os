-- Analytics Tables for Portfolio OS
-- Run this in your Supabase SQL Editor after the main schema.sql

-- Sessions table — tracks visitor sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT,
  mode TEXT CHECK (mode IN ('cli', 'gui')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  page_views INT DEFAULT 1
);

-- Command logs — tracks CLI commands used
CREATE TABLE IF NOT EXISTS command_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resume downloads tracker
CREATE TABLE IF NOT EXISTS resume_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs for admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CV version history
CREATE TABLE IF NOT EXISTS cv_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_number SERIAL,
  data JSONB NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now(),
  applied_by TEXT
);

-- RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

-- Public can insert sessions and command_logs
CREATE POLICY "Anyone can create sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can log commands" ON command_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can log resume downloads" ON resume_downloads FOR INSERT WITH CHECK (true);

-- Only authenticated can read analytics
CREATE POLICY "Admins can read sessions" ON sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read commands" ON command_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read downloads" ON resume_downloads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read audit logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage cv_versions" ON cv_versions FOR ALL USING (auth.role() = 'authenticated');
