'use server'

import { getProfile, getProjects, getExperience, getEducation, getSkills, getAchievements } from '@/lib/api';
import { checkAdminKeyword as _checkAdminKeyword } from '@/security/auth';

export async function checkAdminKeyword(input: string): Promise<boolean> {
    return _checkAdminKeyword(input);
}

export async function fetchProfile() {
    return await getProfile();
}

export async function fetchProjects() {
    return await getProjects();
}

export async function fetchExperience() {
    return await getExperience();
}

export async function fetchEducation() {
    return await getEducation();
}

export async function fetchSkills() {
    return await getSkills();
}

export async function fetchAchievements() {
    return await getAchievements();
}

export async function fetchGithubStats() {
    // Real implementation fetching from GitHub API
    // Using public endpoint for now
    try {
        const res = await fetch('https://api.github.com/users/walterwhite91');
        const data = await res.json();
        return {
            public_repos: data.public_repos,
            followers: data.followers,
            following: data.following,
            public_gists: data.public_gists,
            created_at: data.created_at,
            avatar_url: data.avatar_url,
            html_url: data.html_url
        };
    } catch (e) {
        return null;
    }
}

export async function fetchSocialStats() {
    // Mocked for now as these require private APIs or scraping
    return {
        linkedin: { followers: 500, connections: 500 },
        instagram: { followers: 1200, following: 300 }
    };
}

export async function recordVisitor(name: string, email?: string) {
    if (!name) return { error: 'Name is required' };

    // We need the supabase client here to write, but our lib/api logic seems read-focused or uses admin client if configured?
    // Let's import createClient directly here for simplicity or use what we have.
    // Assuming we have env vars set up.

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials missing, cannot record visitor.');
        return { success: false }; // Fail silently in dev without creds
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('visitors')
        .insert([{ name, email }]);

    if (error) {
        console.error('Error recording visitor:', error);
        return { error: 'Failed to record visit' };
    }

    return { success: true };
}
