import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shareEvents } from '@/lib/db/schema'
import { randomUUID } from 'crypto'

const allowedEvents = new Set(['share_created', 'share_viewed', 'referral_clicked', 'signup_started', 'signup_completed', 'report_generated', 'friend_connected', 'comparison_created'])

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.event !== 'string' || !allowedEvents.has(body.event)) return NextResponse.json({ error: 'Invalid referral event' }, { status: 400 })
  await db.insert(shareEvents).values({ id: randomUUID(), event: body.event, shareCode: typeof body.shareCode === 'string' ? body.shareCode.slice(0, 80) : null, referrerUserId: typeof body.referrerUserId === 'string' ? body.referrerUserId.slice(0, 80) : null, referralCode: typeof body.referralCode === 'string' ? body.referralCode.slice(0, 80) : null, source: typeof body.source === 'string' ? body.source.slice(0, 80) : null, campaign: typeof body.campaign === 'string' ? body.campaign.slice(0, 80) : null })
  return NextResponse.json({ ok: true })
}
