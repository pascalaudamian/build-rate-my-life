'use client'

import { useState } from 'react'
import { CalendarDays, Check, ExternalLink, Image, Music2, X } from 'lucide-react'

type Source = { id: string; label: string; description: string }

export function ConnectDialog({ source, onClose, onConnected }: { source: Source; onClose: () => void; onConnected: () => void }) {
  const [connecting, setConnecting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('')
  const methods = source.id === 'spotify' ? [{ id: 'spotify', label: 'Spotify account', description: 'Import artists, genres, and listening activity.', icon: Music2 }] : source.id === 'calendar' ? [{ id: 'google-calendar', label: 'Google Calendar', description: 'Import event patterns and free-time signals.', icon: CalendarDays }, { id: 'apple-calendar', label: 'Apple Calendar export', description: 'Upload an .ics file from your calendar app.', icon: CalendarDays }] : [{ id: 'upload', label: 'Upload selected data', description: 'Choose an export or file you want to analyze.', icon: Image }]
  const connect = async () => { setConnecting(true); try { const response = await fetch('/api/data-sources', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sourceId: source.id, provider: selectedMethod }) }); if (!response.ok) throw new Error('Connection failed'); onConnected() } finally { setConnecting(false) } }
  return <div className="connect-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="connect-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-dialog-title"><div className="connect-dialog-header"><div><span className="landing-eyebrow">CONNECT SOURCE</span><h2 id="connect-dialog-title">Connect {source.label}</h2><p>{source.description} Choose how you want to bring this signal into your private report.</p></div><button className="connect-dialog-close" onClick={onClose} aria-label="Close dialog"><X size={17} /></button></div><div className="connect-options">{methods.map((method) => { const Icon = method.icon; return <button className={`connect-option ${selectedMethod === method.id ? 'selected' : ''}`} key={method.id} onClick={() => setSelectedMethod(method.id)}><span className="connect-option-icon"><Icon size={18} /></span><span><strong>{method.label}</strong><small>{method.description}</small></span>{selectedMethod === method.id ? <Check size={17} /> : <ExternalLink size={15} />}</button> })}</div><div className="connect-dialog-footer"><button className="cancel" onClick={onClose}>Cancel</button><button className="confirm" onClick={connect} disabled={!selectedMethod || connecting}>{connecting ? 'Connecting…' : 'Continue securely'}</button></div></section></div>
}
