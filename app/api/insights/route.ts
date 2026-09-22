import { NextResponse } from 'next/server'
import { generateGroundedInsight } from '@/lib/ai-insights'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const report = body?.report
    if (!report || typeof report.lifeScore !== 'number' || !report.categoryScores || !Array.isArray(report.facts)) {
      return NextResponse.json({ error: "We don't have enough information to calculate this insight yet." }, { status: 400 })
    }
    const insight = await generateGroundedInsight({
      lifeScore: report.lifeScore,
      categoryScores: report.categoryScores,
      facts: report.facts,
    })
    return NextResponse.json({ insight })
  } catch (error) {
    console.error('[v0] Insight generation failed:', error)
    return NextResponse.json({ error: 'Your data is safe. We could not generate the report right now. Try again.' }, { status: 503 })
  }
}
