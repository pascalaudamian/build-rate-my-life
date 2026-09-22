export const SCORE_VERSION = '1.0'

export type RawLifeData = {
  spotify?: { uniqueArtists?: number; newArtists?: number; genres?: number; minutesListened?: number }
  calendar?: { totalEvents?: number; completedEvents?: number; socialEvents?: number; travelDays?: number; freeHours?: number }
  profile?: { interests?: string[]; goals?: string[] }
}

export type LifeFeatures = {
  noveltyRate: number
  genreBreadth: number
  completionRate: number
  socialEventRate: number
  travelDays: number
  freeHours: number
  interestCount: number
  goalCount: number
  listeningHours: number
}

export type LifeScores = Record<'curiosity' | 'activity' | 'productivity' | 'financialDiscipline' | 'adventure' | 'culture' | 'social' | 'balance', number>

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const ratio = (value: number, max: number) => clamp((value / Math.max(max, 1)) * 100)

export function normalizeRawData(raw: RawLifeData): RawLifeData {
  return { spotify: { uniqueArtists: Math.max(0, raw.spotify?.uniqueArtists ?? 0), newArtists: Math.max(0, raw.spotify?.newArtists ?? 0), genres: Math.max(0, raw.spotify?.genres ?? 0), minutesListened: Math.max(0, raw.spotify?.minutesListened ?? 0) }, calendar: { totalEvents: Math.max(0, raw.calendar?.totalEvents ?? 0), completedEvents: Math.max(0, raw.calendar?.completedEvents ?? 0), socialEvents: Math.max(0, raw.calendar?.socialEvents ?? 0), travelDays: Math.max(0, raw.calendar?.travelDays ?? 0), freeHours: Math.max(0, raw.calendar?.freeHours ?? 0) }, profile: { interests: raw.profile?.interests ?? [], goals: raw.profile?.goals ?? [] } }
}

export function extractFeatures(input: RawLifeData): LifeFeatures {
  const raw = normalizeRawData(input)
  const spotify = raw.spotify!
  const calendar = raw.calendar!
  return { noveltyRate: spotify.uniqueArtists ? spotify.newArtists! / spotify.uniqueArtists : 0, genreBreadth: spotify.genres!, completionRate: calendar.totalEvents ? calendar.completedEvents! / calendar.totalEvents : 0, socialEventRate: calendar.totalEvents ? calendar.socialEvents! / calendar.totalEvents : 0, travelDays: calendar.travelDays!, freeHours: calendar.freeHours!, interestCount: raw.profile!.interests!.length, goalCount: raw.profile!.goals!.length, listeningHours: spotify.minutesListened! / 60 }
}

export const calculateCuriosityScore = (f: LifeFeatures) => clamp(ratio(f.noveltyRate, .75) * .55 + ratio(f.genreBreadth, 15) * .25 + ratio(f.interestCount, 8) * .2)
export const calculateActivityScore = (f: LifeFeatures) => clamp(ratio(f.listeningHours, 30) * .25 + ratio(f.travelDays, 8) * .35 + ratio(f.freeHours, 80) * .4)
export const calculateProductivityScore = (f: LifeFeatures) => clamp(ratio(f.completionRate, 1) * .7 + ratio(f.goalCount, 6) * .3)
export const calculateFinancialDisciplineScore = (f: LifeFeatures) => clamp(58 + ratio(f.goalCount, 8) * .22)
export const calculateAdventureScore = (f: LifeFeatures) => clamp(ratio(f.travelDays, 8) * .65 + ratio(f.noveltyRate, .75) * .35)
export const calculateCultureScore = (f: LifeFeatures) => clamp(ratio(f.genreBreadth, 15) * .55 + ratio(f.interestCount, 8) * .45)
export const calculateSocialScore = (f: LifeFeatures) => clamp(ratio(f.socialEventRate, .5) * .7 + ratio(f.goalCount, 6) * .3)
export const calculateBalanceScore = (f: LifeFeatures) => clamp(ratio(f.freeHours, 70) * .65 + (1 - f.completionRate) * 35)

export function calculateScores(features: LifeFeatures): LifeScores {
  return { curiosity: calculateCuriosityScore(features), activity: calculateActivityScore(features), productivity: calculateProductivityScore(features), financialDiscipline: calculateFinancialDisciplineScore(features), adventure: calculateAdventureScore(features), culture: calculateCultureScore(features), social: calculateSocialScore(features), balance: calculateBalanceScore(features) }
}

export function calculateOverallScore(scores: LifeScores) { return clamp(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length) }

const archetypes = [{ name: 'The Curious Explorer', summary: 'You keep discovering new interests before finishing the old ones.', test: (s: LifeScores) => s.curiosity >= 75 && s.adventure >= 65 }, { name: 'The Weekend Explorer', summary: 'Your calendar says routine. Your curiosity says otherwise.', test: (s: LifeScores) => s.adventure >= 75 && s.balance >= 45 }, { name: 'The Overthinking Optimizer', summary: 'You collect productivity systems faster than you complete tasks.', test: (s: LifeScores) => s.curiosity >= 70 && s.productivity < 60 }, { name: 'The Comfortable Strategist', summary: 'You have researched 17 hobbies. You currently practice 0.', test: (s: LifeScores) => s.curiosity >= 60 && s.activity < 50 }, { name: 'The Corporate Survivor', summary: 'Your calendar is full and somehow you still have meetings about meetings.', test: (s: LifeScores) => s.productivity >= 70 && s.balance < 45 }]

export function assignArchetype(scores: LifeScores) { return archetypes.find((archetype) => archetype.test(scores)) ?? { name: 'The Balanced Improviser', summary: 'You make room for structure, surprise, and a little bit of both.' } }

export function generateLifeReport(raw: RawLifeData) { const normalized = normalizeRawData(raw); const features = extractFeatures(normalized); const scores = calculateScores(features); const archetype = assignArchetype(scores); return { scoreVersion: SCORE_VERSION, raw: normalized, features, scores, overall: calculateOverallScore(scores), archetype } }
