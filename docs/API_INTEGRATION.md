# API Integration Guide

Automatically enrich your awesome list with live metadata from GitHub, GitLab, and 7 package registries. No manual
updates needed—just define your resources and let AwesomeKit fetch stars, downloads, versions, and more.

## What This Does

AwesomeKit automatically fetches metadata for your resources at build time:

- **Repository stats**: Stars, forks, languages, last commit dates
- **Package info**: Download counts, latest versions, licenses
- **Save time**: No manual updates for changing data
- **Stay current**: Always show accurate, up-to-date information

## Supported Platforms

### Repository Hosts

- **GitHub** - Stars, forks, watchers, issues, languages, topics
- **GitLab** - Stars, forks, activity, languages, topics, visibility

### Package Registries

- **npm** (JavaScript/Node.js) - Downloads, versions, repository links
- **PyPI** (Python) - Versions, Python requirements, project URLs
- **Cargo** (Rust) - Downloads, categories, keywords
- **RubyGems** (Ruby) - Downloads, authors, documentation
- **Maven Central** (Java) - Versions, packaging, timestamps
- **Go Packages** - Module versions, documentation links
- **Packagist** (PHP) - Downloads, stars, maintainers

## Quick Start

### 1. Set Up Authentication (Recommended)

For better rate limits, add API tokens to your `.env` file:

```bash
# Copy the example
cp .env.example .env
```

Edit `.env`:

```env
# GitHub token (increases limit from 60 to 5,000 req/hour)
GITHUB_TOKEN=your_github_token_here

# GitLab token (increases limit from 300 to 5,000 req/hour)
GITLAB_TOKEN=your_gitlab_token_here
```

**Get tokens:**

- GitHub: https://github.com/settings/tokens (scope: `public_repo`)
- GitLab: https://gitlab.com/-/profile/personal_access_tokens (scope: `read_api`)

### 2. Fetch Metadata

Run the fetch command:

```bash
bun run fetch
```

You'll see progress as it fetches:

```
Loading resources...
Found 30 resources
Fetching metadata...
Progress: 30/30 (100%)

=== Fetch Statistics ===
Total resources: 30
Fetched: 9
Cached: 0
Failed: 0
Skipped: 21

Cache: 9 entries, 6.70 KB
```

### 3. Build Your Site

```bash
bun run build
```

That's it! Your resources now have enriched metadata.

## How to Use

### GitHub Repository

Create a resource file in `src/data/resources/`:

```yaml
type: repository
id: nextjs-repo
name: Next.js
url: https://github.com/vercel/next.js
repositoryUrl: https://github.com/vercel/next.js
description: The React Framework for production
category: Framework
tags: [ react, ssr, framework ]
topics: [ web-development, react ]
language: en
dateAdded: '2024-03-15'
lastVerified: '2025-12-10'
```

After running `bun run fetch`, these fields are automatically added:

- `owner`, `ownerUrl`
- `stars`, `forks`, `watchers`, `openIssues`
- `lastCommit`, `created`
- `primaryLanguage`, `languages[]`
- `license`
- `archived`, `hasWiki`, `hasDiscussions`
- `topics[]` (merged with existing tags)

### GitLab Repository

```yaml
type: repository
id: gitlab-ce
name: GitLab Community Edition
url: https://gitlab.com/gitlab-org/gitlab-foss
repositoryUrl: https://gitlab.com/gitlab-org/gitlab-foss
description: Open source Git repository management
category: DevOps
tags: [ git, gitlab, devops ]
topics: [ version-control ]
language: en
dateAdded: '2024-03-15'
lastVerified: '2025-12-10'
```

Auto-fetched: stars, forks, lastActivity, languages, topics, visibility

### npm Package

```yaml
type: library
id: react-library
name: React
url: https://react.dev
package:
  registry: npm
  name: react
description: A JavaScript library for building user interfaces
category: Frontend Framework
tags: [ react, ui-library ]
topics: [ web-development, javascript ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, downloads, license, repository, homepage, documentation

### PyPI Package

```yaml
type: library
id: django-library
name: Django
url: https://djangoproject.com
package:
  registry: pypi
  name: django
