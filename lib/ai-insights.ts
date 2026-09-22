import { generateText, gateway } from 'ai'

export type InsightInput = {
  lifeScore: number
  categoryScores: Record<string, number>
  facts: string[]
}

export async function generateGroundedInsight(input: InsightInput) {
  const { text } = await generateText({
    model: gateway('openai/gpt-4.1-mini'),
    system: 'You are the Rate My Life insight writer. Be witty, concise, positive, specific, and honest. Use only the structured derived data provided. Never diagnose, infer sensitive traits, fabricate statistics, or present interpretations as observed facts. Return one 1-2 sentence insight only.',
    prompt: JSON.stringify({ observed: input }),
  })
  return text.trim()
}
