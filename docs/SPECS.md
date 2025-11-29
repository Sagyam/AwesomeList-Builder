# Awesome List Template - Project Specification

## Overview

A modern, feature-rich template for creating "awesome" curated lists that moves beyond basic markdown links. This template provides a visually appealing, performant, and discoverable way to showcase high-quality resources while remaining easy to deploy and maintain.

## Problem Statement

Current awesome lists suffer from poor discoverability and user experience:
- Basic markdown with plain links and minimal descriptions
- No visual previews or metadata
- Difficult to browse large collections
- No way to filter, sort, or search effectively
- Static data that becomes outdated
- Poor mobile experience

## Core Principles

- **Performance First**: Instant load times, minimal JavaScript
- **Zero Cost**: Free to deploy and maintain
- **Easy Contributions**: Simple workflow for adding new projects
- **Accessible**: Works for everyone, everywhere
- **Sustainable**: Automated data updates, low maintenance

---

## Requirements

### Performance & Infrastructure

- **Instant Load Time**: Target < 1s for initial page load
- **SEO Optimized**: Full SSR/SSG with proper meta tags, Open Graph, schema.org markup
- **Modern Image Formats**: Support AVIF with WebP/JPEG fallbacks
- **Responsive**: Mobile-first design, works on all screen sizes
- **Free Hosting**: Deploy to Netlify, Vercel, Cloudflare Pages, or GitHub Pages
- **CDN Edge Delivery**: Static assets served from global CDN

### Content & Data Management

- **Static Data Source**: Projects defined in YAML/JSON files
- **Dynamic Metadata Fetching**: Programmatic updates for:
  - GitHub stars, forks, issues, last commit date
  - npm/PyPI download counts
  - Package versions
  - Repository activity metrics
- **Caching Strategy**: Cache fetched data with timestamps to respect API rate limits
- **Build-time Generation**: All dynamic data fetched during build, not runtime

### Project Cards

Each project should display rich metadata:

#### Required Fields
- Project name
- Short description (1-2 sentences)
- Long description (optional, for detail view)
- Primary URL (project website or repository)
- Repository URL (for auto-fetching metrics)
- Author/Maintainer
- License (with icon)
- Tags/Categories
- Date added

#### Auto-fetched Metrics

**From GitHub:**
- Stars
- Forks
- Open issues count
- Last commit/update date
- Repository language
- Topics/tags

**From Package Registries:**
- **npm**: Weekly/monthly downloads, current version, dependencies count
- **PyPI**: Downloads (via pypistats), current version, Python version support
- **Cargo**: Total downloads, recent downloads, current version
- **RubyGems**: Total downloads, current version, dependencies
- **Maven Central**: Usage statistics, current version
- **NuGet**: Total downloads, current version
- **Go Packages**: Import count, current version
- **Packagist**: Total installs, daily/monthly installs, current version

**Registry Badge Display:**
- Show primary package registry (npm, PyPI, etc.)
- Link to package page
- Display download/install count
- Show current version with link to changelog

#### Optional Fields
- Screenshot/preview image
- Demo URL
- Documentation URL
- Package registry URL(s) (can have multiple)
- Social links
- Related projects

### Visual Design

#### Layout Modes
- **Card Layout**: Rich cards with images and full metadata
- **List Layout**: Compact list view for quick scanning
- **Compact Mode**: Minimal information, maximum density
- **Detailed Mode**: Expanded view with all metadata

#### Theme System (Dual-layer)

**Layer 1: Site Theme (Creator-defined)**
- Custom color scheme and personality
- Defines brand identity of the list
- Accent colors, fonts, overall aesthetic
- Set once by list creator

**Layer 2: Appearance Mode (User-defined)**
- Light mode
- Dark mode
- Auto (system preference)
- Persists across sessions
- Independent of site theme

#### Visual Elements
- Project screenshots/previews (lazy-loaded)
- License icons (Creative Commons, MIT, GPL, etc.)
- Platform badges (GitHub, GitLab, etc.)
- Language/framework tags with color coding
- Project health indicators

### Project Health Indicators

- **Sparkline Charts**: Show star history, commit activity over time
- **Health Metrics**:
  - Last updated (relative time)
  - Maintenance status (active, maintained, deprecated)
  - Community activity score
  - Issue response time (if available)
- **Status Badges**:
  - Archived/Dead project warning
  - Actively maintained indicator
  - New/Recently added badge
  - Trending badge

### Discovery & Navigation

#### Full-Text Search (Optional Feature)
- Client-side search with fuzzy matching
- Search across name, description, tags, author
- Instant results as you type
- Keyboard navigation support
- Highlighted matching terms
- Can be disabled to reduce bundle size

#### Filtering
- Filter by category/tag
- Filter by license
- Filter by language/framework
- Filter by maintenance status (active/archived)
- Multi-select filters
- Clear all filters option

#### Sorting
- By stars (popularity)
- By last updated (freshness)
- By date added (newest first)
- By name (alphabetical)
- By number of downloads
- Ascending/descending toggle

