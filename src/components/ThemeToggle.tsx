import * as React from "react";

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
            {theme === "light" && (
                <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2"/>
                    <path d="M12 20v2"/>
                    <path d="m4.93 4.93 1.41 1.41"/>
                    <path d="m17.66 17.66 1.41 1.41"/>
                    <path d="M2 12h2"/>
                    <path d="M20 12h2"/>
                    <path d="m6.34 17.66-1.41 1.41"/>
                    <path d="m19.07 4.93-1.41 1.41"/>
                </svg>
            )}
            {theme === "dark" && (
                <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
            )}
            {theme === "system" && (
                <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                    <line x1="8" x2="16" y1="21" y2="21"/>
                    <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
            )}
            <span className="ml-2 hidden sm:inline">
        {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
      </span>
        </button>
    );
}
