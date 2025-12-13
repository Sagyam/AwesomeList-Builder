# Migration Summary: Metadata Generation to GitHub Actions

## What Changed

Metadata generation (GitHub stars, package stats, screenshots) has been moved from Vercel build-time to GitHub Actions.

## Benefits

- ✅ **Faster deployments** - Vercel builds complete in ~1-2 minutes (down from 5-10 minutes)
- ✅ **Lower costs** - Reduced Vercel build minutes usage
- ✅ **More reliable** - GitHub Actions has better Playwright support than AWS Lambda
- ✅ **Cached metadata** - Metadata updates respect cache TTL to minimize API calls
- ✅ **Graceful degradation** - Failed API calls don't block deployment

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

- `GITLAB_TOKEN` - For GitLab repositories
- `YOUTUBE_TOKEN` - For YouTube video metadata

### Metadata Caching

- Default cache: 7 days (configured in `src/data/metadata.yaml`)
- Manually force refresh: `bun run fetch --force`
- GitHub Action always uses `--force` to ensure fresh data

## Files Modified

- ✅ Created `.github/workflows/update-metadata.yml` - Metadata update workflow
- ✅ Updated `package.json` - Removed `prebuild` and `postinstall` hooks
- ✅ Updated `vercel.json` - Disabled screenshots during build
- ✅ Updated `src/lib/api/fetch-metadata/index.ts` - Resilient error handling
- ✅ Moved `playwright` to `devDependencies`

## Migration Complete

No action required. The system works automatically.