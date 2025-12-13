# Migration Summary: Metadata Generation to GitHub Actions

## What Changed

Metadata generation (GitHub stars, package stats, screenshots) has been moved from Vercel build-time to GitHub Actions.

## Benefits

- ✅ **Faster deployments** - Vercel builds complete in ~1-2 minutes (down from 5-10 minutes)
- ✅ **Lower costs** - Reduced Vercel build minutes usage
- ✅ **More reliable** - GitHub Actions has better Playwright support than AWS Lambda
- ✅ **Cached metadata** - Granular cache control for metadata, screenshots, and AI responses
- ✅ **Graceful degradation** - Failed API calls, rate limits (429), and timeouts don't block deployment
- ✅ **PDF support** - PDFs rendered as cover images (first page) instead of Playwright screenshots
- ✅ **Fast failure** - Screenshots timeout after 20 seconds (prevents workflow hanging)

## How It Works

1. **GitHub Action runs daily** at 2 AM UTC (`.github/workflows/update-metadata.yml`)
2. **Fetches metadata** from GitHub, npm, PyPI, web scraping, etc.
3. **Captures screenshots** for resources without preview images
4. **Commits changes** to the repository
5. **Vercel auto-deploys** when changes are pushed

## For Developers

### Local Development

```bash
# Fetch metadata locally (optional)
bun run fetch

# Start dev server
bun run dev

# Build (no metadata fetching)
bun run build
```

### Manual Metadata Update

Trigger via GitHub Actions UI:

- Go to: Actions → Update Resource Metadata → Run workflow

### Configuration

Set these in GitHub repository secrets if needed:

- `GH_API_TOKEN` - GitHub personal access token (optional, for higher rate limits)
- `GITLAB_TOKEN` - For GitLab repositories
- `YOUTUBE_TOKEN` - For YouTube video metadata

### Granular Cache Control

Configure cache TTLs independently in `src/data/metadata.yaml`:

```yaml
dataRefresh:
  cache:
    metadata:
      ttl: 1  # Refresh GitHub stars, downloads daily
    screenshots:
      regenerate: false  # Don't regenerate existing screenshots
    ai:
      ttl: 30  # Cache AI responses for 30 days (future use)
```

- **Metadata cache** - Controls how often to refresh GitHub stars, npm downloads, etc.
- **Screenshot cache** - Set `regenerate: false` to skip regenerating existing screenshots
- **AI cache** - Reserved for future AI-powered metadata extraction

Manually force refresh: `bun run fetch --force`

## Files Modified

- ✅ Created `.github/workflows/update-metadata.yml` - Metadata update workflow
- ✅ Created `src/lib/utils/pdf-cover.ts` - Generic PDF cover generator (reusable)
- ✅ Updated `package.json` - Removed `prebuild` and `postinstall` hooks
- ✅ Updated `vercel.json` - Disabled screenshots during build
- ✅ Updated `src/lib/utils/screenshot.ts` - Detects PDFs, reduced timeout to 20s
- ✅ Updated `src/lib/api/arxiv-client.ts` - Uses generic PDF cover utility
- ✅ Updated `src/lib/api/article-client.ts` - Graceful 429 error handling
- ✅ Updated `src/lib/api/fetch-metadata/index.ts` - Resilient error handling
- ✅ Updated `src/lib/api/fetch-metadata/common.ts` - Removed legacy cache support
- ✅ Moved `playwright` to `devDependencies`

## Migration Complete

No action required. The system works automatically.