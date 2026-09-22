import { db } from '@/lib/db'
import { challenges } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-auth'

export async function GET() {
  await requireUser()
  return Response.json({ challenges: await db.select().from(challenges) })
}
