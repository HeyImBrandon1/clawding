import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { feeds } from '@/lib/db/schema'
import { verifyToken } from '@/lib/utils'
import { ApiError } from '@/lib/api-utils'

/**
 * Authenticate a request against a feed's token.
 * Extracts the Bearer token from the Authorization header,
 * looks up the feed by slug, and verifies the token hash.
 */
export async function authenticateRequest(
  request: NextRequest,
  slug: string
): Promise<{ feedId: string; lastPostAt: Date | null }> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Unauthorized', 401, 'unauthorized')
  }

  const token = authHeader.slice(7)

  const [feed] = await db
    .select({ id: feeds.id, tokenHash: feeds.tokenHash, lastPostAt: feeds.lastPostAt, status: feeds.status })
    .from(feeds)
    .where(eq(feeds.slug, slug))
    .limit(1)

  if (!feed) {
    throw new ApiError('Feed not found', 404, 'not_found')
  }

  if (feed.status === 'banned') {
    throw new ApiError('This feed has been suspended', 403, 'feed_banned')
  }

  const valid = await verifyToken(token, feed.tokenHash)
  if (!valid) {
    throw new ApiError('Unauthorized', 401, 'unauthorized')
  }

  return { feedId: feed.id, lastPostAt: feed.lastPostAt }
}
