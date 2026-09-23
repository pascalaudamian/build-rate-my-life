import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { lifeReports } from '@/lib/db/schema'
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function ReportPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const [report] = await db.select().from(lifeReports).where(eq(lifeReports.userId, session.user.id)).orderBy(desc(lifeReports.createdAt)).limit(1)
  const dimensions = report?.dimensions && typeof report.dimensions === 'object' ? Object.entries(report.dimensions as Record<string, unknown>) : []
  return <main className="standalone-report"><header className="report-header"><Link href="/dashboard" className="brand"><span className="brand-mark">R</span><span>Rate My Life</span></Link><span className="privacy-badge"><LockKeyhole size={13} /> Private report</span></header><section className="standalone-report-hero"><span className="eyebrow">YOUR LIFE REPORT</span><h1>{report ? <>A clearer view of<br /><em>your patterns.</em></> : <>Your first report<br /><em>starts here.</em></>}</h1><p>{report ? 'A grounded snapshot of the signals you chose to share, designed to help you notice what is already working.' : 'Connect a source and we will turn your everyday signals into a thoughtful, private report.'}</p></section>{report ? <><section className="standalone-score-card"><div><span className="eyebrow">LIFE SCORE</span><strong>{report.score}</strong><span>out of 100</span></div><div><span className="eyebrow">YOUR ARCHETYPE</span><h2>{report.archetype}</h2><p>Routine by day. Room for a plot twist.</p></div></section><section className="standalone-breakdown"><div><span className="eyebrow">THE BREAKDOWN</span><h2>Every score has a story.</h2></div><div className="standalone-dimensions">{dimensions.map(([label, value]) => <div key={label}><span>{label.replace(/([A-Z])/g, ' $1')}</span><div className="progress-track"><i style={{ width: `${Number(value)}%` }} /></div><strong>{String(value)}</strong></div>)}</div></section><div className="standalone-cta"><Sparkles size={18} /><p>Want a sharper story? Generate a grounded insight from this report.</p><Link href="/dashboard">Explore report <ArrowRight size={15} /></Link></div></> : <div className="standalone-empty"><Sparkles size={28} /><h2>Your signals are waiting.</h2><p>Start with Spotify, Calendar, or a screenshot. You can disconnect everything whenever you choose.</p><Link href="/onboarding" className="primary-button">Start onboarding <ArrowRight size={16} /></Link></div>}</main>
}
