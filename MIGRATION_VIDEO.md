# Video Schema Migration Guide

## Overview

The video schema has been updated to use a **two-tiered architecture** similar to the book schema:

- **Tier 1 (User Input)**: Minimal fields that users must provide
- **Tier 2 (Metadata)**: Automatically fetched from YouTube Data API v3

## What Changed

### Before (Old Schema)

Users had to manually enter all video information:

```yaml
type: video
id: fireship-video
title: 100+ Web Development Things you Should Know
url: https://www.youtube.com/watch?v=erEgovG9WBs
description: Are you a full-stack web developer? Test...
category: Learning Resource
tags:
  - youtube
  - web-development
topics:
  - web-development
language: en
dateAdded: '2024-08-10T10:00:00Z'
lastVerified: '2025-12-09T10:00:00Z'
platform: YouTube
creator: Fireship
published: '2024-06-15T10:00:00Z'
duration: PT15M
views: 2500000
# ... many more manual fields
```

### After (New Schema)

Users only provide **3 required fields**:

```yaml
type: video
id: fireship-video
videoId: erEgovG9WBs
```

That's it! Everything else is automatically fetched from YouTube.

## Migration Steps

### 1. Extract Video ID from URL

From your existing `url` field, extract the 11-character video ID:

| URL Format                                    | Video ID      |
|-----------------------------------------------|---------------|
| `https://www.youtube.com/watch?v=erEgovG9WBs` | `erEgovG9WBs` |
| `https://youtu.be/erEgovG9WBs`                | `erEgovG9WBs` |
| `https://www.youtube.com/embed/erEgovG9WBs`   | `erEgovG9WBs` |

### 2. Update Your YAML Files

**Minimal Format (Recommended):**

```yaml
type: video
id: your-unique-id
videoId: YOUTUBE_VIDEO_ID
```

**With Metadata (Auto-generated after running fetch):**

```yaml
type: video
id: fireship-video
videoId: erEgovG9WBs
metadata:
  title: 100+ Web Development Things you Should Know
  description: Are you a full-stack web developer...
  publishedAt: '2024-06-15T12:00:00Z'
  channel:
    id: UCsBjURrPoezykLs9EqgamOA
    title: Fireship
    customUrl: '@fireship'
  thumbnails:
    high:
      url: https://i.ytimg.com/vi/erEgovG9WBs/hqdefault.jpg
      width: 480
      height: 360
  statistics:
    viewCount: 2547893
    likeCount: 98234
    commentCount: 1247
  contentDetails:
    duration: PT15M23S
    dimension: '2d'
    definition: hd
    caption: true
  categoryId: '28'
  categoryName: Science & Technology
  tags:
    - web development
    - javascript
    - programming
  fetchedAt: '2025-12-12T10:00:00Z'
  etag: xyz123abc
```

### 3. Run the Metadata Fetcher

After updating your YAML files with just `type`, `id`, and `videoId`:

```bash
# Fetch metadata for all videos
bun run fetch

# Or fetch only videos
bun run src/lib/api/fetch-metadata/video.ts

# Force refresh (ignore cache)
bun run fetch --force
```

The fetcher will automatically:

- ✅ Fetch video title, description, and thumbnails
- ✅ Get view count, like count, and comment count
- ✅ Retrieve channel information
- ✅ Extract tags, categories, and topics
- ✅ Get duration, quality (HD/SD), and caption availability
- ✅ Fetch publish date and live streaming details (if applicable)

## What Gets Auto-Fetched

### Core Information

- Title
- Description
- Published date
- Duration (ISO 8601 format)

### Channel Details

- Channel ID and title
- Channel custom URL
- Channel thumbnails

### Statistics (Updated on each fetch)

- View count
- Like count
- Comment count

### Content Details

- Video dimension (2d/3d)
- Definition (hd/sd)
- Caption availability
- Licensed content status
- Projection type

### Categorization

- Category ID and human-readable name
- YouTube topic IDs and categories
- Video tags

### Visual Assets