#### Pagination
- Configurable items per page (12, 24, 48, all)
- Load more button or infinite scroll (configurable)
- URL-based pagination (shareable links)
- Scroll position restoration

### Stats & Analytics Dashboard

**Homepage Overview**:
- Total number of projects
- Total stars across all projects
- Most popular projects (this week/month/all-time)
- Recently added projects
- Trending projects (biggest star growth)
- Category breakdown (pie chart or bar chart)
- Language/framework distribution
- License distribution

**Visualizations**:
- Interactive charts (lightweight library like Chart.js or Recharts)
- Sparklines for individual project trends
- Aggregate statistics
- Timeline of list growth

### Additional Features

#### RSS Feed
- Feed for newly added projects
- Optional feeds per category
- Includes rich metadata in feed items
- Standard RSS 2.0 format

#### Bookmarks/Favorites
- LocalStorage-based favorites
- Persist across sessions
- Export favorites as JSON
- Import favorites from JSON
- Share favorites via URL

#### Comparison View
- Select 2-3 projects to compare side-by-side
- Show all metrics in parallel
- Highlight differences

#### Dead/Archived Project Handling
- Automatic detection based on:
  - GitHub archived status
  - No commits in X months (configurable)
  - Explicit archived flag in data
- Visual indicator on cards
- Separate "Archived Projects" section/filter
- Option to hide archived projects by default

#### Contribution System
- "Submit Project" button
- Pre-filled GitHub issue template
- Or generates PR with YAML entry
- Form validation
- Required fields checker
- Duplicate detection

#### Embeddable Widgets
- Individual project cards embeddable via iframe
- Configurable widget appearance
- Copy-paste embed code generator
- API endpoint for project data (JSON)

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader friendly
- Proper ARIA labels
- Focus indicators
- Skip to content link

---

## Technical Stack

### Static Site Generator
**Astro**
- Zero JS by default
- Component islands for interactivity
- Excellent performance
- Built-in image optimization
- MDX support
- First-class TypeScript support
- Fast build times

### Styling
**Tailwind CSS**
- Utility-first approach
- Tree-shakeable
- Responsive utilities
- Dark mode built-in
- Custom theme support
- Minimal runtime overhead

### UI Components
**shadcn/ui**
- Copy-paste component library
- Built on Radix UI primitives
- Fully customizable with Tailwind
- Accessible by default
- No runtime dependency overhead
- Works seamlessly with Astro

### Search
**Pagefind**
- Fully static search
- Zero-bundle-size at initial page load
- Generated at build time
- Fast client-side search
- Multilingual support
- Automatic indexing
- No backend required

### Icons
**Lucide**
- Clean, consistent icon set
- SVG-based
- Tree-shakeable
- Customizable size and stroke
- Open source

### Charts/Visualizations
**Recharts**
- Built on React and D3
- Responsive charts
- Composable chart components
- Lightweight
- Easy to customize
- Good TypeScript support

### Data Fetching & Package Registries

**GitHub API**
- Octokit for GitHub data
- Stars, forks, issues, commits
- Repository metadata
- Release information

**Package Registries Support**
- **npm** (npmjs.com API) - JavaScript/TypeScript packages
- **PyPI** (pypi.org JSON API) - Python packages
- **Cargo** (crates.io API) - Rust packages
- **RubyGems** (rubygems.org API) - Ruby gems
- **Maven Central** - Java packages
- **NuGet** - .NET packages
- **Go Packages** (pkg.go.dev)
- **Packagist** - PHP packages

**API Utilities**
- Node.js fetch for HTTP requests
- Response caching with timestamps
- Rate limit handling
- Retry logic with exponential backoff
- Parallel request batching

---

## Architecture

### File Structure
```
awesome-project/
├── src/
│   ├── data/
│   │   ├── projects.yaml          # Main project data
│   │   └── categories.yaml        # Category definitions
│   ├── scripts/
│   │   ├── fetch-github-data.js   # Fetch GitHub metrics
│   │   ├── fetch-npm-data.js      # Fetch npm stats
│   │   ├── fetch-pypi-data.js     # Fetch PyPI stats
│   │   ├── fetch-cargo-data.js    # Fetch Cargo stats
│   │   └── build-search-index.js  # Generate Pagefind index
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── tabs.tsx
│   │   ├── ProjectCard.astro      # Main project card
│   │   ├── ProjectList.astro      # List view
│   │   ├── FilterBar.tsx          # Interactive filter (React)
│   │   ├── SearchBox.astro        # Pagefind search integration
│   │   ├── StatsPanel.astro       # Dashboard stats
│   │   ├── Sparkline.tsx          # Chart component (React + Recharts)
│   │   └── ThemeToggle.tsx        # Dark/light mode toggle
│   ├── layouts/
│   │   └── MainLayout.astro       # Base layout with theme support
│   └── pages/
│       ├── index.astro            # Homepage with stats dashboard
│       ├── projects.astro         # Main project listing
│       ├── category/[slug].astro  # Category-specific pages
│       ├── [slug].astro           # Individual project pages
│       └── rss.xml.ts             # RSS feed generation
├── public/
│   ├── images/
│   │   ├── screenshots/           # Project screenshots
│   │   └── icons/                 # License and registry icons
│   └── fonts/                     # Custom fonts (if needed)
├── cache/                          # Cached API responses
│   ├── github/
│   ├── npm/
│   ├── pypi/
│   └── cargo/
├── lib/
│   └── utils.ts                   # shadcn/ui utilities
├── astro.config.mjs               # Astro configuration
├── tailwind.config.mjs            # Tailwind configuration
├── components.json                # shadcn/ui configuration
├── tsconfig.json                  # TypeScript configuration
└── config.yaml                     # Site configuration
```

