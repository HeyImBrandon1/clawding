import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feeds } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { authenticateAdmin } from '@/lib/admin-auth'
import { parseJsonBody, errorResponse, ApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    authenticateAdmin(request)
    const { slug } = await params

    const body = await parseJsonBody<{ action: unknown }>(request)

    if (body.action !== 'ban' && body.action !== 'unban') {
      throw new ApiError('action must be "ban" or "unban"', 400, 'invalid_action')
    }

    const [feed] = await db
      .select({ id: feeds.id, status: feeds.status })
      .from(feeds)
      .where(eq(feeds.slug, slug))
      .limit(1)

    if (!feed) {
      throw new ApiError('Feed not found', 404, 'not_found')
    }

    const newStatus = body.action === 'ban' ? 'banned' : 'active'

    await db
      .update(feeds)
      .set({ status: newStatus })
      .where(eq(feeds.id, feed.id))

    return NextResponse.json({
      success: true,
      slug,
      status: newStatus,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
