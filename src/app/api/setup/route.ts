import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        // Check if already initialized
        const statusResponse = await checkInitialized();
        if (statusResponse) {
            return NextResponse.json({ error: 'System already initialized' }, { status: 400 });
        }

        const body = await req.json();
        const { username, password, keyword, supabaseUrl, supabaseAnonKey } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate session secret
        const crypto = await import('crypto');
        const sessionSecret = crypto.randomBytes(32).toString('hex');

        // Try to store in Supabase system_config table
        if (supabase) {
            try {
                await supabase.from('system_config').upsert([
                    { key: 'admin_username', value: username },
                    { key: 'admin_password_hash', value: passwordHash },
                    { key: 'admin_keyword', value: keyword || '__admin_access__' },
                    { key: 'session_secret', value: sessionSecret },
                    { key: 'initialized', value: 'true' },
                    { key: 'initialized_at', value: new Date().toISOString() },
                ], { onConflict: 'key' });
            } catch {
                // system_config table might not exist — fall through to file-based
            }
        }

        // Also try to write .env.local (works locally, not on Vercel)
        try {
            const envPath = path.join(process.cwd(), '.env.local');
            let envContent = '';

            // Read existing content
            try {
                envContent = fs.readFileSync(envPath, 'utf-8');
            } catch { /* File doesn't exist yet */ }

            // Append or update admin vars
            const newVars: Record<string, string> = {
                ADMIN_USERNAME: username,
                ADMIN_PASSWORD_HASH: passwordHash.replace(/\$/g, '\\$'), // Escape $ for dotenv
                ADMIN_KEYWORD: keyword || '__admin_access__',
                SESSION_SECRET: sessionSecret,
                SESSION_EXPIRY_HOURS: '2',
            };

            if (supabaseUrl) newVars['NEXT_PUBLIC_SUPABASE_URL'] = supabaseUrl;
            if (supabaseAnonKey) newVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = supabaseAnonKey;

            for (const [key, value] of Object.entries(newVars)) {
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${key}=${value}`);
                } else {
                    envContent += `\n${key}=${value}`;
                }
            }

            fs.writeFileSync(envPath, envContent.trim() + '\n');
        } catch (e) {
            // Fall back silently — .env.local write might fail on read-only filesystems
            console.warn('[SETUP] Could not write .env.local:', e);
        }

        // Create a marker file
        try {
            fs.writeFileSync(path.join(process.cwd(), '.initialized'), new Date().toISOString());
        } catch { /* silent */ }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SETUP Error]', error);
        return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
    }
}

async function checkInitialized(): Promise<boolean> {
    // Check marker file
    try {
        const markerPath = path.join(process.cwd(), '.initialized');
        if (fs.existsSync(markerPath)) return true;
    } catch { /* silent */ }

    // Check DB
    if (supabase) {
        try {
            const { data } = await supabase.from('system_config').select('value').eq('key', 'initialized').single();
            if (data?.value === 'true') return true;
        } catch { /* silent */ }
    }

    return false;
}
