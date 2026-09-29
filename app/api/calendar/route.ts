import { db } from '@/lib/db'
import { calendarActivities } from '@/lib/db/schema'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'
import { and, asc, eq, gte, lt } from 'drizzle-orm'

export async function GET(request: Request) { const user = await requireUser(); const month = new URL(request.url).searchParams.get('month') ?? new Date().toISOString().slice(0, 7); const start = new Date(`${month}-01T00:00:00.000Z`); const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1); const activities = await db.select().from(calendarActivities).where(and(eq(calendarActivities.userId, user.id), gte(calendarActivities.startsAt, start), lt(calendarActivities.startsAt, end))).orderBy(asc(calendarActivities.startsAt)); return Response.json({ activities }) }

export async function POST(request: Request) { const user = await requireUser(); const body = await request.json().catch(() => null); if (!body || typeof body.title !== 'string' || !body.title.trim() || typeof body.startsAt !== 'string' || typeof body.endsAt !== 'string') return jsonError('title, startsAt, and endsAt are required'); const [activity] = await db.insert(calendarActivities).values({ id: requestId(), userId: user.id, title: body.title.trim().slice(0, 160), description: typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null, startsAt: new Date(body.startsAt), endsAt: new Date(body.endsAt), source: typeof body.source === 'string' ? body.source.slice(0, 80) : 'manual' }).returning(); return Response.json({ activity }, { status: 201 }) }
