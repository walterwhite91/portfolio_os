import { NextRequest } from 'next/server';
import { getSession } from '@/security/auth';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';
import { auditService } from '@/core/services/index';
import { logger } from '@/core/logger';
import { supabase } from '@/lib/supabase';

// ── CV Data Schema (loose — AI-generated JSON varies) ──────

interface CVData {
    basic_info?: {
        full_name?: string;
        title?: string;
        location?: string;
        years_experience?: string;
        primary_domain?: string;
    };
    technical_stack?: {
        languages?: string[];
        frameworks?: string[];
        databases?: string[];
        devops_tools?: string[];
        cloud_platforms?: string[];
        other_tools?: string[];
    };
    projects?: Array<Record<string, unknown>>;
    work_experience?: Array<Record<string, unknown>>;
    education?: Array<Record<string, unknown>>;
    achievements?: Array<Record<string, unknown>>;
    summary?: string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        if (!supabase) {
            return apiError('Database not configured. CV Import requires Supabase.', 503);
        }

        const data: CVData = await req.json();

        // Validate required fields
        if (!data.basic_info?.full_name) {
            return apiError('Invalid CV data: missing basic_info.full_name', 400);
        }

        logger.info('Starting CV import', { adminUsername: session.username });
        const errors: string[] = [];

        // 1. Update Profile
        try {
            const { data: existingProfile } = await supabase.from('profile').select('id').limit(1).single();
            const profileData = {
                full_name: data.basic_info.full_name,
                headline: data.basic_info.title,
                bio: data.summary,
                location: data.basic_info.location,
            };

            if (existingProfile?.id) {
                await supabase.from('profile').update(profileData).eq('id', existingProfile.id);
            } else {
                await supabase.from('profile').insert([profileData]);
            }
        } catch (err) {
            errors.push(`Profile: ${String(err)}`);
            logger.error('CV import: profile update failed', { error: String(err) });
        }

        // 2. Replace Projects
        if (data.projects?.length) {
            try {
                await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                const projectRows = data.projects.map((p: Record<string, unknown>) => ({
                    title: (p.name || p.title || p.project_name || 'Untitled') as string,
                    slug: ((p.name || p.title || 'project') as string).toLowerCase().replace(/\s+/g, '-'),
                    description: (p.description || '') as string,
                    tech_stack: (p.tech_stack || p.technologies || []) as string[],
                    role: (p.role || '') as string,
                    repo_url: (p.github_link || p.github_url || '') as string,
                    live_url: (p.live_link || p.live_url || '') as string,
                }));
                await supabase.from('projects').insert(projectRows);
            } catch (err) {
                errors.push(`Projects: ${String(err)}`);
                logger.error('CV import: projects update failed', { error: String(err) });
            }
        }

        // 3. Replace Experience
        if (data.work_experience?.length) {
            try {
                await supabase.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                const expRows = data.work_experience.map((e: Record<string, unknown>) => ({
                    company: (e.company || e.company_name || '') as string,
                    role: (e.title || e.job_title || e.role || '') as string,
                    start_date: (e.start_date || new Date().toISOString()) as string,
                    end_date: (e.end_date || null) as string | null,
                    description: Array.isArray(e.responsibilities)
                        ? (e.responsibilities as string[]).join('\n• ')
                        : (e.responsibilities || e.description || '') as string,
                    skills_used: (e.technologies || e.technologies_used || []) as string[],
                }));
                await supabase.from('experience').insert(expRows);
            } catch (err) {
                errors.push(`Experience: ${String(err)}`);
                logger.error('CV import: experience update failed', { error: String(err) });
            }
        }

        // 4. Replace Education
        if (data.education?.length) {
            try {
                await supabase.from('education').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                const eduRows = data.education.map((e: Record<string, unknown>) => ({
                    institution: (e.institution || '') as string,
                    degree: (e.degree || '') as string,
                    field_of_study: (e.field || e.field_of_study || '') as string,
                    start_date: (e.start_date || new Date().toISOString()) as string,
                    end_date: (e.end_date || null) as string | null,
                    grade: (e.grade || e.gpa || '') as string,
                }));
                await supabase.from('education').insert(eduRows);
            } catch (err) {
                errors.push(`Education: ${String(err)}`);
                logger.error('CV import: education update failed', { error: String(err) });
            }
        }

        // 5. Replace Skills
        if (data.technical_stack) {
            try {
                await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                const skillRows: { category: string; items: string[] }[] = [];
                const stack = data.technical_stack;
                if (stack.languages?.length) skillRows.push({ category: 'Programming', items: stack.languages });
                if (stack.frameworks?.length) skillRows.push({ category: 'Frameworks', items: stack.frameworks });
                if (stack.databases?.length) skillRows.push({ category: 'Database', items: stack.databases });
                if (stack.devops_tools?.length) skillRows.push({ category: 'DevOps', items: stack.devops_tools });
                if (stack.cloud_platforms?.length) skillRows.push({ category: 'Cloud', items: stack.cloud_platforms });
                if (stack.other_tools?.length) skillRows.push({ category: 'Other Tools', items: stack.other_tools });
                if (skillRows.length) await supabase.from('skills').insert(skillRows);
            } catch (err) {
                errors.push(`Skills: ${String(err)}`);
                logger.error('CV import: skills update failed', { error: String(err) });
            }
        }

        // 6. Replace Achievements
        if (data.achievements?.length) {
            try {
                await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                const achRows = data.achievements.map((a: Record<string, unknown>) => ({
                    title: (typeof a === 'string' ? a : (a.title || a.name || '')) as string,
                    organization: (a.organization || a.issuer || '') as string,
                    date: (a.date || new Date().toISOString()) as string,
                    description: (a.description || '') as string,
                }));
                await supabase.from('achievements').insert(achRows);
            } catch (err) {
                errors.push(`Achievements: ${String(err)}`);
                logger.error('CV import: achievements update failed', { error: String(err) });
            }
        }

        // 7. Save version snapshot
        try {
            await supabase.from('cv_versions').insert([{
                data: data,
                applied_by: session.username,
            }]);
        } catch {
            // cv_versions table might not exist yet — skip silently
        }

        // Audit log
        await auditService.log(
            'cv_import',
            session.username,
            `CV imported for ${data.basic_info.full_name}${errors.length ? ` (${errors.length} errors)` : ''}`,
            undefined,
            { errors: errors.length ? errors : undefined }
        );

        if (errors.length) {
            return apiSuccess({
                message: `CV data partially applied. ${errors.length} section(s) had errors.`,
                errors,
            });
        }

        return apiSuccess({ message: 'CV data applied successfully' }, 201);
    } catch (error) {
        logger.error('CV import failed', { error: String(error) });
        return apiCatch(error);
    }
}
