// ── Zod Validation Schemas ─────────────────────────────────
// Single source of truth for all input validation.

import { z } from 'zod';

// ── Portfolio Entities ─────────────────────────────────────

export const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    slug: z.string().max(200).optional(),
    description: z.string().min(1, 'Description is required').max(5000),
    tech_stack: z.array(z.string().max(100)).default([]),
    role: z.string().max(100).optional(),
    repo_url: z.string().url().max(500).optional().or(z.literal('')),
    live_url: z.string().url().max(500).optional().or(z.literal('')),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_featured: z.boolean().default(false),
    image_url: z.string().url().max(500).optional().or(z.literal('')),
});

export const ExperienceSchema = z.object({
    company: z.string().min(1, 'Company is required').max(200),
    role: z.string().min(1, 'Role is required').max(200),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable().optional(),
    description: z.string().min(1, 'Description is required').max(5000),
    skills_used: z.array(z.string().max(100)).default([]),
    location: z.string().max(200).optional(),
    type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional(),
});

export const EducationSchema = z.object({
    institution: z.string().min(1, 'Institution is required').max(200),
    degree: z.string().min(1, 'Degree is required').max(200),
    field_of_study: z.string().max(200).optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    grade: z.string().max(50).optional(),
    description: z.string().max(2000).optional(),
    activities: z.string().max(2000).optional(),
});

export const SkillSchema = z.object({
    category: z.string().min(1, 'Category is required').max(100),
    items: z.array(z.string().max(100)).min(1, 'At least one skill item required'),
});

export const AchievementSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    organization: z.string().max(200).optional(),
    date: z.string().min(1, 'Date is required'),
    description: z.string().max(2000).optional(),
    url: z.string().url().max(500).optional().or(z.literal('')),
});

export const ProfileSchema = z.object({
    full_name: z.string().min(1, 'Full name is required').max(200),
    headline: z.string().max(300).optional(),
    bio: z.string().max(5000).optional(),
    email: z.string().email().max(200).optional(),
    location: z.string().max(200).optional(),
    website_url: z.string().url().max(500).optional().or(z.literal('')),
    avatar_url: z.string().url().max(500).optional().or(z.literal('')),
});

// ── Config Schemas ─────────────────────────────────────────

export const BrandingConfigSchema = z.object({
    display_name: z.string().max(100).default('MIMANSH'),
    background_name_text: z.string().max(100).default('MIMANSH'),
    matrix_enabled: z.boolean().default(true),
    matrix_speed: z.number().min(0.1).max(5.0).default(1.0),
    matrix_density: z.number().min(0.1).max(2.0).default(0.8),
    matrix_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').default('#22c55e'),
    matrix_opacity: z.number().min(0).max(1).default(0.3),
    background_mode: z.enum(['matrix', 'minimal', 'custom']).default('matrix'),
});

export const VisualConfigSchema = z.object({
    terminal_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#22c55e'),
    accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#06b6d4'),
    font_family: z.string().max(200).default('JetBrains Mono, monospace'),
    dark_mode: z.boolean().default(true),
    ascii_header: z.string().max(200).default('PORTFOLIO OS'),
    boot_enabled: z.boolean().default(true),
    visitor_form_enabled: z.boolean().default(true),
    default_mode: z.enum(['cli', 'gui']).default('cli'),
});

// ── Auth Schemas ───────────────────────────────────────────

export const LoginInputSchema = z.object({
    username: z.string().min(1).max(64),
    password: z.string().min(1).max(128),
});

export const VisitorInputSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email().max(200).optional().or(z.literal('')),
});

// ── Type Exports (inferred from schemas) ───────────────────

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type ExperienceInput = z.infer<typeof ExperienceSchema>;
export type EducationInput = z.infer<typeof EducationSchema>;
export type SkillInput = z.infer<typeof SkillSchema>;
export type AchievementInput = z.infer<typeof AchievementSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type BrandingConfigInput = z.infer<typeof BrandingConfigSchema>;
export type VisualConfigInput = z.infer<typeof VisualConfigSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type VisitorInput = z.infer<typeof VisitorInputSchema>;
