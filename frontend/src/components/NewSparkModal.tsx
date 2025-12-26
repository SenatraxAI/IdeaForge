import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInput from './VoiceInput';

interface NewSparkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string, goal: string) => Promise<void>;
}

export default function NewSparkModal({ isOpen, onClose, onSubmit }: NewSparkModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title, description, goal);
            setTitle('');
            setDescription('');
            setGoal('');
            onClose();
        } catch (err) {
            console.error("Submission failed", err);
            alert("The Forge failed to process your spark. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-200/60 dark:bg-slate-950/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative w-full max-w-3xl bg-white/95 dark:bg-[#010409]/90 backdrop-blur-3xl border border-slate-200 dark:border-white/[0.05] p-6 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.1)] overflow-hidden font-plus"
                    >
                        {/* Visual Depth */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>

                        <div className="relative z-10 mb-12">
                            <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                                <div className="w-8 h-px bg-blue-500" />
                                Injection Sequence
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">Initialize Spark<span className="text-blue-600">.</span></h2>
                        </div>

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Core Identity</label>
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your concept's focus..."
                                    className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl px-6 md:px-8 py-5 text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 focus:outline-none focus:bg-white dark:focus:bg-white/[0.04] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Primary Intent / Goal</label>
                                <input
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. Social Impact, Profit, or Personal Utility..."
                                    className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl px-6 md:px-8 py-5 text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 focus:outline-none focus:bg-white dark:focus:bg-white/[0.04] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-blue-600 dark:text-blue-400"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Friction & Vision</label>
                                    <VoiceInput onTranscript={(text: string) => setDescription(prev => prev + (prev ? ' ' : '') + text)} />
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Deconstruct the problem and your proposed solution..."
                                    rows={5}
                                    className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[2rem] px-6 md:px-8 py-6 text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-800 focus:outline-none focus:bg-white dark:focus:bg-white/[0.04] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !title || !description}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-20 disabled:grayscale text-white py-6 rounded-[2rem] font-black italic uppercase tracking-tighter text-2xl shadow-2xl shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Sparkles size={24} className="stroke-[2.5px] group-hover:rotate-12 transition-transform" />
                                        Ignite Neural Core
                                    </>
                                )}
                            </button>
                        </form>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                        .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
                        `}} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
