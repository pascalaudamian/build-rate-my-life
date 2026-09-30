import { db } from '@/lib/db'
import { calendarActivities } from '@/lib/db/schema'
import { requireUser, jsonError, requestId } from '@/lib/api-auth'
import { and, asc, eq, gte, lt } from 'drizzle-orm'

function parseDate(value: unknown) { if (typeof value !== 'string') return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date }

export async function GET(request: Request) {
  const user = await requireUser(); const month = new URL(request.url).searchParams.get('month') ?? new Date().toISOString().slice(0, 7); const start = new Date(`${month}-01T00:00:00.000Z`); const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1)
  if (Number.isNaN(start.getTime())) return jsonError('Invalid month.')
  const activities = await db.select().from(calendarActivities).where(and(eq(calendarActivities.userId, user.id), gte(calendarActivities.startsAt, start), lt(calendarActivities.startsAt, end))).orderBy(asc(calendarActivities.startsAt)); return Response.json({ activities })
}

export async function POST(request: Request) {
  const user = await requireUser(); const body = await request.json().catch(() => null); const startsAt = parseDate(body?.startsAt); const endsAt = parseDate(body?.endsAt)
  if (!body || typeof body.title !== 'string' || !body.title.trim() || !startsAt || !endsAt) return jsonError('title, startsAt, and endsAt are required'); if (endsAt <= startsAt) return jsonError('End time must be after start time.')
  const [activity] = await db.insert(calendarActivities).values({ id: requestId(), userId: user.id, title: body.title.trim().slice(0, 160), description: typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null, startsAt, endsAt, source: 'manual' }).returning(); return Response.json({ activity }, { status: 201 })
}

export async function PUT(request: Request) {
  const user = await requireUser(); const body = await request.json().catch(() => null); const startsAt = parseDate(body?.startsAt); const endsAt = parseDate(body?.endsAt)
  if (typeof body?.id !== 'string' || typeof body.title !== 'string' || !body.title.trim() || !startsAt || !endsAt) return jsonError('id, title, startsAt, and endsAt are required'); if (endsAt <= startsAt) return jsonError('End time must be after start time.')
  const [activity] = await db.update(calendarActivities).set({ title: body.title.trim().slice(0, 160), description: typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null, startsAt, endsAt, updatedAt: new Date() }).where(and(eq(calendarActivities.id, body.id), eq(calendarActivities.userId, user.id))).returning(); if (!activity) return jsonError('Event not found.', 404); return Response.json({ activity })
}

export async function DELETE(request: Request) {
  const user = await requireUser(); const id = new URL(request.url).searchParams.get('id'); if (!id) return jsonError('id is required'); const [activity] = await db.delete(calendarActivities).where(and(eq(calendarActivities.id, id), eq(calendarActivities.userId, user.id))).returning({ id: calendarActivities.id }); if (!activity) return jsonError('Event not found.', 404); return Response.json({ deleted: true, id: activity.id })
}
