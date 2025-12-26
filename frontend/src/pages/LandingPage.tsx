import { Rocket, ShieldCheck, Sparkles, Zap, ChevronRight } from 'lucide-react'
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const { login, isAuthenticated, isLoading } = useKindeAuth();
    const navigate = useNavigate();

    if (isLoading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Forging the Experience...</p>
        </div>
    </div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-blue-500/30 font-sans overflow-x-hidden relative transition-colors duration-300">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            {/* Hero Section - expansive split layout */}
            <main className="relative z-10 w-full px-4 md:px-12 lg:px-20 pt-10 md:pt-16 pb-20 md:pb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center min-h-[calc(100vh-140px)]">
                <div className="lg:col-span-7 space-y-10">
                    <div className="h-6" /> {/* Placeholder/Spacer for removed badge */}

                    <div className="space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[3.5rem] md:text-7xl xl:text-[10rem] font-black text-white leading-[0.85] tracking-tighter"
                        >
                            Forge Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Masterpiece.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-base md:text-2xl lg:text-3xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium tracking-tight"
                        >
                            The advanced workspace where sparks transcend into products. Reason, stress-test, and build with the speed of thought.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 pt-4"
                    >
                        <button
                            onClick={() => isAuthenticated ? navigate('/dashboard') : login()}
                            className="group bg-blue-600 hover:bg-blue-700 text-white font-black py-4 md:py-5 px-10 md:px-12 rounded-2xl md:rounded-[2rem] text-lg md:text-xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 hover:-translate-y-1 active:translate-y-0"
                        >
                            Initialize Workbench
                            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button className="bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-900 dark:text-white font-black py-4 md:py-5 px-10 md:px-12 rounded-2xl md:rounded-[2rem] text-lg md:text-xl border border-slate-200 dark:border-slate-800 transition-all backdrop-blur-md shadow-lg">
                            View Blueprint
                        </button>
                    </motion.div>
                </div>

                {/* Expansive Visual Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="hidden lg:block lg:col-span-5 relative h-full min-h-[600px]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/20 rounded-[4rem] border border-slate-700/30 p-12 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] group overflow-hidden h-full flex flex-col justify-between">
                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <div className="w-4 h-4 rounded-full bg-red-500/40" />
                                    <div className="w-4 h-4 rounded-full bg-yellow-500/40" />
                                    <div className="w-4 h-4 rounded-full bg-green-500/40" />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System: Active</div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="h-5 w-48 bg-slate-700/50 rounded-full animate-pulse" />
                                    <div className="h-3 w-full bg-slate-800/50 rounded-full" />
                                </div>

                                <div className="bg-slate-950/80 rounded-[2rem] border border-slate-800 p-8 shadow-inner">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                                            <Rocket size={24} />
                                        </div>
                                        <div className="h-4 w-32 bg-slate-700/50 rounded-full" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-2 w-full bg-blue-500/10 rounded-full" />
                                        <div className="h-2 w-full bg-blue-500/10 rounded-full" />
                                        <div className="h-2 w-3/4 bg-blue-500/10 rounded-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="h-24 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 flex items-center justify-center">
                                        <ShieldCheck className="text-indigo-400" size={32} />
                                    </div>
                                    <div className="h-24 bg-purple-600/10 rounded-[2rem] border border-purple-500/20 flex items-center justify-center">
                                        <Zap className="text-purple-400" size={32} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 p-8 bg-blue-600 rounded-3xl flex items-center justify-between shadow-2xl shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-blue-200 opacity-80 mb-1">Forging Meta-Data</p>
                                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Ready to Expand</p>
                            </div>
                            <Sparkles size={32} className="text-white animate-pulse" />
                        </div>

                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    {/* External Floating Card */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-10 -left-10 bg-slate-950 border border-slate-800 p-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-20 space-y-2 text-center min-w-[200px]"
                    >
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Confidence</p>
                        <p className="text-6xl font-black text-white italic tracking-tighter">98<span className="text-blue-500">%</span></p>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
