# SlashCast — Project Spec

## Overview
SlashCast is a terminal-native coding community platform. Developers broadcast what they're building, join live coding events, compete in hackathons — all from their CLI with `/cast`.

**Tagline:** Broadcast What You Build

## Current State
Initial scaffold — no features built yet. Core lib files (schema, auth, rate limiting, email) ported and adapted from Clawding.

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Database:** Neon (Postgres) + Drizzle ORM
- **Auth:** Token-based (bcrypt hashed, no traditional login)
- **Rate Limiting:** Upstash Redis (with in-memory fallback)
- **Email:** Resend
- **Hosting:** Vercel
- **Repo:** github.com/Slashcast (open source)

## Database Schema

| Table | Status | Purpose |
|-------|--------|---------|
| feeds | Schema ready | User accounts (slug + token) |
| updates | Schema ready | Posts/broadcasts |
| events | Schema ready | Hackathons/competitions |
| event_participants | Schema ready | Who joined which event |
| votes | Schema ready | Community voting on submissions |
| announcements | Schema ready | Push notifications via manifest |

## Pages

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | Placeholder |
| User Feed | `/[slug]` | Not started |
| Global Feed | `/feed` | Not started |
| Guide | `/guide` | Not started |
| Events List | `/events` | Not started |
| Event Detail | `/events/[slug]` | Not started |
| Voting | `/events/[slug]/vote` | Not started |

## API Routes

### Core (port from Clawding)
- POST `/api/check` — Check slug availability
- POST `/api/claim` — Claim username
- POST `/api/post/[slug]` — Post update
- DELETE `/api/delete/[slug]` — Delete last post
- PATCH `/api/profile/[slug]` — Update profile
- GET `/api/feed/[slug]` — Get user feed
- GET `/api/global` — Global feed
- GET `/api/stats` — Platform stats
- GET `/api/active` — Most active users
- GET `/api/discover` — Random feeds
- GET `/api/health` — Health check (done)
- POST `/api/recover` — Recovery email
- POST `/api/recover/verify` — Verify recovery code

### Events (new)
- GET `/api/events` — List events
- GET `/api/events/[slug]` — Event detail
- POST `/api/events/[slug]/join` — Join event
- GET `/api/events/[slug]/leaderboard` — Event leaderboard
- POST `/api/events/[slug]/vote` — Submit vote

### Admin (new)
- POST `/api/admin/events` — Create/update events
- POST `/api/admin/events/[slug]/winners` — Declare winners
- POST `/api/admin/announcements` — Create announcements

### Skill System (new)
- GET `/api/skills/manifest` — Skill version + files + announcements
- GET `/api/notify` — Shell notification check
- GET `/skill.md` — Serve skill content
- GET `/i` — Install script

## Roadmap
See `docs/plans/app-plan.md` for the full build order.
