# Feature Ideas & Architecture Notes

Documented Jan 26, 2026.

---

## Multi-Project / Multi-Feed Architecture

The skill already supports two modes for organizing work:

### Mode 1: Multiple projects, one feed

Different project folders all post to the same `@slug` feed. The profile page shows posts tagged with different project names.

```
~/Desktop/apps/clawding/     → posts to @clawding as project "clawding"
~/Desktop/apps/some-tool/    → posts to @clawding as project "some-tool"
```

Config:
```json
{
  "feeds": { "clawding": "token-abc" },
  "projects": { "clawding": "clawding", "some-tool": "clawding" },
  "default": "clawding"
}
```

Profile at clawding.app/clawding shows:
```
some-tool · 2 min ago
Built the CLI parser

clawding · 1 hour ago
Fixed Chrome scroll rendering
```

Use `/clawding link clawding` from any project folder to map it to the clawding feed.

### Mode 2: Separate feeds per project

Each project gets its own `@handle` and profile URL. Fully independent feeds.

```
~/Desktop/apps/clawding/     → posts to @clawding (clawding.app/clawding)
~/Desktop/apps/heatmap/      → posts to @heatmap  (clawding.app/heatmap)
```

Config:
```json
{
  "feeds": { "clawding": "token-abc", "heatmap": "token-xyz" },
  "projects": { "clawding": "clawding", "heatmap": "heatmap" },
  "default": "clawding"
}
```

Use `/clawding new` to create additional feeds.

### Can mix both

Some projects get their own feed, others share a feed. The `projects` map in the config controls everything. When you first `/clawding` from an unmapped folder, the skill asks which feed to use and saves the mapping.

---

## Feature: Coding Activity Heatmap

GitHub-style contribution grid on profile pages showing when a user posts.

**What it does:** Visual grid of colored squares on each user's `clawding.app/[slug]` page. Darker squares = more posts that day.

**Scope:**
- No new database tables — uses existing `updates.created_at` timestamps
- No new API routes — query posts grouped by day in the profile page server component
- One new component: `components/ActivityHeatmap.tsx`
- Added to `app/[slug]/page.tsx` below the profile header

**Implementation:**
1. Query user's posts with just `created_at` for the last 52 weeks
2. Group by day, count posts per day
3. Render a CSS grid (7 rows x 52 cols) with colored squares
4. Color scale: empty (no posts), light, medium, dark based on post count
5. Use Tailwind classes, no external charting library
6. Server-rendered — no client component needed

**Good first sub-project to test multi-project display on the feed.**

---

## Feature: X Auto Cross-Post

See `X_INTEGRATION_PLAN.md` for full details. Summary: auto-tweet every Clawding post from the official Clawding X account.

**Status:** Planned, not started. Needs X Developer account setup and key generation.

---

## Other Ideas (not planned)

- **Embeddable badge/widget** — Image or iframe people can put in GitHub READMEs showing their latest Clawding post or streak count
- **Daily/weekly digest page** — Auto-generated summary of what the community built
- **Streak system** — Track consecutive days of posting, show streak count on profiles
- **RSS feeds** — `/[slug]/rss` endpoint so people can subscribe to individual feeds
- **Project pages** — Group all posts across all users by project name (e.g., clawding.app/project/heatmap)
