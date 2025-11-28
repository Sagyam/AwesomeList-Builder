# AwesomeKit 😎

> A modern, feature-rich template for creating beautiful "awesome" curated lists that go beyond basic markdown links.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro)](https://astro.build)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

## ✨ Features

- **⚡ Blazing Fast** - Instant load times with Astro's static generation
- **🎨 Beautiful UI** - Modern design with shadcn/ui components and Tailwind CSS
- **🔍 Full-Text Search** - Built-in search powered by Pagefind
- **📊 Rich Metadata** - Auto-fetch GitHub stars, downloads, and package stats
- **📱 Responsive** - Perfect on mobile, tablet, and desktop
- **🌓 Dual Themes** - Site theme + user light/dark mode preference
- **📈 Analytics Dashboard** - Trending projects, stats, and visualizations
- **🏷️ Smart Filtering** - Filter by category, license, language, and status
- **💾 Favorites** - Bookmark projects with localStorage persistence
- **📡 RSS Feed** - Stay updated with new additions
- **♿ Accessible** - WCAG 2.1 AA compliant
- **💰 Free to Deploy** - Zero-cost hosting on Netlify, Vercel, or Cloudflare Pages

## 🎯 Why AwesomeKit?

Current "awesome" lists suffer from poor discoverability and user experience:
- ❌ Basic markdown with plain links
- ❌ No visual previews or metadata
- ❌ Difficult to browse large collections
- ❌ No filtering, sorting, or search
- ❌ Static data that becomes outdated

AwesomeKit transforms your curated lists into engaging, discoverable resource hubs while maintaining the community-driven curation that makes awesome lists valuable.

## 🚀 Quick Start

```bash
# Clone the template
git clone https://github.com/yourusername/awesomekit.git my-awesome-list
cd my-awesome-list

# Install dependencies
npm install

# Add your projects to src/data/projects.yaml

# Run development server
npm run dev

# Build for production
npm run build
```

## 📦 Package Registry Support

AwesomeKit automatically fetches data from:

- **npm** - JavaScript/TypeScript packages
- **PyPI** - Python packages
- **Cargo** - Rust crates
- **RubyGems** - Ruby gems
- **Maven Central** - Java packages
- **NuGet** - .NET packages
- **Go Packages** - Go modules
- **Packagist** - PHP packages

## 📋 Project Structure

```
awesome-project/
├── src/
│   ├── data/
│   │   ├── projects.yaml      # Your curated projects
│   │   └── categories.yaml    # Category definitions
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ProjectCard.astro
│   │   ├── FilterBar.tsx
│   │   └── SearchBox.astro
│   ├── scripts/
│   │   └── fetch-*.js        # API data fetchers
│   └── pages/
│       ├── index.astro       # Homepage with dashboard
│       └── projects.astro    # Main listing
├── config.yaml               # Site configuration
└── cache/                    # API response cache
```

## ⚙️ Configuration

Customize your site in `config.yaml`:

```yaml
site:
  title: "Awesome Python Resources"
  description: "A curated list of awesome Python libraries"
  url: "https://awesome-python.dev"

theme:
  primary_color: "#3B82F6"
  accent_color: "#8B5CF6"

features:
  search: true
  favorites: true
  rss: true

display:
  default_layout: "card"
  projects_per_page: 24
```

## 📝 Adding Projects

Add projects to `src/data/projects.yaml`:

```yaml
- name: "Project Name"
  description: "Short description of the project"
  url: "https://project-website.com"
  repository: "https://github.com/user/repo"
  package:
    npm: "package-name"
    # or pypi: "package-name"
    # or cargo: "package-name"
  license: "MIT"
  tags:
    - web
    - frontend
  image: "/images/project-screenshot.png"
```

The build process automatically fetches:
- ⭐ GitHub stars, forks, and activity
- 📦 Package downloads and versions
- 📊 Project health metrics

## 🎨 Customization

### Theme Colors

Update `config.yaml` to match your brand:

```yaml
theme:
  primary_color: "#3B82F6"    # Your brand color
  accent_color: "#8B5CF6"     # Accent highlights
  font: "Inter"               # Custom font
```

### Components

All components are customizable:
- `src/components/ui/` - shadcn/ui base components
- `src/components/ProjectCard.astro` - Project card layout
- `src/layouts/MainLayout.astro` - Base layout and theme

## 🔧 Tech Stack

- **[Astro](https://astro.build)** - Static site generation with islands
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful, accessible components
- **[Pagefind](https://pagefind.app)** - Static search
- **[Recharts](https://recharts.org)** - Data visualizations
- **[Lucide](https://lucide.dev)** - Icon library

## 🚢 Deployment

Deploy to your favorite platform:

### Netlify
```bash
npm run build
# Connect your repo to Netlify
```

### Vercel
```bash
npm run build
# Connect your repo to Vercel
```

### Cloudflare Pages
```bash
npm run build
# Connect your repo to Cloudflare
```

All platforms offer free tiers perfect for awesome lists!

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## 📖 Documentation

- [Getting Started](docs/getting-started.md)
- [Configuration Guide](docs/configuration.md)
- [Adding Projects](docs/adding-projects.md)
- [Customization](docs/customization.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## 🗺️ Roadmap

See our [Project Roadmap](ROADMAP.md) for upcoming features and improvements.

**Coming Soon:**
- [ ] Multi-language support (i18n)
- [ ] Project comparison view
- [ ] Community voting system
- [ ] Browser extension
- [ ] Advanced analytics

## 📄 License

MIT License - feel free to use this template for your own awesome lists!

## 🌟 Showcase

Using AwesomeKit? Add your list here:

- [Your Awesome List](https://your-list.com) - Description

## 💬 Support

- 📖 [Documentation](https://awesomekit.dev/docs)
- 💬 [Discussions](https://github.com/yourusername/awesomekit/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/awesomekit/issues)
- 🐦 [Twitter](https://twitter.com/awesomekit)

## 🙏 Acknowledgments

Built with inspiration from the awesome-* community and powered by amazing open source tools.

---

<p align="center">Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a></p>
<p align="center">Give it a ⭐ if you like it!</p>
