'use server'

import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { consentRecords } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function setConsent(input: { purpose: string; source?: string; granted: boolean }) {
  const userId = await getUserId()
  const existing = await db.select({ id: consentRecords.id }).from(consentRecords).where(and(eq(consentRecords.userId, userId), eq(consentRecords.purpose, input.purpose), input.source ? eq(consentRecords.source, input.source) : eq(consentRecords.purpose, input.purpose))).limit(1)
  if (existing[0]) await db.update(consentRecords).set({ granted: input.granted, updatedAt: new Date() }).where(and(eq(consentRecords.id, existing[0].id), eq(consentRecords.userId, userId)))
  else await db.insert(consentRecords).values({ id: crypto.randomUUID(), userId, purpose: input.purpose, source: input.source, granted: input.granted })
  revalidatePath('/privacy')
}

export async function getConsents() {
  const userId = await getUserId()
  return db.select().from(consentRecords).where(eq(consentRecords.userId, userId))
}
