export type DataSourceKind =
  | 'profile'
  | 'spotify'
  | 'calendar'
  | 'screenshot'
  | 'photos'
  | 'bookmarks'
  | 'expenses'
  | 'fitness'
  | 'messages'

export type DataSourceStatus = 'available' | 'connected' | 'processing' | 'error'

export type DataSource = {
  kind: DataSourceKind
  title: string
  description: string
  status: DataSourceStatus
  lastSyncedAt?: string
}

export type LifeDimension = {
  key: 'curiosity' | 'adventure' | 'culture' | 'activity' | 'productivity' | 'social'
  label: string
  score: number
  evidence: string[]
}

export type LifeReport = {
  id: string
  period: { start: string; end: string }
  score: number
  archetype: { name: string; summary: string }
  dimensions: LifeDimension[]
  observations: string[]
  insights: string[]
  achievements: string[]
  challenges: string[]
}

export const reportGenerationRules = {
  deterministic: 'Scores and statistics must be derived from connected source evidence.',
  narrative: 'AI may explain patterns and write observations, but must not invent evidence.',
  safety: 'Reports are playful reflections, not scientific, psychological, medical, or financial assessments.',
} as const

export const supportedSources: DataSource[] = [
  { kind: 'profile', title: 'Manual profile', description: 'A few details you choose to share.', status: 'connected' },
  { kind: 'spotify', title: 'Spotify', description: 'Artists, genres, and listening activity.', status: 'connected' },
  { kind: 'calendar', title: 'Calendar', description: 'Event patterns, free time, and meeting density.', status: 'connected' },
  { kind: 'screenshot', title: 'Screenshots', description: 'Images you upload for pattern discovery.', status: 'available' },
  { kind: 'photos', title: 'Photos', description: 'Visual themes from selected memories.', status: 'available' },
  { kind: 'bookmarks', title: 'Bookmarks', description: 'Topics and rabbit holes you save.', status: 'available' },
  { kind: 'expenses', title: 'Expense CSV', description: 'Spending categories you choose to analyze.', status: 'available' },
  { kind: 'fitness', title: 'Fitness data', description: 'Movement and recovery patterns.', status: 'available' },
  { kind: 'messages', title: 'Messages', description: 'Conversation rhythms and social patterns.', status: 'available' },
]

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function calculateLifeScore(dimensions: LifeDimension[]) {
  if (!dimensions.length) return 0
  return clampScore(dimensions.reduce((total, dimension) => total + dimension.score, 0) / dimensions.length)
}
