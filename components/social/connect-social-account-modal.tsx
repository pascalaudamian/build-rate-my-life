'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Globe2, Link2, Loader2, Music2, ShieldCheck, X } from 'lucide-react'

type Provider = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube'
type Connection = { id: string; provider: string; accountName?: string | null; username?: string | null; avatarUrl?: string | null; status?: string }
type Props = { open: boolean; onOpenChange: (open: boolean) => void; onConnected?: (connection: Connection) => void; providers?: Provider[]; connections?: Connection[] }

const configs: Record<Provider, { name: string; description: string; icon: typeof Globe2; configured: boolean }> = {
  facebook: { name: 'Facebook', description: 'Connect your Facebook account', icon: Globe2, configured: true },
  instagram: { name: 'Instagram', description: 'Connect your Instagram account', icon: Globe2, configured: false },
  linkedin: { name: 'LinkedIn', description: 'Connect your LinkedIn account', icon: Link2, configured: false },
  x: { name: 'X', description: 'Connect your X account', icon: X, configured: false },
  youtube: { name: 'YouTube', description: 'Connect your YouTube channel', icon: Globe2, configured: true },
}

export function ConnectSocialAccountModal({ open, onOpenChange, onConnected, providers = ['facebook', 'instagram', 'linkedin', 'x', 'youtube'], connections = [] }: Props) {
  const [selected, setSelected] = useState<Provider | null>(null)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'error'>('idle')
  const [error, setError] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)
  const existing = selected ? connections.find((connection) => connection.provider === selected && connection.status !== 'disconnected') : undefined
  useEffect(() => { if (!open) { setSelected(null); setStatus('idle'); setError(''); return }; closeRef.current?.focus() }, [open])
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && status !== 'connecting') onOpenChange(false) }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [open, status, onOpenChange])
  if (!open) return null
  const config = selected ? configs[selected] : null
  const connect = async () => {
    if (!selected || !config?.configured || existing) return
    setStatus('connecting'); setError('')
    try { const response = await fetch(`/api/social/${selected}/connect`, { method: 'POST' }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error ?? 'Unable to start connection'); window.location.assign(body.authorizationUrl) } catch (caught) { setStatus('error'); setError(caught instanceof Error ? caught.message : 'Unable to connect. Please try again.') }
  }
  return <div className="social-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && status !== 'connecting') onOpenChange(false) }}><section className="social-modal" role="dialog" aria-modal="true" aria-labelledby="social-modal-title"><div className="social-modal-header"><div><span className="landing-eyebrow">SOCIAL SIGNALS</span><h2 id="social-modal-title">{config ? `Connect ${config.name}` : 'Connect your social accounts'}</h2><p>{config ? config.description + ' to bring your digital life into Rate My Life.' : 'Connect your accounts to bring your digital life into Rate My Life.'}</p></div><button ref={closeRef} className="connect-dialog-close" onClick={() => onOpenChange(false)} disabled={status === 'connecting'} aria-label="Close dialog"><X size={17} /></button></div>{config ? <div className="social-confirmation"><button className="social-back" onClick={() => setSelected(null)} disabled={status === 'connecting'}><ArrowLeft size={15} /> All providers</button><div className="social-selected"><span className="social-provider-icon"><config.icon size={22} /></span><div><strong>{config.name}</strong><span>{config.description}</span></div></div>{existing ? <div className="social-success"><Check size={20} /><div><strong>Already connected</strong><p>{existing.accountName ?? config.name}</p></div></div> : <><div className="social-permission"><ShieldCheck size={18} /><div><strong>Why do we need access?</strong><p>Rate My Life uses permitted account information to generate your Life Score and insights. Your password is never entered here.</p></div></div>{status === 'error' && <div className="social-error" role="alert">{error}</div>}<button className="social-continue" onClick={connect} disabled={status === 'connecting'}>{status === 'connecting' ? <><Loader2 className="spin" size={16} /> Connecting securely…</> : <>Continue with {config.name} <ArrowRight size={16} /></>}</button>{!config.configured && <p className="social-coming">Configuration required before this provider can connect.</p>}</>}</div> : <div className="social-provider-list">{providers.map((provider) => { const item = configs[provider]; const Icon = item.icon; const connected = connections.some((connection) => connection.provider === provider && connection.status !== 'disconnected'); return <button className="social-provider-card" key={provider} onClick={() => setSelected(provider)}><span className="social-provider-icon"><Icon size={20} /></span><span><strong>{item.name}</strong><small>{connected ? `Connected as ${connections.find((connection) => connection.provider === provider)?.accountName ?? 'account'}` : item.description}</small></span>{connected ? <Check className="social-card-check" size={17} aria-label="Connected" /> : <ArrowRight size={17} />}</button> })}</div>}<div className="social-modal-footer"><ShieldCheck size={14} /> You stay in control. Connections are private by default.</div></section></div>
}
