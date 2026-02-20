// ── Entity Repositories ────────────────────────────────────
// Thin wrappers around BaseRepository for each table.

import { BaseRepository } from './base.repository';

// ── Type interfaces for DB rows ────────────────────────────

export interface ProjectRow {
    id: string;
    title: string;
    slug: string;
    description: string;
    tech_stack: string[];
    role?: string;
    repo_url?: string;
    live_url?: string;
    start_date?: string;
    end_date?: string;
    is_featured: boolean;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ExperienceRow {
    id: string;
    company: string;
    role: string;
    start_date: string;
    end_date?: string | null;
    description: string;
    skills_used: string[];
    location?: string;
    type?: string;
    created_at: string;
}

export interface EducationRow {
    id: string;
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    grade?: string;
    description?: string;
    activities?: string;
    created_at: string;
}

export interface SkillRow {
    id: string;
    category: string;
    items: string[];
    created_at: string;
}

export interface AchievementRow {
    id: string;
    title: string;
    organization?: string;
    date: string;
    description?: string;
    url?: string;
    created_at: string;
}

export interface SocialRow {
    id: string;
    platform: string;
    username: string;
    url: string;
    icon?: string;
    created_at: string;
}

export interface ProfileRow {
    id: string;
    full_name: string;
    headline?: string;
    bio?: string;
    email?: string;
    location?: string;
    avatar_url?: string;
    website_url?: string;
    custom_css?: Record<string, unknown>;
    updated_at: string;
}

export interface VisitorRow {
    id: string;
    name: string;
    email?: string;
    created_at: string;
}

export interface BrandingConfigRow {
    id: string;
    display_name: string;
    background_name_text: string;
    matrix_enabled: boolean;
    matrix_speed: number;
    matrix_density: number;
    matrix_color: string;
    matrix_opacity: number;
    background_mode: string;
    created_at: string;
    updated_at: string;
}

export interface VisualConfigRow {
    id: string;
    terminal_color: string;
    accent_color: string;
    font_family: string;
    dark_mode: boolean;
    ascii_header: string;
    boot_enabled: boolean;
    visitor_form_enabled: boolean;
    default_mode: string;
    created_at: string;
    updated_at: string;
}

export interface AuditLogRow {
    id: string;
    action: string;
    admin_username?: string;
    change_summary?: string;
    ip_address?: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface SystemConfigRow {
    key: string;
    value: string;
}

// ── Repository Instances ───────────────────────────────────

export const projectsRepo = new BaseRepository<ProjectRow>('projects');
export const experienceRepo = new BaseRepository<ExperienceRow>('experience');
export const educationRepo = new BaseRepository<EducationRow>('education');
export const skillsRepo = new BaseRepository<SkillRow>('skills');
export const achievementsRepo = new BaseRepository<AchievementRow>('achievements');
export const socialsRepo = new BaseRepository<SocialRow>('socials');
export const profileRepo = new BaseRepository<ProfileRow>('profile');
export const visitorsRepo = new BaseRepository<VisitorRow>('visitors');
export const brandingRepo = new BaseRepository<BrandingConfigRow>('branding_config');
export const visualConfigRepo = new BaseRepository<VisualConfigRow>('visual_config');
export const auditRepo = new BaseRepository<AuditLogRow>('audit_logs');
export const systemConfigRepo = new BaseRepository<SystemConfigRow>('system_config');
