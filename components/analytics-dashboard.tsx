'use client'

import useSWR from 'swr'
import { Activity, ArrowUpRight, BarChart3, Users } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
const cards = [
  ['activationRate', 'Activation rate', 'signup → onboarding complete'],
  ['reportCompletionRate', 'Report completion', 'report started → completed'],
  ['shareRate', 'Share rate', 'completed reports shared'],
  ['referralConversion', 'Referral conversion', 'invites → friends joined'],
  ['d1Retention', 'D1 retention', 'returning the next day'],
  ['d7Retention', 'D7 retention', 'returning after one week'],
  ['d30Retention', 'D30 retention', 'returning after one month'],
  ['monthlyReports', 'Monthly reports', 'completed in the event stream'],
  ['averageConnectedSources', 'Connected sources', 'currently connected'],
] as const

export function AnalyticsDashboard() {
  const { data, isLoading } = useSWR('/api/analytics/dashboard', fetcher)
  const metrics = data?.metrics
  return <div className="content-wrap analytics-page"><section className="analytics-hero"><div><p className="eyebrow">PRODUCT ANALYTICS</p><h1>Measure the moments<br /><em>that create value.</em></h1><p className="welcome-copy">A decision dashboard for activation, trust, retention, and growth.</p></div><div className="analytics-summary"><Activity size={18} /><strong>{metrics?.activeUsers ?? '—'}</strong><span>active users recorded</span></div></section><section className="analytics-grid">{cards.map(([key, label, detail]) => <article className="analytics-metric card-surface" key={key}><span>{label}</span><strong>{isLoading ? '—' : key.includes('Rate') || key.includes('Retention') ? `${metrics?.[key] ?? 0}%` : metrics?.[key] ?? 0}</strong><small>{detail}</small></article>)}</section><section className="analytics-events card-surface"><div className="section-label"><span className="label-icon"><BarChart3 size={15} /></span><span>EVENT FUNNEL</span></div><div className="analytics-funnel">{Object.entries(data?.events ?? {}).map(([event, value]) => <div key={event}><span>{event.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div></section><p className="analytics-note"><Users size={14} /> Retention is shown as zero until the event history contains enough dated cohorts. This prevents presenting invented retention numbers.</p></div>
}
