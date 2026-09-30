import { db } from '@/lib/db'
import { calendarActivities, calendarInvites, user } from '@/lib/db/schema'
import { jsonError, requestId, requireUser } from '@/lib/api-auth'
import { and, eq, or } from 'drizzle-orm'

export async function GET(request: Request) {
  const current = await requireUser()
  const activityId = new URL(request.url).searchParams.get('activityId')
  if (!activityId) return jsonError('activityId is required')
  const [activity] = await db.select({ id: calendarActivities.id }).from(calendarActivities).where(and(eq(calendarActivities.id, activityId), eq(calendarActivities.userId, current.id))).limit(1)
  if (!activity) return jsonError('Event not found.', 404)
  const invites = await db.select({ id: calendarInvites.id, status: calendarInvites.status, email: calendarInvites.inviteeEmail, name: user.name }).from(calendarInvites).leftJoin(user, eq(calendarInvites.inviteeUserId, user.id)).where(eq(calendarInvites.activityId, activityId))
  return Response.json({ invites })
}

export async function POST(request: Request) {
  const current = await requireUser()
  const body = await request.json().catch(() => null)
  const activityId = typeof body?.activityId === 'string' ? body.activityId : ''
  const target = typeof body?.target === 'string' ? body.target.trim() : ''
  if (!activityId || !target) return jsonError('activityId and username or email are required')
  const [activity] = await db.select({ id: calendarActivities.id }).from(calendarActivities).where(and(eq(calendarActivities.id, activityId), eq(calendarActivities.userId, current.id))).limit(1)
  if (!activity) return jsonError('Event not found.', 404)
  const [invitee] = await db.select({ id: user.id, email: user.email }).from(user).where(or(eq(user.email, target), eq(user.name, target))).limit(1)
  const emailTarget = target.includes('@') ? target.toLowerCase() : null
  if (!invitee && !emailTarget) return jsonError('No account found. Use an exact username or email address.')
  const [invite] = await db.insert(calendarInvites).values({ id: requestId(), activityId, inviterUserId: current.id, inviteeUserId: invitee?.id ?? null, inviteeEmail: invitee?.email ?? emailTarget, status: 'pending' }).returning()
  return Response.json({ invite }, { status: 201 })
}

export async function PATCH(request: Request) {
  const current = await requireUser()
  const body = await request.json().catch(() => null)
  if (!body?.id || !['accepted', 'declined'].includes(body.status)) return jsonError('id and a valid status are required')
  const [invite] = await db.update(calendarInvites).set({ status: body.status, updatedAt: new Date() }).where(and(eq(calendarInvites.id, body.id), eq(calendarInvites.inviteeUserId, current.id))).returning()
  if (!invite) return jsonError('Invite not found.', 404)
  return Response.json({ invite })
}
