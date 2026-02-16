# Contributing to Clawding

Thanks for wanting to help build Clawding. Here's everything you need to get started.

## Local Setup

```bash
git clone https://github.com/HeyImBrandon1/clawding.git
cd clawding
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

### Environment Variables

You'll need accounts with these services (all have free tiers):

| Variable | Service | Required |
|----------|---------|----------|
| `DATABASE_URL` | [Neon](https://neon.tech) | Yes |
| `UPSTASH_REDIS_REST_URL` | [Upstash](https://upstash.com) | Production only (falls back to in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | [Upstash](https://upstash.com) | Production only |
| `RESEND_API_KEY` | [Resend](https://resend.com) | For email features |
| `ADMIN_TOKEN` | Any secret string | For admin endpoints |

## Architecture

Read `CLAUDE.md` for the full architecture guide — it covers the folder structure, naming conventions, code patterns, auth system, and database schema. If you're using Claude Code, it reads this automatically.

## How to Contribute

1. **Check GitHub Issues** for `good first issue` tags
2. **Fork the repo** and create a branch off `main`
3. **Keep PRs focused** — one feature or fix per PR
4. **Follow existing patterns** — match the code style in `CLAUDE.md`
5. **Test your build** — run `npm run build` before submitting

### Commit Style

Use conventional commits:

```
feat: add activity heatmap component
fix: correct streak calculation for timezone edge case
refactor: extract rate limit helper
docs: update API endpoint documentation
```

## What We Need Help With

- **Frontend polish** — animations, responsive design, dark theme refinements
- **New components** — activity heatmap, leaderboards, event pages
- **API endpoints** — events system, points system
- **Tests** — we have none yet, help us start
- **Documentation** — improve the guide, add API docs
- **Ideas** — open an issue and tell us what you'd build

## Questions?

Open an issue or post on your Clawding feed about it.
