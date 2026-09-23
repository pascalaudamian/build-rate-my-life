import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/api-auth'
import { feedPosts, feedReactions, lifeReports } from '@/lib/db/schema'

export async function GET() {
  const user = await requireUser()
  const posts = await db
    .select({ id: feedPosts.id, content: feedPosts.content, imageUrl: feedPosts.imageUrl, score: feedPosts.score, archetype: feedPosts.archetype, createdAt: feedPosts.createdAt, reactionCount: sql<number>`count(${feedReactions.id})::int` })
    .from(feedPosts)
    .leftJoin(feedReactions, eq(feedReactions.postId, feedPosts.id))
    .where(eq(feedPosts.userId, user.id))
    .groupBy(feedPosts.id)
    .orderBy(desc(feedPosts.createdAt))
    .limit(30)
  return Response.json({ posts })
}

export async function POST(request: Request) {
  const user = await requireUser()
  const body = await request.json() as { content?: string; imageUrl?: string; includeScore?: boolean; postId?: string; reaction?: string }
  if (body.postId) {
    await db.insert(feedReactions).values({ id: crypto.randomUUID(), userId: user.id, postId: body.postId, reaction: body.reaction === 'support' ? 'support' : 'support' })
    return Response.json({ ok: true })
  }
  const content = body.content?.trim()
  if (!content || content.length > 1000) return Response.json({ error: 'A story between 1 and 1000 characters is required.' }, { status: 400 })
  const [latestReport] = body.includeScore ? await db.select().from(lifeReports).where(eq(lifeReports.userId, user.id)).orderBy(desc(lifeReports.createdAt)).limit(1) : []
  const [post] = await db.insert(feedPosts).values({ id: crypto.randomUUID(), userId: user.id, content, imageUrl: body.imageUrl?.trim() || null, postType: body.imageUrl ? 'picture' : 'story', visibility: 'friends', score: latestReport?.score ?? null, archetype: latestReport?.archetype ?? null }).returning()
  return Response.json({ post }, { status: 201 })
}
