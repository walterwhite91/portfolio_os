export interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    tech_stack: string[];
    role: string;
    repo_url?: string;
    live_url?: string;
    start_date: string;
    end_date?: string;
    is_featured: boolean;
    image_url?: string;
    created_at: string;
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    start_date: string;
    end_date?: string | null; // null for 'Present'
    description: string;
    skills_used: string[];
    location?: string;
    type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    grade?: string;
    description?: string;
    activities?: string;
}

export interface SkillCategory {
    id: string;
    category: string;
    items: string[];
}

export interface Achievement {
    id: string;
    title: string;
    organization?: string;
    date: string;
    description?: string;
    url?: string;
}

export interface Profile {
    full_name: string;
    headline: string;
    bio: string;
    email: string;
    location: string;
    website_url?: string;
    avatar_url?: string;
    custom_css?: Record<string, any>;
}

export interface CommandOutput {
    id: string;
    command: string;
    output: React.ReactNode;
    timestamp: Date;
}

export interface BrandingConfig {
    id: string;
    display_name: string;
    background_name_text: string;
    matrix_enabled: boolean;
    matrix_speed: number;
    matrix_density: number;
    matrix_color: string;
    matrix_opacity: number;
    background_mode: 'matrix' | 'minimal' | 'custom';
    created_at: string;
    updated_at: string;
}

export interface VisualConfig {
    id: string;
    terminal_color: string;
    accent_color: string;
    font_family: string;
    dark_mode: boolean;
    ascii_header: string;
    boot_enabled: boolean;
    visitor_form_enabled: boolean;
    default_mode: 'cli' | 'gui';
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    action: string;
    admin_username?: string;
    change_summary?: string;
    ip_address?: string;
    details?: Record<string, unknown>;
    created_at: string;
}
