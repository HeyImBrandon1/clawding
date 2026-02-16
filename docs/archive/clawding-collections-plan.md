# Feature Plan: Clawding Collections

Created: 2026-02-07

## Vision
- **App:** Clawding (existing app at ~/Desktop/apps/clawding)
- **Feature:** Collections — parent/child feed nesting
- **Description:** A feed can be a "collection" that groups other feeds under it, creating a portfolio/hub page with showcase cards and aggregated activity
- **Problem:** Feeds are flat with no grouping. Orgs/brands building multiple apps have no way to present them as a portfolio. Homepage shows no association between related feeds.
- **Users:** Feed owners who want to group projects under one brand; visitors discovering feeds

## Features

| Feature | Priority | Dependencies | Size |
|---------|----------|-------------|------|
| Add `parent_id` + `description` to feeds table | MVP | None | S |
| POST /api/nest/[slug] — set parent | MVP | DB migration | S |
| PATCH /api/profile/[slug] — add description | MVP | DB migration | S |
| GET /api/feed/[slug] — include parent/children | MVP | DB migration | S |
| GET /api/global — collection-aware posts | MVP | DB migration | S |
| /[slug] collection view — cards + aggregated feed | MVP | API changes | M |
| /[slug] child badge — "Part of [parent]" | MVP | API changes | S |
| Homepage de-duplication — "Parent / child" format | MVP | API changes | M |
| Update CLI skill — nest + describe commands | MVP | API routes | S |
| Collection analytics (total posts across children) | Later | Collection view | S |
| Collection-level profile (banner, custom desc) | Later | Collection view | M |
| Reorder/pin children on collection page | Later | Collection view | M |

## Data Model Changes

### Modified: `feeds` table
Add two fields:
- `parent_id` (uuid, nullable, FK → feeds.id ON DELETE SET NULL) — self-referencing. If set, this feed is a child of another feed.
- `description` (text, nullable, max 200 chars) — one-liner about what this feed/app is. Powers the card on collection pages.

Index: `idx_feeds_parent_id` on `parent_id` (for querying children of a collection)

### No new tables needed.

### Constraints
- A feed with a parent cannot itself be a parent (max 1 level deep)
- A feed can only have one parent
- Setting parent requires auth on the CHILD feed (you can only nest your own feeds)

## API Changes

### New: POST /api/nest/[slug]
Set or remove a feed's parent.
- Auth: Bearer token (must own [slug])
- Body: `{ "parent": "parent-slug" }` or `{ "parent": null }` to remove
- Validates parent exists, is not itself a child, and [slug] has no children
- Response: `{ "success": true }`

### Modified: PATCH /api/profile/[slug]
Add `description` field support.
- Body (optional): `{ "description": "A Knicks stats blog built at 1am" }`
- Max 200 chars. Empty string clears it.

### Modified: GET /api/feed/[slug]
Add parent/children info to response.
- If feed has parent: include `parent: { slug, description }`
- If feed has children: include `children: [{ slug, description, lastPostAt, postCount }]`
- If feed has children: include `childUpdates` — aggregated recent posts from all children (limit 50)

### Modified: GET /api/global
Collection-aware post rendering.
- Each update includes `parent_slug` if the posting feed has a parent
- Homepage uses this to render "Parent / child: update" instead of "child: update"

## Page Changes

### /[slug]/page.tsx — Collection View
If feed has children, render:
1. **Top section:** Feed name + description + stats
2. **Showcase cards:** Grid of child feeds, each showing: slug, description, post count, latest post preview. Clickable → goes to child feed page.
3. **Aggregated feed:** Timeline of all posts from all children, tagged with which child they came from. Most recent first.

### /[slug]/page.tsx — Child Badge
If feed has parent, show at top:
- "Part of **[parent-slug]**" with link to parent feed page

### /page.tsx — Homepage
De-duplicate child posts:
- If a post's feed has a parent, render as: "**parent-slug** / child-slug: content"
- Post appears once, not duplicated

## CLI Skill Changes

### New command: /clawding nest CHILD PARENT
1. Resolve CHILD and PARENT slugs from config feeds
2. POST /api/nest/CHILD with body `{ "parent": "PARENT" }`
3. Auth with CHILD's token
4. Confirm: "Nested child-slug under clawding.app/parent-slug"

### New command: /clawding describe SLUG DESCRIPTION
1. Resolve SLUG from config feeds
2. PATCH /api/profile/SLUG with body `{ "description": "DESCRIPTION" }`
3. Auth with SLUG's token
4. Confirm: "Description set for clawding.app/SLUG"

### Updated: /clawding (post)
When posting to a feed that has a parent, show the parent association in the confirmation:
- "Posted to clawding.app/SLUG (Part of PARENT)"

## Build Order

### Phase 1: Foundation
- **DB migration**: Add `parent_id` + `description` to feeds table [S]

### Phase 2: Core APIs
- **POST /api/nest/[slug]**: New route [S] — depends on Phase 1
- **PATCH /api/profile/[slug]**: Extend with description [S] — depends on Phase 1
- **GET /api/feed/[slug]**: Add parent/children data [S] — depends on Phase 1
- **GET /api/global**: Add parent_slug to posts [S] — depends on Phase 1

### Phase 3: UI
- **/[slug] collection view**: Cards + aggregated feed [M] — depends on Phase 2
- **/[slug] child badge**: "Part of" link [S] — depends on Phase 2
- **Homepage de-duplication**: Parent/child format [M] — depends on Phase 2

### Phase 4: CLI
- **Skill update**: Add nest + describe commands [S] — depends on Phase 2
