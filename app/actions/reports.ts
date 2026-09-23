'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { lifeReports, reportEvidence } from '@/lib/db/schema'
import { generateLifeReport, type RawLifeData } from '@/lib/scoring-engine'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createLifeReport(raw: RawLifeData) {
  const userId = await getUserId()
  const report = generateLifeReport(raw)
  const reportId = crypto.randomUUID()
  await db.insert(lifeReports).values({ id: reportId, userId, score: report.overall, archetype: report.archetype.name, dimensions: report.scores, rawFeatures: report.features, scoreVersion: report.scoreVersion })
  const evidence = Object.entries(report.features).slice(0, 12).map(([label, value]) => ({ id: crypto.randomUUID(), userId, reportId, label, value: String(value), source: label.includes('spotify') ? 'Spotify' : label.includes('calendar') ? 'Calendar' : 'Profile', confidence: 90 }))
  if (evidence.length) await db.insert(reportEvidence).values(evidence)
  revalidatePath('/dashboard')
  revalidatePath('/report')
  return { ...report, id: reportId }
}
