import {Filter} from "lucide-react";
import {useEffect, useState} from "react";

interface FilterBarProps {
  categories: string[];
  licenses: string[];
  languages: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  licenses: string[];
  languages: string[];
  statuses: string[];
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "featured", label: "Featured" },
  { value: "trending", label: "Trending" },
];

export function FilterBar({ categories, licenses, languages, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    licenses: [],
    languages: [],
    statuses: [],
  });

  // Read filters from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlFilters: FilterState = {
      categories: params.get("categories")?.split(",").filter(Boolean) || [],
      licenses: params.get("licenses")?.split(",").filter(Boolean) || [],
      languages: params.get("languages")?.split(",").filter(Boolean) || [],
      statuses: params.get("statuses")?.split(",").filter(Boolean) || [],
    };
    setFilters(urlFilters);
    onFilterChange(urlFilters);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Update or remove filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value.length > 0) {
        params.set(key, value.join(","));
      } else {
        params.delete(key);
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);

    onFilterChange(filters);
  }, [filters]);

  const toggleFilter = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      licenses: [],
      languages: [],
      statuses: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="border rounded-lg bg-card">
      {/* Filter Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          )}
          <span className="text-muted-foreground">{isExpanded ? "−" : "+"}</span>
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div id="filter-content" className="border-t p-4 space-y-6">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleFilter("categories", category)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      filters.categories.includes(category)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* License Filter */}
          {licenses.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Licenses</h3>
              <div className="flex flex-wrap gap-2">
                {licenses.map((license) => (
                  <button
                    key={license}
                    type="button"
                    onClick={() => toggleFilter("licenses", license)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      filters.licenses.includes(license)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    }`}
                  >
                    {license}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Language Filter */}
          {languages.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleFilter("languages", language)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      filters.languages.includes(language)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <h3 className="font-medium text-sm mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => toggleFilter("statuses", status.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    filters.statuses.includes(status.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
