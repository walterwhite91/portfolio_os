'use client';

/**
 * Analytics tracking hook for Portfolio OS.
 * Tracks session starts, commands, resume downloads, and page views.
 * Sends events to /api/analytics/track (public, no auth needed).
 */

let sessionId: string | null = null;

async function track(event: string, data: Record<string, any> = {}) {
    try {
        const res = await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data: { ...data, session_id: sessionId } }),
        });
        return await res.json();
    } catch {
        return { tracked: false };
    }
}

export async function trackSessionStart(visitorName: string, mode: 'cli' | 'gui') {
    const result = await track('session_start', { visitor_name: visitorName, mode });
    if (result.sessionId) {
        sessionId = result.sessionId;
    }
    return sessionId;
}

export async function trackCommand(command: string) {
    if (!sessionId) return;
    await track('command', { command });
}

export async function trackResumeDownload() {
    await track('resume_download', {});
}

export async function trackPageView() {
    if (!sessionId) return;
    await track('page_view', {});
}

export function getSessionId() {
    return sessionId;
}
