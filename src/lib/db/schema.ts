import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'

// --- Core entities (ported from Clawding) ---

export const feeds = pgTable('feeds', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull(),
  tokenHash: text('token_hash').notNull(),
  xHandle: text('x_handle'),
  websiteUrl: text('website_url'),
  description: text('description'),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastPostAt: timestamp('last_post_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('idx_feeds_slug').on(table.slug),
])

export const updates = pgTable('updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  feedId: uuid('feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
  projectName: text('project_name').notNull(),
  content: text('content').notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_updates_feed_id').on(table.feedId),
  index('idx_updates_created_at').on(table.createdAt),
  index('idx_updates_event_id').on(table.eventId),
])

// --- Event entities (new for SlashCast) ---

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'slashcast' | 'skills' | 'general'
  status: text('status').notNull().default('announced'), // 'announced' | 'active' | 'ended' | 'archived'
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  votingEndsAt: timestamp('voting_ends_at', { withTimezone: true }),
  prizes: text('prizes'),
  rules: text('rules'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_events_slug').on(table.slug),
  index('idx_events_status').on(table.status),
])

export const eventParticipants = pgTable('event_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  feedId: uuid('feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
  projectName: text('project_name').notNull(),
  projectDescription: text('project_description'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_event_participants_unique').on(table.eventId, table.feedId),
  index('idx_event_participants_event_id').on(table.eventId),
  index('idx_event_participants_feed_id').on(table.feedId),
])

export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  voterFeedId: uuid('voter_feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
  targetFeedId: uuid('target_feed_id').notNull().references(() => feeds.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_votes_unique').on(table.eventId, table.voterFeedId, table.targetFeedId),
  index('idx_votes_event_id').on(table.eventId),
  index('idx_votes_target_feed_id').on(table.targetFeedId),
])

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  message: text('message').notNull(),
  priority: text('priority').notNull().default('info'), // 'info' | 'high' | 'urgent'
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_announcements_expires_at').on(table.expiresAt),
])
