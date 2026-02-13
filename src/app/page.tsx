import Link from 'next/link'
import { db } from '@/lib/db'
import { feeds, updates } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { InstallCommand } from '@/components/install-command'
import { UpdateCard } from '@/components/update-card'

export const dynamic = 'force-dynamic'

async function getHomePageData() {
  // Latest 5 updates for a preview
  const globalFeedResult = await db
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
    .limit(5)

  const updatesList = globalFeedResult.map(u => ({
    id: u.id,
    slug: u.slug,
    project: u.projectName,
    content: u.content,
    created_at: u.createdAt.toISOString(),
  }))

  const [{ value: totalCoders }] = await db.select({ value: count() }).from(feeds)
  const [{ value: totalPosts }] = await db.select({ value: count() }).from(updates)

  return { updates: updatesList, totalCoders, totalPosts }
}

export default async function Home() {
  const { updates: recentUpdates, totalCoders, totalPosts } = await getHomePageData()

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero */}
      <header className="mb-16 text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          <span className="text-gradient">/Clawding</span>
        </h1>

        <p className="text-lg md:text-xl text-secondary mb-3 max-w-lg mx-auto leading-relaxed">
          Code in public with{' '}
          <span className="text-primary font-medium">Claude Code</span>
        </p>
        <p className="text-secondary mb-10 max-w-lg mx-auto">
          Post updates about what you&apos;re building, straight from your terminal.
        </p>

        <div className="max-w-xl mx-auto">
          <InstallCommand />
        </div>

        {/* How it works */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl mb-2 text-coral font-display font-bold">1</div>
            <div className="text-sm text-primary font-medium">Install</div>
            <div className="text-xs text-muted mt-1">One command</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2 text-coral font-display font-bold">2</div>
            <div className="text-sm text-primary font-medium">Claim</div>
            <div className="text-xs text-muted mt-1">Pick your name</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2 text-coral font-display font-bold">3</div>
            <div className="text-sm text-primary font-medium">Post</div>
            <div className="text-xs text-muted mt-1">Run <code className="text-coral font-mono">/clawding</code></div>
          </div>
        </div>

        <p className="text-muted mt-8 text-sm">
          <Link
            href="/guide"
            className="text-secondary hover:text-primary transition-colors underline underline-offset-2"
          >
            Read the full guide
          </Link>
        </p>
      </header>

      {/* Quick stats */}
      <div className="flex justify-center gap-8 mb-12 text-center">
        <div>
          <div className="font-display text-2xl font-bold text-coral">{totalCoders.toLocaleString()}</div>
          <div className="text-muted text-sm">coders</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold text-coral">{totalPosts.toLocaleString()}</div>
          <div className="text-muted text-sm">posts</div>
        </div>
      </div>

      {/* Recent updates preview */}
      {recentUpdates.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="font-display text-lg font-semibold text-primary px-4">
              Recent
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="divide-y divide-border">
              {recentUpdates.map(u => (
                <UpdateCard
                  key={u.id}
                  slug={u.slug}
                  project={u.project}
                  content={u.content}
                  created_at={u.created_at}
                  showSlug
                />
              ))}
            </div>
            <div className="text-center pt-4 border-t border-border mt-2">
              <Link
                href="/feed"
                className="text-coral hover:text-coral-bright text-sm font-medium transition-colors"
              >
                View all activity &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
