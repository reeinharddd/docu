/**
 * Decision thresholds of the classification cascade (IA.md §3). The
 * proposed values (0.90 / 0.60) are initial and get fixed against the
 * dataset (#61); they are configuration, not code. The verdict only orders
 * the next step: publishing always requires a human (ADR-0006).
 */

export type ScoreVerdict = 'automatic' | 'review' | 'quarantine'

export function classifyScore(
  confidence: number,
  autoThreshold: number,
  reviewThreshold: number,
): ScoreVerdict {
  if (confidence >= autoThreshold) return 'automatic'
  if (confidence >= reviewThreshold) return 'review'
  return 'quarantine'
}
