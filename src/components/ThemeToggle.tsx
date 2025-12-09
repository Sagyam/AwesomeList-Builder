import * as React from "react";
import {Monitor, Moon, Sun} from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
    const [theme, setTheme] = React.useState<Theme>("system");
    const [mounted, setMounted] = React.useState(false);

    // Load theme from localStorage on mount
    React.useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme("system");
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;

        if (newTheme === "dark") {
            root.classList.add("dark");
        } else if (newTheme === "light") {
            root.classList.remove("dark");
        } else {
            // System preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    };

    // Prevent flash of unstyled content
    if (!mounted) {
        return (
            <div
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background"/>
        );
    }

    return (
        <button
            onClick={() => {
                const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
                handleThemeChange(newTheme);
            }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Toggle theme"
            title={`Current theme: ${theme}`}
        >
            {theme === "light" && <Sun className="h-5 w-5"/>}
            {theme === "dark" && <Moon className="h-5 w-5"/>}
            {theme === "system" && <Monitor className="h-5 w-5"/>}
            <span className="ml-2 hidden sm:inline">
        {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
      </span>
        </button>
    );
}