description: High-level Python web framework
category: Web Framework
tags: [ python, web, framework ]
topics: [ web-development ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, license, repository, documentation, homepage, keywords

### Cargo Crate

```yaml
type: library
id: serde-library
name: Serde
url: https://serde.rs
package:
  registry: cargo
  name: serde
description: Serialization framework for Rust
category: Rust Library
tags: [ rust, serialization ]
topics: [ rust ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, downloads, license, repository, documentation, categories

### RubyGems

```yaml
type: library
id: rails-library
name: Ruby on Rails
url: https://rubyonrails.org
package:
  registry: rubygems
  name: rails
description: Web application framework for Ruby
category: Web Framework
tags: [ ruby, web, framework ]
topics: [ web-development ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, downloads, license, authors, repository, documentation

### Maven Artifact

**Important**: Use `groupId:artifactId` format

```yaml
type: library
id: spring-boot-library
name: Spring Boot
url: https://spring.io/projects/spring-boot
package:
  registry: maven
  name: org.springframework.boot:spring-boot-starter
description: Framework for creating Spring applications
category: Java Framework
tags: [ java, spring, framework ]
topics: [ java, web-development ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, packaging, lastUpdated, repository (heuristic)

### Go Module

**Important**: Use full module path

```yaml
type: library
id: gin-library
name: Gin Web Framework
url: https://gin-gonic.com
package:
  registry: go
  name: github.com/gin-gonic/gin
description: HTTP web framework for Go
category: Go Framework
tags: [ go, web, framework ]
topics: [ web-development ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, repository, documentation, homepage

### Packagist Package

**Important**: Use `vendor/package` format

```yaml
type: library
id: symfony-library
name: Symfony HTTP Foundation
url: https://symfony.com
package:
  registry: packagist
  name: symfony/http-foundation
description: HTTP abstraction for PHP
category: PHP Library
tags: [ php, http ]
topics: [ web-development ]
language: en
dateAdded: '2024-01-15'
lastVerified: '2025-12-10'
```

Auto-fetched: version, downloads, stars, license, authors, repository

## Cache Management

All API responses are cached for 1 hour to speed up builds and reduce API calls.

### View cache statistics

```bash
bun run cache:stats
```

Output:

```
Cache Statistics:
  Total entries: 9
  Total size: 6.70 KB
```

### Clean expired entries

```bash
bun run cache:clean
```

### Clear all cache

```bash
bun run cache:clear
```

## Automation

### Auto-fetch before build

Update `package.json`:

```json
{
  "scripts": {
    "build": "bun run fetch && astro build"
  }
}
```

### GitHub Actions

Cache API responses in CI:

```yaml
- name: Cache API responses
  uses: actions/cache@v3
  with:
    path: cache
    key: api-cache-${{ github.sha }}
    restore-keys: api-cache-

- name: Fetch metadata
  run: bun run fetch

- name: Build
  run: bun run build
```

### Netlify

Add to `netlify.toml`:

```toml
[build]
  command = "bun run fetch && bun run build"
  publish = "dist"

[[plugins]]
  package = "netlify-plugin-cache"
  [plugins.inputs]
    paths = ["cache"]
```

## Rate Limits

The system automatically handles rate limits with smart throttling and retries.

### Repository Hosts

| Platform | Unauthenticated  | Authenticated      |
|----------|------------------|--------------------|
| GitHub   | 10/min, 60/hour  | 100/min, 5000/hour |
| GitLab   | 10/min, 300/hour | 100/min, 5000/hour |

### Package Registries

| Registry    | Rate Limit        |
|-------------|-------------------|
| npm         | 60/min, 3600/hour |
| PyPI        | 60/min, 3600/hour |
| Cargo       | 60/min, 3600/hour |
| RubyGems    | 60/min, 3600/hour |
| Maven       | 60/min, 3600/hour |
| Go Packages | 30/min, 1800/hour |
| Packagist   | 60/min, 3600/hour |

## Troubleshooting

### Rate Limit Exceeded

**Symptom**: Error messages about rate limits

**Solution**:

1. Add authentication tokens to `.env` (see Quick Start)
2. Wait for rate limit to reset
3. Use cache to avoid repeated requests: `bun run cache:stats`

### Stale Data

**Symptom**: Cached data is outdated

**Solution**:

```bash
bun run cache:clear
bun run fetch
```

### Network Errors

**Symptom**: Some resources fail to fetch

**Solution**:

- The system uses graceful degradation—failed fetches won't break your build
- Check error messages for specific issues
- Verify resource URLs are correct
- Confirm API service is operational

### Build Failures

**Symptom**: Build fails after adding API integration

**Solution**:

1. Run `bun run validate` to check resource format
2. Ensure package names use correct format (see examples above)
3. Check `.env` file has correct token format
4. Try `bun run cache:clear` to reset cache

## Format Requirements

### Maven Central

- **Format**: `groupId:artifactId`
- **Example**: `org.springframework.boot:spring-boot-starter`
- **Note**: Only Maven Central is supported (not other repositories)

### Go Packages

- **Format**: Full module path
- **Example**: `github.com/gin-gonic/gin`
- **Note**: Slower rate limits (30/min vs 60/min)

### Packagist

- **Format**: `vendor/package`
- **Example**: `symfony/http-foundation`
- **Note**: Includes GitHub integration data if available

### GitLab

- **Supported**: gitlab.com only
- **Not supported**: Self-hosted GitLab instances

## How It Works

### Architecture

1. **Base API Client**: All clients extend this with built-in rate limiting and retry logic
2. **Caching Layer**: File-based cache in `cache/` directory (1-hour TTL)
3. **Batch Processing**: Processes resources in groups of 5 with delays
4. **Error Handling**: Exponential backoff with 3 retries, graceful degradation

### Data Flow

```
Resource YAML → Fetch Script → API Clients → Cache → Enriched Data → Build
```

### Performance

- **First run**: ~5-10 seconds per registry type (with API calls)
- **Cached runs**: < 1 second (cache hits)
- **Build impact**: Zero runtime overhead (data fetched at build time only)

## Advanced Usage

### Programmatic API Access

```typescript
import {githubClient, npmClient, rubygemsClient} from "@/lib/api";

// Fetch GitHub repository
const repo = await githubClient.fetchRepositoryMetadata(
    "https://github.com/vercel/next.js"
);

// Fetch npm package
const pkg = await npmClient.fetchPackageMetadata("react");

// Fetch RubyGems
const gem = await rubygemsClient.fetchPackageMetadata("rails");

// Batch fetch multiple packages
const packages = await npmClient.fetchMultiplePackages([
    "react",
    "vue",
    "angular"
]);
```

### Custom Rate Limits

Modify client configuration in the source files if needed:

```typescript
// src/lib/api/custom-client.ts
export class CustomClient extends BaseApiClient {
    constructor() {
        super({
            baseUrl: "https://api.example.com",
            rateLimit: {
                requestsPerMinute: 30,
                requestsPerHour: 1000,
            },
            cache: {
                ttl: 7200000, // 2 hours
                enabled: true,
            },
        });
    }
}
```

## Best Practices

1. **Use tokens**: Always set `GITHUB_TOKEN` and `GITLAB_TOKEN` for better rate limits
2. **Cache in CI**: Configure CI to cache the `cache/` directory
3. **Monitor stats**: Run `bun run cache:stats` to check cache efficiency
4. **Clear strategically**: Only clear cache when you need fresh data
5. **Batch operations**: The system handles batching automatically
6. **Check formats**: Verify package name formats before adding resources

## Summary

AwesomeKit supports **9 package registries** and **2 repository hosts**, covering JavaScript, Python, Rust, Ruby, Java,
Go, and PHP ecosystems. The API integration:

- Fetches metadata automatically at build time
- Caches responses for fast subsequent builds
- Handles rate limits intelligently
- Degrades gracefully on errors
- Requires zero runtime overhead

Simply add resources in the correct format, run `bun run fetch`, and build your site. That's it!
