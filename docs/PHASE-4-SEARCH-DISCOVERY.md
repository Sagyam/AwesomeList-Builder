# Phase 4: Search & Discovery - Implementation Guide

This document provides an overview of the Search & Discovery features implemented in Phase 4 of the AwesomeKit project.

## Overview

Phase 4 introduces powerful search, filtering, sorting, and pagination capabilities to help users discover resources
more effectively.

## Features Implemented

### 1. Pagefind Integration (Static Search)

**What it does:**

- Provides fast, client-side search with zero-bundle-size at initial page load
- Generates search index at build time
- Supports keyboard navigation

**Files:**

- `/src/components/Search.tsx` - Search UI component
- Build script updated in `package.json` to run `pagefind --site dist` after Astro build

**Usage:**

```bash
bun run build  # Builds Astro site and generates Pagefind index
```

**Features:**

- Real-time search results as you type
- Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
- Excerpt highlighting in results
- Auto-complete suggestions
- Accessible with ARIA attributes

### 2. Advanced Filtering System

**What it does:**

- Multi-select filters for categories, licenses, languages, and status
- URL state management for shareable filtered views
- Collapsible filter panel

**Files:**

- `/src/components/FilterBar.tsx` - Filter UI component

**Filter Types:**

- **Categories**: Filter by resource category (e.g., Framework, Tool, Course)
- **Licenses**: Filter by license type (MIT, Apache, GPL, etc.)
- **Languages**: Filter by programming language
- **Status**: Filter by active/archived/featured/trending status

**Features:**

- Multi-select capability (select multiple filters in each category)
- Active filter count badge
- "Clear all" button
- URL parameters persist filters (shareable links)
- Expandable/collapsible UI

### 3. Sorting Options

**What it does:**

- Sort resources by multiple criteria
- Ascending/descending order toggle
- URL state management

**Files:**

- `/src/components/SortBar.tsx` - Sort UI component

**Sort Options:**

- **Featured First**: Shows featured/trending resources first (default)
- **Name**: Alphabetical order (A-Z or Z-A)
- **Stars**: Sort by GitHub stars (high to low or low to high)
- **Recently Added**: Sort by date added (newest or oldest first)

**Features:**

- Visual indicator showing active sort and direction
- One-click toggle between ascending/descending
- URL parameters persist sort state

### 4. Pagination

**What it does:**

- Breaks large result sets into pages
- Configurable items per page
- Smooth scroll to top on page change

**Files:**

- `/src/components/Pagination.tsx` - Pagination component

**Features:**

- Smart page number display (shows relevant pages with ellipsis)
- Items per page selector (12, 24, 48, 96)
- URL-based pagination (shareable links)
- Accessibility compliant with proper ARIA labels
- Shows current range (e.g., "Showing 1-24 of 156")

### 5. Ranking System

**What it does:**

- Intelligently ranks resources based on importance and quality signals
- Implements 3-tier ranking system

**Files:**

- `/src/lib/utils/data-access.ts` - `rankResources()` function

**Ranking Logic:**

1. **Tier 1**: Featured and Trending resources (highest priority)
2. **Tier 2**: Resources with preview images
3. **Tier 3**: Resources without images

This ensures the most important and visually rich resources appear first when using the "Featured First" sort option.

### 6. Integrated Browser Component

**What it does:**

- Combines all search and discovery features in a single component
- Manages state for filters, sorting, and pagination
- Provides seamless user experience

**Files:**

- `/src/components/ResourcesBrowser.tsx` - Main browser component
- `/src/pages/resources.astro` - Updated to use ResourcesBrowser

**Features:**

- Unified state management
- Real-time result counting
- Empty state handling
- Grid/List view toggle integration
- Responsive design

## URL State Management

All filter, sort, and pagination states are reflected in the URL, making every view shareable:

```
/resources?categories=Framework,Library&sort=stars&order=desc&page=2&perPage=24
```

**Parameters:**

