
import { getProfile, getExperience, getEducation, getSkills, getProjects, getAchievements } from '@/lib/api';

export default async function ResumePrintPage() {
    const profile = await getProfile();
    const experience = await getExperience();
    const education = await getEducation();
    const skills = await getSkills();
    const projects = await getProjects();
    const achievements = await getAchievements();

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] print:p-0">
            {/* Header */}
            <header className="border-b-2 border-black pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-tight">{profile.full_name}</h1>
                <p className="text-xl font-medium mt-1">{profile.headline}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span>{profile.email}</span>
                    <span>{profile.location}</span>
                    <span>{profile.website_url}</span>
                </div>
            </header>

            {/* Summary */}
            <section className="mb-6">
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Summary</h2>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
            </section>

            {/* Experience */}
            <section className="mb-6">
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Experience</h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{exp.company}</h3>
                                <span className="text-sm text-gray-600">{exp.start_date} – {exp.end_date || 'Present'}</span>
                            </div>
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="italic font-medium">{exp.role}</p>
                                <span className="text-xs text-gray-500">{exp.location}</span>
                            </div>
                            <p className="text-sm">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects */}
            <section className="mb-6">
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Projects</h2>
                <div className="space-y-3">
                    {projects.filter(p => p.is_featured).map(p => (
                        <div key={p.id}>
                            <div className="flex justify-between font-bold">
                                <span>{p.title}</span>
                                <span className="text-sm font-normal text-gray-600">{p.start_date}</span>
                            </div>
                            <p className="text-sm">{p.description} <span className="text-xs text-gray-500">({p.tech_stack?.join(', ')})</span></p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="mb-6">
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Education</h2>
                <div className="space-y-2">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between">
                            <div>
                                <h3 className="font-bold">{edu.institution}</h3>
                                <p className="text-sm">{edu.degree}</p>
                                {edu.field_of_study && <p className="text-xs text-gray-600">{edu.field_of_study}</p>}
                            </div>
                            <div className="text-right text-sm">
                                <p>{edu.start_date} – {edu.end_date}</p>
                                {edu.grade && <p className="text-gray-500">GPA: {edu.grade}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="mb-6">
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Technical Skills</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {skills.map(cat => (
                        <div key={cat.id}>
                            <span className="font-bold">{cat.category}:</span> {cat.items.join(', ')}
                        </div>
                    ))}
                </div>
            </section>

            {/* Achievements */}
            <section>
                <h2 className="font-bold text-lg uppercase border-b border-gray-300 mb-2">Achievements</h2>
                <ul className="list-disc pl-5 text-sm space-y-1">
                    {achievements.map(ach => (
                        <li key={ach.id}>
                            <span className="font-bold">{ach.title}</span> – {ach.organization} <span className="text-gray-500">({ach.date})</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
