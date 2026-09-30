export const socialProviders = {
  facebook: { name: 'Facebook', description: 'Connect your Facebook account', kind: 'social', configured: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET), scopes: ['public_profile', 'email'] },
  instagram: { name: 'Instagram', description: 'Connect your Instagram account', kind: 'social', configured: false, scopes: [] },
  linkedin: { name: 'LinkedIn', description: 'Connect your LinkedIn account', kind: 'social', configured: false, scopes: [] },
  x: { name: 'X', description: 'Connect your X account', kind: 'social', configured: false, scopes: [] },
  youtube: { name: 'YouTube', description: 'Connect your YouTube channel', kind: 'social', configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), scopes: ['openid', 'email', 'profile'] },
} as const

export type SocialProvider = keyof typeof socialProviders

export function isSocialProvider(value: string): value is SocialProvider {
  return value in socialProviders
}

export function socialProviderConfig(provider: SocialProvider) {
  return socialProviders[provider]
}

export function providerFromOAuth(provider: SocialProvider) {
  return provider === 'youtube' ? 'google' : provider
}

export function callbackUrl(provider: SocialProvider) {
  const base = process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return `${base.replace(/\/$/, '')}/api/social/${provider}/callback`
}

export function authorizeUrl(provider: SocialProvider, state: string) {
  const config = socialProviderConfig(provider)
  const clientId = provider === 'youtube' ? process.env.GOOGLE_CLIENT_ID : process.env.FACEBOOK_CLIENT_ID
  const redirectUri = encodeURIComponent(callbackUrl(provider))
  const scope = encodeURIComponent(config.scopes.join(' '))
  if (provider === 'facebook') return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(clientId ?? '')}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}&scope=${scope}`
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId ?? '')}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}&scope=${scope}`
}

export function secretFor(provider: SocialProvider) {
  return provider === 'youtube' ? process.env.GOOGLE_CLIENT_SECRET : process.env.FACEBOOK_CLIENT_SECRET
}

export function clientIdFor(provider: SocialProvider) {
  return provider === 'youtube' ? process.env.GOOGLE_CLIENT_ID : process.env.FACEBOOK_CLIENT_ID
}

export function tokenUrl(provider: SocialProvider) {
  return provider === 'facebook' ? 'https://graph.facebook.com/v20.0/oauth/access_token' : 'https://oauth2.googleapis.com/token'
}

export function profileUrl(provider: SocialProvider, token: string) {
  return provider === 'facebook' ? `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(token)}` : 'https://www.googleapis.com/oauth2/v2/userinfo'
} 

export function providerLabel(provider: SocialProvider) {
  return socialProviderConfig(provider).name
}

export function oauthCookieName(provider: SocialProvider) {
  return `social_oauth_${provider}`
}

export function makeState() {
  return crypto.randomUUID() + crypto.randomUUID()
}

export function hashState(state: string) {
  return crypto.createHash('sha256').update(state).digest('hex')
}
import crypto from 'node:crypto'
export function stateSignature(state: string) { return crypto.createHmac('sha256', process.env.BETTER_AUTH_SECRET ?? 'development-only').update(state).digest('hex') }
export function verifyState(state: string, signature: string) { return crypto.timingSafeEqual(Buffer.from(stateSignature(state)), Buffer.from(signature)) }

export async function exchangeCode(provider: SocialProvider, code: string) {
  const redirect_uri = callbackUrl(provider)
  const body = provider === 'facebook'
    ? new URLSearchParams({ client_id: clientIdFor(provider) ?? '', client_secret: secretFor(provider) ?? '', redirect_uri, code })
    : new URLSearchParams({ client_id: clientIdFor(provider) ?? '', client_secret: secretFor(provider) ?? '', redirect_uri, code, grant_type: 'authorization_code' })
  const response = await fetch(tokenUrl(provider), { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store' })
  if (!response.ok) throw new Error('OAuth token exchange failed')
  return response.json() as Promise<{ access_token: string; expires_in?: number }>
}

export async function fetchProfile(provider: SocialProvider, accessToken: string) {
  const response = await fetch(profileUrl(provider, accessToken), { headers: provider === 'youtube' ? { Authorization: `Bearer ${accessToken}` } : undefined, cache: 'no-store' })
  if (!response.ok) throw new Error('OAuth profile lookup failed')
  return response.json() as Promise<{ id: string; name?: string; email?: string; picture?: { data?: { url?: string } }; pictureUrl?: string }>
}

export function safeProfile(provider: SocialProvider, profile: { id: string; name?: string; email?: string; picture?: { data?: { url?: string } }; pictureUrl?: string }) {
  return { provider, providerAccountId: profile.id, accountName: profile.name ?? profile.email ?? providerLabel(provider), username: profile.email ?? null, avatarUrl: profile.picture?.data?.url ?? profile.pictureUrl ?? null }
}
