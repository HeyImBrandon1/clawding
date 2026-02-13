# App Plan: Clawding

Created: 2026-02-10

## Vision
- **Name:** Clawding
- **Tagline:** Broadcast What You Build
- **Type:** full-stack
- **Description:** A terminal-native coding community platform — broadcast what you're building, join live coding events, compete in hackathons, all from your CLI with `/cast`
- **Problem:** Developers building with AI tools have no lightweight way to share progress, join coding events, or discover what others are building — without leaving the terminal
- **Users:** Coder: installs via curl, broadcasts updates with /cast, joins events, votes on submissions; Admin: creates events, pushes announcements, declares winners via API
- **Origin:** Evolved from Clawding (clawding.app) — repurposing the codebase with new brand, expanded features, cross-platform identity

## Brand
- **Name:** Clawding
- **Command:** `/cast` (core), `/cast:events` (sub-skills)
- **Logo:** `/` mark — minimal, works at any size. The slash IS the brand.
- **Theme:** Dark background, white text, accent colors (carried from Clawding's coral + cyan palette). Developers code in dark mode.
- **Domain:** clawding.app
- **GitHub:** github.com/HeyImBrandon1/clawding
- **Install:** `curl -sL clawding.app/i | bash`
- **Config:** `~/.config/clawding.json`
- **Skill path:** `~/.claude/skills/clawding/SKILL.md`

## Features

| Feature | User | Priority | Dependencies | Size |
|---------|------|----------|-------------|------|
| Core posting (`/cast`) | Coder | MVP | Schema | M |
| Feed pages (user profiles) | Coder | MVP | Core posting | L |
| Global feed + homepage | Coder | MVP | Core posting | M |
| Self-updating skill manifest | Coder | MVP | Manifest API | M |
| Namespaced sub-skills (cast:events) | Coder | MVP | Manifest API, Events | M |
| Shell notification hook (opt-in) | Coder | MVP | Announcements API | S |
| Event creation (CRUD) | Admin | MVP | Schema | M |
| Event participation (join/leave) | Coder | MVP | Events | M |
| Event-tagged posts | Coder | MVP | Events, Participation | S |
| Announcements (create/expire) | Admin | MVP | Schema | M |
| Event pages on website | Coder | MVP | Event APIs | L |
| Leaderboard (activity-based) | Coder | MVP | Event-tagged posts | M |
| Install script v2 (multi-skill, shell hook) | Coder | MVP | Manifest API | M |
| Guide page | Coder | MVP | None | S |
| Token recovery (email) | Coder | MVP | Schema | M |
| Signed voting links (CLI → web) | Coder | Later | Events, Participation | L |
| Voting page on website | Coder | Later | Voting API | L |
| Winners/prizes display | Admin/Coder | Later | Voting | M |
| Discord/Slack webhooks | Admin | Later | Events | S |
| Shared projects (multi-user) | Coder | Later | Events foundation | L |
| Past events archive page | Coder | Later | Events | S |
| Event countdown timers | Coder | Later | Event pages | S |
| Multi-IDE installer (Codex, Copilot, Cursor, Cline) | Coder | Later | Install script v2 | S |

## Integrations

| Integration | Status | Purpose |
|-------------|--------|---------|
| Neon (Postgres) | Existing (new instance) | Database |
| Drizzle ORM | Existing | Schema + queries |
| Upstash Redis | Existing (new instance) | Rate limiting |
| Resend | Existing | Recovery emails + event notifications |
| Discord webhook | Needed | Event announcements to community channels |
| Slack webhook | Needed | Event announcements to community channels |

## Data Model

### Core Entities (ported from Clawding)

**Feed** (`feeds`)
- Key fields: slug, token_hash, x_handle, website_url, description, email
- Has many: updates, event_participants, votes (as voter and target)

**Update** (`updates`)
- Key fields: feed_id, project_name, content, event_id (nullable), created_at
- Belongs to: feed, event (optional)

### New Entities

**Event** (`events`)
- Key fields: slug, name, description, category (clawding/skills/general), status (announced/active/ended/archived), starts_at, ends_at, prizes, rules, voting_ends_at
- Has many: event_participants, updates (via event_id), votes, announcements

**Event Participant** (`event_participants`)
- Key fields: event_id, feed_id, project_name, project_description, joined_at
- Belongs to: event, feed
- Unique constraint: one feed per event

**Vote** (`votes`)
- Key fields: event_id, voter_feed_id, target_feed_id, created_at
- Belongs to: event, voter feed, target feed
- Unique constraint: one vote per voter per target per event

**Announcement** (`announcements`)
- Key fields: message, priority (info/high/urgent), event_id (optional), starts_at, expires_at
- Belongs to: event (optional — can be platform-wide)

### Relationships
feeds → updates (one-to-many)
feeds → event_participants (one-to-many)
events → event_participants (one-to-many)
events → updates (one-to-many, via event_id)
events → votes (one-to-many)
events → announcements (one-to-many)
feeds → votes as voter (one-to-many)
feeds → votes as target (one-to-many)

## User Flows

### Coder: Install and First Post
1. Runs `curl -sL clawding.app/i | bash` → skill installed + shell hook opt-in
2. Runs `/cast` → welcome flow, claims username, picks a slug
3. Posts first update → "Posted! View at clawding.app/username"
4. Opens new terminal later → shell hook silently checks for announcements

### Coder: Discover and Join Event
1. Opens terminal → shell hook shows "Live Cast: Winter Hackathon starts in 1 hour!"
2. Runs `/cast:events` → sees active/upcoming events with descriptions
3. Runs `/cast:events join winter-hackathon` → picks a project name
4. Posts updates with `/cast` as normal — auto-tagged to the event
5. Views leaderboard at clawding.app/events/winter-hackathon

### Coder: Vote on Submissions
1. Event ends → notification "Winter Hackathon voting is open!"
2. Runs `/cast:events vote winter-hackathon`
3. CLI generates signed voting link → opens browser
4. Browses submissions visually on website → clicks to vote
5. Winners announced via notification on next terminal open

### Admin: Create and Run Event
1. POST `/api/admin/events` → create event with dates, category, prizes
2. POST `/api/admin/announcements` → push "Hackathon starts Feb 20!"
3. Event auto-transitions based on timestamps (announced → active → ended)
4. Manifest API auto-includes event skill while active
5. POST `/api/admin/events/[slug]/winners` → declare winners after voting
6. Discord/Slack webhooks fire on key events

### Coder: Self-Updating Skill
1. Runs `/cast` → checks manifest (if >1 hour since last check)
2. New event skill available → downloads to skills directory
3. Shows: "Clawding updated! New: Winter Hackathon — run /cast:events for details"
4. Event ends → next check removes the event skill file
5. Core /cast posting flow is never interrupted

## Build Order

### Phase 1: Foundation (new project setup)
- **Scaffold Clawding project** — Next.js 16, Tailwind v4, Drizzle, dark theme. Port good code from Clawding. [L]
- **Core schema** — feeds + updates tables (ported) + 4 new tables (events, event_participants, votes, announcements) + event_id on updates [M]
- **Core API** — port all existing endpoints (check, claim, post, delete, profile, feed, global, stats, active, discover, health, recover) [L]
- **Core pages** — homepage, user feed, guide, global feed. New brand, `/` logo, dark theme with accent colors [L]
- **Admin auth middleware** — admin token verification for protected endpoints [S]
- **Manifest API** (`/api/skills/manifest`) — returns version, active skill files, announcements [M]

### Phase 2: Core (MVP — enough to run first hackathon)
- **Event CRUD API** — admin create/update, public list/get events — depends on schema [M]
- **Event participation API** — join event, list participants — depends on events [M]
- **Event-tagged posts** — post endpoint accepts/auto-assigns event_id — depends on participation [S]
- **Announcements API** — admin create/expire, public fetch active — depends on schema [M]
- **Self-updating skill system** — version check + manifest logic in core SKILL.md — depends on manifest API [M]
- **Shell notification hook** — opt-in, checks /api/notify on terminal open — depends on announcements [S]
- **Event sub-skill** (`cast:events`) — join, list, status commands — depends on event APIs [M]
- **Event pages** — event list, detail with timeline + participants + leaderboard — depends on event APIs [L]
- **Install script** — multi-skill install, shell hook opt-in, manifest-aware — depends on manifest API [M]
- **Skill content** (`/cast` SKILL.md) — full rewrite from Clawding skill with new name + event commands [M]

### Phase 3: Complete (post-first-hackathon)
- **Voting system** — signed links from CLI, voting page on website, vote API — depends on events [L]
- **Winners/prizes** — admin declares winners, display on event page + announcements — depends on voting [M]
- **Discord/Slack webhooks** — fire on event creation, start, winners — depends on events [S]
- **Shared projects** — multi-user project tags, shared project pages — depends on events foundation [L]

### Phase 4: Points & Credits
- **Points system** — lifetime activity score, never decreases [M]
  - 1 point per post
  - 5 bonus points for 7-day streak (post at least once each day for 7 consecutive days)
  - Shown on profile alongside posts/streak (already have streak display)
  - Bot protection: email verified, min 20 chars, no duplicate posts
- **Credits** — monetary value, admin-managed [S]
  - Won from events (1st/2nd/3rd place prizes)
  - Admin can grant directly via API
  - Not displayed on profile — internal between platform and user
  - Redeemable for Claude API credits or other prizes
- **Points API** — `/api/points/[slug]` to view, automatic accrual on post [M]
- **Credits API** — `/api/admin/credits` to grant, `/api/credits/[slug]` to view [S]
- **Schema additions** — `points` + `credits` columns on feeds, `point_events` ledger table [S]

### Phase 5: Polish
- **Event countdown timers** on website [S]
- **Past events archive page** [S]
- **Event stats** (participants, posts, activity) [S]
- **Multi-IDE installer** — detect Codex/Copilot/Cursor/Cline, install skills [S]
- **Clawding migration path** — migrate existing users to new schema if needed [M]

## Architecture Notes
- **App type:** full-stack
- **Auth:** yes (token-based for coders, admin token for management, signed codes for web voting)
- **Database:** yes (Neon Postgres + Drizzle ORM)
- **Payments:** no
- **Email:** yes (Resend — recovery codes + event notifications)
- **File uploads:** no
- **Real-time:** no
- **Public pages:** yes (feed pages, event pages, leaderboards, voting pages)
- **Admin dashboard:** no (CLI/API only)
- **Multi-tenant:** no
- **Webhooks:** yes (Discord, Slack)

## Porting from Clawding
Code to repurpose (port, don't copy blindly — refactor as needed):
- Database schema (feeds + updates tables)
- All 13 API endpoints
- Auth utilities (token generation, bcrypt, slug validation)
- Rate limiting (Upstash Redis + in-memory fallback)
- Email recovery system
- Client components (UpdateCard, StatsBar, ActiveCoders, etc.)
- Skill content structure (rewrite for /cast, add manifest + event commands)

Code to replace:
- All branding (Clawding → Clawding, crab mascot → / logo)
- Color palette (keep dark theme, update accent colors if needed)
- Install script (new domain, shell hook, manifest-aware)
- Homepage hero + messaging

## Open Decisions
- [x] Name: Clawding
- [x] Command: /cast
- [x] Logo: / mark (minimal)
- [x] Theme: Dark with accent colors
- [x] Domain: secured
- [x] GitHub org: github.com/Clawding (Free plan, open source)
- [ ] Accent color palette (keep coral+cyan from Clawding or new colors?)
- [ ] Event categories exact naming (clawding/skills/general vs other)
- [ ] Clawding user migration strategy
