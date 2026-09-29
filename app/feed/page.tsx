'use client'

import useSWR from 'swr'
import { ArrowLeft, Heart, MessageCircle, Share2, Sparkles, Users } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

const sharedStats = [
  { name: 'Maya Chen', initials: 'MC', color: '#dcecf5', score: 82, title: 'A month of intentional momentum', detail: 'Shared with friends', dimensions: ['Adventure 91', 'Balance 78', 'Curiosity 88'], likes: 14 },
  { name: 'Jordan Lee', initials: 'JL', color: '#fce2db', score: 76, title: 'More plot twists than planned', detail: 'Shared with friends', dimensions: ['Culture 86', 'Social 81', 'Activity 73'], likes: 9 },
  { name: 'Your friends', initials: 'FR', color: '#e9e7ff', score: 79, title: 'The collective pulse', detail: 'Based on shared stats', dimensions: ['Curiosity 84', 'Balance 76', 'Adventure 81'], likes: 22 },
]

export default function FeedPage() {
  const { data } = useSWR('/api/me', fetcher)
  const userName = data?.user?.name ?? 'your friends'
  return <main className="feed-page"><header className="feed-header"><a href="/dashboard" className="feed-back"><ArrowLeft size={16} /> Back to overview</a><div><p className="eyebrow">RATE MY LIFE FEED</p><h1>Shared signals,<br /><em>not comparisons.</em></h1><p className="welcome-copy">See the moments your friends choose to share. Private by default, always opt-in.</p></div><div className="feed-badge"><Users size={16} /> {userName}&apos;s circle</div></header><section className="feed-toolbar"><strong>Friends and shared stats</strong><span>Only approved highlights appear here.</span></section><section className="feed-list">{sharedStats.map((post) => <article className="feed-card card-surface" key={post.name}><div className="feed-card-top"><div className="feed-person"><span className="feed-avatar" style={{ background: post.color }}>{post.initials}</span><div><strong>{post.name}</strong><small>{post.detail}</small></div></div><button className="more-button" aria-label={`More options for ${post.name}`}>•••</button></div><h2>{post.title}</h2><div className="feed-score-row"><div className="feed-score"><span>SHARED LIFE SCORE</span><b>{post.score}</b></div><div className="feed-dimensions">{post.dimensions.map((dimension) => <span key={dimension}>{dimension}</span>)}</div></div><div className="feed-actions"><button><Heart size={15} /> {post.likes}</button><button><MessageCircle size={15} /> Comment</button><button><Share2 size={15} /> Share</button></div></article>)}</section><aside className="feed-note"><Sparkles size={18} /><div><strong>Your feed gets better with consent.</strong><p>Invite friends from the Friends section and choose exactly which scores or archetypes to share.</p></div><a className="secondary-button" href="/dashboard">Manage sharing</a></aside></main>
}
