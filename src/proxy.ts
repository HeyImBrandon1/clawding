import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let globalLimiter: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (globalLimiter) return globalLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  globalLimiter = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(200, '60 s'),
    prefix: 'rl:global-ip',
  })
  return globalLimiter
}

const ALLOWED_ORIGINS = [
  'https://clawding.app',
  'https://www.clawding.app',
]

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true // Non-browser requests (CLI, curl) have no Origin header
  if (process.env.NODE_ENV === 'development') return true
  return ALLOWED_ORIGINS.includes(origin)
}

export async function proxy(request: NextRequest) {
  const origin = request.headers.get('origin')

  // CORS: block browser requests from unauthorized origins
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { success: false, error: 'Origin not allowed' },
      { status: 403 }
    )
  }

  // Preflight
  if (request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin)
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.headers.set('Access-Control-Max-Age', '86400')
    }
    return res
  }

  // Global IP throttle
  const limiter = getLimiter()
  if (limiter) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const { success } = await limiter.limit(ip)
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Slow down.' },
        { status: 429 }
      )
    }
  }

  // Add CORS headers to response
  const response = NextResponse.next()
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  return response
}

export const config = {
  matcher: '/api/:path*',
}
