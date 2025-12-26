import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, MessageSquare, Map, ShieldCheck, Rocket, BookOpen, Volume2, Mic } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const sections = [
        {
            icon: <Sparkles className="text-blue-500" size={24} />,
            title: "Initialize Spark",
            description: "Start your journey by injecting a raw idea. Use voice or text to 'ignite' a spark in the Neural Workbench."
        },
        {
            icon: <Zap className="text-yellow-500" size={24} />,
            title: "Neural Workbench",
            description: "Your mission control. View all ignited sparks, search through your ideas, and 'forge' them into deep dives."
        },
        {
            icon: <MessageSquare className="text-green-500" size={24} />,
            title: "Natural Studio",
            description: "Chat with Venty, your AI collaborator. Reason through pivots, ask for stress-tests, and refine project specs."
        },
        {
            icon: <Map className="text-purple-500" size={24} />,
            title: "Evolution Atlas",
            description: "The roadmap for your product. View the phases of development from conception to post-launch scaling."
        },
        {
            icon: <ShieldCheck className="text-emerald-500" size={24} />,
            title: "Viability Index",
            description: "Our proprietary scoring system. Get an instant read on your project's technical, market, and financial health."
        },
        {
            icon: <Volume2 className="text-indigo-500" size={24} />,
            title: "Read Aloud (TTS)",
            description: "Listen to project summaries and AI advice using industry-leading neural voices. Just look for the speaker icon."
        },
        {
            icon: <Mic className="text-red-500" size={24} />,
            title: "Voice Input (STT)",
            description: "Dictate ideas or chat messages naturally. Venty uses 'Neural Settlement' to perfectly capture your intent."
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Neural Guide<span className="text-blue-600">.</span></h2>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Understanding the Forge Ecosystem</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sections.map((section, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl group hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                                {section.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{section.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 p-8 bg-blue-600 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32" />
                                <div className="relative z-10 space-y-2 text-center md:text-left">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Deep Documentation Available</h3>
                                    <p className="text-blue-100 font-medium">Want to master the Forge? Access our full technical and user manuals.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        window.open('/docs', '_blank');
                                        onClose();
                                    }}
                                    className="relative z-10 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
                                >
                                    <Rocket size={16} />
                                    Launch Full Docs
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HelpModal;
