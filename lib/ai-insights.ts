import { generateText, gateway, Output } from 'ai'
import { z } from 'zod'

const insightOutputSchema = z.object({
  archetypeDescription: z.string().min(1).max(500),
  insights: z.array(z.object({ title: z.string().min(1).max(120), text: z.string().min(1).max(500), type: z.enum(['humor', 'pattern', 'opportunity', 'caution']) })).max(6),
  surprisingStat: z.object({ value: z.string().max(120), description: z.string().max(300) }).nullable(),
  opportunity: z.object({ title: z.string().max(120), description: z.string().max(500) }).nullable(),
})

export type InsightOutput = z.infer<typeof insightOutputSchema>

export type InsightInput = {
  lifeScore: number
  categoryScores: Record<string, number>
  facts: string[]
}

export async function generateGroundedInsight(input: InsightInput) {
  const { output } = await generateText({
    model: gateway('openai/gpt-4.1-mini'),
    output: Output.object({ schema: insightOutputSchema }),
    system: 'You are the Rate My Life insight writer. Use only the observed derived data. Never invent statistics, diagnose, infer sensitive traits, or present interpretation as fact. If evidence is weak, say Not enough data to determine this. Keep insights kind, useful, and non-clinical.',
    prompt: JSON.stringify({ observed: input }),
  })
  return insightOutputSchema.parse(output)
}
