import {ArrowDown} from "lucide-react";
import * as React from "react";
import {FilterBar, type FilterState} from "@/components/FilterBar";
import {LayoutToggle} from "@/components/LayoutToggle";
import {Pagination} from "@/components/Pagination";
import {ResourceCard} from "@/components/ResourceCard";
import {ResourceListItem} from "@/components/ResourceListItem";
import {Search} from "@/components/Search";
import {SortBar, type SortOption, type SortOrder} from "@/components/SortBar";

import type {SearchConfig} from "@/schema/ts/project.interface";
import type {Types} from "@/schema/ts/types";

interface Resource {
    id: string;
    name: string;
    description: string;
    url: string;
    type: Types;
    category?: string;
    language?: string;
    languages?: string[];
    stars?: number;
    license?: string;
    tags?: string[];
    image?: string;
    imageAlt?: string;
    archived?: boolean;
    trending?: boolean;
    featured?: boolean;
}

interface ResourcesBrowserProps {
    resources: Resource[];
    categories: string[];
    licenses: string[];
    languages: string[];
    searchConfig?: SearchConfig;
}

export function ResourcesBrowser({
                                     resources,
                                     categories,
                                     licenses,
                                     languages,
                                     searchConfig,
                                 }: ResourcesBrowserProps) {
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
    const [filters, setFilters] = React.useState<FilterState>({
        categories: [],
        licenses: [],
        languages: [],
        statuses: [],
    });
    const [sortBy, setSortBy] = React.useState<SortOption>("featured");
    const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(24);

    // Apply filters
    const filteredResources = React.useMemo(() => {
        return resources.filter((resource) => {
            // Category filter
            if (
                filters.categories.length > 0 &&
                (!resource.category || !filters.categories.includes(resource.category))
            ) {
                return false;
            }

            // License filter
            if (
                filters.licenses.length > 0 &&
                (!resource.license || !filters.licenses.includes(resource.license))
            ) {
                return false;
            }

            // Language filter
            if (filters.languages.length > 0) {
                const resourceLanguages = [
                    resource.language,
                    ...(resource.languages || []),
                ].filter(Boolean);
                if (!resourceLanguages.some((lang) => filters.languages.includes(lang as string))) {
                    return false;
                }
            }

            // Status filter
            if (filters.statuses.length > 0) {
                const statuses = [];
                if (resource.archived) statuses.push("archived");
                if (!resource.archived) statuses.push("active");
                if (resource.featured) statuses.push("featured");
                if (resource.trending) statuses.push("trending");

                if (!statuses.some((status) => filters.statuses.includes(status))) {
                    return false;
                }
            }

            return true;
        });
    }, [resources, filters]);

    // Apply sorting
    const sortedResources = React.useMemo(() => {
        const sorted = [...filteredResources];

        switch (sortBy) {
            case "featured":
                // Featured/trending first, then with images, then without
                return sorted.sort((a, b) => {
                    const aScore =
                        (a.featured || a.trending ? 3 : 0) + (a.image ? 2 : 0);
                    const bScore =
                        (b.featured || b.trending ? 3 : 0) + (b.image ? 2 : 0);
                    return bScore - aScore;
                });

            case "name":
                return sorted.sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name);
                    return sortOrder === "asc" ? comparison : -comparison;
                });

            case "stars":
                return sorted.sort((a, b) => {
                    const aStars = a.stars || 0;
                    const bStars = b.stars || 0;
                    return sortOrder === "asc" ? aStars - bStars : bStars - aStars;
                });

            case "recent":
                // For now, use the order in the array as "recent"
                // In a real app, you'd have a dateAdded field
                return sortOrder === "desc" ? sorted : sorted.reverse();

            default:
                return sorted;
        }
    }, [filteredResources, sortBy, sortOrder]);

    // Apply pagination
    const paginatedResources = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedResources.slice(startIndex, endIndex);
    }, [sortedResources, currentPage, itemsPerPage]);

    // Reset to page 1 when filters or sort changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, sortOrder, itemsPerPage]);

    // Read page from URL on mount
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const page = Number.parseInt(params.get("page") || "1", 10);
        const perPage = Number.parseInt(params.get("perPage") || "24", 10);
        setCurrentPage(page);
        setItemsPerPage(perPage);
    }, []);

    // Update URL when page changes
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        params.set("page", currentPage.toString());
        params.set("perPage", itemsPerPage.toString());
        const newUrl = `?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
    }, [currentPage, itemsPerPage]);

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handleSortChange = (sort: SortOption, order: SortOrder) => {
        setSortBy(sort);
        setSortOrder(order);
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex justify-center">
                <Search resources={resources} searchConfig={searchConfig}/>
            </div>

            {/* Filters */}
            <FilterBar
                categories={categories}
                licenses={licenses}
                languages={languages}
                onFilterChange={handleFilterChange}
            />

            {/* Sort and View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <SortBar onSortChange={handleSortChange}/>
                <LayoutToggle value={viewMode} onChange={setViewMode}/>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                Showing {paginatedResources.length} of {sortedResources.length} resources
                {sortedResources.length !== resources.length &&
                    ` (${resources.length} total)`}
            </div>

            {/* Grid View */}
            {viewMode === "grid" && paginatedResources.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedResources.map((resource) => (
                        <ResourceCard key={resource.id} {...resource} />
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && paginatedResources.length > 0 && (
                <div className="border rounded-lg overflow-hidden bg-card">
                    {paginatedResources.map((resource) => (
                        <ResourceListItem key={resource.id} {...resource} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {paginatedResources.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                        <ArrowDown className="h-8 w-8 text-muted-foreground"/>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your filters or search terms.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {paginatedResources.length > 0 && (
                <Pagination
                    totalItems={sortedResources.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            )}
        </div>
    );
}
