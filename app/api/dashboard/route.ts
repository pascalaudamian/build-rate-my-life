import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api-auth'
import { dataConnections, dataSources, lifeReports } from '@/lib/db/schema'

export async function GET() {
  const user = await requireUser()
  const [report] = await db.select().from(lifeReports).where(eq(lifeReports.userId, user.id)).orderBy(desc(lifeReports.createdAt)).limit(1)
  const connections = await db.select({ id: dataConnections.id, status: dataConnections.status, source: dataSources.name, kind: dataSources.kind, updatedAt: dataConnections.updatedAt }).from(dataConnections).leftJoin(dataSources, eq(dataConnections.sourceId, dataSources.id)).where(eq(dataConnections.userId, user.id))
  return Response.json({ report: report ?? null, connections })
}
