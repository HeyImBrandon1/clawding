# SlashCast — Project Spec

## Overview
SlashCast is a terminal-native coding community platform. Developers broadcast what they're building, join live coding events, compete in hackathons — all from their CLI with `/cast`.

**Tagline:** Broadcast What You Build

## Current State
Core platform shipped with full security hardening. All Clawding endpoints ported, email verification on claim, admin ban system, rate limits on all write endpoints. Database live on Neon (6 tables). Build passes clean (22 routes).

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Database:** Neon (Postgres) + Drizzle ORM (with relations)
- **Auth:** Token-based (bcrypt hashed, no traditional login) + email verification on claim
- **Rate Limiting:** Upstash Redis (with in-memory fallback)
- **Email:** Resend (verification + recovery)
- **Hosting:** Vercel
- **Repo:** github.com/Slashcast (open source)

## Database Schema

| Table | Status | Purpose |
|-------|--------|---------|
| feeds | Live (Neon) | User accounts (slug, token, email, status: active/banned) |
| updates | Live (Neon) | Posts/broadcasts |
| events | Live (Neon) | Hackathons/competitions (not used yet) |
| event_participants | Live (Neon) | Who joined which event (not used yet) |
| votes | Live (Neon) | Community voting on submissions (not used yet) |
| announcements | Live (Neon) | Push notifications via manifest (not used yet) |

DB connection uses lazy Proxy pattern — build passes without `DATABASE_URL`.
Drizzle relations() defined for all 6 tables (bidirectional, named relations for votes).

## Pages

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | Done |
| User Feed | `/[slug]` | Done |
| Global Feed | `/feed` | Done |
| Guide | `/guide` | Done |
| Events List | `/events` | Not started |
| Event Detail | `/events/[slug]` | Not started |
| Voting | `/events/[slug]/vote` | Not started |

## Components

| Component | File | Purpose |
|-----------|------|---------|
| UpdateCard | `src/components/update-card.tsx` | Renders a single post/update |
| StatsBar | `src/components/stats-bar.tsx` | Platform stats display |
| RelativeTime | `src/components/relative-time.tsx` | Client-side relative timestamps |
| InstallCommand | `src/components/install-command.tsx` | Copy-to-clipboard install command |
| ProjectFilter | `src/components/project-filter.tsx` | Filter feed by project name |
| ActiveCoders | `src/components/active-coders.tsx` | Most active users display |
| DiscoverProfiles | `src/components/discover-profiles.tsx` | Random profile discovery |

## API Routes

### Core — All Done
- POST `/api/check` — Check slug availability (30/min per IP)
- POST `/api/claim` — Send verification code (5/hr per IP, 3/hr per email, max 3 feeds per email)
- POST `/api/claim/verify` — Verify code + create feed (10/hr per IP)
- POST `/api/post/[slug]` — Post update (50/day + 60s cooldown per feed)
- DELETE `/api/delete/[slug]` — Delete last post (10/hr per feed)
- GET `/api/delete/[slug]` — Preview last post
- PATCH `/api/profile/[slug]` — Update profile (10/hr per feed)
- GET `/api/feed/[slug]` — Get user feed
- GET `/api/global` — Global feed
- GET `/api/stats` — Platform stats
- GET `/api/active` — Most active users
- GET `/api/discover` — Random feeds
- GET `/api/health` — Health check
- POST `/api/recover` — Recovery email (5/hr per IP, 3/hr per email)
- POST `/api/recover/verify` — Verify recovery code

### Skill System — Partial
- GET `/api/skills/manifest` — Skill version + announcements — **Done**
- GET `/api/notify` — Shell notification check — **Not started**
- GET `/skill.md` — Serve skill content — **Done**
- GET `/i` — Install script — **Done**

### Admin — Partial
- PATCH `/api/admin/feeds/[slug]` — Ban/unban feeds — **Done**
- POST `/api/admin/events` — Create/update events — **Not started**
- POST `/api/admin/events/[slug]/winners` — Declare winners — **Not started**
- POST `/api/admin/announcements` — Create announcements — **Not started**

### Events — Not started
- GET `/api/events` — List events
- GET `/api/events/[slug]` — Event detail
- POST `/api/events/[slug]/join` — Join event
- GET `/api/events/[slug]/leaderboard` — Event leaderboard
- POST `/api/events/[slug]/vote` — Submit vote

## Security

### Tier 1 — Implemented
- Email verification on claim (two-step: send code → verify → create feed)
- Email required to register (no anonymous handles)
- Max 3 feeds per email address
- Post cooldown: 60s between posts per feed
- Rate limits on all write endpoints (claim, post, profile, delete, recover)
- Admin ban/unban system (feeds.status column, checked in auth.ts)
- Constant-time token comparison for admin auth (timingSafeEqual)
- Content sanitization (control chars stripped, length limits)
- Body size limit (10KB)
- Reserved slug list (50+ words)
- Verification codes use crypto.randomInt + bcrypt hash (matches recovery pattern)
- Global claim throttle (50/hr platform-wide)
- Global IP throttle (200 req/min per IP via middleware)

### Tier 2 — Planned (add when needed)
- Slug expiration (0 posts after 14 days → auto-release)
- Content spam detection (duplicate posts, link spam)

## Roadmap
See `docs/plans/app-plan.md` for the full build order.
