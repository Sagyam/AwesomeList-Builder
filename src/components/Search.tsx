import {Search as SearchIcon, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";

interface SearchResult {
    id: string;
    url: string;
    excerpt: string;
    meta: {
        title: string;
    };
}

interface PagefindResult {
    data: () => Promise<{
        url: string;
        excerpt: string;
        meta: {
            title: string;
        };
    }>;
}

interface PagefindInstance {
    search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

declare global {
    interface Window {
        pagefind?: {
            init: () => void;
            search: (query: string) => Promise<{ results: PagefindResult[] }>;
        };
    }
}

export function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pagefindRef = useRef<PagefindInstance | null>(null);

    // Initialize Pagefind
    useEffect(() => {
        const loadPagefind = async () => {
            if (typeof window === "undefined") return;

            try {
                // Load Pagefind script
                const script = document.createElement("script");
                script.src = "/pagefind/pagefind.js";
                script.async = true;
                script.onload = () => {
                    if (window.pagefind) {
                        window.pagefind.init();
                        pagefindRef.current = window.pagefind as unknown as PagefindInstance;
                    }
                };
                document.head.appendChild(script);
            } catch (error) {
                console.error("Failed to load Pagefind:", error);
            }
        };

        loadPagefind();
    }, []);

    // Handle search
    useEffect(() => {
        const searchContent = async () => {
            if (!query.trim() || !pagefindRef.current) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);

            try {
                const search = await pagefindRef.current.search(query);
                const searchResults = await Promise.all(
                    search.results.slice(0, 5).map(async (result, index) => {
                        const data = await result.data();
                        return {
                            id: `result-${index}`,
                            url: data.url,
                            excerpt: data.excerpt,
                            meta: data.meta,
                        };
                    })
                );
                setResults(searchResults);
                setSelectedIndex(-1);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(searchContent, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || results.length === 0) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < results.length) {
                        window.location.href = results[selectedIndex].url;
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setIsOpen(false);
                    setQuery("");
                    inputRef.current?.blur();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-xl">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder="Search resources..."
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Search resources"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={isOpen}
                />
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (
                <div
                    id="search-results"
                    role="listbox"
                    className="absolute top-full mt-2 w-full rounded-lg border border-input bg-background shadow-lg overflow-hidden z-50"
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-96 overflow-y-auto">
                            {results.map((result, index) => (
                                <li key={result.id}>
                                    <a
                                        href={result.url}
                                        className={`block p-4 hover:bg-accent transition-colors ${
                                            selectedIndex === index ? "bg-accent" : ""
                                        }`}
                                        role="option"
                                        aria-selected={selectedIndex === index}
                                    >
                                        <div className="font-medium text-sm mb-1">{result.meta.title}</div>
                                        <div
                                            className="text-xs text-muted-foreground line-clamp-2"
                                            dangerouslySetInnerHTML={{__html: result.excerpt}}
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : query ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found for "{query}"
                        </div>
                    ) : null}

                    {results.length > 0 && (
                        <div className="border-t border-input p-2 text-xs text-muted-foreground text-center">
                            Use ↑↓ to navigate, Enter to select, Esc to close
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}