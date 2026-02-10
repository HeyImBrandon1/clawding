'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalCoders: number
  totalPosts: number
  postsToday: number
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load stats')
        return res.json()
      })
      .then((data: Record<string, number>) => setStats({
        totalCoders: data.total_coders,
        totalPosts: data.total_posts,
        postsToday: data.posts_today,
      }))
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <StatItem label="Coders" value={undefined} />
        <StatItem label="Posts" value={undefined} />
        <StatItem label="Today" value={undefined} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatItem label="Coders" value={stats?.totalCoders} />
      <StatItem label="Posts" value={stats?.totalPosts} />
      <StatItem label="Today" value={stats?.postsToday} />
    </div>
  )
}

interface StatItemProps {
  label: string
  value: number | undefined
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-xl p-4 text-center transition-colors hover:border-[var(--border-accent)]">
      <div className="font-display text-2xl font-bold text-[var(--accent-coral)] mb-1">
        {value !== undefined ? value.toLocaleString() : (
          <span className="inline-block w-8 h-7 bg-[var(--background-card)] rounded animate-pulse" />
        )}
      </div>
      <div className="text-[var(--text-muted)] text-sm">{label}</div>
    </div>
  )
}
