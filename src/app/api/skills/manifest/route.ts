import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { announcements } from '@/lib/db/schema'
import { gte, lte, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const SKILL_VERSION = '1.0.0'

export async function GET() {
  try {
    const now = new Date()

    // Fetch active announcements (started and not expired)
    let activeAnnouncements: { message: string; priority: string }[] = []
    try {
      activeAnnouncements = await db
        .select({
          message: announcements.message,
          priority: announcements.priority,
        })
        .from(announcements)
        .where(
          and(
            lte(announcements.startsAt, now),
            gte(announcements.expiresAt, now),
          )
        )
    } catch {
      // DB may not be available — return manifest without announcements
    }

    return NextResponse.json({
      version: SKILL_VERSION,
      skill_url: 'https://slashcast.dev/skill.md',
      announcements: activeAnnouncements.map(a => ({
        message: a.message,
        priority: a.priority,
      })),
    })
  } catch {
    // Always return a valid manifest even on error
    return NextResponse.json({
      version: SKILL_VERSION,
      skill_url: 'https://slashcast.dev/skill.md',
      announcements: [],
    })
  }
}
