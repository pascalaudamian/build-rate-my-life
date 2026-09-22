'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    setPending(false)
    if (result.error) {
      setError('We could not complete that request. Check your details and try again.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return <main className="auth-shell"><section className="auth-card"><div className="brand auth-brand"><span className="brand-mark">R</span><span>Rate My Life</span></div><p className="eyebrow">YOUR PRIVATE LIFE REPORT</p><h1>{isSignUp ? 'Start your report.' : 'Welcome back.'}</h1><p className="auth-copy">{isSignUp ? 'Create an account to keep your patterns, progress and reports in one private space.' : 'Sign in to pick up where your life left off.'}</p><form onSubmit={submit}>{isSignUp && <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Damian Smith" /></label>}{!isSignUp && <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}{isSignUp && <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}<label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={pending}>{pending ? 'Working...' : isSignUp ? 'Create private account' : 'Sign in'}</button></form><p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Rate My Life?'} <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create one'}</Link></p><p className="auth-privacy">Your data stays private by default. You can disconnect sources and delete your account at any time.</p></section></main>
}
