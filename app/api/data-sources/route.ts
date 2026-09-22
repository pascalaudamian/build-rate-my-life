import { db } from '@/lib/db'
import { dataConnections, dataSources } from '@/lib/db/schema'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'
import { eq } from 'drizzle-orm'

export async function GET() {
  const user = await requireUser()
  const sources = await db.select().from(dataSources)
  const connections = await db.select().from(dataConnections).where(eq(dataConnections.userId, user.id))
  return Response.json({ sources, connections })
}

export async function POST(request: Request) {
  const user = await requireUser()
  const body = await request.json().catch(() => null)
  if (!body || typeof body.sourceId !== 'string' || body.sourceId.length > 120) return jsonError('sourceId is required')
  const [connection] = await db.insert(dataConnections).values({ id: requestId(), userId: user.id, sourceId: body.sourceId, status: 'connected', metadata: {} }).returning()
  return Response.json({ connection }, { status: 201 })
}
