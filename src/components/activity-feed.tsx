'use client'

import { useState, useRef } from 'react'
import { UpdateCard } from '@/components/update-card'

interface Update {
  id: string
  slug: string
  project: string
  content: string
  created_at: string
}

const PAGE_SIZE = 20

export function ActivityFeed({ initialUpdates }: { initialUpdates: Update[] }) {
  const [updates, setUpdates] = useState(initialUpdates)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialUpdates.length >= PAGE_SIZE)
  const offsetRef = useRef(initialUpdates.length)

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    fetch(`/api/global?limit=${PAGE_SIZE}&offset=${offsetRef.current}`)
      .then(res => res.json())
      .then(data => {
        const newUpdates = data.updates ?? []
        setUpdates(prev => [...prev, ...newUpdates])
        setHasMore(data.has_more ?? false)
        offsetRef.current += newUpdates.length
        setLoadingMore(false)
      })
      .catch(() => setLoadingMore(false))
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      {updates.length === 0 ? (
        <div className="text-muted text-center py-12">
          <p className="mb-2">No updates yet.</p>
          <p className="text-cyan">Be the first to post!</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {updates.map(u => (
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
          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-surface border border-border rounded-lg text-secondary text-sm font-medium transition-colors hover:border-border-accent hover:text-primary disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
