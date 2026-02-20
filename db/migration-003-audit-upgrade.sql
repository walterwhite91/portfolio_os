-- Migration 003: Audit Logs Upgrade
-- Portfolio OS v1.0
-- Run this in Supabase SQL Editor after migration-002

-- Add missing columns to audit_logs for better tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_username TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS change_summary TEXT;
