import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, GraduationCap, Clock, MonitorPlay, Search } from 'lucide-react';

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

                // Try local index first (served by Vite plugin in dev, static file in prod)
                try {
                    const localIndexRes = await fetch(`${basePath}workshops/index.json`);
                    if (localIndexRes.ok) {
                        mdFilenames = await localIndexRes.json();
                    }
                } catch { /* ignore */ }

                // Fall back to GitHub API
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

                // Fetch content for each workshop
                const workshopPromises = mdFilenames.map(async (filename: string) => {
                    try {
                        // Try local path first
                        let res = await fetch(`${basePath}workshops/${filename}`);
                        if (!res.ok) {
                            // Fall back to GitHub raw
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
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gray-900 border-b border-white/5">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 pt-8 lg:px-8">
                    <div className="flex items-center gap-4 cursor-pointer group w-fit" onClick={() => navigate('/')}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg"
                            alt="IBM"
                            className="h-8 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="h-8 w-px bg-white/10"></div>
                        <span className="text-gray-400 font-medium tracking-tight text-sm">Workshop Platform</span>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-12">
                        Hands-on Workshops
                    </h1>

                    <div className="relative w-full max-w-2xl mb-12 group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a workshop (e.g., AI, Cloud, React...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg placeholder:text-gray-500 shadow-2xl"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity -z-10" />
                    </div>
                </div>
            </div>

            {/* Workshops Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                        <MonitorPlay className="w-6 h-6 text-blue-400" />
                        Available Workshops
                    </h2>
                    <div className="text-sm text-gray-500">
                        {filteredWorkshops.length} {filteredWorkshops.length === 1 ? 'Workshop' : 'Workshops'} Found
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredWorkshops.map((workshop) => (
                        <div
                            key={workshop.id}
                            onClick={() => navigate(`/${workshop.id}`)}
                            className="group relative flex flex-col bg-gray-900 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                    <Book className="w-6 h-6 text-blue-400" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                    {workshop.title}
                                </h3>

                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {workshop.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            Intermediate
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            45m
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-500 text-white transition-all duration-300 transform group-hover:rotate-0 -rotate-45">
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
