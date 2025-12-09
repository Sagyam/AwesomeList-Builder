# Search & Discovery Quick Reference Guide

A quick reference for using the search and discovery features in AwesomeKit.

## 🔍 Search

### Using the Search Box

1. **Type to search**: Start typing in the search box at the top of the resources page
2. **View results**: Results appear in a dropdown below the search box
3. **Navigate results**:
    - Press `↓` to move down
    - Press `↑` to move up
    - Press `Enter` to open selected result
    - Press `Esc` to close search
4. **Clear search**: Click the × button in the search box

### Search Tips

- Search is **case-insensitive**
- Searches across: resource names, descriptions, tags, and content
- Results show **highlighted excerpts** with matching terms
- Search is **debounced** (300ms) for better performance
- Maximum **5 results** shown in dropdown

## 🎯 Filters

### Opening Filters

Click the **"Filters"** button to expand the filter panel.

### Available Filters

#### Categories

Filter resources by their category (e.g., Framework, Library, Tool, Course, etc.)

#### Licenses

Filter by software license (e.g., MIT, Apache-2.0, GPL-3.0, etc.)

#### Languages

Filter by programming language (e.g., TypeScript, JavaScript, Python, etc.)

#### Status

- **Active**: Resources that are actively maintained
- **Archived**: Resources that are archived or deprecated
- **Featured**: Handpicked featured resources
- **Trending**: Currently trending resources

### Using Filters

1. **Select multiple**: Click tags to toggle them on/off (they turn blue when active)
2. **Combine filters**: Use multiple filters together (AND logic within category, OR across categories)
3. **Clear filters**: Click "Clear all" to reset all filters
4. **Active count**: Badge shows how many filters are active

### Filter Behavior

- Filters are **multi-select** (select multiple options in each category)
- Filters use **AND logic** within the same category
- Filters use **OR logic** across different categories
- Results update **instantly** as you change filters

## 🔄 Sort

### Sort Options

Click a sort button to apply that sort:

1. **Featured First** (default)
    - Shows featured/trending resources first
    - Then resources with images
    - Finally resources without images

2. **Name**
    - Alphabetical order
    - Click again to toggle A-Z ↔ Z-A

3. **Stars**
    - Sort by GitHub stars
    - Click again to toggle High-to-Low ↔ Low-to-High

4. **Recently Added**
    - Most recently added resources
    - Click again to toggle Newest ↔ Oldest

### Sort Indicators

- **Blue background**: Active sort option
- **Arrow icons**: Shows sort direction (↑ ascending, ↓ descending)

## 📄 Pagination

### Navigating Pages

- **Previous/Next buttons**: Navigate one page at a time
- **Page numbers**: Click to jump to specific page
- **Ellipsis (...)**: Indicates skipped pages
- **Current page**: Highlighted in blue

### Items Per Page

Select how many resources to show per page:

- 12 items
- 24 items (default)
- 48 items
- 96 items

### Pagination Behavior

- Page **scrolls to top** smoothly when you change pages
- **Result count** shows current range (e.g., "Showing 1-24 of 156")
- Pagination **resets to page 1** when filters or sort changes

## 🔗 URL State & Sharing

### Shareable Links

All search, filter, sort, and pagination states are saved in the URL. This means:

- **Copy the URL** to share exact filtered/sorted view
- **Bookmark URLs** to save favorite filter combinations
- **Browser back/forward** buttons work as expected

### URL Parameters

Example URL:

```
/resources?categories=Framework,Library&licenses=MIT&sort=stars&order=desc&page=2&perPage=24
```

Parameters:

- `categories`: Comma-separated category filters
- `licenses`: Comma-separated license filters
- `languages`: Comma-separated language filters
- `statuses`: Comma-separated status filters
- `sort`: Sort field (featured|name|stars|recent)
- `order`: Sort direction (asc|desc)
- `page`: Page number
- `perPage`: Items per page

## ⌨️ Keyboard Shortcuts

### Search

- `/` - Focus search box (when available)
- `↑` `↓` - Navigate search results
- `Enter` - Open selected result
- `Esc` - Close search dropdown

### Navigation

- `Tab` - Move between interactive elements
- `Shift + Tab` - Move backward
- `Enter` - Activate buttons/links
- `Space` - Toggle buttons

## 📱 View Modes

Toggle between two view modes using the view toggle buttons:

### Grid View (Default)

- **Card layout** with images and full metadata
- Best for **visual browsing**
- Shows 3 columns on desktop, 2 on tablet, 1 on mobile

### List View

- **Compact list** with essential information
- Best for **quick scanning**
- Shows more resources per screen
- Ideal for keyboard navigation

## 🎯 Tips & Tricks

### Finding Featured Resources

1. Use **Featured First** sort (default)
2. Or apply **Status: Featured** filter

### Finding Active Projects

1. Apply **Status: Active** filter
2. Sort by **Stars** for most popular active projects

### Finding Resources by Language

1. Apply **Languages** filter (select one or more)
2. Sort by **Stars** to see most popular in that language

### Browsing Specific Category

1. Apply **Category** filter (select one)
2. Use **Featured First** to see best resources in that category

### Finding New Resources

1. Sort by **Recently Added**
2. Ensure order is descending (newest first)

### Sharing Filtered Views

1. Apply desired filters and sort
2. Copy URL from browser address bar
3. Share with others - they'll see the same filtered view

## 🚀 Performance

- **Search** loads on-demand (no impact on initial page load)
- **Filtering** happens instantly client-side
- **Pagination** reduces rendering overhead
- **Debounced search** prevents excessive searches
- **Memoized results** for efficient re-rendering

## ♿ Accessibility

- All features are **keyboard accessible**
- **Screen reader friendly** with proper ARIA labels
- **Focus indicators** show current element
- **Semantic HTML** for better navigation
- Meets **WCAG 2.1 AA** standards

## 🐛 Troubleshooting

### Search Not Working?

- Ensure you've run `bun run build` to generate search index
- Check browser console for errors
- Try refreshing the page

### Filters Not Applying?

- Ensure JavaScript is enabled
- Check browser console for errors
- Try clearing browser cache

### URL Not Updating?

- Check that browser history API is supported
- Try a different browser
- Check for JavaScript errors

## 📖 Related Documentation

- [Full Implementation Guide](./PHASE-4-SEARCH-DISCOVERY.md)
- [Project Roadmap](./ROADMAP.md)
- [Project Specifications](./SPECS.md)

---

**Need Help?** Check the project documentation or open an issue on GitHub.
