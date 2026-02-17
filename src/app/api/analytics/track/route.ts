import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Public endpoint — no auth required (visitors track themselves)
export async function POST(req: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json({ tracked: false }, { status: 200 });
        }

        const body = await req.json();
        const { event, data } = body;

        switch (event) {
            case 'session_start': {
                const { visitor_name, mode } = data;
                const { data: session, error } = await supabase
                    .from('sessions')
                    .insert([{ visitor_name, mode }])
                    .select('id')
                    .single();
                if (error) return NextResponse.json({ tracked: false }, { status: 200 });
                return NextResponse.json({ tracked: true, sessionId: session?.id });
            }

            case 'command': {
                const { session_id, command } = data;
                if (!session_id || !command) return NextResponse.json({ tracked: false });
                await supabase.from('command_logs').insert([{ session_id, command }]);
                return NextResponse.json({ tracked: true });
            }

            case 'resume_download': {
                const { session_id } = data;
                await supabase.from('resume_downloads').insert([{ session_id: session_id || null }]);
                return NextResponse.json({ tracked: true });
            }

            case 'page_view': {
                const { session_id } = data;
                if (session_id && supabase) {
                    try {
                        await supabase.rpc('increment_page_views', { sid: session_id });
                    } catch {
                        await supabase.from('sessions').update({ page_views: 1 }).eq('id', session_id);
                    }
                }
                return NextResponse.json({ tracked: true });
            }

            default:
                return NextResponse.json({ tracked: false });
        }
    } catch {
        return NextResponse.json({ tracked: false }, { status: 200 });
    }
}
