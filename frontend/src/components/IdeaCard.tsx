import { Trash2, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface IdeaCardProps {
    idea: {
        _id: string;
        title: string;
        description: string;
        score?: number;
        forgeSpec?: any;
        risks?: any[];
    };
    onDelete: (id: string) => void;
    onForge: (id: string) => void;
}

export default function IdeaCard({ idea, onDelete, onForge }: IdeaCardProps) {
    const { speak, stop, isSpeaking } = useSpeechSynthesis();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.05] p-6 md:p-8 rounded-[2rem] hover:bg-white/60 dark:hover:bg-[#0f172a]/60 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl flex flex-col h-full min-h-[450px]"
        >
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {idea.title}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">SPARK-ID: {idea._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            isSpeaking ? stop() : speak(`${idea.title}. ${idea.description}`);
                        }}
                        className={`p-3 rounded-2xl transition-all opacity-0 group-hover:opacity-100 ${isSpeaking ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-blue-500'}`}
                        title={isSpeaking ? "Stop Reading" : "Read Summary"}
                    >
                        {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(idea._id); }}
                        className="p-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1 line-clamp-6 overflow-hidden">
                {typeof idea.description === 'string' ? idea.description : JSON.stringify(idea.description)}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/[0.05] relative z-10">
                <div className="flex items-center gap-3">
                    {idea.score !== undefined ? (
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${idea.score > 70 ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                            idea.score > 40 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${idea.score > 70 ? 'bg-green-500 dark:bg-green-400' : idea.score > 40 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'
                                }`} />
                            Score: {idea.score}%
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-full text-[10px] uppercase font-black border border-slate-200 dark:border-white/[0.05]">
                            Raw Spark
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onForge(idea._id); }}
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all group/btn"
                >
                    {idea.forgeSpec ? 'Reforge' : 'Initialize'}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Modern Card Lighting effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.1] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-white/[0.1] to-transparent" />
        </motion.div>
    );
}
