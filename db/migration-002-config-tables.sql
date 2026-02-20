-- Migration 002: Config Tables
-- Portfolio OS v1.0
-- Run this in Supabase SQL Editor after schema.sql + analytics.sql

-- branding_config (singleton — controls Matrix background identity)
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

-- visual_config (singleton — controls terminal colors, fonts, boot settings)
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

-- RLS + Policies
ALTER TABLE branding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public branding read" ON branding_config FOR SELECT USING (true);
CREATE POLICY "Admin branding write" ON branding_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public visual read" ON visual_config FOR SELECT USING (true);
CREATE POLICY "Admin visual write" ON visual_config FOR ALL USING (auth.role() = 'authenticated');

-- Seed defaults (one row each)
INSERT INTO branding_config DEFAULT VALUES;
INSERT INTO visual_config DEFAULT VALUES;
