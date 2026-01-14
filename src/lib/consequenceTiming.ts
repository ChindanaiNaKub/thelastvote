// ============================================================================
// Consequence Timing Utility (Phase 4)
// ============================================================================
// Calculates emotional timing for consequence reveals based on impact.
// Creates dramatic pacing that enhances doubt and regret.
// ============================================================================

import type { ConsequenceData } from '../types/game'

/**
 * Timing configuration for consequence reveals.
 */
export interface TimingConfig {
  delay: number // Milliseconds to wait before showing content
  animation: 'fade' | 'slide' | 'dramatic-pause' | 'slow-zoom'
  pauseAfter?: number // Optional pause after reveal (ms)
}

/**
 * Impact level determines how dramatic the reveal should be.
 */
export type ImpactLevel = 'low' | 'medium' | 'high' | 'devastating'

/**
 * Gets timing configuration based on impact level.
 *
 * Impact levels:
 * - Low: 1s delay, simple fade (minor consequences)
 * - Medium: 2s delay, slide (moderate consequences)
 * - High: 3.5s delay, dramatic pause (major consequences)
 * - Devastating: 5s delay, dramatic pause (severe consequences)
 *
 * @param impact - How impactful the consequence is
 * @returns Timing configuration for the reveal
 */
export function getConsequenceTiming(impact: ImpactLevel): TimingConfig {
  switch (impact) {
    case 'low':
      return {
        delay: 1000,
        animation: 'fade',
      }
    case 'medium':
      return {
        delay: 2000,
        animation: 'slide',
      }
    case 'high':
      return {
        delay: 3500,
        animation: 'dramatic-pause',
        pauseAfter: 1000,
      }
    case 'devastating':
      return {
        delay: 5000,
        animation: 'dramatic-pause',
        pauseAfter: 1500,
      }
  }
}

/**
 * Analyzes consequence data to determine impact level.
 *
 * Impact factors:
 * - Chosen candidate's hidden secret severity
 * - Number of bad outcomes in long-term consequences
 * - Whether alternative paths look significantly better
 *
 * @param consequences - The consequence data to analyze
 * @returns Impact level for timing
 */
export function analyzeConsequenceImpact(consequences: ConsequenceData): ImpactLevel {
  const { hiddenTruths, longTermConsequences } = consequences

  // Factor 1: Count bad outcomes (0-3 bad = low, 4-5 bad = medium, 6+ bad = high)
  const badOutcomeCount = longTermConsequences.badOutcomes.length

  // Factor 2: Check if chosen candidate secret is particularly damaging
  // Secrets that involve betrayal, lies, or harm are more impactful
  const damagingKeywords = ['หักหลัง', 'โกหก', 'ทำร้าย', 'ฆ่า', 'ทรยศ', 'เสียหาย']
  const hasDamagingSecret = damagingKeywords.some(keyword =>
    hiddenTruths.chosenCandidateSecret.includes(keyword)
  )

  // Factor 3: Alternative paths look much better (creates regret)
  const alternativeCount = consequences.alternativePaths.length
  const hasManyAlternatives = alternativeCount >= 3

  // Calculate impact score (0-100)
  let impactScore = 0

  // Bad outcomes (up to 40 points)
  if (badOutcomeCount >= 6) impactScore += 40
  else if (badOutcomeCount >= 4) impactScore += 30
  else if (badOutcomeCount >= 2) impactScore += 20
  else impactScore += 10

  // Damaging secret (up to 30 points)
  if (hasDamagingSecret) impactScore += 30

  // Many alternatives create regret (up to 30 points)
  if (hasManyAlternatives) impactScore += 30
  else if (alternativeCount >= 2) impactScore += 20
  else if (alternativeCount >= 1) impactScore += 10

  // Determine impact level from score
  if (impactScore >= 70) return 'devastating'
  if (impactScore >= 50) return 'high'
  if (impactScore >= 30) return 'medium'
  return 'low'
}

/**
 * Gets the timing for each consequence reveal phase.
 *
 * Phases:
 * 1. Immediate aftermath (6 months later)
 * 2. Hidden truths revealed
 * 3. Long-term consequences (3 years later)
 * 4. Alternative paths (what if scenarios)
 *
 * @param consequences - The consequence data
 * @param phase - Which phase to get timing for (1-4)
 * @returns Timing configuration for the phase
 */
export function getPhaseTiming(
  consequences: ConsequenceData,
  phase: 1 | 2 | 3 | 4
): TimingConfig {
  const impact = analyzeConsequenceImpact(consequences)

  // Phase 1 (Immediate aftermath): Use full impact timing
  if (phase === 1) {
    return getConsequenceTiming(impact)
  }

  // Phase 2 (Hidden truths): Always high impact (secrets are shocking)
  if (phase === 2) {
    return {
      delay: impact === 'devastating' ? 4000 : 3000,
      animation: 'dramatic-pause',
      pauseAfter: 1000,
    }
  }

  // Phase 3 (Long-term consequences): Scale with impact
  if (phase === 3) {
    const timing = getConsequenceTiming(impact)
    return {
      ...timing,
      pauseAfter: 1500, // Longer pause for reflection
    }
  }

  // Phase 4 (Alternative paths): Fast pacing (creates "what if" urgency)
  if (phase === 4) {
    return {
      delay: 1500,
      animation: 'slide',
    }
  }

  // Fallback (should never reach here due to TypeScript)
  return getConsequenceTiming('medium')
}
