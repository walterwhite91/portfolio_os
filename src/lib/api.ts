
import { supabase } from './supabase';
import { PROFILE, PROJECTS, EXPERIENCE, EDUCATION, SKILLS, ACHIEVEMENTS } from './data';
import { Project, Experience, Education, SkillCategory, Achievement, Profile } from '@/types';

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => !!supabase;

export async function getProfile(): Promise<Profile> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase!
            .from('profile')
            .select('*')
            .single();
        if (data) return data;
        // Fallback: use static data if table empty or error (though ideally handle error)
        console.warn("Supabase fetch failed or empty:", error);
    }
    return PROFILE;
}

export async function getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase!
            .from('projects')
            // .select('*')
            // For now, assume schema matches. In real app, map fields.
            .select(`
        id, title, slug, description, tech_stack, role, repo_url, live_url, start_date, end_date, is_featured, image_url, created_at
      `)
            .order('start_date', { ascending: false });
        if (data) return data as unknown as Project[];
    }
    return PROJECTS;
}

export async function getExperience(): Promise<Experience[]> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase!
            .from('experience')
            .select('*')
            .order('start_date', { ascending: false });
        if (data) return data as unknown as Experience[];
    }
    return EXPERIENCE;
}

export async function getEducation(): Promise<Education[]> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase!
            .from('education')
            .select('*')
            .order('start_date', { ascending: false });
        if (data) return data as unknown as Education[];
    }
    return EDUCATION;
}

export async function getSkills(): Promise<SkillCategory[]> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase!
            .from('skills')
            .select('*')
            .order('category'); // Or custom order
        if (data) return data as unknown as SkillCategory[];
    }
    return SKILLS;
}

export async function getAchievements(): Promise<Achievement[]> {
    if (isSupabaseConfigured()) {
        const { data } = await supabase!
            .from('achievements')
            .select('*')
            .order('date', { ascending: false });
        if (data) return data as unknown as Achievement[];
    }
    return ACHIEVEMENTS;
}
