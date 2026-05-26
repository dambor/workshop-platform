import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, GraduationCap, Search, Sparkles } from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { ThemeToggle } from './ThemeToggle';

interface WorkshopCard {
    id: string;
    title: string;
    description: string;
    content: string;
}

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<WorkshopCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorkshops = workshops.filter(workshop =>
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const extractMetadata = (filename: string, text: string): WorkshopCard => {
            const id = filename.replace('.md', '');
            let title = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            let description = 'No description available.';

            const frontmatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
            if (frontmatterMatch) {
                const fm = frontmatterMatch[1];
                const titleMatch = fm.match(/title:\s*(.*)/);
                const descMatch = fm.match(/description:\s*(.*)/);
                if (titleMatch) title = titleMatch[1].replace(/["']/g, '').trim();
                if (descMatch) description = descMatch[1].replace(/["']/g, '').trim();
            } else {
                const titleLine = text.split('\n').find(l => l.startsWith('# ') || l.startsWith('title:'));
                if (titleLine) {
                    title = titleLine.replace(/^#\s*|title:\s*/, '').replace(/["']/g, '').trim();
                }
            }

            return { id, title, description, content: text };
        };

        const discoverWorkshops = async () => {
            try {
                const basePath = import.meta.env.BASE_URL || '/';
                let mdFilenames: string[] = [];

                try {
                    const localIndexRes = await fetch(`${basePath}workshops/index.json`);
                    if (localIndexRes.ok) {
                        mdFilenames = await localIndexRes.json();
                    }
                } catch { /* ignore */ }

                if (mdFilenames.length === 0) {
                    const repoOwner = 'dambor';
                    const repoName = 'workshop-platform';
                    const contentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/public/workshops`;
                    const response = await fetch(contentsUrl);
                    if (!response.ok) throw new Error('Failed to fetch workshops directory');
                    const files = await response.json();
                    mdFilenames = files
                        .filter((f: any) => f.name.endsWith('.md') && f.type === 'file' && !f.name.startsWith('_'))
                        .map((f: any) => f.name);
                }

                const workshopPromises = mdFilenames.map(async (filename: string) => {
                    try {
                        let res = await fetch(`${basePath}workshops/${filename}`);
                        if (!res.ok) {
                            res = await fetch(`https://raw.githubusercontent.com/dambor/workshop-platform/main/public/workshops/${filename}`);
                        }
                        if (!res.ok) return null;
                        const text = await res.text();
                        return extractMetadata(filename, text);
                    } catch (e) {
                        console.error(`Error processing ${filename}:`, e);
                        return null;
                    }
                });

                const results = await Promise.all(workshopPromises);
                setWorkshops(results.filter((w): w is WorkshopCard => w !== null));
            } catch (error) {
                console.error('Error discovering workshops:', error);
            }
        };

        discoverWorkshops();
    }, []);


    return (
        <div className="min-h-screen bg-surface text-fg font-sans selection:bg-accent-soft">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="aurora-bg" />

                {/* Top bar */}
                <div className="relative max-w-7xl mx-auto px-6 pt-8 lg:px-10 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 group"
                    >
                        <GeminiLogo size={28} animated />
                        <span className="font-display font-semibold text-base tracking-tight gemini-gradient-text">
                            Gemini Workshops
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Hero copy */}
                <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-surface-1/80 backdrop-blur text-xs font-medium text-fg-muted mb-8 animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--color-gemini-purple)]" />
                        Hands-on learning, reimagined with Gemini
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-6 max-w-4xl leading-[1.05]">
                        <span className="gemini-gradient-text">Build with AI,</span>
                        <br />
                        <span className="text-fg">step by step.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-fg-muted max-w-2xl mb-12 leading-relaxed">
                        Guided, interactive workshops to ship real projects with modern AI tooling — from data pipelines to agentic flows.
                    </p>

                    {/* Search */}
                    <div className="relative w-full max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-fg-subtle group-focus-within:text-[var(--color-gemini-purple)] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search workshops by topic, tool, or skill…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-1 border border-border-default text-fg placeholder:text-fg-subtle pl-14 pr-6 py-5 rounded-full focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/60 transition-all text-base shadow-[var(--shadow-card)]"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl gemini-gradient" />
                    </div>
                </div>
            </section>

            {/* Workshops grid */}
            <section className="relative max-w-7xl mx-auto px-6 pb-24 lg:px-10">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-fg">
                            Available workshops
                        </h2>
                        <p className="text-sm text-fg-muted mt-1">
                            {filteredWorkshops.length} {filteredWorkshops.length === 1 ? 'workshop' : 'workshops'} ready to start
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkshops.map((workshop, idx) => (
                        <article
                            key={workshop.id}
                            onClick={() => navigate(`/${workshop.id}`)}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className="group relative flex flex-col rounded-3xl border border-border-default bg-surface-1 hover:bg-surface transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] animate-fade-in"
                        >
                            {/* Top gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] gemini-gradient opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Decorative blur */}
                            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full gemini-gradient opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500" />

                            <div className="relative p-7 flex-1 flex flex-col">
                                <div className="w-12 h-12 rounded-2xl gemini-gradient flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-gemini-purple)]/20 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>

                                <h3 className="font-display text-xl font-semibold text-fg mb-3 tracking-tight">
                                    {workshop.title}
                                </h3>

                                <p className="text-sm text-fg-muted leading-relaxed mb-6 line-clamp-3">
                                    {workshop.description}
                                </p>

                                <div className="mt-auto pt-5 border-t border-border-subtle flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-fg-subtle font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            Intermediate
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            45m
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-2 text-fg-muted group-hover:bg-fg group-hover:text-surface transition-all duration-300">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredWorkshops.length === 0 && workshops.length > 0 && (
                    <div className="text-center py-20 text-fg-muted">
                        No workshops match “{searchQuery}”. Try a different search.
                    </div>
                )}
            </section>
        </div>
    );
};

export default LandingPage;
