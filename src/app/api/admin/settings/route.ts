import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/security/auth';

// Default settings
const DEFAULTS = {
    terminal_color: '#22c55e',
    accent_color: '#06b6d4',
    font_family: 'JetBrains Mono, monospace',
    ascii_header: 'PORTFOLIO OS',
    dark_mode: true,
    default_mode: 'cli',
    show_boot_sequence: true,
    show_visitor_form: true,
};

// GET — fetch settings
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!supabase) return NextResponse.json(DEFAULTS);

    try {
        const { data } = await supabase.from('system_config').select('key, value');
        if (!data?.length) return NextResponse.json(DEFAULTS);

        const settings: Record<string, any> = { ...DEFAULTS };
        data.forEach((row: { key: string; value: string }) => {
            if (row.key.startsWith('theme_') || row.key.startsWith('layout_')) {
                const cleanKey = row.key.replace(/^(theme_|layout_)/, '');
                if (row.value === 'true') settings[cleanKey] = true;
                else if (row.value === 'false') settings[cleanKey] = false;
                else settings[cleanKey] = row.value;
            }
        });
        return NextResponse.json(settings);
    } catch {
        return NextResponse.json(DEFAULTS);
    }
}

// PUT — save settings
export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const rows = Object.entries(body).map(([key, value]) => ({
            key: `theme_${key}`,
            value: String(value),
        }));

        await supabase.from('system_config').upsert(rows, { onConflict: 'key' });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
