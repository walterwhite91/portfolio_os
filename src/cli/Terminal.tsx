'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { trackSessionStart, trackCommand, trackResumeDownload } from '@/modules/analytics/tracker';
import { Github, Linkedin, Mail, Globe, Instagram } from 'lucide-react';
import GUIInterface from '@/gui/GUIInterface';

import VisitorForm from '@/components/VisitorForm';

type CommandType = {
    command: string;
    output: React.ReactNode;
    id: string;
};

export default function Terminal() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<CommandType[]>([]);
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdIndex, setCmdIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [bootStep, setBootStep] = useState(0);
    const [isBootDone, setIsBootDone] = useState(false);
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [visitorName, setVisitorName] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cli' | 'gui'>('cli');
    const [systemData, setSystemData] = useState<any>(null);

    const handleVisitorComplete = (name: string, mode: 'cli' | 'gui') => {
        setVisitorName(name);
        setViewMode(mode);
        setShowVisitorForm(false);
        setIsBootDone(true);
        // Track analytics
        trackSessionStart(name, mode);
    };


    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isBootDone]);

    // Boot Sequence & Data Loading
    useEffect(() => {
        const runBootSequence = async () => {
            // Step 1: Kernel
            await new Promise(r => setTimeout(r, 800));
            setBootStep(1);

            // Fetch data in parallel with Step 2 (Filesystem)
            const dataPromise = Promise.all([
                fetchProfile(),
                fetchProjects(),
                fetchExperience(),
                fetchEducation(),
                fetchSkills(),
                fetchAchievements(),
                fetchGithubStats(),
                fetchSocialStats()
            ]);

            await new Promise(r => setTimeout(r, 1200));
            setBootStep(2);

            // Step 3: Network (Wait for data here if not done)
            const [profile, projects, experience, education, skills, achievements, github, social] = await dataPromise;
            setSystemData({ profile, projects, experience, education, skills, achievements, github, social });

            await new Promise(r => setTimeout(r, 1000));
            setBootStep(3);

            // Final: Show Form
            await new Promise(r => setTimeout(r, 800));
            setShowVisitorForm(true);
        };

        runBootSequence();
    }, []);

    // Focus input on click
    useEffect(() => {
        if (!isBootDone) return;
        const handleClick = () => inputRef.current?.focus();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isBootDone]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const trimmed = input.trim();
            if (!trimmed) return;

            const newCmdHistory = [...cmdHistory, trimmed];
            setCmdHistory(newCmdHistory);
            setCmdIndex(newCmdHistory.length);

            processCommand(trimmed);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdIndex > 0) {
                setCmdIndex(cmdIndex - 1);
                setInput(cmdHistory[cmdIndex - 1]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (cmdIndex < cmdHistory.length - 1) {
                setCmdIndex(cmdIndex + 1);
                setInput(cmdHistory[cmdIndex + 1]);
            } else {
                setCmdIndex(cmdHistory.length);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const commands = ['help', 'whoami', 'projects', 'experience', 'education', 'skills', 'achievements', 'github', 'contact', 'clear', 'resume', 'speedfetch'];
            const match = commands.find(c => c.startsWith(input));
            if (match) setInput(match);
        }
    };

    const processCommand = async (cmd: string) => {
        // Track command for analytics
        trackCommand(cmd);
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        let output: React.ReactNode;

        switch (command) {
            case 'linkedin':
                output = (
                    <div className="border border-blue-700 p-4 bg-blue-900/10 max-w-md">
                        <div className="flex items-center gap-4 mb-2">
                            <Linkedin className="w-12 h-12 text-blue-500" />
                            <div>
                                <h3 className="text-xl font-bold text-white">Mimansh Neupane</h3>
                                <p className="text-sm text-blue-300">B.Sc. Computer Science • System Architect</p>
                                <p className="text-xs text-gray-400">Dhulikhel, Nepal</p>
                            </div>
                        </div>
                        <div className="mt-2 text-sm">
                            <a href="https://www.linkedin.com/in/mimansh-neupane/" target="_blank" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                                <span>View Profile</span>
                                <span>↗</span>
                            </a>
                        </div>
                    </div>
                );
                break;

            case 'instagram':
                output = (
                    <div className="border border-pink-700 p-4 bg-pink-900/10 max-w-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-[2px]">
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                    <Instagram className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">@neu.mimansh</h3>
                                <p className="text-xs text-pink-300">Instagram</p>
                            </div>
                        </div>
                        <div className="mt-2 text-sm">
                            <a href="https://www.instagram.com/neu.mimansh/" target="_blank" className="text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1">
                                <span>View Photos</span>
                                <span>↗</span>
                            </a>
                        </div>
                    </div>
                );
                break;

            case 'email':
                if (typeof window !== 'undefined') window.location.assign('mailto:mimansh_np@proton.me');
                output = (
                    <div>
                        <span>Opening mail client...</span>
                    </div>
                );
                break;

            case 'open':
                if (args[0]) {
                    const target = args[0].toLowerCase();
                    if (target === 'github') {
                        if (typeof window !== 'undefined') window.open('https://github.com/walterwhite91', '_blank');
                        output = <span>Opening GitHub...</span>;
                    } else if (target === 'linkedin') {
                        if (typeof window !== 'undefined') window.open('https://www.linkedin.com/in/mimansh-neupane/', '_blank');
                        output = <span>Opening LinkedIn...</span>;
                    } else if (target === 'instagram') {
                        if (typeof window !== 'undefined') window.open('https://www.instagram.com/neu.mimansh/', '_blank');
                        output = <span>Opening Instagram...</span>;
                    } else if (target === 'resume') {
                        if (typeof window !== 'undefined') window.open('/api/generate-resume', '_blank');
                        output = <span>Opening Resume...</span>;
                    } else {
                        output = <span className="text-yellow-500">Target not recognized. Try 'github', 'linkedin', 'instagram', or 'resume'.</span>;
                    }
                } else {
                    output = <span className="text-yellow-500">Usage: open [github|linkedin|instagram|resume]</span>;
                }
                break;

            case 'help':
                output = (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <span>whoami</span><span className="text-gray-400">Display user biography</span>
                        <span>projects</span><span className="text-gray-400">List technical projects</span>
                        <span>experience</span><span className="text-gray-400">Show work history</span>
                        <span>education</span><span className="text-gray-400">Display academic background</span>
                        <span>skills</span><span className="text-gray-400">List technical skills</span>
                        <span>achievements</span><span className="text-gray-400">Show awards and leadership</span>
                        <span>github</span><span className="text-gray-400">View GitHub analytics</span>
                        <span>linkedin</span><span className="text-gray-400">Open LinkedIn profile</span>
                        <span>instagram</span><span className="text-gray-400">Open Instagram profile</span>
                        <span>email</span><span className="text-gray-400">Send an email</span>
                        <span>open [site]</span><span className="text-gray-400">Open specific resource</span>
                        <span>contact</span><span className="text-gray-400">Display contact info</span>
                        <span>resume</span><span className="text-gray-400">Generate PDF resume</span>
                        <span>speedfetch</span><span className="text-gray-400">Display system stats</span>
                        <span>clear</span><span className="text-gray-400">Clear terminal history</span>
                    </div>
                );
                break;

            case 'clear':
                setHistory([]);
                return;

            case 'whoami':
                const profile = await fetchProfile();
                output = (
                    <div className="space-y-2 max-w-2xl">
                        <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                        <p className="text-green-300">{profile.headline}</p>
                        <p className="border-l-2 border-green-700 pl-4 italic text-gray-300">{profile.bio}</p>
                        <div className="flex gap-4 text-sm text-gray-400 mt-2">
                            <span>📍 {profile.location}</span>
                            <span>📧 {profile.email}</span>
                        </div>
                    </div>
                );
                break;

            case 'projects':
                const projects = await fetchProjects();
                if (args[0]) {
                    output = <span>Opening project... (feature todo)</span>;
                } else {
                    output = (
                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                            {projects.map((p) => (
                                <div key={p.id} className="border border-green-800 p-4 bg-green-900/10 hover:bg-green-900/20 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white">{p.title}</h4>
                                        <span className="text-xs text-green-400 border border-green-700 px-1 rounded">{p.role}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 my-2">{p.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-green-300 mb-2">
                                        {p.tech_stack?.map(t => <span key={t}>#{t}</span>)}
                                    </div>
                                    <div className="flex gap-4 text-xs font-mono">
                                        {p.live_url && <a href={p.live_url} target="_blank" className="hover:underline text-cyan-400">[ LIVE DEMO ]</a>}
                                        {p.repo_url && <a href={p.repo_url} target="_blank" className="hover:underline text-cyan-400">[ CODE ]</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }
                break;

            case 'experience':
                const exp = await fetchExperience();
                output = (
                    <div className="space-y-4">
                        {exp.map(e => (
                            <div key={e.id} className="border-l-2 border-green-600 pl-4 py-1">
                                <div className="flex flex-col md:flex-row md:justify-between">
                                    <h4 className="font-bold text-white">{e.company}</h4>
                                    <span className="text-sm text-gray-400">{e.start_date} - {e.end_date || 'Present'}</span>
                                </div>
                                <p className="text-green-300">{e.role}</p>
                                <p className="text-sm text-gray-300 mt-1">{e.description}</p>
                                {e.skills_used && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {e.skills_used.map(s => <span key={s} className="text-xs bg-green-900/30 px-1 text-green-400">{s}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
                break;

            case 'help':
                output = (
                    <div className="space-y-2">
                        <p className="text-yellow-500">Available commands:</p>
                        <ul className="grid grid-cols-2 gap-2 text-green-300">
                            <li><span className="text-white font-bold">about</span> - View profile info</li>
                            <li><span className="text-white font-bold">projects</span> - List projects</li>
                            <li><span className="text-white font-bold">experience</span> - Work history</li>
                            <li><span className="text-white font-bold">education</span> - Academic background</li>
                            <li><span className="text-white font-bold">skills</span> - Technical skills</li>
                            <li><span className="text-white font-bold">achievements</span> - Awards & roles</li>
                            <li><span className="text-white font-bold">github</span> - Github stats & chart</li>
                            <li><span className="text-white font-bold">contact</span> - Contact info</li>
                            <li><span className="text-white font-bold">resume</span> - Download resume</li>
                            <li><span className="text-white font-bold">speedfetch</span> - System info</li>
                            <li><span className="text-white font-bold">clear</span> - Clear terminal</li>
                            <li><span className="text-white font-bold">gui</span> - Switch to GUI mode</li>
                            <li><span className="text-white font-bold">logout</span> - End session</li>
                        </ul>
                    </div>
                );
                break;

            case 'logout':
                handleLogout();
                return; // Early return to avoid adding to history if reloading

            case 'education':
                // Use systemData if available, else fetch
                const edu = systemData ? systemData.education : await fetchEducation();
                output = (
                    <div className="space-y-6 border-l-2 border-green-900 pl-4">
                        {edu.map((e: any) => (
                            <div key={e.id} className="relative group">
                                {/* Dot indicator */}
                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-900 rounded-full border-2 border-black group-hover:bg-green-500 transition-colors" />

                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
                                    <h4 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{e.institution}</h4>
                                    <span className="text-sm font-mono text-gray-500">{e.start_date} - {e.end_date || 'Present'}</span>
                                </div>

                                <div className="text-green-500 font-bold mb-1">{e.degree}</div>

                                {e.description && <div className="text-sm text-gray-400 mb-1">{e.description}</div>}
                                {e.grade && <div className="text-xs text-yellow-500 font-mono">GPA: {e.grade}</div>}
                            </div>
                        ))}
                    </div>
                );
                break;

            case 'skills':
                const skills = await fetchSkills();
                output = (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skills.map(cat => (
                            <div key={cat.id}>
                                <h4 className="text-green-400 border-b border-green-800 mb-2 uppercase text-xs tracking-wider">{cat.category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {cat.items.map(s => (
                                        <span key={s} className="text-sm text-gray-300 hover:text-white cursor-crosshair">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
                break;

            case 'achievements':
                const ach = await fetchAchievements();
                output = (
                    <ul className="list-disc pl-5 space-y-2">
                        {ach.map(a => (
                            <li key={a.id}>
                                <span className="text-white font-bold">{a.title}</span>
                                {a.organization && <span className="text-gray-400"> @ {a.organization}</span>}
                                {a.description && <p className="text-sm text-gray-400">{a.description}</p>}
                            </li>
                        ))}
                    </ul>
                );
                break;

            case 'github':
                const github = await fetchGithubStats();
                if (!github) {
                    output = <span className="text-red-500">Error: Could not fetch GitHub stats.</span>;
                } else {
                    output = (
                        <div className="border border-green-700 p-4 bg-black/50">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={github.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-green-500 grayscale opacity-80 hover:grayscale-0 transition-all" />
                                <div>
                                    <a href={github.html_url} target="_blank" className="text-xl font-bold hover:underline text-white">@{github.html_url.split('/').pop()}</a>
                                    <p className="text-xs text-gray-400">Joined {format(new Date(github.created_at), 'dd MMM yyyy')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-green-900/20 p-2 rounded">
                                    <div className="text-2xl font-bold text-white">{github.public_repos}</div>
                                    <div className="text-xs text-green-400">REPOS</div>
                                </div>
                                <div className="bg-green-900/20 p-2 rounded">
                                    <div className="text-2xl font-bold text-white">{github.followers}</div>
                                    <div className="text-xs text-green-400">FOLLOWERS</div>
                                </div>
                                <div className="bg-green-900/20 p-2 rounded">
                                    <div className="text-2xl font-bold text-white">{github.following}</div>
                                    <div className="text-xs text-green-400">FOLLOWING</div>
                                </div>
                                <div className="bg-green-900/20 p-2 rounded">
                                    <div className="text-2xl font-bold text-white">{github.public_gists}</div>
                                    <div className="text-xs text-green-400">GISTS</div>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-green-900 pt-4">
                                <p className="text-xs font-bold text-green-500 mb-2">CONTRIBUTION MAP</p>
                                <div className="bg-black/80 p-2 rounded overflow-x-auto">
                                    <img
                                        src="https://ghchart.rshah.org/00ff00/walterwhite91"
                                        alt="Github Chart"
                                        className="min-w-[600px] w-full mix-blend-screen opacity-80"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 text-center text-xs text-gray-500">
                                * Use 'open github' to visit profile.
                            </div>
                        </div>
                    );
                }
                break;

            case 'contact':
                output = (
                    <div className="p-4 border border-green-500 inline-block space-y-2">
                        <p>Email: <a href="mailto:mimansh_np@proton.me" className="text-cyan-400 hover:underline">mimansh_np@proton.me</a></p>
                        <p>GitHub: <a href="https://github.com/walterwhite91" target="_blank" className="text-cyan-400 hover:underline">@walterwhite91</a></p>
                        <p>LinkedIn: <a href="https://www.linkedin.com/in/mimansh-neupane/" target="_blank" className="text-cyan-400 hover:underline">@mimansh-neupane</a></p>
                        <p>Instagram: <a href="https://www.instagram.com/neu.mimansh/" target="_blank" className="text-cyan-400 hover:underline">@neu.mimansh</a></p>
                        <p>Location: Dhulikhel, Nepal</p>
                    </div>
                );
                break;

            case 'resume':
                output = (
                    <div>
                        <p className="mb-2">Generating secure PDF document...</p>
                        <a href="/api/generate-resume" target="_blank" className="bg-green-700 text-black font-bold px-4 py-2 hover:bg-green-600 inline-block">
                            DOWNLOAD_RESUME.PDF
                        </a>
                        <p className="text-xs text-gray-500 mt-2">v1.0.0-signed</p>
                    </div>
                );
                break;

            case 'speedfetch':
                const profileInfo = await fetchProfile();
                output = (
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start font-mono text-sm">
                        <pre className="text-yellow-500 font-bold text-xs md:text-sm leading-none select-none">
                            {`
       _==/          i     i          \\==_
     /XX/            |\\___/|            \\XX\\
   /XXXX\\            |XXXXX|            /XXXX\\
  |XXXXXX\\_         _XXXXXXX_         _/XXXXXX|
 XXXXXXXXXXXxxxxxxxXXXXXXXXXXXxxxxxxxXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
 XXXXXX/^^^^"\\XXXXXXXXXXXXXXXXXXXXX/^^^^^\\XXXXXX
  |XXX|       \\XXX/^^\\XXXX/^^\\XXX/       |XXX|
    \\XX\\       \\X/    \\XX/    \\X/       /XX/
       "\\       "      \\/      "       /"
`}
                        </pre>
                        <div className="space-y-1">
                            <div className="text-green-400 font-bold text-lg mb-2">{visitorName || 'guest'}@portfolio-os</div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">OS:</span>
                                <span className="text-white">Portfolio OS v1.0.0 (Linux)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Host:</span>
                                <span className="text-white">Next.js 14 + Supabase</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Kernel:</span>
                                <span className="text-white">5.15.0-generic</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Uptime:</span>
                                <span className="text-white">99.9%</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Packages:</span>
                                <span className="text-white">npm (142)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Shell:</span>
                                <span className="text-white">zsh 5.8</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Resolution:</span>
                                <span className="text-white">1920x1080</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">DE:</span>
                                <span className="text-white">HackerUI</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">WM:</span>
                                <span className="text-white">TailwindCSS</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-yellow-500 font-bold">Owner:</span>
                                <span className="text-white">{profileInfo.full_name}</span>
                            </div>
                            <div className="mt-4 flex gap-1">
                                <span className="w-4 h-4 bg-black block"></span>
                                <span className="w-4 h-4 bg-red-600 block"></span>
                                <span className="w-4 h-4 bg-green-600 block"></span>
                                <span className="w-4 h-4 bg-yellow-600 block"></span>
                                <span className="w-4 h-4 bg-blue-600 block"></span>
                                <span className="w-4 h-4 bg-purple-600 block"></span>
                                <span className="w-4 h-4 bg-cyan-600 block"></span>
                                <span className="w-4 h-4 bg-white block"></span>
                            </div>
                        </div>
                    </div>
                );
                break;

            default:
                output = <span className="text-red-400">Command not found: {command}. Type 'help' for available commands.</span>;
        }

        setHistory(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            command: cmd,
            output: output
        }]);
    };

    const handleLogout = () => {
        setVisitorName(null);
        setViewMode('cli');
        setIsBootDone(false);
        setBootStep(0);
        setHistory([]);
        setSystemData(null);
        window.location.reload();
    };

    if (showVisitorForm) {
        return <VisitorForm onComplete={handleVisitorComplete} />;
    }

    if (!isBootDone) {
        return (
            <div className="h-full flex flex-col items-center justify-center font-mono text-green-500 p-8 min-h-screen">
                <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between text-xs">
                        <span>BOOT_SEQUENCE_INIT</span>
                        <span>{bootStep > 0 ? 'OK' : '...'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>LOADING_KERNEL_MODULES</span>
                        <span>{bootStep > 1 ? 'OK' : '...'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>MOUNTING_FILESYSTEM</span>
                        <span>{bootStep > 2 ? 'OK' : '...'}</span>
                    </div>

                    <div className="mt-8 border border-green-900 p-1">
                        <motion.div
                            className="h-2 bg-green-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "linear" }}
                        />
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">
                        {bootStep === 1 ? 'ESTABLISHING SECURE CONNECTION...' :
                            bootStep === 2 ? 'DOWNLOADING SYSTEM DATA...' :
                                'SYSTEM READY'}
                    </div>
                </div>
            </div>
        )
    }

    if (viewMode === 'gui') {
        return <GUIInterface visitorName={visitorName || 'Guest'} systemData={systemData} onLogout={handleLogout} />;
    }

    return (
        <div className="max-w-4xl mx-auto w-full min-h-[50vh] pb-8">
            {/* Persistent Header */}
            <div className="mb-8 border-b-2 border-green-900/50 pb-8 select-none">
                <pre className="text-[10px] md:text-sm font-bold text-green-500 leading-none mb-6">
                    {`
 ___  ___  ___  ___   ___   _   _  ___  _   _ 
 |  \\/  | |_ _| |  \\/  |  /   \\ | \\ | |/ ___| | | | |
 | |\\/| |  | |  | |\\/| | / /\\ \\ |  \\| |\\___ \\ | |_| |
 | |  | |  | |  | |  | |/ /  \\ \\| |\\  | ___) | |  _  |
 |_|  |_| |___| |_|  |_/_/    \\_\\_| \\_||____/  |_| |_|
                                                      
`}
                </pre>
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase mb-1">Mimansh Neupane Pokharel</h1>
                        <p className="text-green-400 font-mono text-xs md:text-sm">B.Sc. Computer Science • System Architect • Kathmandu University</p>
                    </div>

                    <div className="flex gap-4 text-gray-400">
                        <a href="https://github.com/walterwhite91" target="_blank" className="hover:text-white transition-colors"><Github size={20} /></a>
                        <a href="https://www.linkedin.com/in/mimansh-neupane/" target="_blank" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="https://www.instagram.com/neu.mimansh/" target="_blank" className="hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="mailto:mimansh_np@proton.me" className="hover:text-white transition-colors"><Mail size={20} /></a>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-4">
                {history.map((entry) => (
                    <div key={entry.id} className="space-y-2">
                        {entry.command && (
                            <div className="flex gap-2 items-center text-gray-400">
                                <span className="text-green-500">{visitorName || 'guest'}@portfolio-os:~$</span>
                                <span>{entry.command}</span>
                            </div>
                        )}
                        <div className="text-green-100/90 ml-0 md:ml-4 overflow-x-auto">
                            {entry.output}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Line */}
            <div className="flex gap-2 items-center bg-black/80 sticky bottom-0 p-2 border-t border-green-900/30 backdrop-blur">
                <span className="text-green-500 font-bold shrink-0">{visitorName || 'guest'}@portfolio-os:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-green-100 w-full font-mono caret-green-500"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
            <div ref={bottomRef} />
        </div>
    );
}
