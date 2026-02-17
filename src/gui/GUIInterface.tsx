'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    fetchProfile,
    fetchProjects,
    fetchExperience,
    fetchEducation,
    fetchSkills,
    fetchAchievements,
    fetchGithubStats,
    fetchSocialStats
} from '@/app/actions';
import { Github, Linkedin, Mail, Instagram, MapPin } from 'lucide-react';

interface GUIInterfaceProps {
    visitorName: string;
    systemData?: any;
    onLogout?: () => void;
}

export default function GUIInterface({ visitorName, systemData, onLogout }: GUIInterfaceProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState<any>(systemData || {
        profile: null,
        projects: [],
        experience: [],
        education: [],
        skills: [],
        achievements: [],
        github: null,
        social: null
    });

    useEffect(() => {
        if (systemData) {
            setData(systemData);
            return;
        }
        // Fallback fetch if no systemData passed (e.g. dev mode or direct mount)
        const loadData = async () => {
            const [profile, projects, experience, education, skills, achievements, github, social] = await Promise.all([
                fetchProfile(),
                fetchProjects(),
                fetchExperience(),
                fetchEducation(),
                fetchSkills(),
                fetchAchievements(),
                fetchGithubStats(),
                fetchSocialStats()
            ]);
            setData({ profile, projects, experience, education, skills, achievements, github, social });
        };
        loadData();
    }, [systemData]);

    const sidebarItems = [
        { id: 'dashboard', label: 'DASHBOARD' },
        { id: 'projects', label: 'PROJECTS' },
        { id: 'experience', label: 'EXPERIENCE' },
        { id: 'education', label: 'EDUCATION' },
        { id: 'skills', label: 'SKILLS' },
        { id: 'contact', label: 'CONTACT' },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-[80vh] gap-6 text-green-500 font-mono p-4">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex flex-col gap-2 border-r border-green-900/50 pr-6">
                <div className="mb-8 select-none">
                    <h1 className="text-xl font-bold text-white tracking-widest">PORTFOLIO_OS</h1>
                    <p className="text-xs text-green-600">v1.2.0 GUI_MODE</p>
                </div>

                <div className="flex flex-col gap-2">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`text-left p-3 border transition-all hover:translate-x-1 ${activeTab === item.id
                                ? 'bg-green-900/30 border-green-500 text-green-100 font-bold'
                                : 'bg-transparent border-green-900/30 text-green-700 hover:border-green-700 hover:text-green-500'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-4">
                    <div className="bg-green-900/10 p-4 border border-green-900/50 rounded">
                        <p className="text-xs text-green-600 mb-1">LOGGED_IN_AS</p>
                        <p className="text-sm font-bold text-white">{visitorName}</p>
                    </div>

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="bg-red-900/20 border border-red-900/50 text-red-500 p-2 text-xs hover:bg-red-900/40 transition-colors uppercase tracking-wider"
                        >
                            [ Logout ]
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto max-h-[80vh] scrollbar-hide">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="border border-green-500/50 bg-black p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {data.github?.avatar_url ? (
                                        <img
                                            src={data.github.avatar_url}
                                            alt="Profile"
                                            className="w-32 h-32 border-4 border-green-500 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 border-4 border-green-500 rounded-full bg-green-900/20" />
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{data.profile?.full_name || 'Loading...'}</h2>
                                <p className="text-green-400 mb-4">{data.profile?.title || 'System Architect'}</p>
                                <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                                    {data.profile?.bio}
                                </p>

                                <div className="flex gap-4 mt-6">
                                    <a href="https://github.com/walterwhite91" target="_blank" className="p-2 border border-green-900 hover:border-green-500 hover:bg-green-900/20 transition-all text-white flex items-center gap-2 group/link">
                                        <Github size={20} />
                                        {data.github && <span className="text-xs hidden group-hover/link:inline">{data.github.followers}</span>}
                                    </a>
                                    <a href="https://www.linkedin.com/in/mimansh-neupane/" target="_blank" className="p-2 border border-green-900 hover:border-green-500 hover:bg-green-900/20 transition-all text-white flex items-center gap-2 group/link">
                                        <Linkedin size={20} />
                                        {data.social && <span className="text-xs hidden group-hover/link:inline">{data.social.linkedin.followers}</span>}
                                    </a>
                                    <a href="https://www.instagram.com/neu.mimansh/" target="_blank" className="p-2 border border-green-900 hover:border-green-500 hover:bg-green-900/20 transition-all text-white flex items-center gap-2 group/link">
                                        <Instagram size={20} />
                                        {data.social && <span className="text-xs hidden group-hover/link:inline">{data.social.instagram.followers}</span>}
                                    </a>
                                    <a href="mailto:mimansh_np@proton.me" className="p-2 border border-green-900 hover:border-green-500 hover:bg-green-900/20 transition-all text-white">
                                        <Mail size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* Github Stats Widget */}
                            {data.github && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-green-900/10 p-4 border border-green-900/50 text-center">
                                        <div className="text-2xl font-bold text-white">{data.github.public_repos}</div>
                                        <div className="text-[10px] text-green-600 tracking-wider">REPOSITORIES</div>
                                    </div>
                                    <div className="bg-green-900/10 p-4 border border-green-900/50 text-center">
                                        <div className="text-2xl font-bold text-white">{data.github.followers}</div>
                                        <div className="text-[10px] text-green-600 tracking-wider">FOLLOWERS</div>
                                    </div>
                                    <div className="bg-green-900/10 p-4 border border-green-900/50 text-center">
                                        <div className="text-2xl font-bold text-white">{data.github.following}</div>
                                        <div className="text-[10px] text-green-600 tracking-wider">FOLLOWING</div>
                                    </div>
                                    <div className="bg-green-900/10 p-4 border border-green-900/50 text-center">
                                        <div className="text-2xl font-bold text-white">{data.github.public_gists}</div>
                                        <div className="text-[10px] text-green-600 tracking-wider">GISTS</div>
                                    </div>
                                </div>
                            )}

                            {/* Contribution Chart */}
                            <div className="border border-green-900/50 p-4 bg-black">
                                <h3 className="text-xs font-bold text-green-500 mb-4 tracking-wider">CONTRIBUTION_MAP</h3>
                                <div className="overflow-x-auto">
                                    <img
                                        src="https://ghchart.rshah.org/00ff00/walterwhite91"
                                        alt="Github Chart"
                                        className="min-w-[600px] w-full mix-blend-screen opacity-80"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="grid grid-cols-1 gap-6">
                            {data.projects.map((project: any) => (
                                <div key={project.id} className="border border-green-900 bg-black/50 p-6 hover:border-green-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{project.title}</h3>
                                        <a href={project.github_url} target="_blank" className="text-xs border border-green-900 px-2 py-1 hover:bg-green-900/50">OPEN SOURCE</a>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                                    <div className="flex flex-wrap gap-2 text-[10px] text-green-600">
                                        {project.technologies?.map((tech: string) => (
                                            <span key={tech} className="bg-green-900/10 px-2 py-1 border border-green-900/30">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="space-y-8 pl-4 border-l border-green-900/50">
                            {data.experience.map((exp: any) => (
                                <div key={exp.id} className="relative">
                                    <div className="absolute -left-[21px] top-0 w-3 h-3 bg-green-500 rounded-full border-4 border-black box-content" />
                                    <div className="text-xs text-green-600 mb-1">{exp.period}</div>
                                    <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                                    <div className="text-green-400 mb-2">{exp.company}</div>
                                    <p className="text-sm text-gray-400">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="space-y-8 pl-4 border-l border-green-900/50">
                            {data.education.map((edu: any) => (
                                <div key={edu.id} className="relative">
                                    <div className="absolute -left-[21px] top-0 w-3 h-3 bg-blue-500 rounded-full border-4 border-black box-content" />
                                    <div className="text-xs text-blue-600 mb-1">
                                        {edu.start_date} - {edu.end_date || 'Present'}
                                        {edu.grade && <span className="text-yellow-500 ml-2">[{edu.grade}]</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{edu.institution}</h3>
                                    <div className="text-blue-400 mb-2 font-bold">{edu.degree}</div>
                                    {edu.description && (
                                        <p className="text-sm text-gray-400 italic">
                                            {edu.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.skills.map((cat: any) => (
                                <div key={cat.id} className="border border-green-900/50 p-4">
                                    <h4 className="text-green-400 border-b border-green-900/50 mb-4 pb-2 text-sm font-bold uppercase">{cat.category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.items.map((skill: string) => (
                                            <span key={skill} className="bg-green-900/20 text-green-300 text-xs px-3 py-1 hover:bg-green-500 hover:text-black transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="border border-green-900 p-8 max-w-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6">TRANSMISSION_CHANNELS</h2>
                            <div className="space-y-6">
                                <a href="mailto:mimansh_np@proton.me" className="flex items-center gap-4 p-4 border border-green-900/30 hover:bg-green-900/10 hover:border-green-500 transition-all group">
                                    <div className="bg-green-900/20 p-3 rounded group-hover:bg-green-500/20">
                                        <Mail className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">ENCRYPTED_MAIL</h3>
                                        <p className="text-xs text-gray-400">mimansh_np@proton.me</p>
                                    </div>
                                    <span className="ml-auto text-xs text-green-700 group-hover:text-green-500">&gt; SEND_PACKET</span>
                                </a>

                                <a href="https://linkedin.com/in/mimansh-neupane" target="_blank" className="flex items-center gap-4 p-4 border border-green-900/30 hover:bg-green-900/10 hover:border-blue-500 transition-all group">
                                    <div className="bg-blue-900/20 p-3 rounded group-hover:bg-blue-500/20">
                                        <Linkedin className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">PROFESSIONAL_NET</h3>
                                        <p className="text-xs text-gray-400">@mimansh-neupane</p>
                                    </div>
                                    <span className="ml-auto text-xs text-blue-900 group-hover:text-blue-500">&gt; CONNECT</span>
                                </a>

                                <a href="https://instagram.com/neu.mimansh" target="_blank" className="flex items-center gap-4 p-4 border border-green-900/30 hover:bg-green-900/10 hover:border-pink-500 transition-all group">
                                    <div className="bg-pink-900/20 p-3 rounded group-hover:bg-pink-500/20">
                                        <Instagram className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">VISUAL_FEED</h3>
                                        <p className="text-xs text-gray-400">@neu.mimansh</p>
                                    </div>
                                    <span className="ml-auto text-xs text-pink-900 group-hover:text-pink-500">&gt; FOLLOW</span>
                                </a>

                                <div className="flex items-center gap-4 p-4 border border-green-900/30 opacity-80">
                                    <div className="bg-yellow-900/20 p-3 rounded">
                                        <MapPin className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">PHYSICAL_NODE</h3>
                                        <p className="text-xs text-gray-400">Dhulikhel, Nepal</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
