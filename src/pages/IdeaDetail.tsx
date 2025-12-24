import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, AlertTriangle, ShieldCheck, Loader2, Info, Save, Edit3, Target, TrendingUp, Search, MessageSquare, Send, X, Workflow, Cpu, Rocket, DollarSign, Zap, RefreshCw, Trash2, Wand2, Check } from 'lucide-react';
import { ideaApi } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const renderMarkdown = (text: string): ReactNode => {
    // Handle Bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);

    if (parts.length > 1) {
        return parts.map((part, i) => {
            if (i % 2 === 1) return <strong key={i} className="font-bold text-white">{renderMarkdown(part)}</strong>;
            return renderMarkdown(part);
        });
    }

    // Handle Italics (*text*)
    const italicRegex = /\*(.*?)\*/g;
    const partsItalic = text.split(italicRegex);
    if (partsItalic.length > 1) {
        return partsItalic.map((part, i) => {
            if (i % 2 === 1) return <em key={i} className="italic text-slate-200">{renderMarkdown(part)}</em>;
            return part;
        });
    }

    return text;
};

export default function IdeaDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<any>(null);
    const [isForging, setIsForging] = useState(false);
    const [isStressTesting, setIsStressTesting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDesc, setEditedDesc] = useState('');
    const [activePhase, setActivePhase] = useState<any>(null);

    // Chat / Consult State
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai', text: string }>>([]);
    const [isConsulting, setIsConsulting] = useState(false);
    const [isApplyingEvolution, setIsApplyingEvolution] = useState(false);
    const [isAddingSpark, setIsAddingSpark] = useState(false);
    const [sparkInput, setSparkInput] = useState('');
    const [sparkTitle, setSparkTitle] = useState('');
    const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'core' | 'sparks'>('core');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showFullSolution, setShowFullSolution] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

    // Refs for inline editing
    const problemRef = useRef<HTMLTextAreaElement>(null);
    const solutionRef = useRef<HTMLTextAreaElement>(null);
    const audienceRef = useRef<HTMLInputElement>(null);
    const revenueRef = useRef<HTMLInputElement>(null);
    const creativeFlowRef = useRef<HTMLTextAreaElement>(null);
    const techStackRef = useRef<HTMLTextAreaElement>(null);
    const growthLeversRef = useRef<HTMLTextAreaElement>(null);
    const unitEconomicsRef = useRef<HTMLTextAreaElement>(null);
    const notesRef = useRef<HTMLTextAreaElement>(null);
    const [expandedDeepDiveSections, setExpandedDeepDiveSections] = useState<Set<string>>(new Set());

    // AI Assist State
    const [aiAssistField, setAiAssistField] = useState<string | null>(null);
    const [aiAssistContext, setAiAssistContext] = useState('');
    const [aiInstruction, setAiInstruction] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const openAiAssist = (field: string, context: string) => {
        setAiAssistField(field);
        setAiAssistContext(context);
        setAiInstruction('');
        setAiResult('');
    };

    const closeAiAssist = () => {
        setAiAssistField(null);
        setAiAssistContext('');
        setAiInstruction('');
        setAiResult('');
    };

    const handleAiGenerate = async () => {
        if (!aiInstruction.trim() || !id) return;
        setIsAiGenerating(true);
        try {
            // We use the consult endpoint as a "writer" proxy
            const prompt = `You are an expert product copywriter. Rewrite the following content based on these instructions: "${aiInstruction}". \n\nOriginal Content: "${aiAssistContext}"\n\nReturn ONLY the rewritten text, no conversational filler.`;
            const res = await ideaApi.consult(id, prompt, aiAssistField || 'General', []);
            setAiResult(res.data.answer);
        } catch (err: any) {
            console.error("AI Writer Error:", err);
            alert(`AI Assistant Error: ${err.response?.data?.message || err.message || "Unknown error"}`);
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSaveCoreSpec = async () => {
        if (!id || !idea.forgeSpec) return;

        const updatedSpec = {
            ...idea.forgeSpec,
            problem: problemRef.current?.value || idea.forgeSpec.problem,
            solution: solutionRef.current?.value || idea.forgeSpec.solution,
            targetAudience: audienceRef.current?.value || idea.forgeSpec.targetAudience,
            revenueModel: revenueRef.current?.value || idea.forgeSpec.revenueModel,
            expansions: {
                ...idea.forgeSpec.expansions,
                creativeFlow: creativeFlowRef.current?.value || idea.forgeSpec.expansions.creativeFlow,
                techStack: techStackRef.current?.value || idea.forgeSpec.expansions.techStack,
                growthLevers: growthLeversRef.current?.value || idea.forgeSpec.expansions.growthLevers,
                unitEconomics: unitEconomicsRef.current?.value || idea.forgeSpec.expansions.unitEconomics,
                notes: notesRef.current?.value || idea.forgeSpec.expansions.notes,
            }
        };

        try {
            await ideaApi.refine(id, 'forgeSpec', JSON.stringify(updatedSpec));
            setEditingSection(null);
            // Optimistic update
            setIdea((prev: any) => prev ? { ...prev, forgeSpec: updatedSpec } : null);
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        }
    };

    const handleAiAccept = () => {
        if (!aiResult || !aiAssistField) return;

        // Update the corresponding ref
        switch (aiAssistField) {
            case 'Problem Statement': if (problemRef.current) problemRef.current.value = aiResult; break;
            case 'Solution': if (solutionRef.current) solutionRef.current.value = aiResult; break;
            case 'Target Audience': if (audienceRef.current) audienceRef.current.value = aiResult; break;
            case 'Revenue Model': if (revenueRef.current) revenueRef.current.value = aiResult; break;
            case 'Creative Flow': if (creativeFlowRef.current) creativeFlowRef.current.value = aiResult; break;
            case 'Tech Stack': if (techStackRef.current) techStackRef.current.value = aiResult; break;
            case 'Growth Levers': if (growthLeversRef.current) growthLeversRef.current.value = aiResult; break;
            case 'Unit Economics': if (unitEconomicsRef.current) unitEconomicsRef.current.value = aiResult; break;
            case 'Neural Notes': if (notesRef.current) notesRef.current.value = aiResult; break;
        }

        closeAiAssist();
    };

    const toggleDeepDiveSection = (section: string) => {
        const newExpanded = new Set(expandedDeepDiveSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedDeepDiveSections(newExpanded);
    };

    useEffect(() => {
        if (chatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, chatOpen]);

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const res = await ideaApi.list();
                const found = res.data.find((i: any) => i._id === id);
                if (found) {
                    setIdea(found);
                    setEditedTitle(found.title);
                    setEditedDesc(found.description);
                }
                else navigate('/dashboard');
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            }
        };
        fetchIdea();
    }, [id, navigate]);

    const handleUpdate = async () => {
        if (!id) return;
        try {
            await ideaApi.update(id, editedTitle, editedDesc);
            setIdea({ ...idea, title: editedTitle, description: editedDesc });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Evolution sync failed.");
        }
    };

    const handleForge = async (redo = false) => {
        if (!id) return;
        setIsForging(true);
        try {
            const res = await ideaApi.forge(id, redo);
            if (redo) {
                setIdea({
                    ...idea,
                    forgeSpec: res.data.forgeSpec,
                    marketResearch: res.data.marketResearch,
                    score: undefined,
                    viabilityBreakdown: undefined,
                    pillarReasons: undefined,
                    risks: undefined,
                    roadmap: undefined,
                    deepDive: undefined
                });
                alert("Forge Reset: Neural pathways remapped with fresh intelligence.");
            } else {
                setIdea({ ...idea, forgeSpec: res.data.forgeSpec, marketResearch: res.data.marketResearch });
            }
        } catch (err: any) {
            console.error(err);
            alert("Forge Initialization Failed: " + (err.response?.data?.message || err.message || "Unknown error"));
        } finally {
            setIsForging(false);
        }
    };

    const handleConsult = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim() || !id) return;

        const currentQuery = query;
        setQuery('');
        const historyToSend = [...chatHistory, { role: 'user' as const, text: currentQuery }];
        setChatHistory(historyToSend);
        setIsConsulting(true);

        try {
            const res = await ideaApi.consult(id, currentQuery, activeSection, chatHistory);
            setChatHistory(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            console.error(err);
            // Don't add error to history, just notify user or show a temporary message
            alert("The Neural Core is resisting this query. Try rephasing or check your connection.");
        } finally {
            setIsConsulting(false);
        }
    };

    const handleApplyEvolution = async (jsonUpdate: string) => {
        if (!id) return;
        setIsApplyingEvolution(true);
        try {
            const res = await ideaApi.refine(id, 'evolution', jsonUpdate);
            setIdea((prev: any) => ({
                ...prev,
                forgeSpec: { ...prev.forgeSpec, ...res.data.updates }
            }));
            // Optionally add a confirmation message to chat
            setChatHistory(prev => [...prev, { role: 'ai', text: "✨ Neural Core updated with the new evolution. The spec cards have been refined." }]);
        } catch (err) {
            console.error(err);
            alert("Failed to apply evolution.");
        } finally {
            setIsApplyingEvolution(false);
        }
    };

    const handleAddSpark = async (text?: string, title?: string) => {
        const sparkText = text || sparkInput;
        const finalTitle = title || sparkTitle;
        if (!id || !sparkText.trim()) return;

        setIsAddingSpark(true);
        try {
            const res = await ideaApi.addSpark(id, sparkText, finalTitle);
            setIdea((prev: any) => ({
                ...prev,
                smallerSparks: [...(prev.smallerSparks || []), res.data.spark]
            }));
            setSparkInput('');
            setSparkTitle('');
            alert("Spark ignited! Captured in the 'Smaller Sparks' tab.");
        } catch (err) {
            console.error(err);
            alert("Failed to save spark.");
        } finally {
            setIsAddingSpark(false);
        }
    };

    const handleDeleteSpark = async (sparkId: string) => {
        if (!id) return;
        try {
            await ideaApi.deleteSpark(id, sparkId);
            setIdea((prev: any) => ({
                ...prev,
                smallerSparks: prev.smallerSparks.filter((s: any) => s.id !== sparkId)
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to remove spark.");
        }
    };

    const openChatWithContext = (section: string) => {
        setActiveSection(section);
        setChatOpen(true);

        // Welcome message if first time opening
        if (chatHistory.length === 0) {
            setTimeout(() => {
                setChatHistory([{
                    role: 'ai',
                    text: `Hey, I'm Venty! 🧠✨\n\nI'm your VC mentor and product strategist. Think of me as your personal Y Combinator partner—I'm here to push you forward and make sure you're actually shipping.\n\nMy goal? To get your idea's viability score above 80 and make sure you're hitting your success metrics. I'll be creative and supportive, but also strict about your business logic. We're here to build a world-class product.\n\nWhat are we building today?`
                }]);
            }, 300);
        }
    };



    const handleStressTest = async (redo = false) => {
        if (!id) return;
        setIsStressTesting(true);
        try {
            const res = await ideaApi.stressTest(id, redo);
            setIdea({
                ...idea,
                risks: res.data.risks,
                score: res.data.score,
                viabilityBreakdown: res.data.viabilityBreakdown,
                pillarReasons: res.data.pillarReasons,
                roadmap: res.data.roadmap,
                deepDive: res.data.deepDive
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsStressTesting(false);
        }
    };

    if (!idea) return null;

    const isHighViability = (idea.score || 0) >= 80;

    return (
        <div className="min-h-screen bg-[#010409] text-slate-300 p-8 lg:p-20 font-plus overflow-x-hidden relative">
            {/* Visual Depth */}
            <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-blue-600/[0.03] blur-[150px] pointer-events-none rounded-full" />
            <div className="fixed bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/[0.02] blur-[100px] pointer-events-none rounded-full" />

            <div className="w-full xl:px-32 3xl:px-48 relative z-10">
                <Link to="/dashboard" className="inline-flex items-center gap-3 text-slate-500 hover:text-white mb-16 transition-all group font-bold uppercase tracking-widest text-[10px]">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Workbench
                </Link>

                <header className="flex flex-col xl:flex-row justify-between items-start gap-12 mb-24">
                    <div className="space-y-6 max-w-4xl w-full">
                        <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-px bg-blue-500" />
                            Project Intelligence
                        </div>
                        {isEditing ? (
                            <div className="space-y-6">
                                <input
                                    value={editedTitle}
                                    onChange={e => setEditedTitle(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-3xl px-8 py-4 text-4xl lg:text-6xl font-black text-white focus:outline-none focus:border-blue-500/50"
                                />
                                <textarea
                                    value={editedDesc}
                                    onChange={e => setEditedDesc(e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-3xl px-8 py-6 text-xl text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none"
                                />
                                <div className="flex gap-4">
                                    <button onClick={handleUpdate} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                                        <Save size={18} /> Save Progress
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="bg-white/5 text-slate-400 px-8 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <h1 className="text-6xl lg:text-8xl 3xl:text-9xl font-black text-white tracking-tighter italic leading-none mb-6">
                                    {idea.title}<span className="text-blue-600">.</span>
                                </h1>
                                <p className="text-slate-400 text-xl lg:text-2xl font-medium leading-relaxed opacity-70 3xl:max-w-5xl mb-8">{idea.description}</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full hover:bg-white/10"
                                    >
                                        <Edit3 size={14} /> Edit Spark
                                    </button>
                                    <button
                                        onClick={() => setChatOpen(true)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all bg-blue-600/10 px-6 py-3 rounded-full hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500/20"
                                    >
                                        <MessageSquare size={14} /> Open Neural Studio
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!idea.forgeSpec ? (
                        <button
                            onClick={() => handleForge(false)}
                            disabled={isForging}
                            className="w-full xl:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-12 py-6 rounded-[2.5rem] font-black italic uppercase tracking-tighter text-2xl shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-4"
                        >
                            {isForging ? <Loader2 className="animate-spin" /> : <Sparkles className="stroke-[2.5px]" />}
                            Initialize Forge
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleForge(true)}
                                disabled={isForging}
                                title="Force fresh market research and spec generation"
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                {isForging ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Redo Neural Research
                            </button>
                        </div>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {idea.forgeSpec ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Tab Switcher */}
                            <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-2xl border border-white/10 mb-8">
                                <button
                                    onClick={() => setActiveTab('core')}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'core' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Product Core
                                </button>
                                <button
                                    onClick={() => setActiveTab('sparks')}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'sparks' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Smaller Sparks
                                    {idea.smallerSparks?.length > 0 && (
                                        <span className="bg-blue-400 text-blue-950 px-1.5 py-0.5 rounded-md text-[8px]">
                                            {idea.smallerSparks.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {activeTab === 'core' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    {/* Product Spec Card */}
                                    <div className="lg:col-span-12 xl:col-span-9 space-y-12">
                                        <section className={`bg-[#0f172a]/40 backdrop-blur-2xl border ${isHighViability ? 'border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)]' : 'border-white/[0.05]'} p-12 rounded-[3.5rem] relative overflow-hidden group/spec`}>
                                            <div className={`absolute top-0 right-0 w-64 h-64 ${isHighViability ? 'bg-yellow-500/10' : 'bg-blue-600/5'} blur-[80px]`} />

                                            <div className="flex justify-between items-start mb-10 relative z-10">
                                                <h2 className="text-2xl font-black text-white flex items-center gap-4 italic uppercase tracking-tight">
                                                    <div className={`p-3 ${isHighViability ? 'bg-yellow-500' : 'bg-blue-600'} rounded-2xl shadow-lg`}>
                                                        <ShieldCheck size={24} className="text-white" />
                                                    </div>
                                                    Core Specification
                                                </h2>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            if (editingSection === 'coreSpec') {
                                                                handleSaveCoreSpec();
                                                            } else {
                                                                setEditingSection('coreSpec');
                                                            }
                                                        }}
                                                        className="opacity-60 group-hover/spec:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
                                                    >
                                                        <Edit3 size={12} /> {editingSection === 'coreSpec' ? 'Save' : 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => openChatWithContext('Core Specification')}
                                                        className="opacity-60 group-hover/spec:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white bg-blue-600/10 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-600"
                                                    >
                                                        <MessageSquare size={12} /> Refine Spec
                                                    </button>
                                                    {isHighViability && (
                                                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">
                                                            Venture Ready
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-12 relative z-10">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <Target size={14} /> The Friction
                                                        </h3>
                                                        <button onClick={() => openChatWithContext('Problem Statement')} className="p-1.5 hover:bg-slate-700/20 rounded-lg transition-colors" title="Discuss Problem">
                                                            <MessageSquare size={14} className="text-slate-500 hover:text-slate-300" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Problem Statement', idea.forgeSpec.problem)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={problemRef}
                                                                defaultValue={idea.forgeSpec.problem}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-lg text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-lg text-slate-300 leading-relaxed font-medium">{idea.forgeSpec.problem}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-4 p-8 bg-blue-600/5 rounded-3xl border border-blue-500/10">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">The Solution</h3>
                                                        <button onClick={() => openChatWithContext('Solution')} className="p-1.5 hover:bg-blue-600/20 rounded-lg transition-colors" title="Discuss Solution">
                                                            <MessageSquare size={14} className="text-blue-400 hover:text-blue-300" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Solution', idea.forgeSpec.solution)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={solutionRef}
                                                                defaultValue={idea.forgeSpec.solution}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-xl text-white focus:outline-none focus:border-blue-500/50 resize-none font-bold italic"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xl text-white leading-relaxed font-bold italic">"{idea.forgeSpec.solution}"</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Segment</h3>
                                                            <button onClick={() => openChatWithContext('Target Audience')} className="p-1.5 hover:bg-slate-700/20 rounded-lg transition-colors" title="Discuss Target Audience">
                                                                <MessageSquare size={14} className="text-slate-500 hover:text-slate-300" />
                                                            </button>
                                                        </div>
                                                        {editingSection === 'coreSpec' ? (
                                                            <div className="space-y-2">
                                                                <div className="flex justify-end">
                                                                    <button onClick={() => openAiAssist('Target Audience', idea.forgeSpec.targetAudience)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                        <Wand2 size={12} /> AI Rewrite
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    ref={audienceRef}
                                                                    defaultValue={idea.forgeSpec.targetAudience}
                                                                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-3 text-lg text-slate-300 focus:outline-none focus:border-blue-500/50 font-bold"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg text-slate-300 font-bold">{idea.forgeSpec.targetAudience}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Revenue Engine</h3>
                                                            <button onClick={() => openChatWithContext('Revenue Model')} className="p-1.5 hover:bg-slate-700/20 rounded-lg transition-colors" title="Discuss Revenue Model">
                                                                <MessageSquare size={14} className="text-slate-500 hover:text-slate-300" />
                                                            </button>
                                                        </div>
                                                        {editingSection === 'coreSpec' ? (
                                                            <div className="space-y-2">
                                                                <div className="flex justify-end">
                                                                    <button onClick={() => openAiAssist('Revenue Model', idea.forgeSpec.revenueModel)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                        <Wand2 size={12} /> AI Rewrite
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    ref={revenueRef}
                                                                    defaultValue={idea.forgeSpec.revenueModel}
                                                                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-3 text-lg text-slate-300 focus:outline-none focus:border-blue-500/50 font-bold"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg text-slate-300 font-bold">{idea.forgeSpec.revenueModel}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* PRODUCT EXPANSIONS */}
                                        {idea.forgeSpec.expansions && (
                                            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem] space-y-4 hover:border-blue-500/20 transition-all group/exp relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-600/10 rounded-xl text-blue-400 group-hover/exp:bg-blue-600 group-hover/exp:text-white transition-all">
                                                                <Workflow size={18} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Creative Flow</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('coreSpec')}
                                                            className="opacity-0 group-hover/exp:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Edit Expansions"
                                                        >
                                                            <Edit3 size={14} className="text-slate-500 hover:text-white" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Creative Flow', idea.forgeSpec.expansions.creativeFlow)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={creativeFlowRef}
                                                                defaultValue={idea.forgeSpec.expansions.creativeFlow}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none h-32"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.forgeSpec.expansions.creativeFlow}</p>
                                                    )}
                                                </div>

                                                <div className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem] space-y-4 hover:border-purple-500/20 transition-all group/exp relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-purple-600/10 rounded-xl text-purple-400 group-hover/exp:bg-purple-600 group-hover/exp:text-white transition-all">
                                                                <Cpu size={18} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tech Stack</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('coreSpec')}
                                                            className="opacity-0 group-hover/exp:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Edit Expansions"
                                                        >
                                                            <Edit3 size={14} className="text-slate-500 hover:text-white" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Tech Stack', idea.forgeSpec.expansions.techStack)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={techStackRef}
                                                                defaultValue={idea.forgeSpec.expansions.techStack}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 resize-none h-32"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.forgeSpec.expansions.techStack}</p>
                                                    )}
                                                </div>

                                                <div className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem] space-y-4 hover:border-orange-500/20 transition-all group/exp relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-orange-600/10 rounded-xl text-orange-400 group-hover/exp:bg-orange-600 group-hover/exp:text-white transition-all">
                                                                <Rocket size={18} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Growth Levers</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('coreSpec')}
                                                            className="opacity-0 group-hover/exp:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Edit Expansions"
                                                        >
                                                            <Edit3 size={14} className="text-slate-500 hover:text-white" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Growth Levers', idea.forgeSpec.expansions.growthLevers)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={growthLeversRef}
                                                                defaultValue={idea.forgeSpec.expansions.growthLevers}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 resize-none h-32"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.forgeSpec.expansions.growthLevers}</p>
                                                    )}
                                                </div>

                                                <div className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem] space-y-4 hover:border-green-500/20 transition-all group/exp relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-600/10 rounded-xl text-green-400 group-hover/exp:bg-green-600 group-hover/exp:text-white transition-all">
                                                                <DollarSign size={18} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Unit Economics</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('coreSpec')}
                                                            className="opacity-0 group-hover/exp:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Edit Expansions"
                                                        >
                                                            <Edit3 size={14} className="text-slate-500 hover:text-white" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Unit Economics', idea.forgeSpec.expansions.unitEconomics)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={unitEconomicsRef}
                                                                defaultValue={idea.forgeSpec.expansions.unitEconomics}
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-green-500/50 resize-none h-32"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.forgeSpec.expansions.unitEconomics}</p>
                                                    )}
                                                </div>

                                                {/* NEURAL NOTES - HIGH PRIORITY CONTEXT */}
                                                <div className="md:col-span-2 bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 p-12 rounded-[3.5rem] space-y-4 hover:border-blue-500/30 transition-all group/exp relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400 group-hover/exp:bg-blue-600 group-hover/exp:text-white transition-all">
                                                                <Edit3 size={18} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Neural Notes (AI Priority Context)</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('coreSpec')}
                                                            className="opacity-0 group-hover/exp:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Edit Notes"
                                                        >
                                                            <Edit3 size={14} className="text-slate-500 hover:text-white" />
                                                        </button>
                                                    </div>
                                                    {editingSection === 'coreSpec' ? (
                                                        <div className="space-y-4">
                                                            <div className="flex justify-end">
                                                                <button onClick={() => openAiAssist('Neural Notes', idea.forgeSpec.expansions.notes || '')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                                                                    <Wand2 size={12} /> AI Rewrite
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                ref={notesRef}
                                                                defaultValue={idea.forgeSpec.expansions.notes || ''}
                                                                placeholder="Add specific directives or constraints here. PRO TIP: Reference 'Named Sparks' (e.g. '@Pivot to Mobile') to prioritize specific captured insights in the AI's evolution strategy. This section is the Neural Priority Layer."
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none h-40"
                                                            />
                                                            {idea.smallerSparks && idea.smallerSparks.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available Sparks for Reference</div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {idea.smallerSparks.map((s: any) => (
                                                                            <button
                                                                                key={s.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (notesRef.current) {
                                                                                        const start = notesRef.current.selectionStart;
                                                                                        const end = notesRef.current.selectionEnd;
                                                                                        const text = notesRef.current.value;
                                                                                        const insert = ` @${s.title || 'Untitled Spark'} `;
                                                                                        notesRef.current.value = text.substring(0, start) + insert + text.substring(end);
                                                                                        notesRef.current.focus();
                                                                                    }
                                                                                }}
                                                                                className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                                                                            >
                                                                                <Zap size={10} />
                                                                                {s.title || 'Untitled Spark'}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-slate-300 text-sm leading-relaxed italic">
                                                                {idea.forgeSpec.expansions.notes || "No specific directives yet. Click the pen to add notes that will guide Venty's evolution analysis."}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[8px] font-bold text-blue-500/50 uppercase tracking-widest">
                                                                <ShieldCheck size={10} /> Priority Instruction Layer Active
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {/* Global Save Button for Expansions when in edit mode */}
                                        {editingSection === 'coreSpec' && (
                                            <div className="flex justify-center pt-8">
                                                <button
                                                    onClick={handleSaveCoreSpec}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105 active:scale-95"
                                                >
                                                    Save All Changes
                                                </button>
                                            </div>
                                        )}

                                        {/* INVESTOR-GRADE DEEP DIVE PRD */}
                                        {idea.deepDive && (
                                            <div className="space-y-8">
                                                {/* Header */}
                                                <div className="text-center space-y-4 py-12">
                                                    <h2 className="text-4xl font-black text-white italic tracking-tight">Investor Deep Dive</h2>
                                                    <p className="text-slate-500 text-sm uppercase tracking-[0.3em] font-bold">Comprehensive Product Requirements Document</p>
                                                </div>

                                                {/* 1. Executive Summary */}
                                                <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-12 rounded-[3.5rem] relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px]" />
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">1</div>
                                                                Executive Summary
                                                            </h3>
                                                            <button
                                                                onClick={() => openChatWithContext('Executive Summary')}
                                                                className="p-2 hover:bg-blue-600/20 rounded-xl transition-colors"
                                                                title="Discuss Executive Summary"
                                                            >
                                                                <MessageSquare size={20} className="text-blue-400" />
                                                            </button>
                                                        </div>
                                                        <p className="text-lg text-slate-300 leading-relaxed">{idea.deepDive.executiveSummary}</p>
                                                    </div>
                                                </section>

                                                {/* 2. Problem Analysis */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button
                                                            onClick={() => toggleDeepDiveSection('problem')}
                                                            className="flex items-center gap-3 flex-1"
                                                        >
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black">2</div>
                                                                Problem Analysis
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openChatWithContext('Problem Analysis')}
                                                                className="p-2 hover:bg-red-600/20 rounded-xl transition-colors"
                                                                title="Discuss Problem Analysis"
                                                            >
                                                                <MessageSquare size={18} className="text-red-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleDeepDiveSection('problem')}
                                                                className="p-2"
                                                            >
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('problem') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('problem') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Problem Statement</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.problemAnalysis.statement}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Market Evidence</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.problemAnalysis.evidence}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Why Now</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.problemAnalysis.urgency}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 3. Solution Architecture */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('solution')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black">3</div>
                                                                Solution Architecture
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Solution Architecture')} className="p-2 hover:bg-green-600/20 rounded-xl transition-colors" title="Discuss Solution Architecture">
                                                                <MessageSquare size={18} className="text-green-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('solution')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('solution') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('solution') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Value Proposition</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.solutionArchitecture.valueProposition}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Key Features</h4>
                                                                    <ul className="space-y-2">
                                                                        {idea.deepDive.solutionArchitecture.keyFeatures.map((feature: string, i: number) => (
                                                                            <li key={i} className="flex items-start gap-3">
                                                                                <div className="w-6 h-6 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                                                </div>
                                                                                <span className="text-slate-300">{feature}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Technical Approach</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.solutionArchitecture.technicalApproach}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 4. Market Opportunity */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('market')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-white font-black">4</div>
                                                                Market Opportunity
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Market Opportunity')} className="p-2 hover:bg-yellow-600/20 rounded-xl transition-colors" title="Discuss Market Opportunity">
                                                                <MessageSquare size={18} className="text-yellow-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('market')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('market') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('market') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    <div className="p-6 bg-yellow-600/10 border border-yellow-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-3">TAM</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.marketOpportunity.tam}</p>
                                                                    </div>
                                                                    <div className="p-6 bg-yellow-600/10 border border-yellow-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-3">SAM</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.marketOpportunity.sam}</p>
                                                                    </div>
                                                                    <div className="p-6 bg-yellow-600/10 border border-yellow-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mb-3">SOM</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.marketOpportunity.som}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Market Trends</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.marketOpportunity.trends}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 5. Competitive Landscape */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('competitive')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black">5</div>
                                                                Competitive Landscape
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Competitive Landscape')} className="p-2 hover:bg-purple-600/20 rounded-xl transition-colors" title="Discuss Competitive Landscape">
                                                                <MessageSquare size={18} className="text-purple-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('competitive')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('competitive') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('competitive') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Direct Competitors</h4>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {idea.deepDive.competitiveLandscape.directCompetitors.map((comp: string, i: number) => (
                                                                            <span key={i} className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-sm font-bold text-purple-400">{comp}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Competitive Advantage</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.competitiveLandscape.advantage}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Moat & Defensibility</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.competitiveLandscape.moat}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 6. Business Model */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('business')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black">6</div>
                                                                Business Model
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Business Model')} className="p-2 hover:bg-emerald-600/20 rounded-xl transition-colors" title="Discuss Business Model">
                                                                <MessageSquare size={18} className="text-emerald-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('business')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('business') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('business') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Revenue Streams</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.businessModel.revenueStreams}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Pricing Strategy</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.businessModel.pricing}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Unit Economics</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.businessModel.unitEconomics}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 7. Go-to-Market */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('gtm')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-white font-black">7</div>
                                                                Go-to-Market Strategy
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Go-to-Market Strategy')} className="p-2 hover:bg-cyan-600/20 rounded-xl transition-colors" title="Discuss Go-to-Market Strategy">
                                                                <MessageSquare size={18} className="text-cyan-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('gtm')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('gtm') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('gtm') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Target Segments</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.goToMarket.segments}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Distribution Channels</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.goToMarket.channels}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Launch Strategy</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.goToMarket.strategy}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 8. Financial Projections */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('financial')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black">8</div>
                                                                Financial Projections
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Financial Projections')} className="p-2 hover:bg-orange-600/20 rounded-xl transition-colors" title="Discuss Financial Projections">
                                                                <MessageSquare size={18} className="text-orange-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('financial')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('financial') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('financial') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Year 1</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.financialProjections.year1}</p>
                                                                    </div>
                                                                    <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Year 2</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.financialProjections.year2}</p>
                                                                    </div>
                                                                    <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Year 3</h4>
                                                                        <p className="text-slate-300 text-sm leading-relaxed">{idea.deepDive.financialProjections.year3}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Path to Profitability</h4>
                                                                    <p className="text-slate-300 leading-relaxed">{idea.deepDive.financialProjections.breakeven}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 9. Risk Assessment */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('risks')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black">9</div>
                                                                Risk Assessment
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Risk Assessment')} className="p-2 hover:bg-red-600/20 rounded-xl transition-colors" title="Discuss Risk Assessment">
                                                                <MessageSquare size={18} className="text-red-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('risks')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('risks') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('risks') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                                                                {idea.deepDive.riskAssessment.risks.map((risk: any, i: number) => (
                                                                    <div key={i} className="p-6 bg-red-600/5 border border-red-500/10 rounded-2xl">
                                                                        <h4 className="text-sm font-black text-red-400 mb-2">{risk.risk}</h4>
                                                                        <p className="text-slate-400 text-sm leading-relaxed"><span className="text-green-500 font-bold">Mitigation:</span> {risk.mitigation}</p>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>

                                                {/* 10. Success Metrics */}
                                                <section className="bg-white/[0.02] border border-white/[0.05] p-12 rounded-[3.5rem]">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <button onClick={() => toggleDeepDiveSection('metrics')} className="flex items-center gap-3 flex-1">
                                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">10</div>
                                                                Success Metrics
                                                            </h3>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openChatWithContext('Success Metrics')} className="p-2 hover:bg-indigo-600/20 rounded-xl transition-colors" title="Discuss Success Metrics">
                                                                <MessageSquare size={18} className="text-indigo-400" />
                                                            </button>
                                                            <button onClick={() => toggleDeepDiveSection('metrics')} className="p-2">
                                                                <ChevronLeft size={24} className={`text-slate-500 transition-transform ${expandedDeepDiveSections.has('metrics') ? 'rotate-90' : '-rotate-90'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedDeepDiveSections.has('metrics') && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                                                                <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                                                                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-3">North Star Metric</h4>
                                                                    <p className="text-white text-lg font-bold">{idea.deepDive.successMetrics.northStar}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Key Performance Indicators</h4>
                                                                    <ul className="space-y-3">
                                                                        {idea.deepDive.successMetrics.kpis.map((kpi: string, i: number) => (
                                                                            <li key={i} className="flex items-start gap-3">
                                                                                <div className="w-6 h-6 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                                    <TrendingUp size={14} className="text-indigo-500" />
                                                                                </div>
                                                                                <span className="text-slate-300">{kpi}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </section>
                                            </div>
                                        )}

                                        {/* Show old sections only if no deepDive yet (legacy support) */}
                                        {!idea.deepDive && idea.forgeSpec.description && (
                                            <section className="bg-white/[0.01] border border-white/[0.03] p-12 rounded-[3.5rem] group/solution">
                                                <div className="flex justify-between items-center mb-8">
                                                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Solution Deep Dive</h2>
                                                    <button
                                                        onClick={() => openChatWithContext('Solution')}
                                                        className="opacity-60 group-hover/solution:opacity-100 transition-opacity text-blue-400 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        <Edit3 size={12} /> Refine
                                                    </button>
                                                </div>
                                                <div className={`${!showFullSolution ? 'max-h-32 overflow-hidden relative' : ''}`}>
                                                    <p className="text-2xl text-slate-400 font-medium leading-normal italic opacity-80">
                                                        {idea.forgeSpec.description}
                                                    </p>
                                                    {!showFullSolution && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#010409] to-transparent" />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setShowFullSolution(!showFullSolution)}
                                                    className="mt-6 text-blue-500 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    {showFullSolution ? 'Show Less' : 'Expand Full Analysis'}
                                                    <ChevronLeft size={16} className={`transform transition-transform ${showFullSolution ? 'rotate-90' : '-rotate-90'}`} />
                                                </button>
                                            </section>
                                        )}

                                        {idea.marketResearch && (
                                            <section className="bg-white/[0.01] border border-white/[0.03] p-12 rounded-[3.5rem] grid grid-cols-1 md:grid-cols-2 gap-12 group/market">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-2">
                                                            <Search size={14} /> Competitive Intel
                                                        </h3>
                                                        <button
                                                            onClick={() => openChatWithContext('Competitive Intel')}
                                                            className="opacity-60 group-hover/market:opacity-100 transition-opacity text-blue-400 hover:text-white"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {idea.marketResearch.competitors.map((c: string, i: number) => (
                                                            <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 capitalize hover:text-white hover:border-blue-500/30 transition-all cursor-default">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-2">
                                                        <TrendingUp size={14} /> Market Trends
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {idea.marketResearch.trends.map((t: string, i: number) => (
                                                            <span key={i} className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-sm font-bold text-blue-400 hover:text-blue-300 transition-all cursor-default">
                                                                # {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {idea.roadmap && (
                                            <section className="bg-gradient-to-br from-[#0a0c10] to-[#010409] p-12 lg:p-20 rounded-[4rem] border border-white/[0.03] relative overflow-hidden min-h-[600px] flex flex-col items-center group/roadmap">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]" />

                                                <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] mb-24 flex items-center justify-center gap-4 text-center relative z-10">
                                                    <div className="w-12 h-px bg-blue-500/20" />
                                                    Evolution Atlas
                                                    <div className="w-12 h-px bg-blue-500/20" />
                                                </h2>

                                                <button
                                                    onClick={() => openChatWithContext('Evolution Roadmap')}
                                                    className="absolute top-12 right-12 opacity-60 group-hover/roadmap:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white bg-blue-600/10 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-600 z-50"
                                                >
                                                    <MessageSquare size={12} /> Discuss Strategy
                                                </button>

                                                {/* Mind Map Structure */}
                                                <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center relative z-10">
                                                    {/* SVG Connections */}
                                                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                                        <defs>
                                                            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                                                                <stop offset="50%" stopColor="#2563eb" stopOpacity="1" />
                                                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M 100 200 Q 250 50 500 200 T 900 200" fill="transparent" stroke="url(#line-grad)" strokeWidth="2" strokeDasharray="8 8" className="animate-dash" />
                                                    </svg>

                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full">
                                                        {idea.roadmap.map((item: any, i: number) => (
                                                            <motion.div
                                                                key={item.id}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                whileInView={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                className="group relative flex flex-col items-center"
                                                            >
                                                                {/* The Node */}
                                                                <button
                                                                    onClick={() => setActivePhase(item)}
                                                                    className="w-20 h-20 rounded-full bg-[#0a0c10] border-2 border-white/5 flex items-center justify-center text-blue-500 hover:border-blue-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all z-20 relative group-hover:text-white"
                                                                >
                                                                    <div className="absolute inset-0 rounded-full bg-blue-600/5 scale-0 group-hover:scale-150 transition-transform duration-700 blur-xl" />
                                                                    <span className="text-xl font-black italic">{i + 1}</span>
                                                                </button>

                                                                {/* Label - Only show if active */}
                                                                {activePhase?.id === item.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="mt-6 text-center absolute top-24 left-1/2 -translate-x-1/2 w-48 z-30 pointer-events-none"
                                                                    >
                                                                        <div className="text-[8px] font-black text-blue-500 tracking-[0.3em] uppercase mb-2 bg-[#0a0c10]/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/20 inline-block">
                                                                            {item.phase}
                                                                        </div>
                                                                        <div className="text-xs font-bold text-white bg-[#0a0c10]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl leading-tight">
                                                                            {item.task}
                                                                        </div>
                                                                    </motion.div>
                                                                )}

                                                                {/* Connector Dot */}
                                                                {i < 4 && (
                                                                    <div className="hidden md:block absolute top-10 -right-4 w-1 h-1 bg-blue-500/20 rounded-full" />
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="mt-20 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Click any sector to expand intelligence</p>
                                            </section>
                                        )}
                                    </div>

                                    {/* Stress Test Sidebar */}
                                    <div className="lg:col-span-12 xl:col-span-3 space-y-12">


                                        <div className={`bg-[#0f172a]/40 backdrop-blur-2xl border ${isHighViability ? 'border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.15)]' : 'border-white/[0.05]'} p-12 rounded-[3.5rem] flex flex-col items-center text-center relative overflow-hidden`}>
                                            {isHighViability && <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />}
                                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-10 relative z-10">Viability Index</h2>
                                            <div className="relative w-56 h-56 flex items-center justify-center z-10">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.02]" />
                                                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                        strokeDasharray={628}
                                                        strokeDashoffset={628 - (628 * (idea.score || 0)) / 100}
                                                        className={`${(idea.score || 0) >= 80 ? 'text-yellow-500' : (idea.score || 0) > 60 ? 'text-blue-500' : (idea.score || 0) > 30 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000 stroke-cap-round`}
                                                    />
                                                </svg>
                                                <div className="absolute flex flex-col items-center">
                                                    <span className={`text-6xl font-black ${(idea.score || 0) >= 80 ? 'text-yellow-500' : (idea.score || 0) > 60 ? 'text-blue-500' : (idea.score || 0) > 30 ? 'text-orange-500' : 'text-red-500'} italic transition-colors`}>{(idea.score || 0)}</span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {(idea.score || 0) >= 80 ? 'Investment Grade' : (idea.score || 0) > 60 ? 'Venture Solid' : (idea.score || 0) > 30 ? 'High Friction' : 'Market Mirage'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Viability Test Trigger Button */}
                                            <div className="mt-8 relative z-10 w-full flex justify-center">
                                                <button
                                                    onClick={() => handleStressTest(true)}
                                                    disabled={isStressTesting}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    {isStressTesting ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={14} />
                                                            Running Neural Analysis...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap size={14} className="fill-current" />
                                                            {idea.score ? 'Recalibrate Viability' : 'Run Viability Test'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {idea.viabilityBreakdown && (
                                                <div className="w-full mt-10 relative z-10">
                                                    <button
                                                        onClick={() => setShowBreakdown(!showBreakdown)}
                                                        className="group/btn relative px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all mx-auto flex items-center gap-3 overflow-hidden mb-10"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 group-hover/btn:translate-x-full duration-1000 transition-transform -translate-x-full" />
                                                        <Info size={16} className={`${showBreakdown ? 'text-blue-500' : 'text-slate-500'} transition-colors`} />
                                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover/btn:text-white transition-colors">
                                                            {showBreakdown ? 'Condense Intel' : 'Expand Analysis'}
                                                        </span>
                                                    </button>
                                                    <AnimatePresence>
                                                        {showBreakdown && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="space-y-6"
                                                            >
                                                                {/* Adversarial Reality Check Layer (Moved Inside) */}
                                                                <div className="w-full bg-red-500/5 border border-red-500/10 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group/adversary text-left mb-8">
                                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] animate-pulse" />
                                                                    <div className="relative z-10 space-y-6">
                                                                        <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
                                                                            <div className="p-2 bg-red-500/10 rounded-xl text-red-500 animate-pulse">
                                                                                <AlertTriangle size={18} />
                                                                            </div>
                                                                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Adversarial Reality Check</h3>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 gap-6">
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-red-400/60 uppercase tracking-widest">
                                                                                    <X size={10} /> Kill Switch
                                                                                </div>
                                                                                <p className="text-white font-bold text-base leading-snug">
                                                                                    {idea.killSwitch || "Analysis Pending..."}
                                                                                </p>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-red-400/60 uppercase tracking-widest">
                                                                                    <Search size={10} /> Founder Delusion
                                                                                </div>
                                                                                <p className="text-slate-400 text-sm leading-relaxed italic pl-3 border-l-2 border-red-500/20">
                                                                                    "{idea.realityCheck || "Analysis Pending..."}"
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {Object.entries(idea.viabilityBreakdown).map(([pillar, val]: any) => (
                                                                    <div key={pillar} className="group/stat">
                                                                        <div className="flex justify-between items-end mb-2 px-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover/stat:text-blue-500 transition-colors">{pillar}</div>
                                                                                {idea.pillarReasons && idea.pillarReasons[pillar] && (
                                                                                    <button
                                                                                        onClick={() => setExpandedPillar(expandedPillar === pillar ? null : pillar)}
                                                                                        className="p-1 hover:bg-blue-600/20 rounded transition-colors"
                                                                                    >
                                                                                        <Info size={12} className="text-blue-500" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-sm font-black text-white italic">{val}%</div>
                                                                        </div>
                                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${val}%` }}
                                                                                className={`h-full ${val > 80 ? 'bg-yellow-500' : val > 50 ? 'bg-blue-600' : 'bg-red-500'}`}
                                                                            />
                                                                        </div>

                                                                        {/* Reasoning Card */}
                                                                        <AnimatePresence>
                                                                            {expandedPillar === pillar && idea.pillarReasons && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, height: 0 }}
                                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                                    exit={{ opacity: 0, height: 0 }}
                                                                                    className="mt-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl"
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-2">
                                                                                        <p className="text-xs text-slate-400 leading-relaxed">{idea.pillarReasons[pillar]}</p>
                                                                                        <button
                                                                                            onClick={() => openChatWithContext(pillar)}
                                                                                            className="ml-3 p-1.5 hover:bg-blue-600/20 rounded-lg transition-colors flex-shrink-0"
                                                                                            title="Discuss in Neural Studio"
                                                                                        >
                                                                                            <MessageSquare size={14} className="text-blue-400" />
                                                                                        </button>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {!idea.risks && (
                                                        <button
                                                            onClick={() => handleStressTest(false)}
                                                            disabled={isStressTesting}
                                                            className="mt-12 w-full bg-slate-900 hover:bg-slate-800 text-white border border-white/5 py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all shadow-xl hover:shadow-blue-600/10"
                                                        >
                                                            {isStressTesting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                                                            Start Evolution Analysis
                                                        </button>
                                                    )}

                                                    {idea.risks && (
                                                        <button
                                                            onClick={() => handleStressTest(false)}
                                                            disabled={isStressTesting}
                                                            className="mt-12 w-full group/sync flex flex-col items-center gap-4 transition-all"
                                                        >
                                                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                                            <div className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em]">
                                                                {isStressTesting ? <Loader2 className="animate-spin" size={12} /> : <TrendingUp size={12} />}
                                                                Sync Evolution
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>


                                        {idea.risks && (
                                            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem]">
                                                <h2 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-2">
                                                    <AlertTriangle size={20} />
                                                    Critical Risks
                                                </h2>
                                                <ul className="space-y-4">
                                                    {idea.risks.map((risk: any, i: number) => (
                                                        <motion.li
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            key={i}
                                                            className="flex gap-3 text-sm text-slate-400"
                                                        >
                                                            <span className="text-red-500 font-bold">{i + 1}.</span>
                                                            {risk.risk}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="max-w-4xl mx-auto space-y-8 pb-32"
                                >
                                    <div className="lg:col-span-12 xl:col-span-9 space-y-12">
                                        <section className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/[0.05] p-12 rounded-[3.5rem] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px]" />

                                            <div className="flex justify-between items-center mb-10 relative z-10">
                                                <h2 className="text-2xl font-black text-white flex items-center gap-4 italic uppercase tracking-tight">
                                                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                                                        <Zap size={24} className="text-white" />
                                                    </div>
                                                    Smaller Sparks
                                                </h2>
                                            </div>

                                            <div className="space-y-8 relative z-10">
                                                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                                                    <div className="space-y-4">
                                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Ignite a New Spark</h3>
                                                        <div className="space-y-4">
                                                            <input
                                                                type="text"
                                                                value={sparkTitle}
                                                                onChange={(e) => setSparkTitle(e.target.value)}
                                                                placeholder="Spark Name (e.g. 'Desktop First Pivot' or 'GPT-5 Integration')"
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                            />
                                                            <textarea
                                                                value={sparkInput}
                                                                onChange={(e) => setSparkInput(e.target.value)}
                                                                placeholder="Describe the insight, agreement, or pivot point..."
                                                                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-6 py-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none h-32"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleAddSpark()}
                                                            disabled={isAddingSpark || !sparkInput.trim()}
                                                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all transform hover:scale-105"
                                                        >
                                                            {isAddingSpark ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                                            Ignite Spark
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {idea.smallerSparks?.length > 0 ? (
                                                        [...idea.smallerSparks].reverse().map((spark: any) => (
                                                            <motion.div
                                                                key={spark.id}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2.5rem] group hover:border-blue-500/20 transition-all relative"
                                                            >
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="space-y-1">
                                                                        <h4 className="text-blue-400 font-bold text-sm tracking-tight">{spark.title || 'Untitled Spark'}</h4>
                                                                        <p className="text-[10px] text-slate-500 font-medium">Capture: {new Date(spark.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteSpark(spark.id)}
                                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all"
                                                                    >
                                                                        <Trash2 size={14} className="text-red-500/50 hover:text-red-500" />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full py-20 text-center space-y-4">
                                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                                                                <Sparkles size={32} />
                                                            </div>
                                                            <div className="text-slate-500 font-medium font-plus">No sparks ignited yet. Save ideas from chat or type them above.</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="p-8 bg-blue-600/10 rounded-full text-blue-500 animate-pulse">
                                <Sparkles size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white">Ready to Forge?</h2>
                                <p className="text-slate-500 max-w-sm">Hit the button above to let the Neural Forge expand your spark and research the market.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Phase Deep-Dive Modal */}
                <AnimatePresence>
                    {activePhase && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md bg-black/60"
                            onClick={() => setActivePhase(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-[#0a0c10] border border-white/10 p-12 rounded-[3.5rem] max-w-2xl w-full shadow-2xl relative overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-2">{activePhase.phase}</div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{activePhase.task}</h3>
                                    </div>
                                    <button onClick={() => setActivePhase(null)} className="text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest mt-2">Close</button>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                        {activePhase.depth}
                                    </p>
                                </div>
                                <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                                    <div className="px-6 py-2 bg-blue-600/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20">Strategic Priority</div>
                                    <div className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline: Ready</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ask Me Anything - Neural Studio */}
                <AnimatePresence>
                    {chatOpen && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 w-full bg-[#0a0c10]/95 backdrop-blur-xl border-t border-white/10 z-[200] px-4 py-8 lg:px-20 lg:py-10 shadow-2xl"
                        >
                            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 h-[80vh] lg:h-[400px]">
                                <div className="flex-1 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                                <Sparkles size={20} className="fill-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white italic tracking-tight">Neural Studio</h3>
                                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                                    Ask Me Anything
                                                    {activeSection && <span className="text-slate-500"> • {activeSection}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setChatOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <X size={20} className="text-slate-500" />
                                        </button>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
                                        {chatHistory.length === 0 && (
                                            <div className="text-center text-slate-600 mt-20">
                                                <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                                                <p className="font-medium">Ask me to refine the spec, explain the risks, or suggest a pivot.</p>
                                            </div>
                                        )}
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-3xl px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 border border-white/5 text-slate-300 rounded-bl-none'}`}>
                                                    {msg.role === 'ai' ? (
                                                        <div className="prose prose-invert prose-sm max-w-none break-words">
                                                            {(() => {
                                                                // Filter out JSON code blocks
                                                                const lines = msg.text.split('\n');
                                                                const filteredLines: string[] = [];
                                                                let inCodeBlock = false;
                                                                let codeBlockContent = '';

                                                                for (const line of lines) {
                                                                    if (line.trim().startsWith('```')) {
                                                                        if (inCodeBlock) {
                                                                            // End of code block - check if it's JSON
                                                                            const trimmed = codeBlockContent.trim();
                                                                            if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                                                                                // Not JSON, keep it
                                                                                filteredLines.push('```');
                                                                                filteredLines.push(...codeBlockContent.split('\n'));
                                                                                filteredLines.push('```');
                                                                            }
                                                                            codeBlockContent = '';
                                                                            inCodeBlock = false;
                                                                        } else {
                                                                            inCodeBlock = true;
                                                                        }
                                                                    } else if (inCodeBlock) {
                                                                        codeBlockContent += line + '\n';
                                                                    } else {
                                                                        filteredLines.push(line);
                                                                    }
                                                                }

                                                                return filteredLines.map((line, idx) => {
                                                                    const trimmedLine = line.trim();

                                                                    // Headers (more forgiving regex)
                                                                    if (trimmedLine.startsWith('###')) {
                                                                        return <h3 key={idx} className="text-base font-bold text-white mt-3 mb-2 break-words">{trimmedLine.replace(/^###\s*/, '')}</h3>;
                                                                    }
                                                                    if (trimmedLine.startsWith('##')) {
                                                                        return <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2 break-words">{trimmedLine.replace(/^##\s*/, '')}</h2>;
                                                                    }
                                                                    if (trimmedLine.startsWith('#')) {
                                                                        return <h1 key={idx} className="text-xl font-bold text-white mt-5 mb-3 break-words">{trimmedLine.replace(/^#\s*/, '')}</h1>;
                                                                    }

                                                                    // Bullet points & List Items
                                                                    if (/^[\s]*[\*\-\•]/.test(line)) {
                                                                        const content = line.replace(/^[\s]*[\*\-\•]\s*/, '');
                                                                        return (
                                                                            <li key={idx} className="ml-4 mb-1 text-sm break-words list-none flex gap-2">
                                                                                <span className="text-blue-400">•</span>
                                                                                <span>{renderMarkdown(content)}</span>
                                                                            </li>
                                                                        );
                                                                    }

                                                                    // Numbered lists
                                                                    if (/^[\s]*\d+\./.test(line)) {
                                                                        const content = line.replace(/^[\s]*\d+\.\s*/, '');
                                                                        const num = line.match(/\d+/)?.[0];
                                                                        return (
                                                                            <li key={idx} className="ml-4 mb-1 text-sm break-words list-none flex gap-2">
                                                                                <span className="text-blue-400 font-bold">{num}.</span>
                                                                                <span>{renderMarkdown(content)}</span>
                                                                            </li>
                                                                        );
                                                                    }

                                                                    // Code blocks (non-JSON ones that weren't filtered)
                                                                    if (trimmedLine.startsWith('```')) {
                                                                        return null;
                                                                    }

                                                                    // Empty lines
                                                                    if (trimmedLine === '') {
                                                                        return <div key={idx} className="h-1" />;
                                                                    }

                                                                    // Regular paragraphs
                                                                    return <p key={idx} className="leading-relaxed mb-2 text-sm break-words">{renderMarkdown(line)}</p>;
                                                                });
                                                            })()}

                                                            {(() => {
                                                                const jsonMatch = msg.text.match(/```json\s*([\s\S]*?)\s*```/);
                                                                if (jsonMatch) {
                                                                    const jsonUpdate = jsonMatch[1].trim();
                                                                    let parsed: any = {};
                                                                    try { parsed = JSON.parse(jsonUpdate); } catch (e) { console.error("JSON Parse Error", e); }

                                                                    const isSpecUpdate = Object.keys(parsed).some(k =>
                                                                        ['problem', 'solution', 'targetAudience', 'revenueModel', 'expansions', 'creativeFlow', 'techStack', 'growthLevers', 'unitEconomics'].includes(k)
                                                                    );

                                                                    return (
                                                                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                                                                            {isSpecUpdate && (
                                                                                <button
                                                                                    onClick={() => handleApplyEvolution(jsonUpdate)}
                                                                                    disabled={isApplyingEvolution}
                                                                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                                                                >
                                                                                    {isApplyingEvolution ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                                                    Apply Evolution to Core
                                                                                </button>
                                                                            )}
                                                                            {parsed.newSpark && (
                                                                                <button
                                                                                    onClick={() => handleAddSpark(parsed.newSpark)}
                                                                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] py-2.5 rounded-xl transition-all border border-blue-500 shadow-lg shadow-blue-600/20"
                                                                                >
                                                                                    <Sparkles size={14} className="fill-white" />
                                                                                    Record Resolution
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => handleAddSpark(msg.text.replace(/```json\s*([\s\S]*?)\s*```/g, '').trim())}
                                                                                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-black uppercase tracking-widest text-[10px] py-2 rounded-xl transition-all border border-white/10"
                                                                            >
                                                                                Save Advice as Spark
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <div className="mt-4 pt-4 border-t border-white/10">
                                                                        <button
                                                                            onClick={() => handleAddSpark(msg.text)}
                                                                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-black uppercase tracking-widest text-[10px] py-2 rounded-xl transition-all border border-white/10"
                                                                        >
                                                                            Save as Spark
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <p className="leading-relaxed break-words">{msg.text}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isConsulting && (
                                            <div className="flex justify-start mb-4">
                                                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl rounded-tl-none p-4 backdrop-blur-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Neural Core Processing</span>
                                                        <div className="flex gap-1 ml-2">
                                                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input */}
                                    <form onSubmit={handleConsult} className="relative">
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder={activeSection ? `Ask about ${activeSection}...` : "Type your query here..."}
                                            className="w-full bg-[#010409] border border-white/10 rounded-2xl pl-6 pr-20 py-4 text-slate-300 focus:outline-none focus:border-blue-500/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isConsulting || !query.trim()}
                                            className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {isConsulting ? <Loader2 size={20} className="animate-spin text-slate-400" /> : <Send size={20} className="text-white" />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style dangerouslySetInnerHTML={{
                    __html: `
              .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
              .stroke-cap-round { stroke-linecap: round; }
              @keyframes dash {
                to {
                  stroke-dashoffset: -1000;
                }
              }
              .animate-dash {
                animation: dash 30s linear infinite;
              }
            `}} />

                {/* AI Assist Modal */}
                <AnimatePresence>
                    {aiAssistField && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-[#0f172a] border border-blue-500/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400">
                                            <Wand2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">AI Writer</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest">Refining: {aiAssistField}</p>
                                        </div>
                                    </div>
                                    <button onClick={closeAiAssist} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {!aiResult ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instructions</label>
                                                <textarea
                                                    value={aiInstruction}
                                                    onChange={e => setAiInstruction(e.target.value)}
                                                    placeholder="E.g., 'Make it more punchy', 'Focus on the enterprise angle', 'Simplify the language'..."
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-blue-500/50 focus:outline-none resize-none h-32"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleAiGenerate}
                                                    disabled={!aiInstruction.trim() || isAiGenerating}
                                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors disabled:opacity-50"
                                                >
                                                    {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                    Generate Magic
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 opacity-50 pointer-events-none">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Original</label>
                                                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-400 text-sm h-48 overflow-y-auto">
                                                        {aiAssistContext}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-blue-500 uppercase tracking-widest">AI Suggestion</label>
                                                    <textarea
                                                        value={aiResult}
                                                        onChange={e => setAiResult(e.target.value)}
                                                        className="w-full bg-blue-600/5 border border-blue-500/30 rounded-xl p-4 text-white text-sm h-48 overflow-y-auto focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setAiResult('')}
                                                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
                                                >
                                                    Try Again
                                                </button>
                                                <button
                                                    onClick={handleAiAccept}
                                                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
                                                >
                                                    <Check size={16} />
                                                    Accept & Apply
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
