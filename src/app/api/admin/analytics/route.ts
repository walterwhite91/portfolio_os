import { getSession } from '@/security/auth';
import { apiSuccess, apiError, apiCatch } from '@/core/api-response';
import { logger } from '@/core/logger';
import { supabase } from '@/lib/supabase';

// ── Analytics aggregate data types ─────────────────────────

interface AnalyticsData {
    totalVisits: number;
    uniqueSessions: number;
    cliPercent: number;
    guiPercent: number;
    topCommands: { command: string; count: number }[];
    resumeDownloads: number;
    visitsByDay: { date: string; count: number }[];
    recentSessions: Record<string, unknown>[];
}

const EMPTY_ANALYTICS: AnalyticsData = {
    totalVisits: 0,
    uniqueSessions: 0,
    cliPercent: 50,
    guiPercent: 50,
    topCommands: [],
    resumeDownloads: 0,
    visitsByDay: [],
    recentSessions: [],
};

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return apiError('Unauthorized', 401);

        if (!supabase) {
            return apiSuccess(EMPTY_ANALYTICS);
        }

        // Total visits (sessions count)
        const { count: totalVisits } = await supabase.from('sessions').select('*', { count: 'exact', head: true });

        // Unique sessions (distinct visitor names)
        const { data: uniqueData } = await supabase.from('sessions').select('visitor_name');
        const uniqueSessions = new Set(uniqueData?.map(s => s.visitor_name).filter(Boolean)).size;

        // CLI vs GUI breakdown
        const { data: modeData } = await supabase.from('sessions').select('mode');
        const cliCount = modeData?.filter(s => s.mode === 'cli').length || 0;
        const guiCount = modeData?.filter(s => s.mode === 'gui').length || 0;
        const total = cliCount + guiCount || 1;
        const cliPercent = Math.round((cliCount / total) * 100);
        const guiPercent = 100 - cliPercent;

        // Top commands
        const { data: cmdData } = await supabase
            .from('command_logs')
            .select('command');
        const cmdCounts: Record<string, number> = {};
        cmdData?.forEach(c => { cmdCounts[c.command] = (cmdCounts[c.command] || 0) + 1; });
        const topCommands = Object.entries(cmdCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([command, count]) => ({ command, count }));

        // Resume downloads
        const { count: resumeDownloads } = await supabase.from('resume_downloads').select('*', { count: 'exact', head: true });

        // Visits by day (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: dailyData } = await supabase
            .from('sessions')
            .select('started_at')
            .gte('started_at', thirtyDaysAgo);
        const dayBuckets: Record<string, number> = {};
        dailyData?.forEach(s => {
            const day = new Date(s.started_at).toISOString().split('T')[0];
            dayBuckets[day] = (dayBuckets[day] || 0) + 1;
        });
        const visitsByDay = Object.entries(dayBuckets)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }));

        // Recent sessions (last 20)
        const { data: recentSessions } = await supabase
            .from('sessions')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(20);

        const data: AnalyticsData = {
            totalVisits: totalVisits || 0,
            uniqueSessions,
            cliPercent,
            guiPercent,
            topCommands,
            resumeDownloads: resumeDownloads || 0,
            visitsByDay,
            recentSessions: (recentSessions || []) as Record<string, unknown>[],
        };

        return apiSuccess(data);
    } catch (error) {
        logger.error('Failed to fetch analytics', { error: String(error) });
        return apiCatch(error);
    }
}
