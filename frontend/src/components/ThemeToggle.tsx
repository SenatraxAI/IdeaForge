import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");

    // Sync with actual DOM state on mount and watch for changes
    useEffect(() => {
        const root = document.documentElement;
        const isDark = root.classList.contains("dark");
        setCurrentTheme(isDark ? "dark" : "light");

        // Watch for external theme changes
        const observer = new MutationObserver(() => {
            const isDark = root.classList.contains("dark");
            setCurrentTheme(isDark ? "dark" : "light");
        });

        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const handleToggle = () => {
        const newTheme = currentTheme === "light" ? "dark" : "light";

        // Direct DOM manipulation - always works
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);

        // Persist to localStorage
        localStorage.setItem("ideaforge-ui-theme", newTheme);

        // Update local state
        setCurrentTheme(newTheme);
    };

    return (
        <button
            onClick={handleToggle}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold group relative
                ${showLabel
                    ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 justify-center'
                }
            `}
            title="Toggle Theme"
        >
            <div className="relative w-5 h-5 flex-shrink-0">
                <Sun
                    size={20}
                    className="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-blue-500"
                />
                <Moon
                    size={20}
                    className="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500"
                />
            </div>
            {showLabel && (
                <span className="truncate">
                    {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
            )}
            {!showLabel && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                    Theme
                </div>
            )}
        </button>
    );
}
