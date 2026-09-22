'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { lifeReports } from '@/lib/db/schema'
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
  await db.insert(lifeReports).values({ id: crypto.randomUUID(), userId, score: report.overall, archetype: report.archetype.name, dimensions: report.scores, rawFeatures: report.features, scoreVersion: report.scoreVersion })
  revalidatePath('/dashboard')
  return report
}
