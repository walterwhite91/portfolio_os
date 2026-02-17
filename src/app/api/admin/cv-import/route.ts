import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/security/auth';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured. CV Import requires Supabase.' }, { status: 503 });
    }

    try {
        const data = await req.json();

        // Validate required fields
        if (!data.basic_info?.full_name) {
            return NextResponse.json({ error: 'Invalid CV data: missing basic_info.full_name' }, { status: 400 });
        }

        // 1. Update Profile
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

        // 2. Replace Projects
        if (data.projects?.length) {
            await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            const projectRows = data.projects.map((p: any) => ({
                title: p.name || p.title || p.project_name || 'Untitled',
                slug: (p.name || p.title || 'project').toLowerCase().replace(/\s+/g, '-'),
                description: p.description || '',
                tech_stack: p.tech_stack || p.technologies || [],
                role: p.role || '',
                repo_url: p.github_link || p.github_url || '',
                live_url: p.live_link || p.live_url || '',
            }));
            await supabase.from('projects').insert(projectRows);
        }

        // 3. Replace Experience
        if (data.work_experience?.length) {
            await supabase.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const expRows = data.work_experience.map((e: any) => ({
                company: e.company || e.company_name || '',
                role: e.title || e.job_title || e.role || '',
                start_date: e.start_date || e.duration?.split('-')[0]?.trim() || new Date().toISOString(),
                end_date: e.end_date || null,
                description: Array.isArray(e.responsibilities)
                    ? e.responsibilities.join('\n• ')
                    : e.responsibilities || e.description || '',
                skills_used: e.technologies || e.technologies_used || [],
            }));
            await supabase.from('experience').insert(expRows);
        }

        // 4. Replace Education
        if (data.education?.length) {
            await supabase.from('education').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const eduRows = data.education.map((e: any) => ({
                institution: e.institution || '',
                degree: e.degree || '',
                field_of_study: e.field || e.field_of_study || '',
                start_date: e.start_date || e.duration?.split('-')[0]?.trim() || new Date().toISOString(),
                end_date: e.end_date || null,
                grade: e.grade || e.gpa || '',
            }));
            await supabase.from('education').insert(eduRows);
        }

        // 5. Replace Skills
        if (data.technical_stack) {
            await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const skillRows: any[] = [];
            const stack = data.technical_stack;
            if (stack.languages?.length) skillRows.push({ category: 'Programming', items: stack.languages });
            if (stack.frameworks?.length) skillRows.push({ category: 'Frameworks', items: stack.frameworks });
            if (stack.databases?.length) skillRows.push({ category: 'Database', items: stack.databases });
            if (stack.devops_tools?.length) skillRows.push({ category: 'DevOps', items: stack.devops_tools });
            if (stack.cloud_platforms?.length) skillRows.push({ category: 'Cloud', items: stack.cloud_platforms });
            if (stack.other_tools?.length) skillRows.push({ category: 'Other Tools', items: stack.other_tools });
            if (skillRows.length) await supabase.from('skills').insert(skillRows);
        }

        // 6. Replace Achievements
        if (data.achievements?.length) {
            await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const achRows = data.achievements.map((a: any) => ({
                title: typeof a === 'string' ? a : a.title || a.name || '',
                organization: a.organization || a.issuer || '',
                date: a.date || new Date().toISOString(),
                description: a.description || '',
            }));
            await supabase.from('achievements').insert(achRows);
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

        return NextResponse.json({ success: true, message: 'CV data applied successfully' });

    } catch (error) {
        console.error('[CV Import Error]', error);
        return NextResponse.json({ error: 'Failed to process CV data' }, { status: 500 });
    }
}
