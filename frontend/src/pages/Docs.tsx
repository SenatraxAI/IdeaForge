import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ShieldCheck, Zap, MessageSquare, Volume2, Mic } from 'lucide-react';

const Docs: React.FC = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: <Rocket size={20} />,
            content: (
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tight italic uppercase">Getting Started</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        Welcome to the IdeaForge ecosystem. This platform is designed to take your raw "sparks" of creativity and forge them into investor-grade project specifications.
                    </p>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tight">The First Step</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Navigate to your **Dashboard** and click **"Initialize Spark"**. You'll be prompted to describe your idea. The more detail you provide, the better Venty (our AI engine) can visualize the project.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'neural-workbench',
            title: 'Neural Workbench',
            icon: <Zap size={20} />,
            content: (
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tight italic uppercase">Neural Workbench</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        The Workbench is your central hub for managing project state.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg text-blue-600 h-fit">1</div>
                            <div>
                                <h4 className="font-bold">Spark Management</h4>
                                <p className="text-slate-500 dark:text-slate-400">Search through your history, delete failed concepts, or ignite new ones.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg text-blue-600 h-fit">2</div>
                            <div>
                                <h4 className="font-bold">Deep Forging</h4>
                                <p className="text-slate-500 dark:text-slate-400">Click "Forge" on any spark to enter the Deep Dive view, where the real magic happens.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            id: 'natural-studio',
            title: 'Natural Studio (Chat)',
            icon: <MessageSquare size={20} />,
            content: (
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tight italic uppercase">Natural Studio</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        Natural Studio is where context-aware AI collaboration takes place.
                    </p>
                    <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-blue-500">
                            <ShieldCheck size={18} /> Context Aware
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Venty knows exactly which project section you're looking at. If you ask "How do I make the revenue model better?", it will analyze your current project's business section before answering.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'voice-features',
            title: 'Voice Ecosystem',
            icon: <Volume2 size={20} />,
            content: (
                <div className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tight italic uppercase">Voice Ecosystem</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                        We prioritize accessibility and speed through high-fidelity voice tech.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2 font-bold text-red-500">
                                <Mic size={18} /> Neural Settlement (STT)
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Perfect transcription that waits for your thoughts to fully form.</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2 font-bold text-indigo-500">
                                <Volume2 size={18} /> Neural Voices (TTS)
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">High-fidelity read-aloud capabilities for cards and chat advice.</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#010409] text-slate-900 dark:text-slate-200 font-plus flex">
            {/* Secondary Docs Sidebar */}
            <aside className="w-80 border-r border-slate-200 dark:border-white/5 p-8 flex flex-col hidden lg:flex h-screen sticky top-0">
                <div className="mb-6">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Documentation</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold group ${activeSection === s.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                            <span className={`${activeSection === s.id ? 'text-white' : 'text-blue-500'}`}>{s.icon}</span>
                            {s.title}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 lg:p-24 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl mx-auto"
                    >
                        {sections.find(s => s.id === activeSection)?.content}

                        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <p>© 2025 Senatrax AI - IdeaForge Documentation</p>
                            <div className="flex gap-6">
                                <button className="hover:text-blue-500">Privacy</button>
                                <button className="hover:text-blue-500">Terms</button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Docs;
