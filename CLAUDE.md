# SlashCast

Terminal-native coding community platform. Broadcast what you build, join events, compete in hackathons — all from `/cast`.

**Plan:** See `docs/plans/app-plan.md` for feature roadmap, data model, and build order.

## Architecture

```
src/
  app/                    # Next.js App Router
    [slug]/               # User feed pages
    feed/                 # Global feed
    guide/                # Guide/docs
    events/               # Event list + detail + voting
      [slug]/
        vote/             # Web-based voting (auth via signed code)
    api/
      check/              # Check slug availability
      claim/              # Claim username
      post/[slug]/        # Post update
      delete/[slug]/      # Delete last post
      profile/[slug]/     # Update profile
      feed/[slug]/        # Get user feed
      global/             # Global feed
      stats/              # Platform stats
      active/             # Most active users
      discover/           # Random feeds
      health/             # Health check
      recover/            # Email recovery
      notify/             # Shell notification check
      skills/manifest/    # Skill manifest (version + files + announcements)
      events/[slug]/      # Public event endpoints (join, leaderboard, vote)
      admin/              # Admin-only endpoints (events, announcements)
    skill.md/             # Serve /cast SKILL.md content
    i/                    # Install script endpoint
  components/             # React components (flat — no nested folders)
  lib/
    db/
      index.ts            # Drizzle + Neon client
      schema.ts           # All tables in one file
    auth.ts               # Feed token verification
    admin-auth.ts         # Admin token verification
    utils.ts              # Token gen, slug validation, sanitization, colors
    api-utils.ts          # ApiError, rate limiting (Upstash + fallback), JSON parsing
    email.ts              # Resend integration
    skill-content.ts      # /cast SKILL.md content (string export)
docs/
  plans/                  # Plan files
  sessions/               # Session saves
  journal/                # Build journal entries
  PROJECT_SPEC.md         # Current state of the project
```

## Core Principles

1. **Dark theme, always.** Background `#050810`, coral + cyan accents. No light mode.
2. **Token-based auth.** No passwords, no sessions, no NextAuth. Users get a token via `/cast`, it's bcrypt hashed.
3. **Admin via API.** No admin dashboard. Events and announcements managed via API calls with `ADMIN_TOKEN`.
4. **CLI-first.** The website displays data. The CLI (`/cast`) is the primary interaction point.
5. **Open source.** Code is public at github.com/Slashcast. Never commit secrets.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (PostCSS, `@theme inline` for tokens)
- **Drizzle ORM** + **Neon** (serverless Postgres via `@neondatabase/serverless`)
- **Upstash Redis** (rate limiting, with in-memory fallback for dev)
- **Resend** (recovery emails, event notifications)
- **bcryptjs** (token hashing)

## Naming Conventions

- **Files:** kebab-case (`update-card.tsx`, `api-utils.ts`)
- **Components:** PascalCase (`UpdateCard`, `StatsBar`)
- **Functions/variables:** camelCase (`authenticateRequest`, `feedId`)
- **DB columns:** snake_case in SQL (`token_hash`), camelCase in Drizzle (`tokenHash`)
- **API responses:** snake_case for external consistency (`created_at`, `project_name`)
- **CSS variables:** kebab-case (`--accent-coral`, `--text-primary`)

## Database Schema

6 tables in `src/lib/db/schema.ts`:

| Table | Purpose |
|-------|---------|
| `feeds` | User accounts — slug, token_hash, profile fields |
| `updates` | Posts — feed_id, project_name, content, optional event_id |
| `events` | Hackathons — slug, name, category, status, dates, prizes |
| `event_participants` | Who joined which event — event_id, feed_id, project info |
| `votes` | Community voting — event_id, voter_feed_id, target_feed_id |
| `announcements` | Push messages — message, priority, event_id, starts_at, expires_at |

