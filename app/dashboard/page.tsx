'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { generateLifeReport } from '@/lib/scoring-engine'
import { saveWeeklyPulse, startExperiment } from '@/app/actions/retention'
import { supportedSources } from '@/lib/life-report'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Compass,
  Database,
  FileImage,
  Flame,
  Gauge,
  Gift,
  Headphones,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Music2,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react'

const generatedReport = generateLifeReport({
  spotify: { uniqueArtists: 42, newArtists: 18, genres: 9, minutesListened: 1280 },
  calendar: { totalEvents: 31, completedEvents: 25, socialEvents: 8, travelDays: 3, freeHours: 42 },
  profile: { interests: ['design', 'travel', 'music'], goals: ['finish projects', 'meet friends'] },
})

const dimensionMeta = { curiosity: ['Curiosity', '#6f5cff', Compass], adventure: ['Adventure', '#fa6c4f', Compass], culture: ['Culture', '#f4b64a', Headphones], activity: ['Activity', '#46b1a4', Activity], productivity: ['Productivity', '#4a84e8', Target], financialDiscipline: ['Financial Discipline', '#7b68ee', Gauge], social: ['Social', '#e56ca2', Users], balance: ['Balance', '#37a98d', Gauge] } as const
const dimensions = Object.entries(generatedReport.scores).map(([key, score]) => { const [label, color, icon] = dimensionMeta[key as keyof typeof dimensionMeta]; return { label, score, color, icon } })

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Report', icon: Sparkles },
  { label: 'Monthly review', icon: CalendarDays },
  { label: 'Trends', icon: BarChart3 },
  { label: 'Challenges', icon: Target },
  { label: 'Weekly pulse', icon: Activity },
  { label: 'Experiments', icon: Zap },
  { label: 'Friends', icon: Users },
  { label: 'Life feed', icon: Share2 },
]

function ScoreRing({ size = 192, score }: { size?: number; score?: number | null }) {
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <div className="score-ring-inner">
        <span className="score-label">LIFE SCORE</span>
        <strong>{score ?? '—'}</strong>
        <span className="score-out-of">out of 100</span>
      </div>
    </div>
  )
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (item: string) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">R</span><span>Rate My Life</span></div>
      <div className="profile-mini"><div className="avatar">DS</div><div><strong>Damian Smith</strong><span>Personal space</span></div><ChevronRight size={15} /></div>
      <nav className="side-nav" aria-label="Primary navigation">
        <span className="nav-caption">YOUR LIFE</span>
        {navItems.map((item) => {
          const Icon = item.icon
          return <button key={item.label} className={`nav-item ${active === item.label ? 'active' : ''}`} onClick={() => onNavigate(item.label)}><Icon size={18} /><span>{item.label}</span>{item.label === 'My Report' && <span className="nav-dot" />}</button>
        })}
        <span className="nav-caption nav-caption-spaced">MANAGE</span>
        <button className="nav-item" onClick={() => onNavigate('Data sources')}><Database size={18} /><span>Data sources</span><span className="connected-count">2</span></button>
        <button className="nav-item" onClick={() => onNavigate('Settings')}><Settings size={18} /><span>Settings</span></button>
      </nav>
      <button className="privacy-card" onClick={() => window.location.assign('/methodology')}><div className="privacy-icon"><LockKeyhole size={16} /></div><div><strong>Your data, your rules.</strong><p>Only analyze what you choose to share.</p></div><ChevronRight size={15} /></button>
      <div className="sidebar-help"><CircleHelp size={16} /> Need a hand?</div>
    </aside>
  )
}

function Header({ active, onMenu }: { active: string; onMenu: () => void }) {
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><span /></button><div className="top-avatar">DS</div></div></header>
}

function SourceCard({ icon, title, detail, status, accent, onClick }: { icon: React.ReactNode; title: string; detail: string; status: string; accent: string; onClick: () => void }) {
  return <button className="source-card" onClick={onClick}><div className="source-icon" style={{ background: accent }}>{icon}</div><div className="source-copy"><strong>{title}</strong><span>{detail}</span></div><div className={`source-status ${status === 'Connected' ? 'connected' : ''}`}>{status === 'Connected' ? <Zap size={12} /> : <Plus size={14} />}{status}</div></button>
}

const fetcher = (url: string) => fetch(url).then((response) => response.json())

