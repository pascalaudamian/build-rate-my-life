'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Check, ExternalLink, Globe2, Link2, Music2, RefreshCw, Unplug, Youtube } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
const providers = [
  { id: 'facebook', label: 'Facebook', description: 'Pages and permitted engagement signals.', icon: Globe2, auth: 'facebook' as const },
  { id: 'instagram', label: 'Instagram', description: 'Business profile and permitted activity.', icon: Globe2 },
  { id: 'linkedin', label: 'LinkedIn', description: 'Professional interests and learning themes.', icon: Link2 },
  { id: 'x', label: 'X', description: 'Public conversations and topics you choose.', icon: ExternalLink },
  { id: 'youtube', label: 'YouTube', description: 'Watch themes and channel activity.', icon: Globe2 },
  { id: 'spotify', label: 'Spotify', description: 'Artists, genres, and listening activity.', icon: Music2 },
]

export function ConnectedAccounts() {
  const { data, mutate } = useSWR('/api/data-sources', fetcher)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const connections = data?.connections ?? []
  const connectionFor = (id: string) => connections.find((connection: { sourceId: string; status: string }) => connection.sourceId === `social:${id}` && connection.status !== 'disconnected')
  const connect = async (provider: typeof providers[number]) => {
    setBusy(provider.id); setMessage('')
    try {
      if (provider.auth) {
        const result = await authClient.signIn.social({ provider: provider.auth, callbackURL: '/settings#sources' })
        if (result.error) throw new Error('oauth')
      } else {
        const response = await fetch('/api/data-sources', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sourceId: `social:${provider.id}`, provider: provider.id }) })
        if (!response.ok) throw new Error('connect')
        await mutate()
        setMessage(`${provider.label} connection is ready for authorization.`)
      }
    } catch { setMessage(`We could not start the ${provider.label} connection. Please try again.`) } finally { setBusy('') }
  }
  const disconnect = async (connectionId: string, label: string) => {
    setBusy(connectionId); setMessage('')
    try { const response = await fetch('/api/data-sources', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ connectionId }) }); if (!response.ok) throw new Error('disconnect'); await mutate(); setMessage(`${label} disconnected.`) } catch { setMessage(`We could not disconnect ${label}. Please try again.`) } finally { setBusy('') }
  }
  return <section className="settings-section connected-accounts" aria-labelledby="connected-accounts-title"><div className="section-heading"><div><span className="section-icon"><Unplug size={18} /></span><h2 id="connected-accounts-title">Connected accounts</h2><p>Connect social accounts with official authorization. Passwords and tokens never appear here.</p></div></div><div className="connected-account-list">{providers.map((provider) => { const Icon = provider.icon; const connection = connectionFor(provider.id); return <article className="connected-account-card" key={provider.id}><div className="connected-account-icon"><Icon size={19} /></div><div className="connected-account-copy"><strong>{provider.label}</strong><span>{connection ? <><Check size={13} /> Connected · {connection.metadata?.lastSyncedAt ? 'synced recently' : 'ready to sync'}</> : provider.description}</span></div>{connection ? <button className="account-action disconnect-action" disabled={busy === connection.id} onClick={() => disconnect(connection.id, provider.label)}>{busy === connection.id ? 'Disconnecting...' : 'Disconnect'}</button> : <button className="account-action" disabled={busy === provider.id} onClick={() => connect(provider)}>{busy === provider.id ? 'Connecting...' : 'Connect'} <ExternalLink size={13} /></button>}</article> })}</div>{message && <p className="connected-account-status" role="status">{message}</p>}<p className="connected-account-note"><RefreshCw size={14} /> Connections are scoped to your account and can be disconnected at any time.</p></section>
}
