import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feeds } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { validateSlug, generateSuggestions, hashToken } from '@/lib/utils'
import { parseJsonBody, errorResponse, rateLimit, getClientIp, getRedis, ApiError } from '@/lib/api-utils'
import { sendVerificationCode } from '@/lib/email'
import { randomInt } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Global claim throttle: 50 claims per hour platform-wide
    const { allowed: globalAllowed } = await rateLimit('claim-global', 50, 3600000)
    if (!globalAllowed) {
      throw new ApiError('Too many registrations right now. Try again later.', 429, 'rate_limited')
    }

    // Rate limit: 5 claims per hour per IP
    const ip = getClientIp(request)
    const { allowed } = await rateLimit(`claim:${ip}`, 5, 3600000)
    if (!allowed) {
      throw new ApiError('Too many registration attempts. Try again later.', 429, 'rate_limited')
    }

    const body = await parseJsonBody<{ slug: unknown; email: unknown }>(request)
    const slug = body.slug
    const email = body.email

    // Validate slug
    if (typeof slug !== 'string') {
      throw new ApiError('slug must be a string', 400, 'invalid_slug')
    }

    const validation = validateSlug(slug)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Email is required
    if (typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      throw new ApiError('A valid email is required to claim a handle', 400, 'email_required')
    }

    const cleanEmail = email.trim().toLowerCase()

    // Rate limit per email: 3 claims per hour
    const { allowed: emailAllowed } = await rateLimit(`claim-email:${cleanEmail}`, 3, 3600000)
    if (!emailAllowed) {
      throw new ApiError('Too many attempts for this email. Try again later.', 429, 'rate_limited')
    }

    // Check slug availability
    const [existing] = await db
      .select({ id: feeds.id })
      .from(feeds)
      .where(eq(feeds.slug, slug))
      .limit(1)

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'slug_taken',
        suggestions: generateSuggestions(slug)
      }, { status: 409 })
    }

    // Max 3 feeds per email
    const [{ value: feedCount }] = await db
      .select({ value: count() })
      .from(feeds)
      .where(eq(feeds.email, cleanEmail))

    if (feedCount >= 3) {
      throw new ApiError('Maximum 3 feeds per email address', 400, 'max_feeds_reached')
    }

    // Generate and store verification code in Redis (15 min TTL)
    const code = String(randomInt(100000, 999999))
    const codeHash = await hashToken(code)
    const redis = getRedis()

    if (!redis) {
      throw new ApiError('Verification service unavailable', 503, 'service_unavailable')
    }

    // Store hashed code in Redis (matches recovery pattern)
    await redis.set(
      `claim:${cleanEmail}:${slug}`,
      JSON.stringify({ codeHash, email: cleanEmail, slug }),
      { ex: 900 } // 15 minutes
    )

    // Send verification email
    const sent = await sendVerificationCode(cleanEmail, code, slug)
    if (!sent) {
      throw new ApiError('Failed to send verification email', 500, 'email_failed')
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      slug,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
