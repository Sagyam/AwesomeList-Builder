# Search Configuration Guide

## Overview

AwesomeKit includes a powerful, configurable full-text search powered by [Orama](https://orama.com/). You can enable or
disable different search features based on your needs and performance requirements.

## Configuration Location

Search settings are configured in `/src/data/metadata.yaml` under the `search` section:

```yaml
search:
  enableHighlighting: true
  enablePersistence: false
  enableEmbeddings: false
```

## Available Options

### 1. Search Result Highlighting (`enableHighlighting`)

**What it does:** Highlights matching search terms in results with visual indicators

**Bundle Impact:** +2 KB (~0.5 KB gzipped)

**Pros:**

- Shows users exactly what matched their query
- Improves search result clarity
- Minimal performance impact

**Cons:**

- None significant

**Recommendation:** ✅ **Enable (default: true)**

**Example:**

```yaml
search:
  enableHighlighting: true
```

When searching for "react", results show **React** highlighted in both titles and descriptions.

---

### 2. Database Persistence (`enablePersistence`)

**What it does:** Caches the search database in browser's localStorage to speed up subsequent page loads

**Bundle Impact:** +70 KB gzipped (only loaded when enabled via dynamic import)

**Pros:**

- Faster page loads on repeat visits
- Reduces CPU usage for returning users
- Database is automatically rebuilt when content changes

**Cons:**

- Significant bundle size increase
- Uses localStorage space (~50-200 KB depending on resource count)
- Not beneficial for users who only visit once
- Static sites rebuild on deploy anyway

**Recommendation:** ⚠️ **Disable unless users frequently reload pages (default: false)**

**When to enable:**

- Your list has 200+ resources (slow to index)
- Users frequently return to browse (analytics show high return rate)
- You update content infrequently (weekly/monthly)

**Example:**

```yaml
search:
  enablePersistence: true
```

---

### 3. Semantic/Vector Search (`enableEmbeddings`)

**What it does:** AI-powered semantic search using TensorFlow.js that understands conceptual similarity

**Bundle Impact:** +111 KB gzipped (TensorFlow.js + embeddings model)

**Pros:**

- Finds conceptually similar results (e.g., "UI widgets" matches "React components")
- Handles synonyms automatically
- Understands context and intent

**Cons:**

- **Massive bundle size** (8x increase)
- Slow initialization (2-5 seconds)
- Generates embeddings for all resources at runtime
- Overkill for small lists (<500 resources)
- Current fuzzy search + typo tolerance is usually sufficient

**Recommendation:** ❌ **Disable unless you have 500+ resources (default: false)**

**When to enable:**

- Your list has 500+ diverse resources
- Users search with varied terminology
- You need "find similar" functionality
- You have complex/technical content with many synonyms

**Example:**

```yaml
search:
  enableEmbeddings: true
```

**Hybrid Mode:** When enabled, searches use both full-text and vector similarity for best results.

---

## Bundle Size Comparison

| Configuration         | Bundle Size | Gzipped | Use Case                            |
|-----------------------|-------------|---------|-------------------------------------|
| **Highlighting only** | 90 KB       | ~29 KB  | ✅ Recommended for most lists        |
| **+ Persistence**     | 161 KB      | ~50 KB  | ⚠️ Large lists with returning users |
| **+ Embeddings**      | 730 KB      | ~140 KB | ❌ Very large lists (500+) only      |

## Recommended Configurations

### Small to Medium Lists (< 100 resources)

```yaml
search:
  enableHighlighting: true
  enablePersistence: false
  enableEmbeddings: false
```

**Bundle:** ~29 KB gzipped

---

### Large Lists (100-500 resources)

```yaml
search:
  enableHighlighting: true
  enablePersistence: true  # Optional based on usage patterns
  enableEmbeddings: false
```

**Bundle:** ~29-50 KB gzipped

---

### Very Large Lists (500+ resources)

```yaml
search:
  enableHighlighting: true
  enablePersistence: true
  enableEmbeddings: true
```

**Bundle:** ~140 KB gzipped

---

## Performance Considerations

### Initial Load Time

- **Highlighting only:** <100ms initialization
- **With persistence (cache miss):** 100-500ms (1st visit)
- **With persistence (cache hit):** <50ms (repeat visits)
- **With embeddings:** 2-5 seconds (generating vectors)

### Search Latency

- **Full-text search:** <10ms per query
- **Hybrid search (with embeddings):** 20-50ms per query

### Browser Storage

- **Persistence:** Uses 50-200 KB of localStorage per site
- Check browser console for cache status messages:
    - ✓ `Search database restored from cache`
    - ✓ `Search database built and cached`
    - ✓ `Search database built`

---

## Implementation Details

### Dynamic Imports

Heavy plugins are loaded **only when enabled** using dynamic imports:

```typescript
// Persistence plugin (Search.tsx:90)
const {restore} = await import("@orama/plugin-data-persistence");

// Embeddings plugin (Search.tsx:130)
const {pluginEmbeddings} = await import("@orama/plugin-embeddings");
```

This ensures you only pay the bundle cost for features you actually use.

### Search Modes

- **Full-text mode** (default): Traditional keyword search with stemming, typo tolerance, and boosting
- **Hybrid mode** (embeddings enabled): Combines full-text + vector similarity

### Cache Invalidation

The persistence layer automatically rebuilds when:

- Resource IDs change (add/remove/modify resources)
- You clear browser localStorage
- User visits from incognito/private mode

---

## Troubleshooting

### Search not working

1. Check browser console for errors
2. Verify `metadata.yaml` syntax is valid YAML
3. Ensure resources have required fields: `id`, `name`, `description`, `url`

### Bundle too large

1. Disable `enableEmbeddings` (saves 111 KB)
2. Disable `enablePersistence` (saves 70 KB)
3. Keep only `enableHighlighting: true` for minimal bundle

### Slow initialization with embeddings

1. This is expected - TensorFlow.js model loading takes 2-5 seconds
2. Consider disabling embeddings if you have < 500 resources
3. Persistence helps on repeat visits

### Cache not working

1. Check localStorage isn't full (dev tools → Application → Storage)
2. Verify `enablePersistence: true` in config
3. Look for console messages about cache status

---

## Migration from Pagefind

If you're migrating from Pagefind:

1. Remove Pagefind scripts from `package.json`
2. Delete `/public/pagefind/` directory
3. Remove `data-pagefind-*` attributes from HTML
4. Configure Orama search in `metadata.yaml`

**Advantages over Pagefind:**

- No build-time indexing required
- Configurable features and bundle size
- Better TypeScript support
- More flexible search options
- Optional AI-powered semantic search

---

## Need Help?

- [Orama Documentation](https://docs.orama.com/)
- [GitHub Issues](https://github.com/oramasearch/orama/issues)
- Project ORAMA-PLUGINS-EVALUATION.md for detailed analysis
