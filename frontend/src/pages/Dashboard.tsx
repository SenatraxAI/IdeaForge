import { useEffect, useState } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { LogOut, Plus, Layout, Search, Settings, Shield, Zap, Grid3X3, Menu, X } from 'lucide-react';
import { ideaApi, setAuthToken } from '../lib/api';
import IdeaCard from '../components/IdeaCard';
import NewSparkModal from '../components/NewSparkModal';
import Logo from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { logout, user: kindeUser, getToken } = useKindeAuth();
    // const { theme, setTheme } = useTheme(); // Unused now
    const navigate = useNavigate();

    // DEV MODE MOCK
    const user = kindeUser || { givenName: 'Innovator', email: 'dev@ideaforge.app' };

    const [ideas, setIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Skip real token fetch in dev if desired, or just handle null
                const token = await getToken().catch(() => "dev_token");
                setAuthToken(token || "dev_token");
                fetchIdeas();
            } catch (err) {
                console.error("Auth init failed", err);
                // Fallback for dev
                setAuthToken("dev_token");
                fetchIdeas();
            }
        };
        init();
    }, [getToken]);

    const fetchIdeas = async () => {
        setIsLoading(true);
        try {
            const res = await ideaApi.list();
            setIdeas(res.data);
        } catch (err) {
            console.error("Failed to fetch ideas", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateIdea = async (title: string, description: string) => {
        try {
            const res = await ideaApi.create(title, description);
            setIdeas([res.data, ...ideas]);
        } catch (err) {
            console.error("Failed to create idea", err);
        }
    };

    const handleDeleteIdea = async (id: string) => {
        try {
            await ideaApi.delete(id);
            setIdeas(ideas.filter(i => i._id !== id));
        } catch (err) {
            console.error("Failed to delete idea", err);
        }
    };

    const handleForge = (id: string) => {
        navigate(`/idea/${id}`);
    };

    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#010409] text-slate-900 dark:text-slate-300 flex font-plus overflow-hidden relative transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Ultra-Modern Floating Sidebar */}
            <aside className={`w-80 h-full fixed left-0 top-0 p-8 flex flex-col z-50 bg-white/80 dark:bg-[#010409]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/[0.03] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center mb-14 px-4">
                    <div onClick={() => navigate('/')} className="cursor-pointer">
                        <Logo />
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-6">Navigation</p>
                        <nav className="space-y-2">
                            <button className="w-full flex items-center gap-4 px-5 py-4 bg-slate-100 dark:bg-white text-slate-900 rounded-2xl transition-all shadow-sm dark:shadow-xl font-bold">
                                <Grid3X3 size={20} />
                                <span>Workbench</span>
                            </button>
                            <button
                                onClick={() => alert("Social Lab (Collaborate) is coming in Phase 4! Stay tuned.")}
                                className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all font-bold"
                            >
                                <Layout size={20} />
                                <span>Collaborate</span>
                            </button>
                            <button
                                onClick={() => alert("The Vault (Encrypted Ideas) is a premium feature coming soon.")}
                                className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all font-bold"
                            >
                                <Shield size={20} />
                                <span>Vault</span>
                            </button>
                        </nav>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-6">Support</p>
                        <nav className="space-y-2">
                            <button
                                onClick={() => alert("Global settings and profile preferences will be available shortly.")}
                                className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all font-bold text-sm"
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => alert("Upgrades module is currently locked in this Phase.")}
                                className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all font-bold text-sm"
                            >
                                <Zap size={18} />
                                <span>Upgrades</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Profile Widget */}
                <div className="pt-8 mt-auto space-y-4">
                    <ThemeToggle />

                    <div className="bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-6 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-xl">
                                {user?.givenName?.[0] || user?.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-black text-slate-900 dark:text-white truncate leading-none mb-1">{user?.givenName || 'John'}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-red-400/20"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Workbench - Edge-to-Edge Fluidity */}
            <main className="flex-1 w-full lg:ml-80 h-screen overflow-y-auto relative bg-slate-50 dark:bg-[#010409]">
                {/* Visual Depth Elements */}
                <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-blue-600/[0.03] blur-[150px] pointer-events-none rounded-full" />
                <div className="fixed bottom-0 left-[20%] w-[30%] h-[30%] bg-indigo-600/[0.03] blur-[150px] pointer-events-none rounded-full" />

                {/* Mobile Header */}
                <div className="lg:hidden p-6 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-[#010409]/90 backdrop-blur-xl z-20 border-b border-slate-200 dark:border-white/5">
                    <div className="scale-75 origin-left">
                        <Logo />
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 rounded-full">
                        <Menu size={20} />
                    </button>
                </div>

                <div className="w-full px-4 md:px-12 lg:px-20 xl:px-32 py-8 lg:py-16 xl:py-24 space-y-12 lg:space-y-24">
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 lg:gap-12 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-blue-500" />
                                Neural Workbench
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                                DASHBOARD<span className="text-blue-600">.</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-2xl font-medium max-w-3xl leading-relaxed tracking-tight opacity-70">
                                Active workspace for {user?.givenName || 'John'}. Reason, expand, and stress-test your sparks with Gemini 2.5 Flash.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 w-full xl:w-auto">
                            <div className="relative w-full sm:w-[350px] xl:w-[450px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search deep in the mesh..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl pl-16 pr-8 py-4 lg:py-5 text-base lg:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-700 focus:outline-none focus:bg-white focus:dark:bg-white/[0.04] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm dark:shadow-none"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-[2.5rem] font-black italic uppercase tracking-tighter text-lg lg:text-xl shadow-2xl shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                            >
                                <Plus size={20} className="stroke-[3px]" />
                                Initialize Spark
                            </button>
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 text-slate-600 gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-white/[0.03] rounded-full" />
                                <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                            </div>
                            <p className="font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">Querying Core</p>
                        </div>
                    ) : (
                        <div className="relative z-10 pb-20">
                            <AnimatePresence mode="popLayout">
                                {filteredIdeas.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full aspect-[21/9] rounded-[4rem] bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.03] flex flex-col items-center justify-center text-center p-8 lg:p-20 shadow-xl dark:shadow-none"
                                    >
                                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-100 dark:bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 lg:mb-10 border border-blue-500/20">
                                            <Plus className="w-8 h-8 lg:w-12 lg:h-12 stroke-[1px]" />
                                        </div>
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter italic uppercase">Mesh Depleted</h2>
                                        <p className="text-slate-500 max-w-lg text-base lg:text-lg font-medium leading-relaxed opacity-60">
                                            {searchQuery ? "Our neural link failed to locate that specific spark pattern." : "The workshop awaits your first injection of creative energy."}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8"
                                    >
                                        {filteredIdeas.map((idea) => (
                                            <IdeaCard
                                                key={idea._id}
                                                idea={idea}
                                                onDelete={handleDeleteIdea}
                                                onForge={() => handleForge(idea._id)}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Custom Scrollbar Styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
              ::-webkit-scrollbar { width: 8px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
              ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
              .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}} />

            <NewSparkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateIdea}
            />
        </div>
    );
}
