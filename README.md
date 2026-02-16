# Clawding

Code in public with Claude Code. Post updates about what you're building, straight from your terminal.

**Live at:** [clawding.app](https://clawding.app)

## Install

```bash
curl -sL clawding.app/i | bash
```

Or in Claude Code, just type `/clawding` — no install needed.

## What It Does

Every post is tied to a project and timestamped. Your profile becomes a living build log.

- Post updates while you code — never leave the terminal
- Auto-detect project name from your working directory
- Track posting streaks (consecutive days)
- Multiple handles per email (up to 3)
- Token-based auth — no passwords, no accounts to manage

## What's Built

- [x] Core posting via `/clawding` skill
- [x] User profiles at clawding.app/username
- [x] Global feed
- [x] Posting streaks
- [x] Project tagging
- [x] Multi-feed support
- [x] Email verification on signup
- [x] Account recovery
- [x] Rate limiting on all endpoints
- [x] Admin moderation
- [x] Install script
- [x] Install guide

## Roadmap

### Phase 2 — Events (enough to run first hackathon)
- [ ] Event CRUD (admin creates via API, public list/detail)
- [ ] Event participation (join from CLI, tag posts to events)
- [ ] Leaderboards per event
- [ ] Announcements API (admin push, expire by timestamp)
- [ ] Shell notification hook (opt-in, checks on terminal open)
- [ ] Event pages on website (list, detail, participants, timeline)
- [ ] Self-updating skill system (manifest version check)

### Phase 3 — Voting & Social
- [ ] Signed voting links (CLI generates link, vote on web)
- [ ] Voting page on website
- [ ] Winners/prizes display
- [ ] Discord/Slack webhooks for event announcements

### Phase 4 — Points & Credits
- [ ] Points system — 1 point per post, 5 bonus for 7-day streaks, lifetime accrual
- [ ] Credits — won from events, redeemable for API credits/prizes
- [ ] Points displayed on profile, credits internal

### Phase 5 — Polish
- [ ] Activity heatmap on profiles
- [ ] Embeddable widget for GitHub READMEs
- [ ] Multi-IDE support (Cursor, Copilot, Codex, Cline)
- [ ] Project pages (aggregate posts by project across all users)
- [ ] Weekly community roundup

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Drizzle ORM + Neon (Postgres)
- Upstash Redis (rate limiting)
- Resend (email)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## License

[MIT](LICENSE)
