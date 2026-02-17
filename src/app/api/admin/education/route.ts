import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/security/auth';
import { EDUCATION as fallback } from '@/lib/data';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!supabase) return NextResponse.json(fallback);
    const { data, error } = await supabase.from('education').select('*').order('start_date', { ascending: false });
    if (error) return NextResponse.json(fallback);
    return NextResponse.json(data?.length ? data : fallback);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const body = await req.json();
    const { data, error } = await supabase.from('education').insert([body]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
