import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
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
            className="p-3 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-all hover:bg-slate-300 dark:hover:bg-white/10"
            title="Toggle Theme"
        >
            <div className="relative w-5 h-5">
                <Sun
                    size={20}
                    className="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                    size={20}
                    className="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
            </div>
        </button>
    );
}
