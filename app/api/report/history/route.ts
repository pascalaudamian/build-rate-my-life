import { db } from '@/lib/db'
import { lifeReports } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-auth'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const user = await requireUser()
  const reports = await db.select().from(lifeReports).where(eq(lifeReports.userId, user.id)).orderBy(desc(lifeReports.createdAt)).limit(24)
  return Response.json({ reports })
}
