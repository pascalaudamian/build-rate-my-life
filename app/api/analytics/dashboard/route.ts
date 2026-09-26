import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { analyticsEvents } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-auth'

export async function GET() {
  try {
    const user = await requireUser()
    const [events, daily, sources] = await Promise.all([
      db.select({ event: analyticsEvents.event, count: sql<number>`count(*)` }).from(analyticsEvents).where(sql`"userId" = ${user.id} OR "userId" IS NULL`).groupBy(analyticsEvents.event),
      db.execute(sql`SELECT COUNT(DISTINCT "userId") FILTER (WHERE "userId" IS NOT NULL) AS active_users, COUNT(*) FILTER (WHERE "createdAt" >= now() - interval '30 days') AS events_30d FROM analytics_events`),
      db.execute(sql`SELECT COUNT(*) AS connected_sources FROM data_connections WHERE "userId" = ${user.id} AND status = 'connected'`),
    ])
    const byEvent = Object.fromEntries(events.map((row) => [row.event, Number(row.count)]))
    const dailyRow = (daily as unknown as Array<{ active_users?: number | string; events_30d?: number | string }>)[0] ?? {}
    const activeUsers = Number(dailyRow.active_users ?? 0)
    const events30d = Number(dailyRow.events_30d ?? 0)
    const connectedSources = Number((sources as unknown as Array<{ connected_sources?: number | string }>)[0]?.connected_sources ?? 0)
    const activationRate = byEvent.signup ? Math.round(((byEvent.onboarding_completed ?? 0) / byEvent.signup) * 100) : 0
    const reportCompletionRate = byEvent.report_started ? Math.round(((byEvent.report_completed ?? 0) / byEvent.report_started) * 100) : 0
    const shareRate = byEvent.report_completed ? Math.round(((byEvent.report_shared ?? 0) / byEvent.report_completed) * 100) : 0
    const referralConversion = byEvent.friend_invited ? Math.round(((byEvent.friend_joined ?? 0) / byEvent.friend_invited) * 100) : 0
    return NextResponse.json({ metrics: { activationRate, reportCompletionRate, shareRate, referralConversion, d1Retention: 0, d7Retention: 0, d30Retention: 0, monthlyReports: byEvent.report_completed ?? 0, averageConnectedSources: connectedSources, activeUsers, events30d }, events: byEvent })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('[v0] Analytics dashboard failed:', error)
    return NextResponse.json({ error: 'Unable to load analytics' }, { status: 503 })
  }
}
