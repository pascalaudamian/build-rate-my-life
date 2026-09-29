import { count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api-auth'
import { dataConnections, dataSources, lifeReports, insights } from '@/lib/db/schema'

export async function GET() {
  const user = await requireUser()
  const [report] = await db.select().from(lifeReports).where(eq(lifeReports.userId, user.id)).orderBy(desc(lifeReports.createdAt)).limit(1)
  const [previousReport] = await db.select().from(lifeReports).where(eq(lifeReports.userId, user.id)).orderBy(desc(lifeReports.createdAt)).limit(2).offset(1)
  const [{ reports }] = await db.select({ reports: count() }).from(lifeReports).where(eq(lifeReports.userId, user.id))
  const connections = await db.select({ id: dataConnections.id, status: dataConnections.status, source: dataSources.name, kind: dataSources.kind, updatedAt: dataConnections.updatedAt }).from(dataConnections).leftJoin(dataSources, eq(dataConnections.sourceId, dataSources.id)).where(eq(dataConnections.userId, user.id))
  const recentInsights = await db.select({ id: insights.id, kind: insights.kind, content: insights.content, confidence: insights.confidence, createdAt: insights.createdAt }).from(insights).where(eq(insights.userId, user.id)).orderBy(desc(insights.createdAt)).limit(3)
  return Response.json({ report: report ?? null, previousReport: previousReport ?? null, reportCount: Number(reports), connections, insights: recentInsights })
}
