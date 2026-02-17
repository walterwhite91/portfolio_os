import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/security/auth';
import { PROJECTS as fallbackProjects } from '@/lib/data';

// GET — list all projects
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) return NextResponse.json(fallbackProjects);

    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json(fallbackProjects);
    return NextResponse.json(data?.length ? data : fallbackProjects);
}

// POST — create new project
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    const body = await req.json();
    const { title, slug, description, tech_stack, role, repo_url, live_url, is_featured } = body;

    if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('projects')
        .insert([{
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            description,
            tech_stack: tech_stack || [],
            role,
            repo_url,
            live_url,
            is_featured: is_featured || false,
        }])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
