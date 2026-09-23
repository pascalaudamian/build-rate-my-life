import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { challengeProgress } from '@/lib/db/schema'
import { jsonError, requireUser, requestId } from '@/lib/api-auth'

export async function GET() {
  const user = await requireUser()
  const progress = await db.select().from(challengeProgress).where(eq(challengeProgress.userId, user.id))
  return Response.json({ progress })
}

export async function POST(request: Request) {
  const user = await requireUser()
  const body = await request.json().catch(() => null)
  if (!body || typeof body.challengeId !== 'string' || typeof body.completed !== 'boolean') return jsonError('challengeId and completed are required')
  const [existing] = await db.select().from(challengeProgress).where(and(eq(challengeProgress.userId, user.id), eq(challengeProgress.challengeId, body.challengeId))).limit(1)
  const values = { status: body.completed ? 'completed' : 'active', progress: body.completed ? 100 : 0, completedAt: body.completed ? new Date() : null, updatedAt: new Date() }
  const [progress] = existing
    ? await db.update(challengeProgress).set(values).where(and(eq(challengeProgress.id, existing.id), eq(challengeProgress.userId, user.id))).returning()
    : await db.insert(challengeProgress).values({ id: requestId(), userId: user.id, challengeId: body.challengeId, ...values }).returning()
  return Response.json({ progress })
}
