
import { Project, Experience, Education, SkillCategory, Achievement, Profile } from "@/types";

export const PROFILE: Profile = {
    full_name: "Mimansh Neupane Pokharel",
    headline: "Computer Science Student & System Architect",
    bio: "Results-driven Computer Science student focused on machine learning, AI systems, networking, and system architecture. Combines technical execution with leadership experience in managing cross-functional teams and large-scale tech events.",
    email: "mimansh_np@proton.me",
    location: "Nepal",
    website_url: "https://github.com/walterwhite91"
};

export const SKILLS: SkillCategory[] = [
    { id: "1", category: "Programming", items: ["Python", "C++", "JavaScript"] },
    { id: "2", category: "Database", items: ["SQLite", "MongoDB", "Supabase"] },
    { id: "3", category: "Web & Backend", items: ["Flask", "Nginx", "Next.js", "Oracle Cloud", "n8n"] },
    { id: "4", category: "AI & Tools", items: ["Generative AI", "AI Agents", "Workflow Automation"] },
    { id: "5", category: "Dev Tools", items: ["Git", "VS Code"] },
    { id: "6", category: "Design", items: ["Canva", "Figma"] },
    { id: "7", category: "Networking & Linux", items: ["Raspberry Pi", "DNS", "NAS", "Pi-hole", "Bash"] },
    { id: "8", category: "Soft Skills", items: ["Leadership", "Project Management", "Team Coordination"] }
];

export const PROJECTS: Project[] = [
    {
        id: "1",
        title: "Ask-M",
        slug: "ask-m",
        description: "Academic search and summarization system tailored to Kathmandu University syllabus.",
        tech_stack: ["Python", "JavaScript", "MongoDB", "Flask"],
        role: "Team Lead",
        start_date: "2025-11",
        is_featured: true,
        created_at: new Date().toISOString()
    },
    {
        id: "2",
        title: "Healthcare Database Management System",
        slug: "hdbms",
        description: "Modular hospital workflow system including patient registration and appointment management.",
        tech_stack: ["C++", "Qt", "Qt SQL"],
        role: "Team Lead",
        start_date: "2025-05",
        is_featured: true,
        created_at: new Date().toISOString()
    },
    {
        id: "3",
        title: "Linux-Based Network Projects",
        slug: "linux-net",
        description: "Infrastructure projects including Pi-hole, NAS, DNS management, and Oracle Cloud hosting.",
        tech_stack: ["Linux", "Bash", "Nginx", "Docker"],
        role: "Solo",
        start_date: "2025-02",
        is_featured: true,
        created_at: new Date().toISOString()
    }
];

export const EXPERIENCE: Experience[] = [
    {
        id: "1",
        company: "Blueprint Marketing Pvt. Ltd.",
        role: "Content Developer & Tech Consultant",
        start_date: "2024-07",
        end_date: null,
        description: "Created AI-assisted marketing workflows, built AI agents, produced videos.",
        skills_used: ["AI", "Automation", "Video Editing"]
    },
    {
        id: "2",
        company: "Tears of Happiness",
        role: "Social Media Manager",
        start_date: "2024-08",
        end_date: "2025-04",
        description: "Managed content scheduling, designed graphics, AI-assisted content strategy.",
        skills_used: ["Social Media", "Design"]
    }
];

export const EDUCATION: Education[] = [
    {
        id: "1",
        institution: "Kathmandu University",
        degree: "B.Sc. Computer Science",
        start_date: "2024",
        end_date: "2028",
        description: "Software Project Management, Data Structures, Computer Networks"
    },
    {
        id: "2",
        institution: "British Grammar School",
        degree: "+2 Science",
        start_date: "2022",
        end_date: "2024",
        grade: "3.50 GPA"
    }
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: "1", title: "Executive Member", organization: "KU Computer Club", date: "2025" },
    { id: "2", title: "Best Volunteer", organization: "IT Meet 2025", date: "2025" },
    { id: "3", title: "Event Executive", organization: "Aavishkar 25", date: "2025" },
    { id: "4", title: "Event Lead", organization: "Namaste Creative Fest", date: "2024", description: "Managed NPR 500,000 budget, 1000+ attendees" }
];
