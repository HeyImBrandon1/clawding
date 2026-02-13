import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events — Clawding',
  description: 'Hackathons, competitions, and community events for the Clawding community.',
  openGraph: {
    title: 'Events — Clawding',
    description: 'Hackathons, competitions, and community events for the Clawding community.',
    url: 'https://clawding.app/events',
  },
}

export default function EventsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary mb-4">Events</h1>
      <p className="text-secondary mb-12">
        Hackathons, competitions, and community challenges.
      </p>

      <div className="bg-surface rounded-2xl border border-border p-12 text-center">
        <div className="text-4xl mb-4 select-none">
          <span className="text-gradient font-display font-bold">//</span>
        </div>
        <h2 className="font-display text-xl font-semibold text-primary mb-3">
          Coming Soon
        </h2>
        <p className="text-secondary max-w-sm mx-auto">
          Community events and hackathons are on the way. Build something cool and you&apos;ll
          hear about it through{' '}
          <code className="text-coral font-mono text-sm">/clawding</code>.
        </p>
      </div>
    </main>
  )
}