- `categories`: Comma-separated list of category filters
- `licenses`: Comma-separated list of license filters
- `languages`: Comma-separated list of language filters
- `statuses`: Comma-separated list of status filters
- `sort`: Sort field (featured|name|stars|recent)
- `order`: Sort order (asc|desc)
- `page`: Current page number
- `perPage`: Items per page

## Accessibility

All components are built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper use of semantic elements
- **Color Contrast**: Meets WCAG 2.1 AA standards

## Performance

- **Static Search**: Pagefind loads search functionality on-demand
- **Optimized Rendering**: Only renders visible items (pagination)
- **Debounced Search**: 300ms debounce on search input
- **Memoization**: Uses React.useMemo for expensive computations
- **Client-Side Filtering**: No server requests needed

## Future Enhancements

Potential improvements for future phases:

1. **Advanced Search Syntax**: Support for operators like "AND", "OR", "NOT"
2. **Search History**: Remember recent searches
3. **Saved Filters**: Save and name custom filter combinations
4. **Infinite Scroll**: Option for infinite scroll instead of pagination
5. **Faceted Search**: Show result counts for each filter option
6. **Search Analytics**: Track popular searches
7. **Related Resources**: Show related items based on current filters

## Testing

To test the features:

1. **Build the project**:
   ```bash
   bun run build
   ```

2. **Preview the production build**:
   ```bash
   bun run preview
   ```

3. **Visit** `http://localhost:4321/resources` to see all features in action

4. **Test scenarios**:
    - Try searching for resources
    - Apply multiple filters
    - Change sort order
    - Navigate through pages
    - Share URLs with filters applied

## Troubleshooting

**Search not working?**

- Ensure the build completed successfully
- Check that `/dist/pagefind` directory exists
- Verify that pages have `data-pagefind-body` attribute

**Filters not persisting?**

- Check browser console for JavaScript errors
- Ensure URL parameters are being set correctly

**Performance issues?**

- Check the size of the Pagefind index
- Consider reducing items per page
- Optimize resource data size

## Code Examples

### Adding a New Filter Type

To add a new filter category, update `FilterBar.tsx`:

```tsx
// Add to FilterState interface
export interface FilterState {
    categories: string[];
    licenses: string[];
    languages: string[];
    statuses: string[];
    yourNewFilter: string[];  // Add this
}

// Add filter UI in the component
<div>
    <h3 className="font-medium text-sm mb-3">Your New Filter</h3>
    <div className="flex flex-wrap gap-2">
        {yourOptions.map((option) => (
            <button
                key={option}
                type="button"
                onClick={() => toggleFilter("yourNewFilter", option)}
                className={/* ... */}
            >
                {option}
            </button>
        ))}
    </div>
</div>
```

### Adding a New Sort Option

Update `SortBar.tsx`:

```tsx
const SORT_OPTIONS: { value: SortOption; label: string; hasOrder?: boolean }[] = [
    {value: "featured", label: "Featured First", hasOrder: false},
    {value: "yourSort", label: "Your Sort", hasOrder: true},  // Add this
    // ...
];
```

Then implement the sort logic in `ResourcesBrowser.tsx`:

```tsx
case
"yourSort"
:
return sorted.sort((a, b) => {
    // Your sorting logic here
    return sortOrder === "asc" ? a.value - b.value : b.value - a.value;
});
```

## Dependencies

- **pagefind**: `^1.4.0` - Static search library
- **@pagefind/default-ui**: `^1.4.0` - Default UI (not currently used, custom UI built instead)
- **lucide-react**: Icon library for UI elements
- **react**: For interactive components

## Related Documentation

- [Phase 1-2: Data Layer & UI](./ROADMAP.md)
- [Phase 3: API Integration (Planned)](./ROADMAP.md)
- [Pagefind Documentation](https://pagefind.app/)
- [SPECS.md](./SPECS.md) - Original specifications

---

**Phase 4 Status**: ✅ Complete

**Next Phase**: Phase 5 - Analytics & Insights
