import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function GET() {
    // Check marker file
    try {
        const markerPath = path.join(process.cwd(), '.initialized');
        if (fs.existsSync(markerPath)) {
            return NextResponse.json({ initialized: true });
        }
    } catch { /* silent */ }

    // Check env var
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH) {
        return NextResponse.json({ initialized: true });
    }

    // Check DB
    if (supabase) {
        try {
            const { data } = await supabase.from('system_config').select('value').eq('key', 'initialized').single();
            if (data?.value === 'true') {
                return NextResponse.json({ initialized: true });
            }
        } catch { /* silent */ }
    }

    return NextResponse.json({ initialized: false });
}