function Overview({ onNavigate, onShare }: { onNavigate: (item: string) => void; onShare: () => void }) {
  const { data, isLoading } = useSWR('/api/dashboard', fetcher)
  const liveScore = data?.report?.score ?? null
  const liveArchetype = data?.report?.archetype ?? null
  const connectedConnections = data?.connections?.filter((connection: { status: string }) => connection.status === 'connected') ?? []
  const connectedCount = connectedConnections.length
  const hasReport = Boolean(data?.report)
  const liveDimensions = hasReport ? Object.entries(data.report.dimensions as Record<string, number>).map(([key, score]) => { const [label, color, icon] = dimensionMeta[key as keyof typeof dimensionMeta]; return { label, score, color, icon } }) : []
  return <div className="content-wrap">
    <section className="welcome-row"><div><p className="eyebrow">Monday, September 23, 2026</p><h1>Good morning, Damian <Sparkles className="wave" size={20} /></h1><p className="welcome-copy">Your digital life has some explaining to do.</p></div><button className="primary-button" onClick={() => onNavigate('My Report')}><Sparkles size={17} /> View my report <ArrowUpRight size={16} /></button></section>
    <section className="hero-grid">
      <div className="score-card card-surface"><div className="card-kicker"><span>YOUR LIFE SCORE</span><button className="more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div><div className="score-main"><ScoreRing score={liveScore ?? undefined} /><div className="score-note">{hasReport ? <><div className="trend-pill"><ArrowUpRight size={14} /> Report ready</div><p>Your score is based on the sources you chose to share.</p></> : <><div className="trend-pill neutral-pill">No report yet</div><p>Connect a source and generate your first report to see grounded insights.</p></>}<button className="text-button" onClick={() => onNavigate('Trends')}>See what changed <ChevronRight size={15} /></button></div></div><div className="score-footer"><span><span className="status-dot" />{liveScore === null ? 'Connect a source to begin' : `Based on ${connectedCount} connected sources`}</span><button onClick={onShare}><Share2 size={15} /> Share score</button></div></div>
      <div className="archetype-card"><div className="archetype-orb"><Sparkles className="orb-star" size={37} /></div><div><span className="card-kicker light">YOUR ARCHETYPE</span><h2>{(liveArchetype ?? generatedReport.archetype.name).replace('The ', 'The ').replace(' ', '\u00a0').split('\u00a0').map((word, index) => <span key={index}>{word}{index === 0 ? <br /> : ' '}</span>)}</h2><p>{liveArchetype ? 'Your latest persisted report archetype.' : isLoading ? 'Loading your latest report.' : 'Generate your first report to discover your archetype.'}</p><button className="light-button" onClick={() => onNavigate('My Report')}>Explore your archetype <ArrowUpRight size={15} /></button></div></div>
    </section>
    <section className="section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h2>Your life dimensions</h2></div><button className="text-button" onClick={() => onNavigate('My Report')}>View full breakdown <ChevronRight size={15} /></button></section>
    <section className="dimension-grid">{(hasReport ? liveDimensions : []).map((item) => { const Icon = item.icon; return <div className="dimension-card card-surface" key={item.label}><div className="dimension-top"><div className="dimension-icon" style={{ color: item.color, background: `${item.color}18` }}><Icon size={17} /></div><span>{item.label}</span><strong>{item.score}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${item.score}%`, background: item.color }} /></div><span className="dimension-caption">{item.score > 85 ? 'A standout strength' : item.score > 75 ? 'Looking good' : 'Room to grow'}</span></div> })}</section>
    <section className="lower-grid"><div className="insight-card card-surface"><div className="section-label"><span className="label-icon"><Sparkles size={15} /></span><span>LATEST INSIGHT</span><span className="new-pill">NEW</span></div><blockquote>“You plan vacations like a military operation, then spend the first day looking for the best coffee shop.”</blockquote><div className="insight-bottom"><span>Based on your calendar and travel activity</span><button className="icon-button small" onClick={onShare} aria-label="Share insight"><Share2 size={16} /></button></div></div><div className="challenge-card card-surface"><div className="section-label"><span className="label-icon coral"><Flame size={15} /></span><span>UP NEXT</span></div><h3>Discover 5 new artists</h3><p>Explore outside your usual rotation and give your curiosity a little cardio.</p><div className="challenge-progress"><div className="mini-avatars"><span>1</span><span>2</span><span>3</span></div><span>2 of 5 artists</span><ChevronRight size={17} /></div></div></section>
    <section className="section-heading sources-heading"><div><p className="eyebrow">YOUR DATA, YOUR CHOICE</p><h2>Connected sources</h2></div><button className="text-button" onClick={() => onNavigate('Data sources')}>Manage sources <ChevronRight size={15} /></button></section>
    <section className="source-grid">{connectedConnections.length ? connectedConnections.slice(0, 3).map((connection: { id: string; source: string | null; updatedAt: string }) => <SourceCard key={connection.id} icon={<Database size={19} />} title={connection.source ?? 'Connected source'} detail={`Connection updated ${new Date(connection.updatedAt).toLocaleDateString()}`} status="Connected" accent="#dff4e9" onClick={() => onNavigate('Data sources')} />) : <div className="empty-source-state"><Database size={19} /><span>No sources connected yet. Start with one source you trust.</span></div>}<SourceCard icon={<FileImage size={19} />} title="Screenshots" detail="Add your first upload" status="Connect" accent="#fff0dc" onClick={() => onNavigate('Data sources')} /></section>
  </div>
}

function EvidenceDrawer() {
  const [open, setOpen] = useState(false)
  return <><button className="secondary-button evidence-toggle" onClick={() => setOpen(true)}><CircleHelp size={15} /> Explain this score</button>{open && <div className="evidence-drawer-backdrop" role="presentation" onClick={() => setOpen(false)}><aside className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close evidence"><X size={18} /></button><p className="eyebrow">SCORE EVIDENCE</p><h2 id="evidence-title">What shaped your report?</h2><p className="drawer-intro">These are the observed signals behind the current score. We never infer what we did not receive.</p>{dimensions.slice(0, 5).map((item) => <div className="evidence-row" key={item.label}><div><strong>{item.label}</strong><span>Observed from your selected data</span></div><b>{item.score}%</b><small>90% confidence</small></div>)}<div className="evidence-note"><LockKeyhole size={15} /><span>Not analyzed: messages, health data, finances, and anything you did not connect.</span></div></aside></div>}</>
}

function WeeklyPulse() {
  const [saved, setSaved] = useState(false)
  const [reflection, setReflection] = useState('')
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); await saveWeeklyPulse({ week: new Date().toISOString().slice(0, 10), mood: Number(form.get('mood')), energy: Number(form.get('energy')), focus: Number(form.get('focus')), reflection }); setSaved(true) }
  return <div className="content-wrap simple-page"><p className="eyebrow">WEEKLY PULSE</p><h1>How did this<br /><em>week feel?</em></h1><p className="welcome-copy">A two-minute check-in that adds your perspective to the signals we observe.</p>{saved ? <div className="empty-feature"><Sparkles size={28} /><h2>Pulse saved.</h2><p>Next week, we&apos;ll help you notice what changed.</p></div> : <form className="pulse-form" onSubmit={submit}>{[['mood','Mood'],['energy','Energy'],['focus','Focus']].map(([name,label]) => <label key={name}>{label}<input name={name} type="range" min="1" max="5" defaultValue="3" /></label>)}<label>One thing worth remembering<textarea value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={500} placeholder="A small win, a surprise, or something you want to change..." /></label><button className="primary-button" type="submit">Save this week <ArrowUpRight size={15} /></button></form>}</div>
}

function Experiments() {
  const [started, setStarted] = useState(false)
  const start = async () => { await startExperiment({ title: 'Make room for one plot twist', description: 'Choose one unplanned activity this week and notice how it changes your energy.', targetDays: 7 }); setStarted(true) }
  return <div className="content-wrap simple-page"><p className="eyebrow">PERSONAL EXPERIMENTS</p><h1>Small changes,<br /><em>real evidence.</em></h1><p className="welcome-copy">Turn an insight into a gentle, measurable 7-day experiment.</p><div className="experiment-card card-surface"><span className="eyebrow">RECOMMENDED FOR YOU</span><h2>Make room for one plot twist</h2><p>Choose one unplanned activity this week and notice how it changes your energy.</p><div className="experiment-meta"><span>7 days</span><span>Based on your Adventure score</span></div><button className="primary-button" onClick={start}>{started ? 'Experiment started' : 'Start experiment'} <ArrowUpRight size={15} /></button></div></div>
}

function Report({ onShare }: { onShare: () => void }) {
  const [insight, setInsight] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const generateInsight = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/insights', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ report: { lifeScore: generatedReport.overall, categoryScores: generatedReport.scores, facts: ['listening_diversity_low', 'calendar_density_high', 'travel_activity_high'] } }) })
      const data = await response.json()
      setInsight(data.insight ?? 'Not enough data for a grounded insight yet.')
    } finally { setIsGenerating(false) }
  }
  return <div className="content-wrap report-page"><section className="report-intro"><div><p className="eyebrow">YOUR SEPTEMBER REPORT</p><h1>A month of<br /><em>beautifully mixed signals.</em></h1><p className="welcome-copy">A closer look at the patterns behind your score.</p></div><button className="primary-button" onClick={onShare}><Share2 size={17} /> Share report</button></section><EvidenceDrawer /><div className="report-mosaic"><div className="report-score card-surface"><p className="eyebrow">OVERALL SCORE</p><div className="report-score-row"><ScoreRing size={155} /><div><span className="trend-pill"><ArrowUpRight size={14} /> 4 points</span><p>That puts you in the <strong>top 18%</strong> of curious humans this month.</p></div></div></div><div className="report-quote"><span className="card-kicker light">THE VIBE</span><h2>“Part planner,<br />part plot twist.”</h2><span className="quote-mark">”</span></div><div className="report-stat card-surface"><p className="eyebrow">MOST SURPRISING STAT</p><strong>3.7 <small>hrs</small></strong><p>Average weekly time spent on planned-but-unfinished activities.</p></div><div className="report-archetype"><span className="card-kicker light">YOUR ARCHETYPE</span><h2>The Weekend<br />Explorer</h2><p>Routine by day. Plot twist by weekend.</p></div></div><section className="section-heading report-heading"><div><p className="eyebrow">THE BREAKDOWN</p><h2>Every score has a story</h2></div></section><div className="report-dimensions">{dimensions.map((item, i) => <div className="report-dimension" key={item.label}><div><span>{String(i + 1).padStart(2, '0')}</span><strong>{item.label}</strong></div><div className="report-line"><div style={{ width: `${item.score}%`, background: item.color }} /></div><b>{item.score}</b></div>)}</div><section className="ai-insight-panel"><div><p className="eyebrow">GROUNDED AI INSIGHT</p><h2>{insight || 'Turn your score into a sharper story.'}</h2><p>Generated only from derived scores and observed facts. Interpretations are labeled, never presented as facts.</p></div><button className="primary-button" onClick={generateInsight} disabled={isGenerating}><Sparkles size={17} /> {isGenerating ? 'Thinking...' : 'Generate insight'}</button></section></div>
}

function MonthlyReview({ onShare }: { onShare: () => void }) {
  const stats = [{ label: 'Life Score', value: '74', detail: '+4 since August' }, { label: 'Top category', value: 'Adventure', detail: '91 / 100' }, { label: 'Biggest change', value: '+12', detail: 'Adventure' }, { label: 'Most interesting', value: '18', detail: 'new artists discovered' }]
  return <div className="content-wrap review-page"><section className="welcome-row"><div><p className="eyebrow">SEPTEMBER 2026</p><h1>Your month in<br /><em>review.</em></h1><p className="welcome-copy">The patterns, pivots, and plot twists behind your score.</p></div><button className="primary-button" onClick={onShare}><Share2 size={16} /> Share review</button></section><div className="review-grid">{stats.map((stat) => <div className="review-stat card-surface" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></div>)}</div><section className="review-feature"><div><p className="eyebrow">THE MONTH&apos;S VIBE</p><h2>Part planner,<br /><em>part plot twist.</em></h2><p>You made room for movement, found new music, and kept your calendar from telling the whole story.</p></div><div className="review-favorites"><span>FAVORITES</span><strong>New music, long walks,<br />and spontaneous weekends.</strong><div><Music2 size={15} /> 18 new artists <span>•</span> <CalendarDays size={15} /> 3 travel days</div></div></section><div className="review-bottom"><div className="card-surface review-list"><p className="eyebrow">ACHIEVEMENTS UNLOCKED</p>{['First Report','Music Explorer','Weekend Explorer'].map((item, i) => <div key={item}><span className="achievement-badge"><Trophy size={15} /></span><strong>{item}</strong><small>{['Report generated','20 artists discovered','Weekend activity up'][i]}</small><Zap size={14} /></div>)}</div><div className="challenge-callout"><Flame size={22} /><p className="eyebrow">NEXT MONTH&apos;S CHALLENGE</p><h3>Discover 5 new artists</h3><p>Complete: listen to five artists you&apos;ve never heard before.</p><button className="light-button" onClick={() => onShare()}>Accept challenge <ArrowUpRight size={14} /></button></div></div></div>
}

function Challenges() {
  const { data: progressData, mutate: refreshProgress } = useSWR('/api/challenge-progress', fetcher)
  const [completed, setCompleted] = useState<string[]>([])
  const persistedCompleted = (progressData?.progress ?? []).filter((item: { status: string }) => item.status === 'completed').map((item: { challengeId: string }) => item.challengeId)
  const toggleChallenge = async (title: string, done: boolean) => { const response = await fetch('/api/challenge-progress', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ challengeId: title, completed: !done }) }); if (response.ok) { setCompleted((items) => !done ? [...items, title] : items.filter((item) => item !== title)); await refreshProgress() } }
  const challenges = [
    { title: 'Discover 5 new artists', type: 'Curiosity', progress: '2 of 5 artists', reward: '+100 XP', description: 'Explore outside your usual rotation.', fill: '40%' },
    { title: 'The social reset', type: 'Social', progress: '0 of 1 plans', reward: '+80 XP', description: 'Make plans with someone you have not seen recently.', fill: '8%' },
    { title: 'Take the long way', type: 'Adventure', progress: '1 of 3 days', reward: '+120 XP', description: 'Add a little more unplanned movement to your week.', fill: '33%' },
    { title: 'Protect one quiet hour', type: 'Balance', progress: '0 of 3 days', reward: '+90 XP', description: 'Leave one hour unscheduled and notice what you reach for.', fill: '8%' },
    { title: 'Finish the almost-finished', type: 'Productivity', progress: '1 of 3 tasks', reward: '+110 XP', description: 'Close one open loop that has been taking up mental space.', fill: '33%' },
    { title: 'Try a new neighborhood', type: 'Adventure', progress: '0 of 1 outing', reward: '+100 XP', description: 'Change your scenery with a walk, café, or place you have not visited.', fill: '8%' },
    { title: 'Send the good message', type: 'Connection', progress: '0 of 2 messages', reward: '+75 XP', description: 'Reach out to two people you are genuinely glad to know.', fill: '8%' },
    { title: 'Make something for fun', type: 'Culture', progress: '0 of 2 sessions', reward: '+95 XP', description: 'Spend two short sessions creating without optimizing the result.', fill: '8%' },
  ]
  return <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">YOUR QUEST LOG</p><h1>Good habits,<br /><em>better stories.</em></h1><p className="welcome-copy">Small experiments based on the patterns already in your report.</p></div><div className="xp-pill"><Zap size={14} /> 240 XP</div></section><div className="challenge-list">{challenges.map((challenge) => { const done = completed.includes(challenge.title) || persistedCompleted.includes(challenge.title); return <article className={`challenge-row ${done ? 'done' : ''}`} key={challenge.title}><div className="challenge-symbol"><Flame size={20} /></div><div className="challenge-copy"><span>{challenge.type}</span><h2>{challenge.title}</h2><p>{challenge.description}</p><div className="challenge-meter"><i style={{ width: done ? '100%' : challenge.fill }} /></div><small>{done ? 'Complete' : challenge.progress}</small></div><div className="challenge-reward"><strong>{challenge.reward}</strong><button className={done ? 'completed-button' : 'primary-button'} aria-pressed={done} onClick={() => toggleChallenge(challenge.title, done)}>{done ? 'Completed' : 'Mark complete'}</button></div></article> })}</div><p className="safety-note"><LockKeyhole size={14} /> Challenges are reflective prompts, not professional health or financial advice.</p></div>
}

function LifeFeed() {
  const { data, mutate } = useSWR('/api/feed', fetcher)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [includeScore, setIncludeScore] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!content.trim()) return; setIsPosting(true); try { await fetch('/api/feed', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content, imageUrl, includeScore }) }); setContent(''); setImageUrl(''); await mutate() } finally { setIsPosting(false) } }
  const react = async (postId: string) => { await fetch('/api/feed', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId, reaction: 'support' }) }); await mutate() }
  return <div className="content-wrap feed-page"><section className="feed-heading"><div><p className="eyebrow">LIFE FEED</p><h1>Your life,<br /><em>in motion.</em></h1><p className="welcome-copy">Share the moments and stats you want your people to see.</p></div><span className="privacy-chip"><LockKeyhole size={14} /> Friends only</span></section><form className="feed-composer card-surface" onSubmit={submit}><div className="composer-top"><div className="avatar">DS</div><div><strong>Share an update</strong><span>Only you choose what leaves your private space.</span></div></div><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} placeholder="What is worth remembering today?" aria-label="Story text" /><div className="composer-options"><label><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Optional picture URL" aria-label="Optional picture URL" /></label><label className="score-toggle"><input type="checkbox" checked={includeScore} onChange={(event) => setIncludeScore(event.target.checked)} /> Include my current life score</label><button className="primary-button" type="submit" disabled={isPosting}>{isPosting ? 'Sharing...' : 'Share update'} <ArrowUpRight size={15} /></button></div></form><div className="feed-list">{data?.posts?.length ? data.posts.map((post: { id: string; content: string; imageUrl: string | null; score: number | null; archetype: string | null; createdAt: string; reactionCount: number }) => <article className="feed-post card-surface" key={post.id}><div className="feed-post-header"><div className="avatar">DS</div><div><strong>Damian Smith</strong><span>{new Date(post.createdAt).toLocaleDateString()} · Friends only</span></div><MoreHorizontal size={18} /></div><p className="feed-content">{post.content}</p>{post.imageUrl && <img className="feed-image" src={post.imageUrl} alt="Shared life update" />}{post.score !== null && <div className="shared-score"><div><span className="eyebrow">LIFE SCORE SNAPSHOT</span><strong>{post.score}<small>/100</small></strong></div><span>{post.archetype ?? 'Current chapter'}</span></div>}<div className="feed-post-actions"><span>{post.reactionCount} support{post.reactionCount === 1 ? '' : 's'}</span><button onClick={() => react(post.id)}><Sparkles size={14} /> Support</button></div></article>) : <div className="empty-feature"><Share2 size={28} /><h2>Your feed starts here.</h2><p>Share a story, picture, or life-score snapshot with your friends.</p></div>}</div></div>
}

function Friends() {
  const [invited, setInvited] = useState(false); const [comparison, setComparison] = useState(false); const [groupCreated, setGroupCreated] = useState(false)
  return <div className="content-wrap friends-page"><section className="welcome-row"><div><p className="eyebrow">YOUR PEOPLE</p><h1>Compare notes,<br /><em>not lives.</em></h1><p className="welcome-copy">Share only the patterns you choose. Never the underlying data.</p></div><button className="primary-button" onClick={() => setInvited(true)}><Users size={16} /> {invited ? 'Invite copied' : 'Invite a friend'}</button></section><div className="friends-grid"><section className="friends-card card-surface"><div className="friends-card-head"><div><p className="eyebrow">FRIENDS</p><h2>{invited ? 'Invite ready to share' : 'Build your circle'}</h2></div><Users size={24} /></div>{invited ? <div className="invite-success"><span>INVITE LINK</span><strong>ratemylife.app/invite/damian</strong><button className="text-button" onClick={() => setInvited(false)}>Reset invite</button></div> : <div className="friend-empty"><Users size={28} /><p>Invite people you trust to compare patterns with consent.</p></div>}<button className="secondary-button" onClick={() => setComparison(!comparison)}>{comparison ? 'Hide comparison' : 'Compare with Alex'} <ChevronRight size={15} /></button></section><section className="friends-card card-surface"><div className="friends-card-head"><div><p className="eyebrow">PRIVATE GROUP</p><h2>{groupCreated ? 'The 2026 friend group' : 'Make a private group'}</h2></div><LockKeyhole size={22} /></div>{groupCreated ? <div className="group-summary"><strong>4 members</strong><span>Only opted-in patterns included</span>{['Most adventurous pattern','Most active pattern','Most music diversity'].map((item) => <div key={item}><span>{item}</span><b>—</b></div>)}</div> : <div className="friend-empty"><LockKeyhole size={28} /><p>See collective patterns only when everyone opts in.</p></div>}<button className="secondary-button" onClick={() => setGroupCreated(true)}>{groupCreated ? 'Add members' : 'Create private group'} <Plus size={15} /></button></section></div>{comparison && <section className="comparison-card"><div className="comparison-head"><div><p className="eyebrow">AGREED COMPARISON</p><h2>Different life patterns</h2></div><span>YOU / ALEX</span></div><div className="comparison-score"><div><small>YOU</small><strong>{generatedReport.overall}</strong></div><div><small>ALEX</small><strong>71</strong></div></div>{[['Curiosity',82,77],['Adventure',91,62],['Culture',88,91],['Activity',71,76],['Productivity',64,68],['Social',76,82]].map(([label, you, alex]) => <div className="compare-line" key={label as string}><span>{label}</span><div><i style={{ width: `${you}%` }} /><b>{you}</b></div><div className="alex"><i style={{ width: `${alex}%` }} /><b>{alex}</b></div></div>)}</section>}</div>
}

function Trends() {
  return <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">YOUR PROGRESS</p><h1>Small shifts.<br /><em>Big patterns.</em></h1><p className="welcome-copy">Your life score is trending in a very encouraging direction.</p></div><div className="select-chip">Last 6 months <ChevronRight size={15} /></div></section><div className="trend-card card-surface"><div className="trend-card-head"><div><p className="eyebrow">LIFE SCORE</p><div className="trend-number">74 <span><ArrowUpRight size={14} /> +4%</span></div></div><div className="chart-legend"><span><i className="legend-dot purple" />Score</span><span><i className="legend-dot coral" />Average</span></div></div><div className="chart"><div className="chart-grid"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 760 230" preserveAspectRatio="none" role="img" aria-label="Life score trend chart"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f5cff" stopOpacity=".23" /><stop offset="1" stopColor="#6f5cff" stopOpacity="0" /></linearGradient></defs><path d="M20 180 C100 174 110 145 178 155 S260 128 320 138 S405 110 465 112 S545 82 590 91 S665 50 740 66 L740 230 L20 230Z" fill="url(#chartFill)" /><path d="M20 180 C100 174 110 145 178 155 S260 128 320 138 S405 110 465 112 S545 82 590 91 S665 50 740 66" fill="none" stroke="#6f5cff" strokeWidth="4" strokeLinecap="round" /><circle cx="740" cy="66" r="6" fill="#fff" stroke="#6f5cff" strokeWidth="4" /></svg><div className="chart-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div><section className="section-heading trend-heading"><div><p className="eyebrow">WHAT CHANGED</p><h2>Your biggest shifts</h2></div></section><div className="change-grid"><div className="change-card"><ArrowUpRight size={17} /><strong>Adventure <b>+12</b></strong><span>More weekends away than usual.</span></div><div className="change-card"><ArrowUpRight size={17} /><strong>Activity <b>+7</b></strong><span>Your calendar got you moving.</span></div><div className="change-card down"><ArrowUpRight size={17} /><strong>Productivity <b>-2</b></strong><span>Honestly, probably a good thing.</span></div></div></div>
}

const socialSources = [
  { id: 'instagram', name: 'Instagram', description: 'Your selected posts, topics, and visual themes', icon: '◎', accent: '#f5dce9' },
  { id: 'facebook', name: 'Facebook', description: 'Events, groups, and the activity you choose to share', icon: 'f', accent: '#dfe9ff' },
  { id: 'google', name: 'Google', description: 'Calendar, saved places, and activity you explicitly select', icon: 'G', accent: '#fff0d9' },
  { id: 'x', name: 'X / Twitter', description: 'Topics and public conversations you choose to analyze', icon: '𝕏', accent: '#e7e7e7' },
  { id: 'tiktok', name: 'TikTok', description: 'Watch themes and interests from your data export', icon: '♪', accent: '#dff4f1' },
  { id: 'linkedin', name: 'LinkedIn', description: 'Career interests and professional learning themes', icon: 'in', accent: '#dcecf5' },
] as const

function DataSources({ onToast }: { onToast: (message: string) => void }) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [connected, setConnected] = useState<string[]>(['spotify', 'calendar'])

  const connectSource = async (sourceId: string, name: string) => {
    const response = await fetch('/api/data-sources', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sourceId }) })
    if (response.ok) { setConnected((current) => current.includes(sourceId) ? current : [...current, sourceId]); onToast(`${name} connected — choose what to share next`) }
    else onToast('We could not connect that source yet')
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file.name)
    setIsAnalyzing(true)
    onToast('Screenshot added — preparing your report')
    window.setTimeout(() => setIsAnalyzing(false), 1800)
  }

  return <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">DATA SOURCES</p><h1>What should we<br /><em>look at next?</em></h1><p className="welcome-copy">You are always in control. Connect only what feels right.</p></div><div className="source-security"><LockKeyhole size={15} /> Private by default</div></section><div className="data-source-list"><div className="data-source-row"><div className="source-icon spotify"><Music2 size={21} /></div><div><strong>Spotify</strong><span>Music preferences, artists, genres and listening activity</span></div><div className="row-actions"><span className="status-connected"><Zap size={12} /> Connected</span><button onClick={() => onToast('Spotify sync started')}><Activity size={15} /> Sync</button></div></div><div className="data-source-row"><div className="source-icon calendar"><CalendarDays size={21} /></div><div><strong>Calendar</strong><span>Event patterns, free time and meeting density</span></div><div className="row-actions"><span className="status-connected"><Zap size={12} /> Connected</span><button onClick={() => onToast('Calendar sync started')}><Activity size={15} /> Sync</button></div></div><div className="data-source-row"><div className="source-icon screenshots"><FileImage size={21} /></div><div><strong>Screenshots</strong><span>{uploadedFile ?? 'Upload images to find patterns in your digital life'}</span></div><div className="row-actions">{uploadedFile && <span className="status-connected"><Zap size={12} /> {isAnalyzing ? 'Analyzing' : 'Ready'}</span>}<label className="connect-button"><Upload size={15} /> {uploadedFile ? 'Add another' : 'Upload'}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleUpload} /></label></div></div></div><section className="source-section"><div className="source-section-heading"><div><p className="eyebrow">SOCIAL SIGNALS</p><h2>Bring in the parts of life you choose</h2></div><span className="source-count">{socialSources.length} available</span></div><div className="data-source-grid">{socialSources.map((source) => { const isConnected = connected.includes(source.id); return <div className="data-source-tile" key={source.id}><div className="social-mark" style={{ background: source.accent }}>{source.icon}</div><div className="data-source-tile-copy"><strong>{source.name}</strong><span>{source.description}</span></div><button className={isConnected ? 'source-connected-button' : 'source-connect-button'} onClick={() => isConnected ? onToast(`${source.name} is already connected`) : connectSource(source.id, source.name)}>{isConnected ? <><Zap size={13} /> Connected</> : <><Plus size={14} /> Connect</>}</button></div> })}</div></section><div className="source-extension"><div><Sparkles size={17} /><strong>More ways to tell your story</strong><p>Photos, bookmarks, expenses, fitness and messages can join your report as new connectors.</p></div><span>{supportedSources.length} connectors planned</span></div><div className="privacy-banner"><div className="privacy-icon"><LockKeyhole size={17} /></div><div><strong>We only analyze what you choose to share.</strong><p>Source data is private by default and never shared with friends. You can disconnect or delete anything at any time.</p></div><ChevronRight size={17} /></div></div>
}

export default function Page() {
  const [active, setActive] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = (item: string) => { setActive(item); setMobileOpen(false) }
  const share = async () => { const url = `${window.location.origin}/compare/damian-74`; try { await navigator.clipboard.writeText(url); setToast('Public comparison link copied'); } catch { setToast(url) }; setTimeout(() => setToast(''), 2600) }
  return <div className="app-shell"><Sidebar active={active} onNavigate={navigate} /><div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}><button className="drawer-close" onClick={() => setMobileOpen(false)}><X size={20} /></button><Sidebar active={active} onNavigate={navigate} /></div><div className="main-area"><Header active={active} onMenu={() => setMobileOpen(true)} /><main>{active === 'Overview' && <Overview onNavigate={navigate} onShare={share} />}{active === 'My Report' && <Report onShare={share} />}{active === 'Monthly review' && <MonthlyReview onShare={share} />}{active === 'Trends' && <Trends />}{active === 'Data sources' && <DataSources onToast={setToast} />}{active === 'Challenges' && <Challenges />}{active === 'Weekly pulse' && <WeeklyPulse />}{active === 'Experiments' && <Experiments />}{active === 'Friends' && <Friends />}{active === 'Life feed' && <LifeFeed />}{active === 'Settings' && <div className="content-wrap simple-page"><span className="eyebrow">YOUR SPACE</span><h1>Make it<br /><em>feel like you.</em></h1><div className="empty-feature"><Settings size={28} /><h2>Settings are coming together.</h2><p>Your profile, notifications and sharing preferences will live here.</p></div></div>}{active === 'Privacy Center' && <div className="content-wrap simple-page"><span className="eyebrow">PRIVACY CENTER</span><h1>Your data,<br /><em>your rules.</em></h1><div className="empty-feature"><LockKeyhole size={28} /><h2>Privacy controls live in one place.</h2><p>Review connected sources, export your data, and manage deletion requests.</p><a className="primary-button" href="/privacy">Open privacy center <ArrowUpRight size={16} /></a></div></div>}</main></div>{toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}</div>
}
