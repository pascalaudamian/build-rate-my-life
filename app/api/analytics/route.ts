'use server'

import { db } from '@/lib/db'
import { analyticsEvents } from '@/lib/db/schema'
import { jsonError, requireUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

const allowedEvents = new Set([
  'signup', 'onboarding_started', 'onboarding_completed', 'data_source_connected',
  'data_uploaded', 'report_started', 'report_completed', 'report_shared', 'share_viewed',
  'friend_invited', 'friend_joined', 'comparison_created', 'challenge_started',
  'challenge_completed', 'subscription_started', 'subscription_cancelled',
])

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()
    if (!body || typeof body.event !== 'string' || !allowedEvents.has(body.event)) return jsonError('Unsupported analytics event')
    const properties = body.properties && typeof body.properties === 'object' ? body.properties : {}
    await db.insert(analyticsEvents).values({ id: crypto.randomUUID(), userId: user.id, event: body.event, properties })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('[v0] Analytics event failed:', error)
    return jsonError('We could not record that event. Try again.', 503)
  }
}
