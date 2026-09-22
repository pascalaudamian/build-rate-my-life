'use client'

import Link from 'next/link'
import { ArrowUpRight, LockKeyhole, Sparkles } from 'lucide-react'

export default function ComparePage({ params }: { params: Promise<{ code: string }> }) {
  return <main className="public-compare"><div className="public-brand"><span className="brand-mark">R</span> Rate My Life</div><section className="public-compare-card"><p className="eyebrow">A SHARED LIFE SCORE</p><h1>Damian scored<br /><em>74.</em></h1><p className="public-copy">Think you can beat it? Compare patterns, not private data.</p><div className="public-score-facts"><span><strong>91</strong> Adventure</span><span><strong>88</strong> Culture</span><span><strong>82</strong> Curiosity</span></div><div className="public-archetype"><Sparkles size={18} /> The Weekend Explorer</div><Link className="primary-button" href="/onboarding">Rate my life <ArrowUpRight size={16} /></Link><p className="public-privacy"><LockKeyhole size={13} /> Limited preview. Private source data is never exposed.</p></section></main>
}
