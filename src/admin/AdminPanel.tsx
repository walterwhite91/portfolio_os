'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2, LogOut, User, Briefcase, GraduationCap, Code, BarChart3,
    FileJson, Plus, Save, Trash2, X, Copy, Check, Palette, Layout, Wand2
} from 'lucide-react';
import MatrixBackground from '@/components/MatrixBackground';

// ── Generic Admin Hook ─────────────────────────────────────
function useAdminData<T>(endpoint: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/${endpoint}`);
            if (res.ok) {
                const json = await res.json();
                // Handle both ApiResponse wrapper {success, data} and legacy raw arrays
                const payload = json.data ?? json;
                setData(Array.isArray(payload) ? payload : [payload]);
            }
        } catch { /* silent */ }
        setLoading(false);
    }, [endpoint]);

    useEffect(() => { load(); }, [load]);

    return { data, setData, loading, reload: load };
}

// ── Profile Manager ────────────────────────────────────────
function ProfileManager() {
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/admin/profile').then(r => r.json()).then(res => setProfile(res.data ?? res)).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!profile) return <Loader2 className="animate-spin text-green-500" />;

    return (
        <div className="space-y-4">
            <FieldRow label="FULL_NAME" value={profile.full_name || ''} onChange={v => setProfile({ ...profile, full_name: v })} />
            <FieldRow label="HEADLINE" value={profile.headline || ''} onChange={v => setProfile({ ...profile, headline: v })} />
            <FieldRow label="EMAIL" value={profile.email || ''} onChange={v => setProfile({ ...profile, email: v })} />
            <FieldRow label="LOCATION" value={profile.location || ''} onChange={v => setProfile({ ...profile, location: v })} />
            <FieldRow label="WEBSITE_URL" value={profile.website_url || ''} onChange={v => setProfile({ ...profile, website_url: v })} />
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">BIO</label>
                <textarea
                    value={profile.bio || ''}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 h-32 resize-y"
                />
            </div>
            <SaveButton saving={saving} saved={saved} onClick={handleSave} />
        </div>
    );
}

// ── Projects Manager ───────────────────────────────────────
function ProjectsManager() {
    const { data: projects, loading, reload } = useAdminData<any>('projects');
    const [editing, setEditing] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    const handleSave = async (project: any) => {
        const isNew = !project.id;
        const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${project.id}`;
        const method = isNew ? 'POST' : 'PUT';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
        });

        setEditing(null);
        setCreating(false);
        reload();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
        reload();
    };

    if (loading) return <Loader2 className="animate-spin text-green-500" />;

    if (editing || creating) {
        const item = editing || { title: '', description: '', tech_stack: [], repo_url: '', live_url: '', role: '' };
        return <ProjectForm item={item} onSave={handleSave} onCancel={() => { setEditing(null); setCreating(false); }} />;
    }

    return (
        <div className="space-y-4">
            <Button onClick={() => setCreating(true)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
                <Plus className="w-3 h-3 mr-1" /> ADD_PROJECT
            </Button>
            {projects.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-green-900/50 hover:border-green-700 transition-colors">
                    <div>
                        <h4 className="text-white font-bold">{p.title}</h4>
                        <p className="text-xs text-gray-500">{p.description?.substring(0, 80)}...</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setEditing(p)} variant="outline" size="sm" className="text-xs border-green-900 text-green-500">Edit</Button>
                        <Button onClick={() => handleDelete(p.id)} variant="outline" size="sm" className="text-xs border-red-900 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProjectForm({ item, onSave, onCancel }: { item: any; onSave: (p: any) => void; onCancel: () => void }) {
    const [form, setForm] = useState(item);
    const [techInput, setTechInput] = useState('');

    const addTech = () => {
        if (techInput.trim()) {
            setForm({ ...form, tech_stack: [...(form.tech_stack || []), techInput.trim()] });
            setTechInput('');
        }
    };

    const removeTech = (idx: number) => {
        setForm({ ...form, tech_stack: form.tech_stack.filter((_: string, i: number) => i !== idx) });
    };

    return (
        <div className="space-y-4 border border-green-900/50 p-4">
            <FieldRow label="TITLE" value={form.title} onChange={v => setForm({ ...form, title: v })} />
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">DESCRIPTION</label>
                <textarea
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 h-24 resize-y"
                />
            </div>
            <FieldRow label="ROLE" value={form.role || ''} onChange={v => setForm({ ...form, role: v })} />
            <FieldRow label="GITHUB_URL" value={form.repo_url || ''} onChange={v => setForm({ ...form, repo_url: v })} />
            <FieldRow label="LIVE_URL" value={form.live_url || ''} onChange={v => setForm({ ...form, live_url: v })} />
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">TECH_STACK</label>
                <div className="flex gap-2 mb-2">
                    <Input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                        className="bg-black border-green-900/50 text-green-100 text-sm" placeholder="Add technology..." />
                    <Button type="button" onClick={addTech} className="text-xs bg-green-900/20 border border-green-900/50 text-green-500">+</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                    {(form.tech_stack || []).map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-green-900/20 px-2 py-1 text-green-400 border border-green-900/50 flex items-center gap-1">
                            {t} <button onClick={() => removeTech(i)} className="text-red-500 hover:text-red-400"><X className="w-2 h-2" /></button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => onSave(form)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                <Button onClick={onCancel} variant="outline" className="text-xs border-gray-700 text-gray-500">CANCEL</Button>
            </div>
        </div>
    );
}

// ── Experience Manager ─────────────────────────────────────
function ExperienceManager() {
    const { data: items, loading, reload } = useAdminData<any>('experience');
    const [editing, setEditing] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    const handleSave = async (item: any) => {
        const isNew = !item.id;
        const url = isNew ? '/api/admin/experience' : `/api/admin/experience/${item.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        setEditing(null); setCreating(false); reload();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
        reload();
    };

    if (loading) return <Loader2 className="animate-spin text-green-500" />;

    if (editing || creating) {
        const item = editing || { company: '', role: '', start_date: '', end_date: '', description: '', skills_used: [] };
        return <GenericForm fields={[
            { key: 'company', label: 'COMPANY' },
            { key: 'role', label: 'ROLE' },
            { key: 'start_date', label: 'START_DATE', type: 'date' },
            { key: 'end_date', label: 'END_DATE', type: 'date' },
            { key: 'description', label: 'DESCRIPTION', type: 'textarea' },
        ]} item={item} onSave={handleSave} onCancel={() => { setEditing(null); setCreating(false); }} />;
    }

    return (
        <div className="space-y-4">
            <Button onClick={() => setCreating(true)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
                <Plus className="w-3 h-3 mr-1" /> ADD_EXPERIENCE
            </Button>
            {items.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 border border-green-900/50">
                    <div>
                        <h4 className="text-white font-bold">{e.role}</h4>
                        <p className="text-xs text-green-600">{e.company} • {e.period || `${e.start_date} → ${e.end_date || 'Present'}`}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setEditing(e)} variant="outline" size="sm" className="text-xs border-green-900 text-green-500">Edit</Button>
                        <Button onClick={() => handleDelete(e.id)} variant="outline" size="sm" className="text-xs border-red-900 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Education Manager ──────────────────────────────────────
function EducationManager() {
    const { data: items, loading, reload } = useAdminData<any>('education');
    const [editing, setEditing] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    const handleSave = async (item: any) => {
        const isNew = !item.id;
        const url = isNew ? '/api/admin/education' : `/api/admin/education/${item.id}`;
        const method = isNew ? 'POST' : 'PUT';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        setEditing(null); setCreating(false); reload();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/education/${id}`, { method: 'DELETE' });
        reload();
    };

    if (loading) return <Loader2 className="animate-spin text-green-500" />;

    if (editing || creating) {
        const item = editing || { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: '' };
        return <GenericForm fields={[
            { key: 'institution', label: 'INSTITUTION' },
            { key: 'degree', label: 'DEGREE' },
            { key: 'field_of_study', label: 'FIELD_OF_STUDY' },
            { key: 'start_date', label: 'START_DATE', type: 'date' },
            { key: 'end_date', label: 'END_DATE', type: 'date' },
            { key: 'grade', label: 'GRADE' },
            { key: 'description', label: 'DESCRIPTION', type: 'textarea' },
        ]} item={item} onSave={handleSave} onCancel={() => { setEditing(null); setCreating(false); }} />;
    }

    return (
        <div className="space-y-4">
            <Button onClick={() => setCreating(true)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
                <Plus className="w-3 h-3 mr-1" /> ADD_EDUCATION
            </Button>
            {items.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 border border-green-900/50">
                    <div>
                        <h4 className="text-white font-bold">{e.institution}</h4>
                        <p className="text-xs text-green-600">{e.degree} • {e.start_date} → {e.end_date || 'Present'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setEditing(e)} variant="outline" size="sm" className="text-xs border-green-900 text-green-500">Edit</Button>
                        <Button onClick={() => handleDelete(e.id)} variant="outline" size="sm" className="text-xs border-red-900 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Skills Manager ─────────────────────────────────────────
function SkillsManager() {
    const { data: skills, loading, reload } = useAdminData<any>('skills');
    const [editing, setEditing] = useState<any>(null);

    const handleSave = async (skill: any) => {
        await fetch('/api/admin/skills', {
            method: skill.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(skill),
        });
        setEditing(null);
        reload();
    };

    if (loading) return <Loader2 className="animate-spin text-green-500" />;

    return (
        <div className="space-y-4">
            <Button onClick={() => setEditing({ category: '', items: [] })} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
                <Plus className="w-3 h-3 mr-1" /> ADD_CATEGORY
            </Button>
            {editing && (
                <SkillForm skill={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
            )}
            {skills.map((s: any) => (
                <div key={s.id || s.category} className="p-3 border border-green-900/50">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-green-400 font-bold text-xs uppercase tracking-wider">{s.category}</h4>
                        <Button onClick={() => setEditing(s)} variant="outline" size="sm" className="text-xs border-green-900 text-green-500">Edit</Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {(s.items || []).map((item: string) => (
                            <span key={item} className="text-xs bg-green-900/20 px-2 py-1 text-green-300 border border-green-900/30">{item}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SkillForm({ skill, onSave, onCancel }: { skill: any; onSave: (s: any) => void; onCancel: () => void }) {
    const [form, setForm] = useState(skill);
    const [itemInput, setItemInput] = useState('');

    const addItem = () => {
        if (itemInput.trim()) {
            setForm({ ...form, items: [...(form.items || []), itemInput.trim()] });
            setItemInput('');
        }
    };

    const removeItem = (idx: number) => {
        setForm({ ...form, items: form.items.filter((_: string, i: number) => i !== idx) });
    };

    return (
        <div className="border border-green-900/50 p-4 space-y-3">
            <FieldRow label="CATEGORY" value={form.category} onChange={v => setForm({ ...form, category: v })} />
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">ITEMS</label>
                <div className="flex gap-2 mb-2">
                    <Input value={itemInput} onChange={e => setItemInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
                        className="bg-black border-green-900/50 text-green-100 text-sm" placeholder="Add skill..." />
                    <Button type="button" onClick={addItem} className="text-xs bg-green-900/20 border border-green-900/50 text-green-500">+</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                    {(form.items || []).map((item: string, i: number) => (
                        <span key={i} className="text-xs bg-green-900/20 px-2 py-1 text-green-400 border border-green-900/50 flex items-center gap-1">
                            {item} <button onClick={() => removeItem(i)} className="text-red-500"><X className="w-2 h-2" /></button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => onSave(form)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                <Button onClick={onCancel} variant="outline" className="text-xs border-gray-700 text-gray-500">CANCEL</Button>
            </div>
        </div>
    );
}

// ── CV Import Engine ───────────────────────────────────────
const CV_PROMPT = `You are a professional technical CV extractor.

You must conduct a structured interview to extract the core sections of a professional developer CV.

Ask questions ONE BY ONE. Wait for answer before next question. Do NOT skip sections.

Cover these exact sections:

SECTION 1 — Basic Information: Full Name, Current Role/Title, Location, Years of experience, Primary domain
SECTION 2 — Technical Stack: Programming languages, Frameworks, Databases, DevOps tools, Cloud platforms, Other tools
SECTION 3 — Projects: For each: Name, Description, Tech stack, Role, GitHub link, Live link
SECTION 4 — Work Experience: For each: Title, Company, Duration, Responsibilities, Technologies used
SECTION 5 — Education: Degree, Institution, Duration, Key achievements
SECTION 6 — Achievements & Certifications: Awards, Hackathons, Certifications, Publications
SECTION 7 — Summary: 3-4 sentences about specialization

FINAL OUTPUT: Generate a structured QnA summary, then a STRICT JSON block with this schema:
{
  "basic_info": { "full_name": "", "title": "", "location": "", "years_experience": "", "primary_domain": "" },
  "technical_stack": { "languages": [], "frameworks": [], "databases": [], "devops_tools": [], "cloud_platforms": [], "other_tools": [] },
  "projects": [], "work_experience": [], "education": [], "achievements": [], "summary": ""
}

Return ONLY: 1. QnA section 2. JSON block. No commentary.`;

function CVImportEngine() {
    const [copied, setCopied] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [preview, setPreview] = useState<any>(null);
    const [error, setError] = useState('');
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const copyPrompt = () => {
        navigator.clipboard.writeText(CV_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const parseJSON = () => {
        setError('');
        try {
            // Extract JSON from text (skip non-JSON parts)
            const match = jsonInput.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('No JSON block found');
            const parsed = JSON.parse(match[0]);

            // Basic validation
            if (!parsed.basic_info?.full_name) throw new Error('Missing basic_info.full_name');

            setPreview(parsed);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const applyData = async () => {
        setApplying(true);
        try {
            const res = await fetch('/api/admin/cv-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preview),
            });
            if (res.ok) {
                setApplied(true);
                setPreview(null);
                setJsonInput('');
            } else {
                const data = await res.json();
                setError(data.error || 'Import failed');
            }
        } catch {
            setError('Network error');
        }
        setApplying(false);
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Copy prompt */}
            <div className="border border-green-900/50 p-4">
                <h4 className="text-xs text-green-500 font-bold tracking-wider mb-2">STEP 1: COPY_CV_INTERVIEW_PROMPT</h4>
                <p className="text-xs text-gray-500 mb-3">Paste this prompt into any LLM (ChatGPT, Claude, Gemini). Complete the interview. Copy the JSON output.</p>
                <Button onClick={copyPrompt} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
                    {copied ? <><Check className="w-3 h-3 mr-1" /> COPIED!</> : <><Copy className="w-3 h-3 mr-1" /> COPY_PROMPT</>}
                </Button>
            </div>

            {/* Step 2: Paste JSON */}
            <div className="border border-green-900/50 p-4">
                <h4 className="text-xs text-green-500 font-bold tracking-wider mb-2">STEP 2: PASTE_LLM_OUTPUT</h4>
                <textarea
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder="Paste the full LLM output here (including QnA and JSON block)..."
                    className="w-full bg-black border border-green-900/50 text-green-100 p-3 text-xs font-mono focus:outline-none focus:border-green-500 h-48 resize-y"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                <Button onClick={parseJSON} className="mt-2 bg-green-900/20 border border-green-500 text-green-500 text-xs" disabled={!jsonInput.trim()}>
                    PARSE_JSON
                </Button>
            </div>

            {/* Step 3: Preview & Apply */}
            {preview && (
                <div className="border border-green-500 p-4">
                    <h4 className="text-xs text-green-500 font-bold tracking-wider mb-4">STEP 3: PREVIEW &amp; APPLY</h4>
                    <div className="space-y-2 text-xs mb-4">
                        <p className="text-white"><strong>Name:</strong> {preview.basic_info?.full_name}</p>
                        <p className="text-white"><strong>Title:</strong> {preview.basic_info?.title}</p>
                        <p className="text-white"><strong>Projects:</strong> {preview.projects?.length || 0}</p>
                        <p className="text-white"><strong>Experience:</strong> {preview.work_experience?.length || 0} roles</p>
                        <p className="text-white"><strong>Education:</strong> {preview.education?.length || 0} entries</p>
                        <p className="text-white"><strong>Skills:</strong> {Object.values(preview.technical_stack || {}).flat().length} items</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={applyData} disabled={applying} className="bg-green-700 text-black text-xs font-bold">
                            {applying ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} APPLY_TO_PORTFOLIO
                        </Button>
                        <Button onClick={() => setPreview(null)} variant="outline" className="text-xs border-gray-700 text-gray-500">CANCEL</Button>
                    </div>
                </div>
            )}

            {applied && (
                <div className="border border-green-500 bg-green-900/10 p-4 text-green-400 text-sm">
                    ✓ CV data applied successfully. Your portfolio has been updated.
                </div>
            )}
        </div>
    );
}

// ── Branding Manager ───────────────────────────────────────
function BrandingManager() {
    const [config, setConfig] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/admin/branding').then(r => r.json()).then(res => {
            setConfig(res.data || res);
        }).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/admin/branding', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!config) return <Loader2 className="animate-spin text-green-500" />;

    return (
        <div className="space-y-6">
            {/* Background Text */}
            <FieldRow
                label="BACKGROUND_NAME_TEXT"
                value={config.background_name_text || 'MIMANSH'}
                onChange={v => setConfig({ ...config, background_name_text: v })}
            />
            <FieldRow
                label="DISPLAY_NAME"
                value={config.display_name || 'MIMANSH'}
                onChange={v => setConfig({ ...config, display_name: v })}
            />

            {/* Matrix Enable/Disable */}
            <ToggleRow
                label="MATRIX_ENABLED"
                description="Enable the falling Matrix rain effect on the landing page."
                value={config.matrix_enabled !== false}
                onChange={v => setConfig({ ...config, matrix_enabled: v })}
            />

            {/* Background Mode */}
            <div>
                <label className="block text-xs text-green-700 mb-2 tracking-wider">BACKGROUND_MODE</label>
                <div className="flex gap-3">
                    {(['matrix', 'minimal', 'custom'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setConfig({ ...config, background_mode: mode })}
                            className={`px-6 py-3 border text-xs font-bold tracking-wider transition-all ${config.background_mode === mode
                                ? 'border-green-500 text-green-500 bg-green-900/20'
                                : 'border-green-900/50 text-gray-500 hover:border-green-700'
                                }`}
                        >
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Color */}
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">MATRIX_COLOR</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.matrix_color || '#22c55e'}
                        onChange={e => setConfig({ ...config, matrix_color: e.target.value })}
                        className="w-10 h-10 bg-transparent border border-green-900/50 cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 font-mono">{config.matrix_color}</span>
                </div>
            </div>

            {/* Matrix Speed */}
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">MATRIX_SPEED ({config.matrix_speed?.toFixed(1) || '1.0'})</label>
                <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={config.matrix_speed || 1.0}
                    onChange={e => setConfig({ ...config, matrix_speed: parseFloat(e.target.value) })}
                    className="w-full accent-green-500"
                />
            </div>

            {/* Matrix Density */}
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">MATRIX_DENSITY ({config.matrix_density?.toFixed(1) || '0.8'})</label>
                <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={config.matrix_density || 0.8}
                    onChange={e => setConfig({ ...config, matrix_density: parseFloat(e.target.value) })}
                    className="w-full accent-green-500"
                />
            </div>

            {/* Matrix Opacity */}
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">MATRIX_OPACITY ({config.matrix_opacity?.toFixed(2) || '0.30'})</label>
                <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={config.matrix_opacity || 0.3}
                    onChange={e => setConfig({ ...config, matrix_opacity: parseFloat(e.target.value) })}
                    className="w-full accent-green-500"
                />
            </div>

            {/* Live Preview */}
            <div className="border border-green-900/50 relative overflow-hidden" style={{ height: 200 }}>
                <h4 className="text-xs text-green-700 tracking-wider p-2 relative z-10">LIVE_PREVIEW</h4>
                <div className="absolute inset-0">
                    <MatrixBackground
                        text={config.background_name_text || 'MIMANSH'}
                        enabled={config.matrix_enabled !== false && config.background_mode === 'matrix'}
                        color={config.matrix_color || '#22c55e'}
                        speed={config.matrix_speed || 1.0}
                        density={config.matrix_density || 0.8}
                        opacity={config.matrix_opacity || 0.3}
                    />
                </div>
            </div>

            <SaveButton saving={saving} saved={saved} onClick={handleSave} />
        </div>
    );
}

// ── Theme Manager ──────────────────────────────────────────
const COLOR_PRESETS = [
    { name: 'Matrix', terminal: '#22c55e', accent: '#06b6d4' },
    { name: 'Amber', terminal: '#f59e0b', accent: '#ef4444' },
    { name: 'Neon', terminal: '#a855f7', accent: '#ec4899' },
    { name: 'Ice', terminal: '#06b6d4', accent: '#3b82f6' },
    { name: 'Blood', terminal: '#ef4444', accent: '#f97316' },
    { name: 'Ghost', terminal: '#6b7280', accent: '#9ca3af' },
];

const FONT_OPTIONS = [
    'JetBrains Mono, monospace',
    'Fira Code, monospace',
    'Source Code Pro, monospace',
    'IBM Plex Mono, monospace',
    'Courier New, monospace',
];

function ThemeManager() {
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(res => setSettings(res.data ?? res)).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!settings) return <Loader2 className="animate-spin text-green-500" />;

    return (
        <div className="space-y-6">
            {/* Color Presets */}
            <div>
                <h4 className="text-xs text-green-700 tracking-wider mb-3">COLOR_PRESETS</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {COLOR_PRESETS.map(p => (
                        <button
                            key={p.name}
                            onClick={() => setSettings({ ...settings, terminal_color: p.terminal, accent_color: p.accent })}
                            className={`p-3 border text-center transition-all hover:scale-105 ${settings.terminal_color === p.terminal ? 'border-white' : 'border-green-900/50'
                                }`}
                        >
                            <div className="flex gap-1 justify-center mb-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.terminal }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                            </div>
                            <span className="text-[10px] text-gray-400">{p.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-green-700 mb-1 tracking-wider">TERMINAL_COLOR</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={settings.terminal_color || '#22c55e'}
                            onChange={e => setSettings({ ...settings, terminal_color: e.target.value })}
                            className="w-10 h-10 bg-transparent border border-green-900/50 cursor-pointer" />
                        <span className="text-xs text-gray-400 font-mono">{settings.terminal_color}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-green-700 mb-1 tracking-wider">ACCENT_COLOR</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={settings.accent_color || '#06b6d4'}
                            onChange={e => setSettings({ ...settings, accent_color: e.target.value })}
                            className="w-10 h-10 bg-transparent border border-green-900/50 cursor-pointer" />
                        <span className="text-xs text-gray-400 font-mono">{settings.accent_color}</span>
                    </div>
                </div>
            </div>

            {/* Font */}
            <div>
                <label className="block text-xs text-green-700 mb-1 tracking-wider">FONT_FAMILY</label>
                <select
                    value={settings.font_family || FONT_OPTIONS[0]}
                    onChange={e => setSettings({ ...settings, font_family: e.target.value })}
                    className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500"
                >
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                </select>
            </div>

            {/* ASCII Header */}
            <FieldRow label="ASCII_HEADER" value={settings.ascii_header || 'PORTFOLIO OS'}
                onChange={v => setSettings({ ...settings, ascii_header: v })} />

            {/* Preview */}
            <div className="border border-green-900/50 p-4">
                <h4 className="text-xs text-green-700 tracking-wider mb-3">PREVIEW</h4>
                <div className="p-4 bg-black border border-green-900/30" style={{ fontFamily: settings.font_family }}>
                    <p style={{ color: settings.terminal_color }}>visitor@portfolio-os:~$ help</p>
                    <p style={{ color: settings.accent_color }}>Available commands:</p>
                    <p className="text-gray-500">  about  projects  skills  resume ...</p>
                    <p style={{ color: settings.terminal_color }}>visitor@portfolio-os:~$ <span className="animate-pulse">█</span></p>
                </div>
            </div>

            <SaveButton saving={saving} saved={saved} onClick={handleSave} />
        </div>
    );
}

// ── Layout Control ─────────────────────────────────────────
function LayoutControl() {
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(res => setSettings(res.data ?? res)).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!settings) return <Loader2 className="animate-spin text-green-500" />;

    return (
        <div className="space-y-6">
            {/* Default Mode */}
            <div>
                <label className="block text-xs text-green-700 mb-2 tracking-wider">DEFAULT_MODE</label>
                <div className="flex gap-3">
                    {(['cli', 'gui'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setSettings({ ...settings, default_mode: mode })}
                            className={`px-6 py-3 border text-xs font-bold tracking-wider transition-all ${settings.default_mode === mode
                                ? 'border-green-500 text-green-500 bg-green-900/20'
                                : 'border-green-900/50 text-gray-500 hover:border-green-700'
                                }`}
                        >
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Default interface shown to visitors after the form.</p>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4">
                <ToggleRow
                    label="SHOW_BOOT_SEQUENCE"
                    description="Display animated boot sequence on first load."
                    value={settings.show_boot_sequence !== false}
                    onChange={v => setSettings({ ...settings, show_boot_sequence: v })}
                />
                <ToggleRow
                    label="SHOW_VISITOR_FORM"
                    description="Ask visitors for their name before entering."
                    value={settings.show_visitor_form !== false}
                    onChange={v => setSettings({ ...settings, show_visitor_form: v })}
                />
                <ToggleRow
                    label="DARK_MODE"
                    description="Force dark mode (default: on)."
                    value={settings.dark_mode !== false}
                    onChange={v => setSettings({ ...settings, dark_mode: v })}
                />
            </div>

            <SaveButton saving={saving} saved={saved} onClick={handleSave} />
        </div>
    );
}

function ToggleRow({ label, description, value, onChange }: {
    label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 border border-green-900/50">
            <div>
                <p className="text-xs text-green-400 tracking-wider">{label}</p>
                <p className="text-[10px] text-gray-600">{description}</p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-green-600' : 'bg-gray-700'
                    }`}
            >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
            </button>
        </div>
    );
}

// ── Shared Components ──────────────────────────────────────
function FieldRow({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div>
            <label className="block text-xs text-green-700 mb-1 tracking-wider">{label}</label>
            <Input
                type={type || 'text'}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="bg-black border-green-900/50 text-green-100 text-sm font-mono focus:border-green-500"
            />
        </div>
    );
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
    return (
        <Button onClick={onClick} disabled={saving} className="bg-green-900/20 border border-green-500 text-green-500 text-xs">
            {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> SAVING...</>
                : saved ? <><Check className="w-3 h-3 mr-1" /> SAVED!</>
                    : <><Save className="w-3 h-3 mr-1" /> SAVE_CHANGES</>}
        </Button>
    );
}

function GenericForm({ fields, item, onSave, onCancel }: {
    fields: { key: string; label: string; type?: string }[];
    item: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState(item);
    return (
        <div className="border border-green-900/50 p-4 space-y-3">
            {fields.map(f => (
                f.type === 'textarea' ? (
                    <div key={f.key}>
                        <label className="block text-xs text-green-700 mb-1 tracking-wider">{f.label}</label>
                        <textarea
                            value={form[f.key] || ''}
                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full bg-black border border-green-900/50 text-green-100 p-2 text-sm font-mono focus:outline-none focus:border-green-500 h-24 resize-y"
                        />
                    </div>
                ) : (
                    <FieldRow key={f.key} label={f.label} value={form[f.key] || ''} onChange={v => setForm({ ...form, [f.key]: v })} type={f.type} />
                )
            ))}
            <div className="flex gap-2">
                <Button onClick={() => onSave(form)} className="bg-green-900/20 border border-green-500 text-green-500 text-xs"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                <Button onClick={onCancel} variant="outline" className="text-xs border-gray-700 text-gray-500">CANCEL</Button>
            </div>
        </div>
    );
}

// ── Main Admin Panel ───────────────────────────────────────
export default function AdminPanel() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<{ username: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/session')
            .then(res => {
                if (res.status === 401) { router.push('/'); return null; }
                return res.json();
            })
            .then(data => {
                if (data?.authenticated) setSession({ username: data.username });
                setLoading(false);
            })
            .catch(() => router.push('/'));
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/');
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-green-500"><Loader2 className="animate-spin" /></div>;
    if (!session) return null;

    return (
        <div className="min-h-screen bg-black text-gray-300 p-4 md:p-8 font-mono">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-green-900 pb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-green-500 tracking-widest">OS.CONTROL_PANEL</h1>
                    <p className="text-xs text-green-700 mt-1">v2.0.0 — Stealth Edition</p>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-xs text-gray-500 border border-green-900/50 px-2 py-1">{session.username}@admin</span>
                    <Button onClick={handleLogout} variant="outline" className="text-xs border-red-900 text-red-500 hover:bg-red-900/20">
                        <LogOut className="w-3 h-3 mr-1" /> LOGOUT
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-green-900/10 border border-green-900/50 flex flex-wrap gap-1 h-auto p-1">
                    <TabsTrigger value="profile" className="text-xs gap-1"><User className="w-3 h-3" /> Profile</TabsTrigger>
                    <TabsTrigger value="projects" className="text-xs gap-1"><Code className="w-3 h-3" /> Projects</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs gap-1"><Briefcase className="w-3 h-3" /> Experience</TabsTrigger>
                    <TabsTrigger value="education" className="text-xs gap-1"><GraduationCap className="w-3 h-3" /> Education</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                    <TabsTrigger value="branding" className="text-xs gap-1"><Wand2 className="w-3 h-3" /> Branding</TabsTrigger>
                    <TabsTrigger value="theme" className="text-xs gap-1"><Palette className="w-3 h-3" /> Theme</TabsTrigger>
                    <TabsTrigger value="layout" className="text-xs gap-1"><Layout className="w-3 h-3" /> Layout</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs gap-1"><BarChart3 className="w-3 h-3" /> Analytics</TabsTrigger>
                    <TabsTrigger value="cv-import" className="text-xs gap-1"><FileJson className="w-3 h-3" /> CV Import</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <ManagerCard title="Profile Manager" description="Your public identity."><ProfileManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="projects" className="mt-6">
                    <ManagerCard title="Projects Manager" description="CRUD for your projects."><ProjectsManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="experience" className="mt-6">
                    <ManagerCard title="Experience Manager" description="Work history & roles."><ExperienceManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="education" className="mt-6">
                    <ManagerCard title="Education Manager" description="Academic history."><EducationManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="skills" className="mt-6">
                    <ManagerCard title="Skills Manager" description="Categorized technical skills."><SkillsManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="branding" className="mt-6">
                    <ManagerCard title="Branding Manager" description="Matrix background, display text, and identity configuration."><BrandingManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="theme" className="mt-6">
                    <ManagerCard title="Theme Manager" description="Colors, fonts, and visual identity."><ThemeManager /></ManagerCard>
                </TabsContent>
                <TabsContent value="layout" className="mt-6">
                    <ManagerCard title="Layout Control" description="OS behavior and display settings."><LayoutControl /></ManagerCard>
                </TabsContent>
                <TabsContent value="analytics" className="mt-6">
                    <ManagerCard title="Analytics Dashboard" description="Visitor tracking & usage statistics.">
                        <AnalyticsDashboard />
                    </ManagerCard>
                </TabsContent>
                <TabsContent value="cv-import" className="mt-6">
                    <ManagerCard title="AI CV Import Engine" description="Paste structured JSON from any LLM interview."><CVImportEngine /></ManagerCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Analytics Dashboard ────────────────────────────────────
function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <Loader2 className="animate-spin text-green-500" />;
    if (!data) return <p className="text-gray-500 text-sm">Failed to load analytics.</p>;

    const maxDayCount = Math.max(...(data.visitsByDay?.map((d: any) => d.count) || [1]), 1);
    const maxCmdCount = Math.max(...(data.topCommands?.map((c: any) => c.count) || [1]), 1);

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="TOTAL_VISITS" value={data.totalVisits} />
                <StatCard label="UNIQUE_SESSIONS" value={data.uniqueSessions} />
                <StatCard label="CLI_USAGE" value={`${data.cliPercent}%`} />
                <StatCard label="RESUME_DL" value={data.resumeDownloads} />
            </div>

            {/* CLI vs GUI */}
            <div className="border border-green-900/50 p-4">
                <h4 className="text-xs text-green-500 font-bold tracking-wider mb-3">MODE_DISTRIBUTION</h4>
                <div className="flex gap-2 h-6">
                    <div className="bg-green-600 transition-all" style={{ width: `${data.cliPercent}%` }}>
                        <span className="text-[10px] text-black font-bold px-1 leading-6">CLI {data.cliPercent}%</span>
                    </div>
                    <div className="bg-cyan-600 transition-all" style={{ width: `${data.guiPercent}%` }}>
                        <span className="text-[10px] text-black font-bold px-1 leading-6">GUI {data.guiPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Top Commands */}
            {data.topCommands?.length > 0 && (
                <div className="border border-green-900/50 p-4">
                    <h4 className="text-xs text-green-500 font-bold tracking-wider mb-3">TOP_COMMANDS</h4>
                    <div className="space-y-2">
                        {data.topCommands.map((c: any) => (
                            <div key={c.command} className="flex items-center gap-3">
                                <span className="text-xs text-green-300 w-24 truncate font-mono">{c.command}</span>
                                <div className="flex-1 h-4 bg-green-900/20 overflow-hidden">
                                    <div
                                        className="h-full bg-green-600 transition-all"
                                        style={{ width: `${(c.count / maxCmdCount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-right">{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Visits by Day */}
            {data.visitsByDay?.length > 0 && (
                <div className="border border-green-900/50 p-4">
                    <h4 className="text-xs text-green-500 font-bold tracking-wider mb-3">VISITS_BY_DAY (30d)</h4>
                    <div className="flex items-end gap-1 h-24">
                        {data.visitsByDay.map((d: any) => (
                            <div key={d.date} className="flex-1 flex flex-col items-center" title={`${d.date}: ${d.count}`}>
                                <div
                                    className="w-full bg-green-600 min-h-[2px] transition-all"
                                    style={{ height: `${(d.count / maxDayCount) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                        <span>{data.visitsByDay[0]?.date}</span>
                        <span>{data.visitsByDay[data.visitsByDay.length - 1]?.date}</span>
                    </div>
                </div>
            )}

            {/* Recent Sessions */}
            {data.recentSessions?.length > 0 && (
                <div className="border border-green-900/50 p-4">
                    <h4 className="text-xs text-green-500 font-bold tracking-wider mb-3">RECENT_SESSIONS</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-green-700 border-b border-green-900/50">
                                    <th className="text-left py-1 pr-4">VISITOR</th>
                                    <th className="text-left py-1 pr-4">MODE</th>
                                    <th className="text-left py-1 pr-4">VIEWS</th>
                                    <th className="text-left py-1">TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSessions.slice(0, 10).map((s: any) => (
                                    <tr key={s.id} className="border-b border-green-900/20 text-gray-400">
                                        <td className="py-1 pr-4">{s.visitor_name || '—'}</td>
                                        <td className="py-1 pr-4">
                                            <span className={`px-1 text-[10px] border ${s.mode === 'cli' ? 'border-green-800 text-green-500' : 'border-cyan-800 text-cyan-500'}`}>
                                                {s.mode?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-1 pr-4">{s.page_views}</td>
                                        <td className="py-1 text-gray-600">{new Date(s.started_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="border border-green-900/50 p-3 text-center">
            <p className="text-xs text-green-700 tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{value}</p>
        </div>
    );
}

function ManagerCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="p-6 border border-green-900/50 rounded bg-green-900/5">
            <h3 className="text-lg font-bold text-green-400 mb-1 tracking-wider">{title}</h3>
            <p className="text-xs text-gray-500 mb-6">{description}</p>
            {children}
        </div>
    );
}
