import {ArrowDownAZ, ArrowUpAZ} from "lucide-react";
import {useEffect, useState} from "react";

export type SortOption = "name" | "stars" | "recent" | "featured";
export type SortOrder = "asc" | "desc";

interface SortBarProps {
    onSortChange: (sort: SortOption, order: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; hasOrder?: boolean }[] = [
    {value: "featured", label: "Featured First", hasOrder: false},
    {value: "name", label: "Name", hasOrder: true},
    {value: "stars", label: "Stars", hasOrder: true},
    {value: "recent", label: "Recently Added", hasOrder: true},
];

export function SortBar({onSortChange}: SortBarProps) {
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    // Read sort from URL on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const urlSort = (params.get("sort") as SortOption) || "featured";
        const urlOrder = (params.get("order") as SortOrder) || "desc";

        setSortBy(urlSort);
        setSortOrder(urlOrder);
        onSortChange(urlSort, urlOrder);
    }, []);

    // Update URL and notify parent when sort changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        params.set("sort", sortBy);
        params.set("order", sortOrder);

        const newUrl = `?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);

        onSortChange(sortBy, sortOrder);
    }, [sortBy, sortOrder]);

    const handleSortChange = (value: SortOption) => {
        if (value === sortBy && SORT_OPTIONS.find((opt) => opt.value === value)?.hasOrder) {
            // Toggle order if clicking the same option
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(value);
            // Set default order for the new sort option
            if (value === "name") {
                setSortOrder("asc");
            } else {
                setSortOrder("desc");
            }
        }
    };

    const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
            <div className="flex items-center gap-2 flex-wrap">
                {SORT_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSortChange(option.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                            sortBy === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        aria-pressed={sortBy === option.value}
                    >
                        {option.label}
                        {sortBy === option.value && option.hasOrder && (
                            <span className="ml-1">
                {sortOrder === "asc" ? (
                    <ArrowUpAZ className="h-3.5 w-3.5"/>
                ) : (
                    <ArrowDownAZ className="h-3.5 w-3.5"/>
                )}
              </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
