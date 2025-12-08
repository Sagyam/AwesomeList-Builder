# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AwesomeKit** - A modern, feature-rich template for creating beautiful "awesome" curated lists that go beyond basic markdown links. Built with Astro, React, and Tailwind CSS to provide a visually appealing, performant, and discoverable way to showcase high-quality resources.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Astro 5.x** - Static site generator with islands architecture
- **React 19** - Interactive components
- **Tailwind CSS 4.x** - Utility-first styling with @tailwindcss/vite
- **shadcn/ui** - Copy-paste component library built on Radix UI
- **Lucide React** - Icon library
- **TypeScript** - Type safety throughout

## Architecture

### Core Principles

1. **Static-First**: Astro generates static HTML with minimal JavaScript by default
2. **Islands Architecture**: Interactive components (React) are loaded only where needed
3. **Zero Config**: Tailwind CSS 4.x uses inline theme configuration in CSS
4. **Component-Driven**: shadcn/ui components are copied directly into src/components/ui/

### Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components (button, card, input, label)
├── layouts/
│   └── main.astro       # Base layout with metadata
├── lib/
│   └── utils.ts         # cn() utility for className merging
├── pages/
│   └── index.astro      # Homepage
└── styles/
    └── global.css       # Tailwind imports + theme configuration
```

### Key Patterns

**Styling System:**
- Tailwind CSS 4.x with inline theme configuration in `global.css`
- Custom CSS variables for colors using OKLCH color space
- Light/dark mode support via `.dark` class
- Theme tokens: `--radius`, `--background`, `--foreground`, `--primary`, etc.
- Use `cn()` utility from `@/lib/utils` to merge Tailwind classes

**Component Architecture:**
- `.astro` files for static content and layouts
- `.tsx` files for interactive React components
- Path aliases configured: `@/` maps to `src/`
- shadcn/ui components use `class-variance-authority` for variants

**Astro Configuration:**
- Tailwind CSS integrated via @tailwindcss/vite plugin
- React integration enabled for interactive components
- TypeScript strict mode enabled

## Planned Features (from ROADMAP.md)

Currently in **Phase 0 - Foundation**. The roadmap includes:

**Phase 1-2:** Data layer with YAML schemas for projects/categories, API integration for GitHub/npm/PyPI metrics
**Phase 3:** Enhanced UI with project cards, list layouts, theme system
**Phase 4:** Pagefind search integration, filtering, sorting, pagination
**Phase 5:** Analytics dashboard with Recharts visualizations
**Phase 6:** Favorites system, RSS feeds, project comparison
**Phase 7:** Performance optimization, SEO, accessibility (WCAG 2.1 AA)
**Phase 8:** Documentation and v1.0 launch

## Data Architecture (Future)

When implementing data features, follow SPECS.md:

**Data Sources:**
- Projects defined in `src/data/projects.yaml`
- Categories in `src/data/categories.yaml`
- Build-time data fetching for GitHub stars, npm downloads, etc.
- Response caching in `cache/` directory

**Package Registry Support:**
- npm, PyPI, Cargo, RubyGems, Maven Central, NuGet, Go Packages, Packagist
- Auto-fetch: stars, downloads, versions, last update
- Health metrics: maintenance status, activity indicators

## Design System

**Theme Configuration:**
- Colors use OKLCH color space for perceptual uniformity
- CSS custom properties in `src/styles/global.css`
- Radius: `--radius: 0.625rem` (10px base)
- shadcn/ui style: "new-york" (refined, professional)

**Component Guidelines:**
- Use shadcn/ui components from `@/components/ui/`
- Icons from `lucide-react`
- Responsive by default (mobile-first)
- Accessibility built-in via Radix UI primitives

## Performance Goals

- Load time < 1s on 3G
- Lighthouse score > 95
- < 100KB initial JS bundle
- First Contentful Paint < 1.5s
- Build time < 2min for 500 projects

## Configuration Files

- `astro.config.mjs` - Astro + Tailwind + React integration
- `tsconfig.json` - TypeScript with path aliases (@/*)
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies and scripts
- Future: `config.yaml` - Site configuration (per SPECS.md)

## Important Notes

- Tailwind CSS 4.x uses new inline theme syntax - no separate tailwind.config file
- shadcn/ui components are copied into codebase (not npm packages)
- React 19 with new JSX transform (`jsx: "react-jsx"`)
- Path alias `@/*` resolves to `src/*`
- Global styles in `src/styles/global.css` must be imported in layouts