**Relationships:**
- feeds → updates (one-to-many)
- feeds → event_participants (one-to-many)
- events → event_participants, updates, votes, announcements (one-to-many)
- votes: unique per (event_id, voter_feed_id, target_feed_id)

## Patterns

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, parseJsonBody, rateLimit, getClientIp } from '@/lib/api-utils'
import { authenticateRequest } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { feedId } = await authenticateRequest(request, slug)

    const ip = getClientIp(request)
    const { allowed } = await rateLimit(`post:${feedId}`, 50, 86400000)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 })
    }

    const body = await parseJsonBody<{ project: string; update: string }>(request)
    // ... validate, insert, respond

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
```

### Admin Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { errorResponse, parseJsonBody } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    authenticateAdmin(request)
    const body = await parseJsonBody<{ name: string }>(request)
    // ... validate, insert, respond
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
```

### Query Pattern

```typescript
import { db } from '@/lib/db'
import { feeds, updates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const results = await db
  .select({
    id: updates.id,
    content: updates.content,
    projectName: updates.projectName,
    createdAt: updates.createdAt,
  })
  .from(updates)
  .where(eq(updates.feedId, feedId))
  .orderBy(desc(updates.createdAt))
  .limit(50)
```

### Component Pattern

```typescript
// Server component (default) — fetches data
export default async function EventsPage() {
  const events = await getActiveEvents()
  return <EventList events={events} />
}

// Client component — interactivity
'use client'
export function EventList({ events }: { events: Event[] }) {
  // useState, handlers, etc.
}
```

## Next.js 16 Route Params

**CRITICAL:** In Next.js 16, route params are async. Always await them:

```typescript
// CORRECT
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
}

// WRONG — will cause runtime errors
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params // Error!
}
```

## Auth

Two auth levels:

1. **Feed auth** (`authenticateRequest`) — Bearer token verified against feed's bcrypt hash. Used for posting, deleting, profile updates.
2. **Admin auth** (`authenticateAdmin`) — Bearer token compared to `ADMIN_TOKEN` env var. Used for event/announcement management.

No web-based auth. The CLI handles token storage in `~/.config/slashcast.json`.

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST `/api/claim` | 5 | 1 hour per IP |
| POST `/api/check` | 30 | 1 minute per IP |
| POST `/api/post/[slug]` | 50 | 1 day per feed |
| POST `/api/recover` | 5/IP, 3/email | 1 hour |

## Environment Variables

```
DATABASE_URL          # Neon Postgres connection string
UPSTASH_REDIS_REST_URL    # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN  # Upstash Redis token
RESEND_API_KEY        # Resend email API key
ADMIN_TOKEN           # Admin bearer token
NEXT_PUBLIC_GA_ID     # Google Analytics (optional)
```

## Development Commands

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npx drizzle-kit push  # Push schema to database
npx drizzle-kit generate  # Generate migration files
```

## Git Commits

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Keep commits focused — one feature/fix per commit
- Never commit `.env.local` or any secrets

## Session Continuity

- `docs/PROJECT_SPEC.md` — current state of the project
- `docs/journal/` — session history
- `docs/sessions/` — session saves for context recovery
- `docs/plans/app-plan.md` — feature roadmap and build order

## Feature Skeleton

When building a new feature, create files in this order:

```
Feature: "{feature-name}"

Schema:     lib/db/schema.ts                              → add table if needed
API:        app/api/{feature-name}/route.ts               → validate → query → respond
API:        app/api/{feature-name}/[slug]/route.ts        → if needs dynamic routes
Page:       app/{feature-name}/page.tsx                   → thin: import + render
Component:  components/{feature-name}-{purpose}.tsx       → client interactivity
```

## Before Writing Code

1. Read this CLAUDE.md
2. Read `docs/plans/app-plan.md` for build order and data model
3. Check `docs/PROJECT_SPEC.md` for current state
4. Check `docs/journal/` for recent session history
5. Run `npm run build` to verify starting state
