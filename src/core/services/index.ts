// ── Service Layer ──────────────────────────────────────────
// Business logic + validation. All data access passes through here.

import { ZodSchema } from 'zod';
import {
    projectsRepo,
    experienceRepo,
    educationRepo,
    skillsRepo,
    achievementsRepo,
    profileRepo,
    visitorsRepo,
    brandingRepo,
    visualConfigRepo,
    auditRepo,
    systemConfigRepo,
    type ProjectRow,
    type ExperienceRow,
    type EducationRow,
    type SkillRow,
    type AchievementRow,
    type ProfileRow,
    type BrandingConfigRow,
    type VisualConfigRow,
    type SystemConfigRow,
} from '../repositories/index';
import {
    ProjectSchema,
    ExperienceSchema,
    EducationSchema,
    SkillSchema,
    AchievementSchema,
    ProfileSchema,
    BrandingConfigSchema,
    VisualConfigSchema,
    VisitorInputSchema,
} from '../validators/schemas';
import { AppError } from '../errors/errors';
import { logger } from '../logger';
import {
    PROFILE,
    PROJECTS,
    EXPERIENCE,
    EDUCATION,
    SKILLS,
    ACHIEVEMENTS,
} from '@/lib/data';

// ── Helpers ────────────────────────────────────────────────

function validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const messages = result.error.issues.map((e) => `${String(e.path?.join('.') ?? '')}: ${e.message}`).join(', ');
        throw AppError.validation(messages, result.error.format());
    }
    return result.data;
}

// ── Projects Service ───────────────────────────────────────

export const projectsService = {
    async getAll(): Promise<ProjectRow[]> {
        if (!projectsRepo.isConfigured) return PROJECTS as unknown as ProjectRow[];
        try {
            const data = await projectsRepo.findAll('created_at', false);
            return data.length ? data : (PROJECTS as unknown as ProjectRow[]);
        } catch {
            return PROJECTS as unknown as ProjectRow[];
        }
    },

    async create(input: unknown, adminUsername?: string): Promise<ProjectRow> {
        const validated = validate(ProjectSchema, input);
        const slug = validated.slug || validated.title.toLowerCase().replace(/\s+/g, '-');
        const result = await projectsRepo.create({ ...validated, slug } as Partial<ProjectRow>);
        logger.audit('project.create', { adminUsername, title: validated.title });
        await auditService.log('project.create', adminUsername, `Created project: ${validated.title}`);
        return result;
    },

    async update(id: string, input: unknown, adminUsername?: string): Promise<ProjectRow> {
        const validated = validate(ProjectSchema, input);
        const result = await projectsRepo.update(id, validated as Partial<ProjectRow>);
        logger.audit('project.update', { adminUsername, id });
        await auditService.log('project.update', adminUsername, `Updated project: ${validated.title}`);
        return result;
    },

    async delete(id: string, adminUsername?: string): Promise<void> {
        await projectsRepo.delete(id);
        logger.audit('project.delete', { adminUsername, id });
        await auditService.log('project.delete', adminUsername, `Deleted project: ${id}`);
    },
};

// ── Experience Service ─────────────────────────────────────

export const experienceService = {
    async getAll(): Promise<ExperienceRow[]> {
        if (!experienceRepo.isConfigured) return EXPERIENCE as unknown as ExperienceRow[];
        try {
            const data = await experienceRepo.findAll('start_date', false);
            return data.length ? data : (EXPERIENCE as unknown as ExperienceRow[]);
        } catch {
            return EXPERIENCE as unknown as ExperienceRow[];
        }
    },

    async create(input: unknown, adminUsername?: string): Promise<ExperienceRow> {
        const validated = validate(ExperienceSchema, input);
        const result = await experienceRepo.create(validated as Partial<ExperienceRow>);
        logger.audit('experience.create', { adminUsername });
        await auditService.log('experience.create', adminUsername, `Created: ${validated.company}`);
        return result;
    },

    async update(id: string, input: unknown, adminUsername?: string): Promise<ExperienceRow> {
        const validated = validate(ExperienceSchema, input);
        const result = await experienceRepo.update(id, validated as Partial<ExperienceRow>);
        logger.audit('experience.update', { adminUsername, id });
        await auditService.log('experience.update', adminUsername, `Updated: ${validated.company}`);
        return result;
    },

    async delete(id: string, adminUsername?: string): Promise<void> {
        await experienceRepo.delete(id);
        logger.audit('experience.delete', { adminUsername, id });
        await auditService.log('experience.delete', adminUsername, `Deleted: ${id}`);
    },
};

