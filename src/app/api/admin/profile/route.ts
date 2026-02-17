import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/security/auth';
import { PROFILE as fallbackProfile } from '@/lib/data';

// GET — fetch profile
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) {
        return NextResponse.json(fallbackProfile);
    }

    const { data, error } = await supabase.from('profile').select('*').limit(1).single();
    if (error || !data) return NextResponse.json(fallbackProfile);
    return NextResponse.json(data);
}

// PUT — update profile (singleton — always updates first row)
export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await req.json();
    const { full_name, headline, bio, email, location, website_url } = body;

    // Get existing profile ID
    const { data: existing } = await supabase.from('profile').select('id').limit(1).single();

    if (existing?.id) {
        const { data, error } = await supabase
            .from('profile')
            .update({ full_name, headline, bio, email, location, website_url, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } else {
        // Insert new profile
        const { data, error } = await supabase
            .from('profile')
            .insert([{ full_name, headline, bio, email, location, website_url }])
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }
}
