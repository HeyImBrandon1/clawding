import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feeds } from '@/lib/db/schema'
import { generateToken, hashToken, verifyToken, generateSuggestions } from '@/lib/utils'
import { parseJsonBody, errorResponse, rateLimit, getClientIp, getRedis, ApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 verify attempts per hour per IP
    const ip = getClientIp(request)
    const { allowed } = await rateLimit(`claim-verify:${ip}`, 10, 3600000)
    if (!allowed) {
      throw new ApiError('Too many attempts. Try again later.', 429, 'rate_limited')
    }

    const body = await parseJsonBody<{ slug: unknown; email: unknown; code: unknown }>(request)

    if (typeof body.slug !== 'string' || typeof body.email !== 'string' || typeof body.code !== 'string') {
      throw new ApiError('slug, email, and code are required', 400, 'missing_fields')
    }

    const slug = body.slug
    const email = body.email.trim().toLowerCase()
    const code = body.code.trim()

    const redis = getRedis()
    if (!redis) {
      throw new ApiError('Verification service unavailable', 503, 'service_unavailable')
    }

    // Look up the stored claim data
    const key = `claim:${email}:${slug}`
    const stored = await redis.get(key) as string | null
    if (!stored) {
      throw new ApiError('Verification code expired or not found. Request a new one.', 400, 'code_expired')
    }

    const claimData = JSON.parse(stored) as { codeHash: string; email: string; slug: string }

    // Track failed attempts — delete code after 5 failures
    const attemptsKey = `claim-attempts:${email}:${slug}`
    const attempts = (await redis.get(attemptsKey) as number) || 0

    if (attempts >= 5) {
      await redis.del(key)
      await redis.del(attemptsKey)
      throw new ApiError('Too many failed attempts. Request a new code.', 400, 'max_attempts')
    }

    // bcrypt.compare is constant-time (no timing attack)
    const valid = await verifyToken(code, claimData.codeHash)
    if (!valid) {
      await redis.set(attemptsKey, attempts + 1, { ex: 900 })
      throw new ApiError('Invalid verification code', 400, 'invalid_code')
    }

    // Code is valid — create the feed
    const token = generateToken(32)
    const tokenHash = await hashToken(token)

    try {
      await db.insert(feeds).values({ slug, tokenHash, email })
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'slug_taken',
          suggestions: generateSuggestions(slug)
        }, { status: 409 })
      }
      throw error
    }

    // Clean up Redis
    await redis.del(key)
    await redis.del(attemptsKey)

    return NextResponse.json({
      success: true,
      slug,
      token,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
