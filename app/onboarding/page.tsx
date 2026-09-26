'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronLeft, LockKeyhole, Music2, Upload, Image, Dumbbell, Bookmark, MessageCircle, WalletCards } from 'lucide-react'

const choices = [
  { label: 'Music', sourceId: 'spotify', description: 'Artists, genres, and listening activity.', icon: Music2 },
  { label: 'Calendar', sourceId: 'calendar', description: 'Event patterns, free time, and meeting density.', icon: CalendarDays },
  { label: 'Screenshots', sourceId: 'screenshot', description: 'Images you upload for pattern discovery.', icon: Image },
  { label: 'Photos', sourceId: 'photos', description: 'Visual themes from selected memories.', icon: Upload },
  { label: 'Spending', sourceId: 'spending', description: 'Only categories and patterns you choose.', icon: WalletCards },
  { label: 'Fitness', sourceId: 'fitness', description: 'Movement and activity patterns.', icon: Dumbbell },
  { label: 'Bookmarks', sourceId: 'bookmarks', description: 'Topics and rabbit holes you save.', icon: Bookmark },
  { label: 'Messages', sourceId: 'messages', description: 'Communication patterns, never message content.', icon: MessageCircle },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const toggle = (sourceId: string) => setSelected((items) => items.includes(sourceId) ? items.filter((value) => value !== sourceId) : [...items, sourceId])
  const connectSelectedSources = async () => {
    setIsConnecting(true)
    setError('')
    try {
      const results = await Promise.all(selected.map((sourceId) => fetch('/api/data-sources', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sourceId }) })))
      if (results.some((response) => !response.ok)) throw new Error('Some sources could not be connected.')
      window.location.assign('/dashboard')
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : 'We could not connect your sources.')
    } finally { setIsConnecting(false) }
  }

  return <main className="onboarding-shell"><header className="onboarding-nav"><Link href="/" className="brand"><span className="brand-mark">R</span><span>Rate My Life</span></Link><span>Step {step} of 3</span></header><div className="onboarding-progress"><i style={{ width: `${step * 33.33}%` }} /></div><section className="onboarding-card">
    {step === 1 && <><span className="landing-eyebrow">NICE TO MEET YOU</span><h1>What should we<br /><em>call you?</em></h1><p>A first name is all we need to make your report feel like yours.</p><label>First name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Damian" /></label><button className="primary-button" onClick={() => setStep(2)} disabled={!name.trim()}>Continue <ArrowRight size={17} /></button></>}
    {step === 2 && <><span className="landing-eyebrow">YOUR STORY, YOUR CHOICE</span><h1>Choose your<br /><em>data sources.</em></h1><p>Select the sources you want to connect now. You can change these choices anytime from Data sources.</p><div className="choice-grid source-choice-grid">{choices.map(({ label, sourceId, description, icon: Icon }) => <button className={`choice source-choice ${selected.includes(sourceId) ? 'selected' : ''}`} key={sourceId} onClick={() => toggle(sourceId)}><span className="choice-leading">{selected.includes(sourceId) ? <Check size={16} /> : <Icon size={16} />}</span><span><strong>{label}</strong><small>{description}</small></span></button>)}</div><div className="onboarding-actions"><button className="back-button" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button><button className="primary-button" onClick={() => setStep(3)} disabled={!selected.length}>Continue <ArrowRight size={17} /></button></div></>}
    {step === 3 && <><span className="landing-eyebrow">READY WHEN YOU ARE</span><h1>Connect your<br /><em>chosen sources.</em></h1><p>We&apos;ll create a private connection for each source you selected. External authorization or uploads happen next, and nothing is analyzed without your permission.</p><div className="selected-source-summary">{selected.map((sourceId) => <div key={sourceId}><Check size={15} /><span>{choices.find((choice) => choice.sourceId === sourceId)?.label}</span><small>Ready to connect</small></div>)}</div>{error && <p className="form-error" role="alert">{error}</p>}<div className="onboarding-actions"><button className="back-button" onClick={() => setStep(2)}><ChevronLeft size={16} /> Change choices</button><button className="primary-button" onClick={connectSelectedSources} disabled={isConnecting}>{isConnecting ? 'Connecting...' : 'Connect sources'} <ArrowRight size={17} /></button></div><p className="onboarding-trust"><LockKeyhole size={14} /> Your choices stay private and can be removed anytime.</p></>}
  </section></main>
}
