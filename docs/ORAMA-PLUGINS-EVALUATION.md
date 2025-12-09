# Orama Plugins Evaluation

## Bundle Size Comparison

| Configuration                        | ResourcesBrowser Size | Gzipped       | Change    |
|--------------------------------------|-----------------------|---------------|-----------|
| **Baseline (no Orama)**              | N/A                   | N/A           | -         |
| **Vanilla Orama**                    | 87.51 kB              | 28.18 kB      | baseline  |
| **+ @orama/highlight**               | 89.69 kB              | 28.95 kB      | +2.5%     |
| **+ @orama/plugin-data-persistence** | 158.94 kB             | 50.16 kB      | +81.6%    |
| **+ @orama/plugin-embeddings**       | **727.16 kB**         | **139.14 kB** | **+730%** |

## Plugin Analysis

### ✅ @orama/highlight - RECOMMENDED

**What it does:** Highlights matching search terms in results with `<mark>` tags

**Pros:**

- Minimal bundle size increase (+2.5%)
- Significantly improves UX by showing users what matched
- Easy to implement
- Zero performance impact

**Cons:**

- None

**Verdict:** **KEEP IT** - Great UX improvement with negligible cost

---

### ⚠️ @orama/plugin-data-persistence - QUESTIONABLE

**What it does:** Caches the Orama database in localStorage to avoid rebuilding on page reloads

**Pros:**

- Faster subsequent page loads (database restored from cache)
- Reduces CPU usage on repeat visits

**Cons:**

- **Massive bundle size increase** (+81.6%, adds 70 KB gzipped)
- Brings in `dpack` serialization library
- localStorage limits (~5-10 MB total per domain)
- Cache invalidation complexity
- Your site is static - users rebuild anyway when you deploy updates

**Verdict:** **REMOVE IT** - Cost outweighs benefits for a static site. The bundle bloat will slow down FIRST page load
more than caching helps subsequent loads.

---

### ❌ @orama/plugin-embeddings - NOT RECOMMENDED

**What it does:** AI-powered semantic/vector search using TensorFlow.js embeddings

**Pros:**

- Can find conceptually similar results (e.g., "UI widgets" matches "React components")
- Handles synonyms automatically
- Cool technology

**Cons:**

- **MASSIVE bundle size** (+730%, adds 111 KB gzipped)
- Includes entire TensorFlow.js library (~500 KB)
- Slow initialization (generating embeddings for all items)
- Overkill for a curated list with ~30 items
- Current fuzzy search + typo tolerance is sufficient

**Verdict:** **REMOVE IT** - Not worth 8x bundle size for minimal benefit at your scale. Consider only if you have 1000+
resources.

---

### 🔄 @orama/plugin-astro - NOT IMPLEMENTED

**What it does:** Generates search databases at build time

**Pros:**

- Database pre-built (no client-side initialization)
- Potentially smaller runtime bundle

**Cons:**

- Requires complete architecture change
- Currently has Astro 5 compatibility issues (though reportedly fixed)
- Less flexible than runtime approach
- Your current method (passing resources as props) works well

**Verdict:** **SKIP IT** - Your current approach is simpler and more flexible

---

## Recommendations

### Keep:

1. ✅ **Vanilla Orama** - Core search functionality
2. ✅ **@orama/highlight** - Visual feedback for matches

### Remove:

1. ❌ **@orama/plugin-data-persistence** - Bundle cost > benefit
2. ❌ **@orama/plugin-embeddings** - Massive overkill

### Final Bundle Size:

- **Current (all plugins):** 727.16 kB (139.14 kB gzipped) ⚠️
- **Recommended (Orama + highlight):** ~90 kB (~29 kB gzipped) ✅

**Savings:** ~650 kB (~110 KB gzipped) - **83% reduction!**

---

## Performance Considerations

### Current Issues:

1. **Initial load:** 139 KB for search is excessive
2. **TensorFlow.js:** Takes several seconds to initialize
3. **Embeddings generation:** Slow on first run (all 30 resources)

### With Recommended Config:

1. **Initial load:** ~29 KB (acceptable)
2. **Initialization:** <100ms
3. **Search latency:** <10ms

---

## Next Steps

Would you like me to remove the data-persistence and embeddings plugins to get back to a lean bundle size while keeping
the highlighting feature?
