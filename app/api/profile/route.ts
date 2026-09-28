import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'
import { eq } from 'drizzle-orm'

export async function PUT(request: Request) {
  const user = await requireUser()
  const body = await request.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 80) return jsonError('A valid name is required')
  const name = body.name.trim()
  const interests = Array.isArray(body.interests) ? body.interests.filter((value: unknown): value is string => typeof value === 'string').slice(0, 20) : []
  const [existing] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, user.id)).limit(1)
  const profile = existing
    ? (await db.update(profiles).set({ bio: name, interests, updatedAt: new Date() }).where(eq(profiles.id, existing.id)).returning())[0]
    : (await db.insert(profiles).values({ id: requestId(), userId: user.id, bio: name, interests }).returning())[0]
  return Response.json({ profile })
}
