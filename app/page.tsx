'use client'

import { useState } from 'react'
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

const dimensions = [
  { label: 'Curiosity', score: 82, color: '#6f5cff', icon: Compass },
  { label: 'Adventure', score: 91, color: '#fa6c4f', icon: Compass },
  { label: 'Culture', score: 88, color: '#f4b64a', icon: Headphones },
  { label: 'Activity', score: 71, color: '#46b1a4', icon: Activity },
  { label: 'Productivity', score: 64, color: '#4a84e8', icon: Target },
  { label: 'Social', score: 76, color: '#e56ca2', icon: Users },
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Report', icon: Sparkles },
  { label: 'Trends', icon: BarChart3 },
  { label: 'Challenges', icon: Target },
  { label: 'Friends', icon: Users },
]

function ScoreRing({ size = 192 }: { size?: number }) {
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <div className="score-ring-inner">
        <span className="score-label">LIFE SCORE</span>
        <strong>74</strong>
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
      <div className="privacy-card"><div className="privacy-icon"><LockKeyhole size={16} /></div><div><strong>Your data, your rules.</strong><p>Only analyze what you choose to share.</p></div><ChevronRight size={15} /></div>
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

function Overview({ onNavigate, onShare }: { onNavigate: (item: string) => void; onShare: () => void }) {
  return <div className="content-wrap">
    <section className="welcome-row"><div><p className="eyebrow">Monday, September 23, 2026</p><h1>Good morning, Damian <Sparkles className="wave" size={20} /></h1><p className="welcome-copy">Your digital life has some explaining to do.</p></div><button className="primary-button" onClick={() => onNavigate('My Report')}><Sparkles size={17} /> View my report <ArrowUpRight size={16} /></button></section>
    <section className="hero-grid">
      <div className="score-card card-surface"><div className="card-kicker"><span>YOUR LIFE SCORE</span><button className="more-button" aria-label="More options"><MoreHorizontal size={19} /></button></div><div className="score-main"><ScoreRing /><div className="score-note"><div className="trend-pill"><ArrowUpRight size={14} /> 4 pts <span>since last month</span></div><p>You are doing better than your calendar suggests.</p><button className="text-button" onClick={() => onNavigate('Trends')}>See what changed <ChevronRight size={15} /></button></div></div><div className="score-footer"><span><span className="status-dot" />Based on 3 connected sources</span><button onClick={onShare}><Share2 size={15} /> Share score</button></div></div>
      <div className="archetype-card"><div className="archetype-orb"><Sparkles className="orb-star" size={37} /></div><div><span className="card-kicker light">YOUR ARCHETYPE</span><h2>The Weekend<br />Explorer</h2><p>Your calendar says routine. Your curiosity says otherwise.</p><button className="light-button" onClick={() => onNavigate('My Report')}>Explore your archetype <ArrowUpRight size={15} /></button></div></div>
    </section>
    <section className="section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h2>Your life dimensions</h2></div><button className="text-button" onClick={() => onNavigate('My Report')}>View full breakdown <ChevronRight size={15} /></button></section>
    <section className="dimension-grid">{dimensions.map((item) => { const Icon = item.icon; return <div className="dimension-card card-surface" key={item.label}><div className="dimension-top"><div className="dimension-icon" style={{ color: item.color, background: `${item.color}18` }}><Icon size={17} /></div><span>{item.label}</span><strong>{item.score}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${item.score}%`, background: item.color }} /></div><span className="dimension-caption">{item.score > 85 ? 'A standout strength' : item.score > 75 ? 'Looking good' : 'Room to grow'}</span></div> })}</section>
    <section className="lower-grid"><div className="insight-card card-surface"><div className="section-label"><span className="label-icon"><Sparkles size={15} /></span><span>LATEST INSIGHT</span><span className="new-pill">NEW</span></div><blockquote>“You plan vacations like a military operation, then spend the first day looking for the best coffee shop.”</blockquote><div className="insight-bottom"><span>Based on your calendar and travel activity</span><button className="icon-button small" onClick={onShare} aria-label="Share insight"><Share2 size={16} /></button></div></div><div className="challenge-card card-surface"><div className="section-label"><span className="label-icon coral"><Flame size={15} /></span><span>UP NEXT</span></div><h3>Discover 5 new artists</h3><p>Explore outside your usual rotation and give your curiosity a little cardio.</p><div className="challenge-progress"><div className="mini-avatars"><span>1</span><span>2</span><span>3</span></div><span>2 of 5 artists</span><ChevronRight size={17} /></div></div></section>
    <section className="section-heading sources-heading"><div><p className="eyebrow">YOUR DATA, YOUR CHOICE</p><h2>Connected sources</h2></div><button className="text-button" onClick={() => onNavigate('Data sources')}>Manage sources <ChevronRight size={15} /></button></section>
    <section className="source-grid"><SourceCard icon={<Music2 size={19} />} title="Spotify" detail="Synced 2 hours ago" status="Connected" accent="#dff4e9" onClick={() => onNavigate('Data sources')} /><SourceCard icon={<CalendarDays size={19} />} title="Calendar" detail="Synced yesterday" status="Connected" accent="#e5e4ff" onClick={() => onNavigate('Data sources')} /><SourceCard icon={<FileImage size={19} />} title="Screenshots" detail="Add your first upload" status="Connect" accent="#fff0dc" onClick={() => onNavigate('Data sources')} /></section>
  </div>
}

function Report({ onShare }: { onShare: () => void }) {
  return <div className="content-wrap report-page"><section className="report-intro"><div><p className="eyebrow">YOUR SEPTEMBER REPORT</p><h1>A month of<br /><em>beautifully mixed signals.</em></h1><p className="welcome-copy">A closer look at the patterns behind your score.</p></div><button className="primary-button" onClick={onShare}><Share2 size={17} /> Share report</button></section><div className="report-mosaic"><div className="report-score card-surface"><p className="eyebrow">OVERALL SCORE</p><div className="report-score-row"><ScoreRing size={155} /><div><span className="trend-pill"><ArrowUpRight size={14} /> 4 points</span><p>That puts you in the <strong>top 18%</strong> of curious humans this month.</p></div></div></div><div className="report-quote"><span className="card-kicker light">THE VIBE</span><h2>“Part planner,<br />part plot twist.”</h2><span className="quote-mark">”</span></div><div className="report-stat card-surface"><p className="eyebrow">MOST SURPRISING STAT</p><strong>3.7 <small>hrs</small></strong><p>Average weekly time spent on planned-but-unfinished activities.</p></div><div className="report-archetype"><span className="card-kicker light">YOUR ARCHETYPE</span><h2>The Weekend<br />Explorer</h2><p>Routine by day. Plot twist by weekend.</p></div></div><section className="section-heading report-heading"><div><p className="eyebrow">THE BREAKDOWN</p><h2>Every score has a story</h2></div></section><div className="report-dimensions">{dimensions.map((item, i) => <div className="report-dimension" key={item.label}><div><span>{String(i + 1).padStart(2, '0')}</span><strong>{item.label}</strong></div><div className="report-line"><div style={{ width: `${item.score}%`, background: item.color }} /></div><b>{item.score}</b></div>)}</div></div>
}

function Trends() {
  return <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">YOUR PROGRESS</p><h1>Small shifts.<br /><em>Big patterns.</em></h1><p className="welcome-copy">Your life score is trending in a very encouraging direction.</p></div><div className="select-chip">Last 6 months <ChevronRight size={15} /></div></section><div className="trend-card card-surface"><div className="trend-card-head"><div><p className="eyebrow">LIFE SCORE</p><div className="trend-number">74 <span><ArrowUpRight size={14} /> +4%</span></div></div><div className="chart-legend"><span><i className="legend-dot purple" />Score</span><span><i className="legend-dot coral" />Average</span></div></div><div className="chart"><div className="chart-grid"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 760 230" preserveAspectRatio="none" role="img" aria-label="Life score trend chart"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f5cff" stopOpacity=".23" /><stop offset="1" stopColor="#6f5cff" stopOpacity="0" /></linearGradient></defs><path d="M20 180 C100 174 110 145 178 155 S260 128 320 138 S405 110 465 112 S545 82 590 91 S665 50 740 66 L740 230 L20 230Z" fill="url(#chartFill)" /><path d="M20 180 C100 174 110 145 178 155 S260 128 320 138 S405 110 465 112 S545 82 590 91 S665 50 740 66" fill="none" stroke="#6f5cff" strokeWidth="4" strokeLinecap="round" /><circle cx="740" cy="66" r="6" fill="#fff" stroke="#6f5cff" strokeWidth="4" /></svg><div className="chart-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div><section className="section-heading trend-heading"><div><p className="eyebrow">WHAT CHANGED</p><h2>Your biggest shifts</h2></div></section><div className="change-grid"><div className="change-card"><ArrowUpRight size={17} /><strong>Adventure <b>+12</b></strong><span>More weekends away than usual.</span></div><div className="change-card"><ArrowUpRight size={17} /><strong>Activity <b>+7</b></strong><span>Your calendar got you moving.</span></div><div className="change-card down"><ArrowUpRight size={17} /><strong>Productivity <b>-2</b></strong><span>Honestly, probably a good thing.</span></div></div></div>
}

function DataSources({ onToast }: { onToast: (message: string) => void }) {
  return <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">DATA SOURCES</p><h1>What should we<br /><em>look at next?</em></h1><p className="welcome-copy">You are always in control. Connect only what feels right.</p></div><div className="source-security"><LockKeyhole size={15} /> Private by default</div></section><div className="data-source-list"><div className="data-source-row"><div className="source-icon spotify"><Music2 size={21} /></div><div><strong>Spotify</strong><span>Music preferences, artists, genres and listening activity</span></div><div className="row-actions"><span className="status-connected"><Zap size={12} /> Connected</span><button onClick={() => onToast('Spotify sync started')}><Activity size={15} /> Sync</button></div></div><div className="data-source-row"><div className="source-icon calendar"><CalendarDays size={21} /></div><div><strong>Calendar</strong><span>Event patterns, free time and meeting density</span></div><div className="row-actions"><span className="status-connected"><Zap size={12} /> Connected</span><button onClick={() => onToast('Calendar sync started')}><Activity size={15} /> Sync</button></div></div><div className="data-source-row"><div className="source-icon screenshots"><FileImage size={21} /></div><div><strong>Screenshots</strong><span>Upload images to find patterns in your digital life</span></div><div className="row-actions"><button className="connect-button" onClick={() => onToast('Upload flow coming up next')}><Upload size={15} /> Connect</button></div></div></div><div className="privacy-banner"><div className="privacy-icon"><LockKeyhole size={17} /></div><div><strong>We only analyze what you choose to share.</strong><p>Source data is private by default and never shared with friends. You can disconnect or delete anything at any time.</p></div><ChevronRight size={17} /></div></div>
}

export default function Page() {
  const [active, setActive] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = (item: string) => { setActive(item); setMobileOpen(false) }
  const share = () => { setToast('Share card copied to clipboard'); setTimeout(() => setToast(''), 2600) }
  return <div className="app-shell"><Sidebar active={active} onNavigate={navigate} /><div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}><button className="drawer-close" onClick={() => setMobileOpen(false)}><X size={20} /></button><Sidebar active={active} onNavigate={navigate} /></div><div className="main-area"><Header active={active} onMenu={() => setMobileOpen(true)} /><main>{active === 'Overview' && <Overview onNavigate={navigate} onShare={share} />}{active === 'My Report' && <Report onShare={share} />}{active === 'Trends' && <Trends />}{active === 'Data sources' && <DataSources onToast={setToast} />}{active === 'Challenges' && <div className="content-wrap simple-page"><span className="eyebrow">YOUR QUEST LOG</span><h1>Good habits,<br /><em>better stories.</em></h1><div className="empty-feature"><Gift size={28} /><h2>Your next challenge is waiting.</h2><p>Complete your report to unlock personalized challenges.</p><button className="primary-button" onClick={() => navigate('My Report')}>View report <ArrowUpRight size={16} /></button></div></div>}{active === 'Friends' && <div className="content-wrap simple-page"><span className="eyebrow">YOUR PEOPLE</span><h1>Compare notes,<br /><em>not lives.</em></h1><div className="empty-feature"><Users size={28} /><h2>Your report is better with someone to compare it with.</h2><p>Invite a friend and see where your patterns overlap.</p><button className="primary-button" onClick={() => setToast('Invite link copied to clipboard')}>Invite a friend <Share2 size={16} /></button></div></div>}{active === 'Settings' && <div className="content-wrap simple-page"><span className="eyebrow">YOUR SPACE</span><h1>Make it<br /><em>feel like you.</em></h1><div className="empty-feature"><Settings size={28} /><h2>Settings are coming together.</h2><p>Your profile, notifications and sharing preferences will live here.</p></div></div>}</main></div>{toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}</div>
}
