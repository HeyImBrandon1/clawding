import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url').slice(0, length)
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10)
}

export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}

// System-reserved: current routes, API paths, infrastructure, and any page we might build
const SYSTEM_SLUGS = [
  // Current routes & API
  'api', 'admin', 'settings', 'i', 'skill', 'login', 'logout', 'signup',
  'register', 'auth', 'oauth', 'callback', 'webhook', 'webhooks', 'feed',
  'feeds', 'global', 'check', 'claim', 'post', 'delete', 'update', 'updates',
  'user', 'users', 'profile', 'profiles', 'health', 'notify', 'activity',
  'skills', 'manifest', 'discover', 'active', 'stats', 'recover', 'vote',
  'static', 'assets', 'public', 'src', 'app', 'lib', 'components',
  // Pages we might build (singular + plural + hyphenated variants)
  'about', 'about-us', 'contact', 'contact-us', 'help', 'help-center',
  'terms', 'terms-of-service', 'privacy', 'privacy-policy',
  'legal', 'tos', 'dmca', 'security', 'cookies', 'cookie-policy',
  'pricing', 'plans', 'pro', 'premium', 'upgrade', 'billing',
  'guide', 'guides', 'docs', 'documentation', 'faq', 'faqs',
  'blog', 'news', 'changelog', 'change-log', 'roadmap', 'road-map',
  'status', 'uptime', 'incidents',
  'event', 'events', 'hackathon', 'hackathons', 'hack',
  'tournament', 'tournaments', 'challenge', 'challenges',
  'competition', 'competitions', 'contest', 'contests', 'jam', 'jams',
  'search', 'explore', 'browse',
  'notification', 'notifications', 'inbox', 'message', 'messages',
  'leaderboard', 'leaderboards', 'ranking', 'rankings', 'streak', 'streaks',
  'team', 'teams', 'org', 'orgs', 'organization', 'organizations',
  'project', 'projects', 'shared', 'shared-projects',
  'badge', 'badges', 'achievement', 'achievements', 'reward', 'rewards',
  'sponsor', 'sponsors', 'partner', 'partners', 'advertise',
  'download', 'install', 'setup', 'set-up', 'onboarding', 'welcome', 'get-started',
  'home', 'index', 'root', 'null', 'undefined', 'error', 'not-found',
  'featured', 'spotlight', 'picks', 'curated', 'trending', 'popular', 'top',
  'winner', 'winners', 'hall-of-fame',
  'credits', 'credit', 'points', 'point', 'score', 'scores',
  'tokens', 'token', 'coins', 'coin', 'xp', 'level', 'levels', 'tier', 'tiers',
  'store', 'shop', 'marketplace', 'redeem',
  'log', 'logs', 'journal', 'journals', 'history',
  'sitemap', 'robots', 'favicon', 'rss', 'atom',
]

// Owner-reserved: brand names and protected names held for future use
const OWNER_SLUGS = [
  // Our brands
  'cast', 'slash', 'slashcast', 'slashcash', 'slashfeed',
  // 'clawding', — temporarily unblocked for owner claim
  // 'brandon', — temporarily unblocked for owner claim
  'brandonbuilds', 'brandoncodes', 'latenightapps', 'latenight', 'late-night',
  // AI tools & companies
  'claude', 'claudeai', 'claude-ai', 'claudecode', 'claude-code', 'anthropic',
  'sonnet', 'opus', 'haiku',
  'openai', 'gpt', 'chatgpt', 'copilot', 'github-copilot',
  'cursor', 'windsurf', 'codeium', 'gemini', 'devin', 'mistral', 'perplexity', 'llama', 'meta-ai',
  // Platform authority
  'official', 'staff', 'mod', 'moderator', 'support',
  'hello', 'info', 'system', 'bot',
  // Squatter bait
  'test', 'demo', 'example', 'featured', 'trending', 'popular',
  'top', 'first', 'dev', 'hacker', 'coder', 'builder',
  // Finance & crypto (GME forever)
  'bitcoin', 'btc', 'ethereum', 'eth', 'doge', 'dogecoin', 'crypto',
  'gme', 'gamestop', 'treasury', 'stonks', 'hodl',
  'usa', 'america', 'new-york', 'newyork', 'nyc', 'longisland', 'long-island',
  // Reserved for owner
  'today',
]

const RESERVED_SLUGS = [...SYSTEM_SLUGS, ...OWNER_SLUGS]

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' }
  }
  if (slug.length < 3 || slug.length > 20) {
    return { valid: false, error: 'Slug must be 3-20 characters' }
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' }
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' }
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, error: 'This username is reserved' }
  }
  return { valid: true }
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 500)
}

export function sanitizeProjectName(name: string): string {
  return name
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 100)
}

export function validateXHandle(handle: string): { valid: boolean; error?: string } {
  if (!handle) return { valid: true }
  const cleaned = handle.startsWith('@') ? handle.slice(1) : handle
  if (cleaned.length === 0) return { valid: false, error: 'X handle cannot be empty' }
  if (cleaned.length > 15) return { valid: false, error: 'X handle must be 15 characters or fewer' }
  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) return { valid: false, error: 'X handle can only contain letters, numbers, and underscores' }
  return { valid: true }
}

export function cleanXHandle(handle: string): string {
  return handle.startsWith('@') ? handle.slice(1) : handle
}

export function validateWebsiteUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true }
  if (url.length > 200) return { valid: false, error: 'Website URL must be 200 characters or fewer' }
  if (!url.startsWith('https://')) return { valid: false, error: 'Website URL must start with https://' }
  try { new URL(url) } catch { return { valid: false, error: 'Invalid URL format' } }
  return { valid: true }
}

const SLUG_COLORS = [
  '#5eead4', '#c084fc', '#60a5fa', '#fb923c',
  '#f472b6', '#fbbf24', '#34d399', '#f87171',
]

export function slugColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0
  }
  return SLUG_COLORS[Math.abs(hash) % SLUG_COLORS.length]
}

export function generateSuggestions(slug: string): string[] {
  const suffixes = ['dev', 'codes', 'builds', 'ships', '99', 'io', 'hq']
  return suffixes
    .map(suffix => `${slug}${suffix}`)
    .filter(s => s.length <= 20)
    .slice(0, 3)
}

export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return dateObj.toLocaleDateString()
}
