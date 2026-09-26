import { db } from '@/lib/db'
import { profiles, user, userSettings } from '@/lib/db/schema'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'
import { eq } from 'drizzle-orm'

const defaults = { profileVisibility: 'private', scoreSharing: false, archetypeSharing: false, dimensionsSharing: false, feedSharing: false, comparisonSharing: false, weeklyPulseReminders: true, reportReadyNotifications: true, syncFailureNotifications: true, challengeReminders: true, socialNotifications: true, marketingNotifications: false, emailNotifications: true, inAppNotifications: true, quietHoursStart: '22:00', quietHoursEnd: '08:00', timezone: 'UTC' }

export async function GET() {
  const currentUser = await requireUser()
  const [account] = await db.select({ name: user.name, email: user.email, image: user.image, emailVerified: user.emailVerified, createdAt: user.createdAt }).from(user).where(eq(user.id, currentUser.id)).limit(1)
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, currentUser.id)).limit(1)
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, currentUser.id)).limit(1)
  return Response.json({ account, profile, settings: settings ?? { id: '', userId: currentUser.id, ...defaults } })
}

export async function PATCH(request: Request) {
  const currentUser = await requireUser()
  const body = await request.json().catch(() => null)
  if (!body || typeof body.section !== 'string' || !['profile', 'sharing', 'notifications'].includes(body.section)) return jsonError('A valid settings section is required')
  const existing = await db.select({ id: userSettings.id }).from(userSettings).where(eq(userSettings.userId, currentUser.id)).limit(1)
  const allowedKeys = body.section === 'sharing' ? ['profileVisibility', 'scoreSharing', 'archetypeSharing', 'dimensionsSharing', 'feedSharing', 'comparisonSharing'] : body.section === 'notifications' ? ['weeklyPulseReminders', 'reportReadyNotifications', 'syncFailureNotifications', 'challengeReminders', 'socialNotifications', 'marketingNotifications', 'emailNotifications', 'inAppNotifications', 'quietHoursStart', 'quietHoursEnd', 'timezone'] : []
  const update = Object.fromEntries(allowedKeys.filter((key) => key in (body.values ?? {})).map((key) => [key, body.values[key]]))
  if (body.section === 'profile') {
    if (typeof body.values?.timezone === 'string') await db.update(profiles).set({ timezone: body.values.timezone, updatedAt: new Date() }).where(eq(profiles.userId, currentUser.id))
    if (typeof body.values?.name === 'string' && body.values.name.trim()) await db.update(user).set({ name: body.values.name.trim(), updatedAt: new Date() }).where(eq(user.id, currentUser.id))
  }
  if (existing[0]) await db.update(userSettings).set(update).where(eq(userSettings.userId, currentUser.id))
  else await db.insert(userSettings).values({ id: requestId(), userId: currentUser.id, ...defaults, ...update })
  return Response.json({ ok: true, savedAt: new Date().toISOString() })
}