### Data Flow
1. Developer adds project to `projects.yaml`
2. Build script runs:
   - Reads project data
   - Fetches GitHub/npm metrics
   - Caches responses with timestamps
   - Generates static pages
3. Deploy to hosting platform
4. CDN serves pre-rendered pages
5. Minimal client-side JS for interactions

### Build Process
```
1. Read data files (YAML/JSON)
2. Check cache for recent API data
3. Fetch missing/stale data from APIs:
   - GitHub metrics (stars, forks, commits)
   - npm data (downloads, version)
   - PyPI data (downloads, version)
   - Cargo data (downloads, version)
   - Other registries as configured
4. Update cache with timestamps
5. Build Astro pages with all data pre-rendered
6. Generate Pagefind search index
7. Optimize images (AVIF + WebP + JPEG fallbacks)
8. Generate RSS feed
9. Compile Tailwind CSS (purge unused)
10. Deploy to hosting
```

### Update Strategy
- Scheduled builds (daily/weekly via GitHub Actions)
- Webhook triggers on new PR merges
- Manual trigger option
- Rate limit respecting (cache-first approach)

---

## Configuration Options

Site-wide settings in `config.yaml`:

```yaml
site:
  title: "Awesome Python Resources"
  description: "A curated list of awesome Python libraries and tools"
  url: "https://awesome-python.dev"
  author: "Community"

theme:
  primary_color: "#3B82F6"
  accent_color: "#8B5CF6"
  font: "Inter"

features:
  search: true                    # Enable/disable search
  favorites: true                 # Enable/disable bookmarks
  comparison: true                # Enable comparison view
  rss: true                       # Generate RSS feed
  widgets: true                   # Enable embeddable widgets

display:
  default_layout: "card"          # card or list
  projects_per_page: 24
  show_archived: false            # Show archived projects by default

api:
  github_token: "gh_token"        # Optional, for higher rate limits
  cache_duration: 86400           # Cache duration in seconds (24h)

health:
  stale_months: 12                # Mark projects stale after X months
  archived_auto_detect: true      # Auto-detect archived repos
```

---

## Success Metrics

- Load time < 1 second on 3G
- Lighthouse score > 95
- Zero runtime errors
- < 100KB initial JS bundle (with all features)
- Works without JavaScript (progressive enhancement)
- Build time < 2 minutes for 500 projects
- GitHub stars > 1000 (adoption indicator)

---

## Future Enhancements (Post-v1)

- Internationalization (i18n)
- User accounts for personalized lists
- Project submission portal (alternative to PR)
- Email notifications for new projects
- Browser extension for quick bookmarking
- API for programmatic access
- Alternative view suggestions based on interests
- Community voting/rating system
- Changelog/history view
- Related projects suggestions
- Integration with package managers (one-click install)

---

## Getting Started (For List Creators)

1. Fork the template repository
2. Update `config.yaml` with your site details
3. Add projects to `src/data/projects.yaml`
4. Customize theme colors and branding
5. Deploy to hosting platform
6. Set up scheduled builds (optional)
7. Share your awesome list!

---

## Contributing Guidelines

- Projects must be actively maintained
- High quality, well-documented
- Open source (with clear license)
- Follows category guidelines
- No duplicates
- No spam or promotional content
- English descriptions required
- Working links required

---

## License

MIT License - Free to use, modify, and distribute

---

## Questions & Decisions Needed

- [ ] Default pagination size? (Recommend: 24)
- [ ] How aggressive should archived project detection be? (Recommend: 12 months of inactivity)
- [ ] Include GitHub Sponsors badge?
- [ ] Support for non-GitHub projects (GitLab, Bitbucket)?
- [ ] Maximum image sizes for previews? (Recommend: 1200x630 for cards, optimized AVIF)
- [ ] Should comparison view be v1 or v2 feature? (Recommend: v2)
- [ ] Auto-generate screenshots using headless browser, or require manual uploads?
- [ ] Rate limiting strategy: Require GitHub token or implement aggressive caching?

## Decisions Made

- [x] **Framework**: Astro (static site generation with islands)
- [x] **Styling**: Tailwind CSS
- [x] **UI Components**: shadcn/ui
- [x] **Search**: Pagefind (build-time static search)
- [x] **Icons**: Lucide
- [x] **Charts**: Recharts
- [x] **Package Registries**: npm, PyPI, Cargo, RubyGems, Maven, NuGet, Go, Packagist