- 5 different thumbnail sizes (default, medium, high, standard, maxres)

### Status Information

- Privacy status (public/unlisted/private)
- Upload status
- Embeddable status
- Made for kids flag

## Environment Setup

Make sure you have a YouTube API key in your `.env` file:

```env
YOUTUBE_TOKEN=your_youtube_api_key_here
# OR
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key to your `.env` file

## Benefits

✅ **Less Manual Work**: Only 3 fields instead of 20+
✅ **Always Up-to-Date**: Stats refresh automatically
✅ **More Accurate**: Data comes directly from YouTube
✅ **Richer Metadata**: Access to information you couldn't manually enter
✅ **Consistent Format**: All videos follow the same structure

## Breaking Changes

⚠️ The following fields are **no longer at the root level**:

- `title` → `metadata.title`
- `description` → `metadata.description`
- `views` → `metadata.statistics.viewCount`
- `duration` → `metadata.contentDetails.duration`
- `published` → `metadata.publishedAt`
- `creator` → `metadata.channel.title`
- `platform` → (removed, assumed YouTube)
- `thumbnail` → `metadata.thumbnails.high.url`
- `hasSubtitles` → `metadata.contentDetails.caption`

## UI Component Updates

The resource detail page has been updated to use the new metadata structure. If you have custom components displaying
video data, update them:

```typescript
// OLD
{
    resource.type === "video" && resource.views && (
        <div>{resource.views.toLocaleString()}
    views < /div>
)
}

// NEW
{
    resource.type === "video" && resource.metadata && (
        <div>{resource.metadata.statistics.viewCount.toLocaleString()}
    views < /div>
)
}
```

## Troubleshooting

**Problem**: "YOUTUBE_TOKEN or YOUTUBE_API_KEY environment variable is required"
**Solution**: Add your YouTube API key to the `.env` file

**Problem**: "No metadata found for video ID: xyz"
**Solution**: Check that the video ID is correct and the video is public

**Problem**: "YouTube API error: 403"
**Solution**: Check your API key is valid and YouTube Data API v3 is enabled

**Problem**: Video fetching is slow
**Solution**: The fetcher respects YouTube API rate limits. For many videos, it may take time.

## Example: Complete Migration

**Before** (src/data/resources/05-fireship-video.yaml):

```yaml
type: video
id: fireship-video
title: 100+ Web Development Things you Should Know
url: https://www.youtube.com/watch?v=erEgovG9WBs
description: Long description...
category: Learning Resource
tags: [ youtube, web-development ]
topics: [ web-development ]
language: en
dateAdded: '2024-08-10T10:00:00Z'
lastVerified: '2025-12-09T10:00:00Z'
platform: YouTube
creator: Fireship
published: '2024-06-15T10:00:00Z'
duration: PT15M
views: 2500000
```

**After** (minimal, before fetch):

```yaml
type: video
id: fireship-video
videoId: erEgovG9WBs
```

**After** (after running `bun run fetch`):

```yaml
type: video
id: fireship-video
videoId: erEgovG9WBs
metadata:
  title: 100+ Web Development Things you Should Know
  description: Are you a full-stack web developer? Test your knowledge...
  publishedAt: '2024-06-15T12:00:00Z'
  channel:
    id: UCsBjURrPoezykLs9EqgamOA
    title: Fireship
    customUrl: '@fireship'
  thumbnails:
    high:
      url: https://i.ytimg.com/vi/erEgovG9WBs/hqdefault.jpg
      width: 480
      height: 360
  statistics:
    viewCount: 2547893
    likeCount: 98234
    commentCount: 1247
  contentDetails:
    duration: PT15M23S
    dimension: '2d'
    definition: hd
    caption: true
  categoryId: '28'
  categoryName: Science & Technology
  tags:
    - web development
    - javascript
    - tutorial
  fetchedAt: '2025-12-12T10:00:00Z'
  etag: xyz123
```

---

**Questions?** Check the main documentation or open an issue on GitHub.
