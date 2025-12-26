import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Home, Grid3X3, BookOpen, HelpCircle,
    LogOut, ChevronLeft, ChevronRight,
    User, Rocket
} from 'lucide-react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import HelpModal from './HelpModal';

const GlobalSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, login, user, isAuthenticated } = useKindeAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location]);

    const navItems = [
        { id: 'home', icon: <Home size={20} />, label: 'Home', path: '/', pub: true },
        { id: 'workbench', icon: <Grid3X3 size={20} />, label: 'Workbench', path: '/dashboard', pub: false },
        { id: 'docs', icon: <BookOpen size={20} />, label: 'Documentation', path: '/docs', pub: true },
    ];

    const sidebarVariants = {
        expanded: { width: '320px' },
        collapsed: { width: '100px' }
    };

    const NavButton = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = location.pathname === item.path;
        const isDisabled = !item.pub && !isAuthenticated;

        if (isDisabled) return null;

        return (
            <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold relative group
                    ${isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
            >
                <div className={`${isActive ? 'text-white' : 'text-blue-500 group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                </div>
                {(isExpanded || isMobileOpen) && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="truncate"
                    >
                        {item.label}
                    </motion.span>
                )}
                {!isExpanded && !isMobileOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                        {item.label}
                    </div>
                )}
            </button>
        );
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#010409] font-plus overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={isExpanded ? 'expanded' : 'collapsed'}
                variants={sidebarVariants}
                className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#010409] border-r border-slate-200 dark:border-white/5 p-6 flex flex-col hidden lg:flex transition-all duration-500 ease-in-out"
            >
                <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-12`}>
                    {isExpanded ? <Logo /> : <div className="scale-75"><Rocket className="text-blue-600" /></div>}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                    >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
                    <div>
                        {isExpanded && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">Neural Grid</p>}
                        <nav className="space-y-2">
                            {navItems.map(item => <NavButton key={item.id} item={item} />)}
                        </nav>
                    </div>

                    <div>
                        {isExpanded && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">Tools</p>}
                        <nav className="space-y-4">
                            <div className="px-2">
                                <button
                                    onClick={() => setIsHelpModalOpen(true)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold group relative
                                        ${isExpanded ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}
                                    `}
                                >
                                    <HelpCircle size={20} className={`${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-500'} transition-colors`} />
                                    {isExpanded && <span>Neural Guide</span>}
                                    {!isExpanded && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                                            Neural Guide
                                        </div>
                                    )}
                                </button>
                            </div>
                            <div className="px-2">
                                <ThemeToggle showLabel={isExpanded} />
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Profile Widget */}
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                    {isAuthenticated ? (
                        <div className={`flex flex-col gap-4 ${!isExpanded && 'items-center'}`}>
                            {isExpanded ? (
                                <div className="bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.05] rounded-3xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black truncate">{user?.givenName || 'Architect'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={() => logout()}
                                className={`w-full flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[10px] ${!isExpanded ? 'justify-center' : 'px-4 py-2'}`}
                            >
                                <LogOut size={16} />
                                {isExpanded && <span>Sign Out</span>}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => login()}
                            className={`w-full bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ${!isExpanded ? 'justify-center w-12 h-12 p-0 mx-auto' : 'px-6 py-4'}`}
                        >
                            <User size={16} />
                            {isExpanded && <span>Access Forge</span>}
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* Mobile Nav Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#010409]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-50 px-6 flex items-center justify-between">
                <div className="scale-75 origin-left"><Logo /></div>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-900 dark:text-white"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-[#020617]/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white dark:bg-[#010409] z-[70] p-8 flex flex-col lg:hidden"
                        >
                            <div className="mb-12"><Logo /></div>
                            <nav className="flex-1 space-y-4">
                                {navItems.map(item => <NavButton key={item.id} item={item} />)}
                                <div className="px-2">
                                    <button
                                        onClick={() => setIsHelpModalOpen(true)}
                                        className="w-full flex items-center gap-4 px-5 py-4 bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl transition-all font-bold group"
                                    >
                                        <HelpCircle size={20} />
                                        <span>Neural Guide</span>
                                    </button>
                                </div>
                                <div className="px-2 pt-2">
                                    <ThemeToggle showLabel={true} />
                                </div>
                            </nav>
                            <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/5">
                                {isAuthenticated ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                                                {user?.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white">{user?.givenName || 'Architect'}</p>
                                                <p className="text-xs text-slate-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => logout()} className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-black uppercase tracking-widest text-[10px] border border-red-500/20 rounded-2xl">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => login()} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 items-center justify-center flex gap-3">
                                        <User size={18} /> Access Forge
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className={`flex-1 w-full transition-all duration-500 ease-in-out ${isExpanded ? 'lg:pl-[320px]' : 'lg:pl-[100px]'} pt-16 lg:pt-0`}>
                {children}
            </main>

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
};

export default GlobalSidebar;
