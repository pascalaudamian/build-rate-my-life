import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Response('Unauthorized', { status: 401 })
  return session.user
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export function requestId() { return crypto.randomUUID() }
