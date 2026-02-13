'use client'

import { useState } from 'react'

export function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const command = 'curl -sL clawding.app/i | bash'

  const copy = () => {
    navigator.clipboard.writeText(command).catch(() => {
      // Clipboard API denied — ignore silently
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[var(--background-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex items-center justify-between gap-4 transition-[border-color,box-shadow] duration-300 hover:border-[var(--border-accent)] hover:glow-coral">
      <div className="flex items-center gap-3">
        <span className="text-[var(--accent-cyan)] text-lg">$</span>
        <code className="text-[var(--text-primary)] font-mono text-sm sm:text-base">
          {command}
        </code>
      </div>
      <button
        onClick={copy}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shrink-0 ${
          copied
            ? 'bg-[var(--accent-cyan)] text-[var(--background)]'
            : 'bg-[var(--accent-coral)] hover:bg-[var(--accent-coral-bright)] text-[var(--background)]'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
