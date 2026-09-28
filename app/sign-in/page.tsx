import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function SignInPage() {
  let session = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    // Keep the form available when a stale session or transient database failure occurs.
  }
  if (session?.user) redirect('/')
  return <AuthForm mode="sign-in" />
}
