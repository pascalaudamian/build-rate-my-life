import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const analyticsEvents = pgTable('analytics_events', { id: text('id').primaryKey(), userId: text('userId'), event: text('event').notNull(), properties: jsonb('properties').notNull().default({}), createdAt: timestamp('createdAt').notNull().defaultNow() })

export const shareEvents = pgTable('share_events', {
  id: text('id').primaryKey(),
  event: text('event').notNull(),
  shareCode: text('shareCode'),
  referrerUserId: text('referrerUserId'),
  referralCode: text('referralCode'),
  source: text('source'),
  campaign: text('campaign'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const profiles = pgTable('profile', { id: text('id').primaryKey(), userId: text('userId').notNull(), bio: text('bio'), timezone: text('timezone'), interests: jsonb('interests').notNull().default([]), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const dataSources = pgTable('data_sources', { id: text('id').primaryKey(), name: text('name').notNull(), kind: text('kind').notNull(), description: text('description'), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const dataConnections = pgTable('data_connections', { id: text('id').primaryKey(), userId: text('userId').notNull(), sourceId: text('sourceId').notNull(), status: text('status').notNull().default('connected'), providerAccountId: text('providerAccountId'), metadata: jsonb('metadata').notNull().default({}), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const datasets = pgTable('datasets', { id: text('id').primaryKey(), userId: text('userId').notNull(), connectionId: text('connectionId'), name: text('name').notNull(), kind: text('kind').notNull(), metadata: jsonb('metadata').notNull().default({}), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const featureSnapshots = pgTable('feature_snapshots', { id: text('id').primaryKey(), userId: text('userId').notNull(), datasetId: text('datasetId'), features: jsonb('features').notNull(), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const lifeScores = pgTable('life_scores', { id: text('id').primaryKey(), userId: text('userId').notNull(), reportId: text('reportId'), overall: integer('overall').notNull(), dimensions: jsonb('dimensions').notNull(), scoreVersion: text('scoreVersion').notNull().default('1.0'), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const insights = pgTable('insights', { id: text('id').primaryKey(), userId: text('userId').notNull(), reportId: text('reportId'), kind: text('kind').notNull(), content: text('content').notNull(), confidence: integer('confidence'), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const challenges = pgTable('challenges', { id: text('id').primaryKey(), slug: text('slug').notNull().unique(), title: text('title').notNull(), description: text('description').notNull(), category: text('category').notNull(), reward: integer('reward').notNull().default(0) })
export const achievements = pgTable('achievements', { id: text('id').primaryKey(), slug: text('slug').notNull().unique(), title: text('title').notNull(), description: text('description').notNull() })
export const friendships = pgTable('friendships', { id: text('id').primaryKey(), userId: text('userId').notNull(), friendUserId: text('friendUserId').notNull(), status: text('status').notNull().default('accepted'), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const comparisons = pgTable('comparisons', { id: text('id').primaryKey(), userId: text('userId').notNull(), friendUserId: text('friendUserId').notNull(), visibility: text('visibility').notNull().default('private'), snapshot: jsonb('snapshot').notNull(), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const shares = pgTable('shares', { id: text('id').primaryKey(), userId: text('userId').notNull(), reportId: text('reportId'), code: text('code').notNull().unique(), visibility: text('visibility').notNull().default('limited'), createdAt: timestamp('createdAt').notNull().defaultNow() })

export const consentRecords = pgTable('consent_records', { id: text('id').primaryKey(), userId: text('userId').notNull(), purpose: text('purpose').notNull(), source: text('source'), granted: boolean('granted').notNull().default(false), version: text('version').notNull().default('1.0'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const reportEvidence = pgTable('report_evidence', { id: text('id').primaryKey(), userId: text('userId').notNull(), reportId: text('reportId').notNull(), label: text('label').notNull(), value: text('value').notNull(), source: text('source'), confidence: integer('confidence'), createdAt: timestamp('createdAt').notNull().defaultNow() })
export const weeklyPulses = pgTable('weekly_pulses', { id: text('id').primaryKey(), userId: text('userId').notNull(), week: text('week').notNull(), mood: integer('mood'), energy: integer('energy'), focus: integer('focus'), reflection: text('reflection'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow() })
export const experiments = pgTable('experiments', { id: text('id').primaryKey(), userId: text('userId').notNull(), title: text('title').notNull(), description: text('description').notNull(), status: text('status').notNull().default('active'), targetDays: integer('targetDays').notNull().default(7), startedAt: timestamp('startedAt').notNull().defaultNow(), completedAt: timestamp('completedAt') })

export const lifeReports = pgTable('life_reports', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  score: integer('score').notNull(),
  archetype: text('archetype').notNull(),
  dimensions: jsonb('dimensions').notNull(),
  rawFeatures: jsonb('rawFeatures').notNull().default({}),
  scoreVersion: text('scoreVersion').notNull().default('1.0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
