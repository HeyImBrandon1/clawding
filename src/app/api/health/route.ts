import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  try {
    // Basic health check — DB check can be added once DATABASE_URL is configured
    return NextResponse.json({
      status: 'healthy',
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', timestamp: new Date().toISOString() },
      { status: 503 }
    )
  }
}
