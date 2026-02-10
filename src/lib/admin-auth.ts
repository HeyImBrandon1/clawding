import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { ApiError } from '@/lib/api-utils'

/**
 * Authenticate an admin request.
 * Checks the Authorization header against the ADMIN_TOKEN env var.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function authenticateAdmin(request: NextRequest): void {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    throw new ApiError('Admin not configured', 500, 'admin_not_configured')
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Unauthorized', 401, 'unauthorized')
  }

  const token = authHeader.slice(7)
  const tokenBuf = Buffer.from(token)
  const adminBuf = Buffer.from(adminToken)
  if (tokenBuf.length !== adminBuf.length || !timingSafeEqual(tokenBuf, adminBuf)) {
    throw new ApiError('Unauthorized', 401, 'unauthorized')
  }
}
