import {ChevronLeft, ChevronRight} from "lucide-react";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export function Pagination({
                               totalItems,
                               itemsPerPage,
                               currentPage,
                               onPageChange,
                               onItemsPerPageChange,
                           }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            // Show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            // Scroll to top of page
            window.scrollTo({top: 0, behavior: "smooth"});
        }
    };

    const pageNumbers = getPageNumbers();

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Show</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Items per page"
                >
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <span className="text-muted-foreground">per page</span>
            </div>

            {/* Page info and navigation */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {startItem}–{endItem} of {totalItems}
        </span>

                <nav className="flex items-center gap-1" aria-label="Pagination">
                    {/* Previous button */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page, index) =>
                                typeof page === "number" ? (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handlePageChange(page)}
                                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-9 w-9 ${
                                            page === currentPage
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                        aria-label={`Go to page ${page}`}
                                        aria-current={page === currentPage ? "page" : undefined}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span
                                        key={index}
                                        className="inline-flex items-center justify-center h-9 w-9 text-muted-foreground"
                                    >
                  {page}
                </span>
                                )
                        )}
                    </div>

                    {/* Next button */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        aria-label="Go to next page"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                </nav>
            </div>
        </div>
    );
}
