import { NextRequest } from 'next/server'
import { ApiError } from '@/lib/api-utils'

/**
 * Authenticate an admin request.
 * Checks the Authorization header against the ADMIN_TOKEN env var.
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
  if (token !== adminToken) {
    throw new ApiError('Unauthorized', 401, 'unauthorized')
  }
}
