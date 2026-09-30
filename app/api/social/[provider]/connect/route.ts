import { cookies } from 'next/headers'
import { requireUser, jsonError } from '@/lib/api-auth'
import { authorizeUrl, hashState, isSocialProvider, oauthCookieName, socialProviderConfig, stateSignature } from '@/lib/social/providers'

export async function POST(_: Request, context: { params: Promise<{ provider: string }> }) {
  await requireUser()
  const { provider: providerParam } = await context.params
  if (!isSocialProvider(providerParam)) return jsonError('Unsupported social provider', 404)
  const config = socialProviderConfig(providerParam)
  if (!config.configured) return jsonError('This provider is not configured yet', 503)
  const state = hashState(crypto.randomUUID() + crypto.randomUUID())
  const signature = stateSignature(state)
  const cookieStore = await cookies()
  cookieStore.set(oauthCookieName(providerParam), `${state}.${signature}`, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: `/api/social/${providerParam}` })
  return Response.json({ authorizationUrl: authorizeUrl(providerParam, state) })
}
