'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/feed', label: 'Feed' },
  { href: '/events', label: 'Events' },
  { href: '/guide', label: 'Guide' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight transition-opacity hover:opacity-80">
          <span className="text-gradient">/Clawding</span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-coral'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
