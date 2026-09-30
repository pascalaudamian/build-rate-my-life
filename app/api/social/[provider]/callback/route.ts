import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { dataConnections, dataSources } from '@/lib/db/schema'
import { requireUser, requestId } from '@/lib/api-auth'
import { exchangeCode, fetchProfile, isSocialProvider, oauthCookieName, safeProfile, verifyState } from '@/lib/social/providers'

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider: providerParam } = await context.params
  const destination = new URL('/dashboard?social=', request.url)
  if (!isSocialProvider(providerParam)) { destination.searchParams.set('social', 'error'); destination.searchParams.set('reason', 'unsupported'); return redirect(destination.toString()) }
  const provider = providerParam
  const url = new URL(request.url)
  if (url.searchParams.get('error') === 'access_denied') { destination.searchParams.set('social', 'cancelled'); return redirect(destination.toString()) }
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  const cookieStore = await cookies()
  const stored = cookieStore.get(oauthCookieName(provider))?.value
  if (!state || !code || !stored) { destination.searchParams.set('social', 'error'); destination.searchParams.set('reason', 'invalid_state'); return redirect(destination.toString()) }
  const [storedState, signature] = stored.split('.')
  if (storedState !== state || !signature || !verifyState(state, signature)) { destination.searchParams.set('social', 'error'); destination.searchParams.set('reason', 'invalid_state'); return redirect(destination.toString()) }
  try {
    const user = await requireUser()
    const token = await exchangeCode(provider, code)
    const profile = safeProfile(provider, await fetchProfile(provider, token.access_token))
    const [source] = await db.select({ id: dataSources.id }).from(dataSources).where(eq(dataSources.id, provider)).limit(1)
    const sourceId = source?.id ?? `social:${provider}`
    const [existing] = await db.select().from(dataConnections).where(and(eq(dataConnections.userId, user.id), eq(dataConnections.sourceId, sourceId))).limit(1)
    const metadata = { provider: profile.provider, accountName: profile.accountName, username: profile.username, avatarUrl: profile.avatarUrl, connectedAt: new Date().toISOString() }
    if (existing) await db.update(dataConnections).set({ status: 'connected', providerAccountId: profile.providerAccountId, metadata, updatedAt: new Date() }).where(and(eq(dataConnections.userId, user.id), eq(dataConnections.id, existing.id)))
    else await db.insert(dataConnections).values({ id: requestId(), userId: user.id, sourceId, status: 'connected', providerAccountId: profile.providerAccountId, metadata })
    cookieStore.delete(oauthCookieName(provider))
    destination.searchParams.set('social', 'connected'); destination.searchParams.set('provider', provider)
  } catch { destination.searchParams.set('social', 'error'); destination.searchParams.set('reason', 'connection_failed') }
  return redirect(destination.toString())
}
