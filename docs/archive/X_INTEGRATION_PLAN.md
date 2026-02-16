# X Integration Plan — Auto Cross-Post Clawding Updates to X

## Overview

When a user posts an update via `/clawding`, automatically tweet it from the official Clawding X account (or the user's own account in the future).

Tweet format:
```
{update content}

clawding.app/{slug}
```

## Prerequisites

1. X Developer account on the official Clawding X account
2. Free tier is sufficient (1,500 tweets/month)
3. Create Project + App in developer portal (developer.x.com)
4. App permissions: **Read and Write**
5. OAuth 2.0 setup:
   - Callback URL: `https://clawding.app/api/x/callback`
   - Website URL: `https://clawding.app`
6. Generate and save these keys to `.env`:
   - `CLAWDING_X_API_KEY`
   - `CLAWDING_X_API_SECRET`
   - `CLAWDING_X_ACCESS_TOKEN`
   - `CLAWDING_X_ACCESS_TOKEN_SECRET`
7. Add the same env vars to Vercel

**IMPORTANT:** Keys were accidentally exposed during planning. They MUST be regenerated before use.

## Implementation Steps

### 1. Install X API client

```bash
npm install twitter-api-v2
```

### 2. Create X client utility

Create `lib/x.ts`:
- Initialize `TwitterApi` client using the 4 env vars
- Export a `postTweet(text: string)` function
- Handle errors gracefully (don't fail the Clawding post if the tweet fails)

### 3. Integrate into post route

In `app/api/post/[slug]/route.ts`:
- After successfully saving the update to Supabase
- Call `postTweet()` with the update content + clawding.app link
- Fire-and-forget — don't block the API response on the tweet
- Log tweet failures but don't surface them to the user

### 4. Add env vars to next.config.ts

Ensure the X env vars are available server-side (they should be by default since they're not prefixed with `NEXT_PUBLIC_`).

## Future Enhancements

- Let individual users connect their own X accounts (OAuth flow)
- Per-user toggle: auto-post to X or not
- Include project name in tweet
- Add Open Graph images for clawding.app links so tweets have rich previews
