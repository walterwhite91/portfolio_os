'use server'

import {
    profileService,
    projectsService,
    experienceService,
    educationService,
    skillsService,
    achievementsService,
    visitorService,
} from '@/core/services/index';
import { checkAdminKeyword as _checkAdminKeyword } from '@/security/auth';

export async function checkAdminKeyword(input: string): Promise<boolean> {
    return _checkAdminKeyword(input);
}

export async function fetchProfile() {
    return await profileService.get();
}

export async function fetchProjects() {
    return await projectsService.getAll();
}

export async function fetchExperience() {
    return await experienceService.getAll();
}

export async function fetchEducation() {
    return await educationService.getAll();
}

export async function fetchSkills() {
    return await skillsService.getAll();
}

export async function fetchAchievements() {
    return await achievementsService.getAll();
}

export async function fetchGithubStats() {
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
    } catch {
        return null;
    }
}

export async function fetchSocialStats() {
    return {
        linkedin: { followers: 500, connections: 500 },
        instagram: { followers: 1200, following: 300 }
    };
}

export async function recordVisitor(name: string, email?: string) {
    if (!name) return { error: 'Name is required' };
    try {
        await visitorService.record({ name, email });
        return { success: true };
    } catch (err) {
        console.error('Error recording visitor:', err);
        return { error: 'Failed to record visit' };
    }
}

export async function fetchBrandingConfig() {
    const { brandingService } = await import('@/core/services/index');
    return await brandingService.get();
}

export async function fetchVisualConfig() {
    const { visualConfigService } = await import('@/core/services/index');
    return await visualConfigService.get();
}
