export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-6 text-7xl font-bold font-display text-primary">/</div>
        <h1 className="mb-4 text-5xl font-bold font-display text-gradient">
          SlashCast
        </h1>
        <p className="mb-8 text-xl text-secondary">
          Broadcast What You Build
        </p>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-4 font-mono text-sm text-secondary hover:glow-coral transition-shadow">
          <span className="text-muted">$</span>{" "}
          <span className="text-primary">curl -sL slashcast.dev/i | bash</span>
        </div>
      </section>

      {/* Placeholder for global feed */}
      <section className="text-center text-secondary">
        <p>Global feed will appear here.</p>
      </section>
    </main>
  )
}
