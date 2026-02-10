'use client'

import Link from 'next/link'

interface DiscoverProfile {
  slug: string
  latestProject: string
  latestContent: string
  postCount: number
}

interface DiscoverProfilesProps {
  initialProfiles: DiscoverProfile[]
}

export function DiscoverProfiles({ initialProfiles }: DiscoverProfilesProps) {
  if (initialProfiles.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-center py-6 text-sm">
        No profiles to discover yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {initialProfiles.map(profile => (
        <Link
          key={profile.slug}
          href={`/${profile.slug}`}
          className="block bg-[var(--background-card)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[var(--border-accent)] hover:bg-[var(--background-card)]/80 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--accent-coral)] font-medium text-sm">
              @{profile.slug}
            </span>
            <span className="text-[var(--text-muted)] text-xs">
              {profile.postCount} {profile.postCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2">
            {profile.latestContent}
          </p>
          <div className="text-[var(--accent-cyan)] text-xs mt-2 font-mono truncate">
            {profile.latestProject}
          </div>
        </Link>
      ))}
    </div>
  )
}
