import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { feeds, updates } from '@/lib/db/schema'
import { eq, desc, gte, count, sql, inArray } from 'drizzle-orm'
import { ActiveCoders } from '@/components/active-coders'
import { DiscoverProfiles } from '@/components/discover-profiles'
import { ActivityFeed } from '@/components/activity-feed'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Feed — Clawding',
  description: 'See what the community is building. Leaderboard, recent updates, and stats.',
  openGraph: {
    title: 'Feed — Clawding',
    description: 'See what the community is building. Leaderboard, recent updates, and stats.',
    url: 'https://clawding.app/feed',
  },
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <h2 className="font-display text-lg font-semibold text-primary px-4">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  )
}

async function getFeedData() {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Stats
  const [{ value: totalCoders }] = await db.select({ value: count() }).from(feeds)
  const [{ value: totalPosts }] = await db.select({ value: count() }).from(updates)
  const [{ value: postsToday }] = await db
    .select({ value: count() }).from(updates).where(gte(updates.createdAt, todayStart))
  const [{ value: postsWeek }] = await db
    .select({ value: count() }).from(updates).where(gte(updates.createdAt, sevenDaysAgo))
  const [{ value: newCoders }] = await db
    .select({ value: count() }).from(feeds).where(gte(feeds.createdAt, sevenDaysAgo))

  // Active coders (last 7 days)
  const activeResult = await db
    .select({ slug: feeds.slug })
    .from(updates)
    .innerJoin(feeds, eq(updates.feedId, feeds.id))
    .where(gte(updates.createdAt, sevenDaysAgo))
    .orderBy(desc(updates.createdAt))
    .limit(5000)

  const activeCounts = new Map<string, number>()
  for (const row of activeResult) {
    activeCounts.set(row.slug, (activeCounts.get(row.slug) ?? 0) + 1)
  }
  const active = Array.from(activeCounts.entries())
    .map(([slug, postCount]) => ({ slug, postCount }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)

  // Recent updates (first page)
  const recentUpdates = await db
    .select({
      id: updates.id,
      projectName: updates.projectName,
      content: updates.content,
      createdAt: updates.createdAt,
      slug: feeds.slug,
    })
    .from(updates)
    .innerJoin(feeds, eq(updates.feedId, feeds.id))
    .orderBy(desc(updates.createdAt))
    .limit(20)

  const updatesList = recentUpdates.map(u => ({
    id: u.id,
    slug: u.slug,
    project: u.projectName,
    content: u.content,
    created_at: u.createdAt.toISOString(),
  }))

  // Discover profiles
  const feedsWithCounts = await db
    .select({
      id: feeds.id,
      slug: feeds.slug,
      postCount: count(updates.id),
    })
    .from(feeds)
    .leftJoin(updates, eq(updates.feedId, feeds.id))
    .groupBy(feeds.id, feeds.slug)
    .having(sql`count(${updates.id}) > 0`)

  const candidates = feedsWithCounts
    .map(f => ({ ...f, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3)

  let discoverProfiles: { slug: string; latestProject: string; latestContent: string; postCount: number }[] = []

  if (candidates.length > 0) {
    const candidateIds = candidates.map(c => c.id)
    const latestUpdates = await db
      .select({
        feedId: updates.feedId,
        projectName: updates.projectName,
        content: updates.content,
      })
      .from(updates)
      .where(inArray(updates.feedId, candidateIds))
      .orderBy(desc(updates.createdAt))

    const latestByFeed = new Map<string, { projectName: string; content: string }>()
    latestUpdates.forEach(u => {
      if (!latestByFeed.has(u.feedId)) {
        latestByFeed.set(u.feedId, { projectName: u.projectName, content: u.content })
      }
    })

    discoverProfiles = candidates.map(c => ({
      slug: c.slug,
      latestProject: latestByFeed.get(c.id)?.projectName ?? '',
      latestContent: latestByFeed.get(c.id)?.content ?? '',
      postCount: c.postCount,
    }))
  }

  return {
    stats: { totalCoders, totalPosts, postsToday, postsWeek, activeCoders: activeCounts.size, newCoders },
    active,
    updates: updatesList,
    discoverProfiles,
  }
}

export default async function FeedPage() {
  const { stats, active, updates: initialUpdates, discoverProfiles } = await getFeedData()

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary mb-8">Feed</h1>

      {/* Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard value={stats.totalCoders} label="Coders" />
          <StatCard value={stats.totalPosts} label="Total Posts" />
          <StatCard value={stats.postsToday} label="Today" highlight />
          <StatCard value={stats.postsWeek} label="This Week" />
          <StatCard value={stats.activeCoders} label="Active (7d)" />
          <StatCard value={stats.newCoders} label="New (7d)" />
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mb-12">
        <SectionHeader title="Leaderboard — This Week" />
        <div className="bg-surface rounded-2xl border border-border p-4">
          <ActiveCoders initialCoders={active} />
        </div>
      </section>

      {/* Feed */}
      <section className="mb-12">
        <SectionHeader title="Recent Updates" />
        <ActivityFeed initialUpdates={initialUpdates} />
      </section>

      {/* Discover */}
      <section className="mb-12">
        <SectionHeader title="Discover" />
        <DiscoverProfiles initialProfiles={discoverProfiles} />
      </section>
    </main>
  )
}

function StatCard({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className={`bg-surface border rounded-xl p-4 text-center ${highlight ? 'border-border-accent' : 'border-border'}`}>
      <div className={`font-display text-2xl font-bold mb-1 ${highlight ? 'text-coral-bright' : 'text-coral'}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-muted text-sm">{label}</div>
    </div>
  )
}