// ── Education Service ──────────────────────────────────────

export const educationService = {
    async getAll(): Promise<EducationRow[]> {
        if (!educationRepo.isConfigured) return EDUCATION as unknown as EducationRow[];
        try {
            const data = await educationRepo.findAll('start_date', false);
            return data.length ? data : (EDUCATION as unknown as EducationRow[]);
        } catch {
            return EDUCATION as unknown as EducationRow[];
        }
    },

    async create(input: unknown, adminUsername?: string): Promise<EducationRow> {
        const validated = validate(EducationSchema, input);
        const result = await educationRepo.create(validated as Partial<EducationRow>);
        logger.audit('education.create', { adminUsername });
        await auditService.log('education.create', adminUsername, `Created: ${validated.institution}`);
        return result;
    },

    async update(id: string, input: unknown, adminUsername?: string): Promise<EducationRow> {
        const validated = validate(EducationSchema, input);
        const result = await educationRepo.update(id, validated as Partial<EducationRow>);
        logger.audit('education.update', { adminUsername, id });
        await auditService.log('education.update', adminUsername, `Updated: ${validated.institution}`);
        return result;
    },

    async delete(id: string, adminUsername?: string): Promise<void> {
        await educationRepo.delete(id);
        logger.audit('education.delete', { adminUsername, id });
        await auditService.log('education.delete', adminUsername, `Deleted: ${id}`);
    },
};

// ── Skills Service ─────────────────────────────────────────

export const skillsService = {
    async getAll(): Promise<SkillRow[]> {
        if (!skillsRepo.isConfigured) return SKILLS as unknown as SkillRow[];
        try {
            const data = await skillsRepo.findAll('category', true);
            return data.length ? data : (SKILLS as unknown as SkillRow[]);
        } catch {
            return SKILLS as unknown as SkillRow[];
        }
    },

    async upsert(input: unknown, adminUsername?: string): Promise<SkillRow> {
        const validated = validate(SkillSchema, input);
        // upsert by category: check if exists
        const all = await skillsRepo.findAll();
        const existing = all.find((s) => s.category === validated.category);
        let result: SkillRow;
        if (existing) {
            result = await skillsRepo.update(existing.id, validated as Partial<SkillRow>);
        } else {
            result = await skillsRepo.create(validated as Partial<SkillRow>);
        }
        logger.audit('skills.upsert', { adminUsername, category: validated.category });
        await auditService.log('skills.upsert', adminUsername, `Updated skill: ${validated.category}`);
        return result;
    },
};

// ── Achievements Service ───────────────────────────────────

export const achievementsService = {
    async getAll(): Promise<AchievementRow[]> {
        if (!achievementsRepo.isConfigured) return ACHIEVEMENTS as unknown as AchievementRow[];
        try {
            const data = await achievementsRepo.findAll('date', false);
            return data.length ? data : (ACHIEVEMENTS as unknown as AchievementRow[]);
        } catch {
            return ACHIEVEMENTS as unknown as AchievementRow[];
        }
    },
};

// ── Profile Service ────────────────────────────────────────

export const profileService = {
    async get(): Promise<ProfileRow> {
        if (!profileRepo.isConfigured) return PROFILE as unknown as ProfileRow;
        try {
            const data = await profileRepo.findSingleton();
            return data ?? (PROFILE as unknown as ProfileRow);
        } catch {
            return PROFILE as unknown as ProfileRow;
        }
    },

    async update(input: unknown, adminUsername?: string): Promise<ProfileRow> {
        const validated = validate(ProfileSchema, input);
        const result = await profileRepo.upsertSingleton(validated as Partial<ProfileRow>);
        logger.audit('profile.update', { adminUsername });
        await auditService.log('profile.update', adminUsername, `Updated profile`);
        return result;
    },
};

// ── Visitor Service ────────────────────────────────────────

export const visitorService = {
    async record(input: unknown): Promise<void> {
        const validated = validate(VisitorInputSchema, input);
        if (!visitorsRepo.isConfigured) {
            logger.warn('Supabase not configured, skipping visitor record');
            return;
        }
        await visitorsRepo.create(validated as Partial<{ id: string; name: string; email?: string; created_at: string }>);
    },
};

