import { useEffect, useState } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Plus, Search } from 'lucide-react';
import { ideaApi, setAuthToken } from '../lib/api';
import IdeaCard from '../components/IdeaCard';
import NewSparkModal from '../components/NewSparkModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, getToken, isAuthenticated } = useKindeAuth();
    const navigate = useNavigate();

    const [ideas, setIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const init = async () => {
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }
            try {
                const token = await getToken();
                if (token) {
                    setAuthToken(token);
                    await fetchIdeas();
                } else {
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Auth init failed", err);
                setIsLoading(false);
            }
        };
        init();
    }, [getToken, isAuthenticated]);

    const fetchIdeas = async () => {
        setIsLoading(true);
        try {
            const res = await ideaApi.list();
            setIdeas(res.data);
        } catch (err: any) {
            console.error("Failed to fetch ideas", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateIdea = async (title: string, description: string, goal: string) => {
        try {
            const res = await ideaApi.create(title, description, goal);
            setIdeas(prevIdeas => [res.data, ...prevIdeas]);
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to create idea", err);
        }
    };

    const handleDeleteIdea = async (id: string) => {
        try {
            await ideaApi.delete(id);
            setIdeas(ideas.filter(i => i._id !== id));
        } catch (err: any) {
            console.error("Failed to delete idea", err);
        }
    };

    const handleForge = (id: string) => {
        navigate(`/idea/${id}`);
    };

    const filteredIdeas = ideas.filter(idea =>
        idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#010409] font-plus overflow-hidden">
            {/* Main Workbench */}
            <main className="flex-1 w-full h-screen overflow-y-auto relative bg-slate-50 dark:bg-[#010409]">

                <div className="w-full px-4 md:px-12 lg:px-20 py-6 md:py-16 space-y-8 lg:space-y-24">
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-blue-500" />
                                Neural Workbench
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                                DASHBOARD<span className="text-blue-600">.</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base md:text-2xl font-medium max-w-3xl leading-relaxed tracking-tight opacity-70">
                                Active workspace for {(user as any)?.given_name || (user as any)?.givenName || 'Architect'}. Reason, expand, and stress-test your sparks in the Neural Lab.
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
                                    className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl pl-16 pr-8 py-4 lg:py-5 text-base lg:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-700 focus:outline-none focus:bg-white focus:dark:bg-white/[0.04] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
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
            <NewSparkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateIdea}
            />
        </div>
    );
}
