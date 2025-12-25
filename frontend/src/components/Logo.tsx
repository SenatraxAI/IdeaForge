import { Zap } from 'lucide-react';

interface LogoProps {
    className?: string;
    iconSize?: number;
    showText?: boolean;
}

export default function Logo({ className = "", iconSize = 28, showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg group-hover:bg-blue-600/50 transition-colors" />

                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-xl shadow-blue-500/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                    <Zap
                        size={iconSize}
                        className="text-white fill-white/20 stroke-[2.5px]"
                    />
                </div>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white">
                        Idea<span className="text-blue-600">Forge</span>
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.4em] text-blue-600/80 dark:text-blue-400/80 uppercase">
                        Neural Lab
                    </span>
                </div>
            )}
        </div>
    );
}