// ── Branding Config Service ────────────────────────────────

const BRANDING_DEFAULTS: Omit<BrandingConfigRow, 'id' | 'created_at' | 'updated_at'> = {
    display_name: 'MIMANSH',
    background_name_text: 'MIMANSH',
    matrix_enabled: true,
    matrix_speed: 1.0,
    matrix_density: 0.8,
    matrix_color: '#22c55e',
    matrix_opacity: 0.3,
    background_mode: 'matrix',
};

export const brandingService = {
    async get(): Promise<BrandingConfigRow> {
        if (!brandingRepo.isConfigured) return { id: '', created_at: '', updated_at: '', ...BRANDING_DEFAULTS };
        try {
            const data = await brandingRepo.findSingleton();
            return data ?? { id: '', created_at: '', updated_at: '', ...BRANDING_DEFAULTS };
        } catch {
            return { id: '', created_at: '', updated_at: '', ...BRANDING_DEFAULTS };
        }
    },

    async update(input: unknown, adminUsername?: string): Promise<BrandingConfigRow> {
        const validated = validate(BrandingConfigSchema, input);
        const result = await brandingRepo.upsertSingleton(validated as Partial<BrandingConfigRow>);
        logger.audit('branding.update', { adminUsername, ...validated });
        await auditService.log('branding.update', adminUsername, `Updated branding config`);
        return result;
    },
};

// ── Visual Config Service ──────────────────────────────────

const VISUAL_DEFAULTS: Omit<VisualConfigRow, 'id' | 'created_at' | 'updated_at'> = {
    terminal_color: '#22c55e',
    accent_color: '#06b6d4',
    font_family: 'JetBrains Mono, monospace',
    dark_mode: true,
    ascii_header: 'PORTFOLIO OS',
    boot_enabled: true,
    visitor_form_enabled: true,
    default_mode: 'cli',
};

export const visualConfigService = {
    async get(): Promise<VisualConfigRow> {
        if (!visualConfigRepo.isConfigured) return { id: '', created_at: '', updated_at: '', ...VISUAL_DEFAULTS };
        try {
            const data = await visualConfigRepo.findSingleton();
            return data ?? { id: '', created_at: '', updated_at: '', ...VISUAL_DEFAULTS };
        } catch {
            return { id: '', created_at: '', updated_at: '', ...VISUAL_DEFAULTS };
        }
    },

    async update(input: unknown, adminUsername?: string): Promise<VisualConfigRow> {
        const validated = validate(VisualConfigSchema, input);
        const result = await visualConfigRepo.upsertSingleton(validated as Partial<VisualConfigRow>);
        logger.audit('visual_config.update', { adminUsername });
        await auditService.log('visual_config.update', adminUsername, `Updated visual config`);
        return result;
    },
};

// ── System Config Service (legacy key-value) ───────────────

export const systemConfigService = {
    async getAll(): Promise<Record<string, string>> {
        if (!systemConfigRepo.isConfigured) return {};
        try {
            const rows = await systemConfigRepo.findAll();
            const map: Record<string, string> = {};
            rows.forEach((r) => { map[r.key] = r.value; });
            return map;
        } catch {
            return {};
        }
    },

    async set(entries: Record<string, string>): Promise<void> {
        const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
        await systemConfigRepo.upsert(rows as Partial<SystemConfigRow>[], 'key');
    },
};

// ── Audit Service ──────────────────────────────────────────

export const auditService = {
    async log(
        action: string,
        adminUsername?: string,
        changeSummary?: string,
        ip?: string,
        details?: Record<string, unknown>
    ): Promise<void> {
        if (!auditRepo.isConfigured) {
            // Fallback: just log to console
            logger.audit(action, { adminUsername, changeSummary });
            return;
        }
        try {
            await auditRepo.create({
                action,
                admin_username: adminUsername,
                change_summary: changeSummary,
                ip_address: ip,
                details,
            } as Partial<{ id: string; action: string; admin_username?: string; change_summary?: string; ip_address?: string; details?: Record<string, unknown>; created_at: string }>);
        } catch (err) {
            // Audit logging should never crash the app
            logger.error('Failed to write audit log', { action, error: String(err) });
        }
    },

    async getRecent(limit = 50) {
        if (!auditRepo.isConfigured) return [];
        try {
            return await auditRepo.findAll('created_at', false);
        } catch {
            return [];
        }
    },
};
