'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { experiments, weeklyPulses } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function saveWeeklyPulse(input: { week: string; mood: number; energy: number; focus: number; reflection?: string }) {
  const userId = await getUserId()
  const existing = await db.select({ id: weeklyPulses.id }).from(weeklyPulses).where(and(eq(weeklyPulses.userId, userId), eq(weeklyPulses.week, input.week))).limit(1)
  if (existing[0]) await db.update(weeklyPulses).set({ ...input, updatedAt: new Date() }).where(and(eq(weeklyPulses.id, existing[0].id), eq(weeklyPulses.userId, userId)))
  else await db.insert(weeklyPulses).values({ id: crypto.randomUUID(), userId, ...input })
  revalidatePath('/dashboard')
}

export async function startExperiment(input: { title: string; description: string; targetDays?: number }) {
  const userId = await getUserId()
  const [experiment] = await db.insert(experiments).values({ id: crypto.randomUUID(), userId, title: input.title.trim(), description: input.description.trim(), targetDays: input.targetDays ?? 7 }).returning()
  revalidatePath('/dashboard')
  return experiment
}

export async function getRetentionData() {
  const userId = await getUserId()
  const [pulse] = await db.select().from(weeklyPulses).where(eq(weeklyPulses.userId, userId)).orderBy(desc(weeklyPulses.createdAt)).limit(1)
  const activeExperiments = await db.select().from(experiments).where(and(eq(experiments.userId, userId), eq(experiments.status, 'active'))).orderBy(desc(experiments.startedAt))
  return { pulse: pulse ?? null, experiments: activeExperiments }
}
