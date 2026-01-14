// ============================================================================
// Tension Calculation Utility (Phase 4)
// ============================================================================
// Calculates overall game tension based on multiple factors.
// Tension influences visual effects and atmosphere (0-100 scale).
// ============================================================================

import type { GameState } from '../types/game'

/**
 * TensionLevel represents the 4 tension states for visual effects.
 */
export type TensionLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Calculates overall game tension based on game state factors.
 *
 * Tension factors (weighted):
 * - Questions remaining (×30): Fewer questions = higher tension
 * - Candidates eliminated (×20): More eliminations = higher tension
 * - Average candidate pressure (×25): From tracking.ts pressure system
 * - Clash events (×15): More clashes = higher tension
 * - Phase (×10): Later phases = higher tension
 *
 * @param state - Current game state
 * @returns Tension level from 0-100
 */
export function calculateTension(state: GameState): number {
  // Start with base tension
  let tension = 0

  // Factor 1: Questions remaining (30 points)
  // 3 questions = 0 tension, 2 questions = 10 tension, 1 question = 20 tension, 0 questions = 30 tension
  const questionsTension = (3 - state.questionsRemaining) * 10
  tension += questionsTension

  // Factor 2: Candidates eliminated (20 points)
  // 0 eliminated = 0 tension, 1 eliminated = 10 tension, 2 eliminated = 20 tension
  const eliminatedTension = state.eliminatedCandidateIds.length * 10
  tension += eliminatedTension

  // Factor 3: Average candidate pressure (25 points)
  // Get pressure levels from all active (non-eliminated) candidates
  const activeCandidateIds = state.candidates
    .filter((c) => !state.eliminatedCandidateIds.includes(c.id))
    .map((c) => c.id)

  const pressureValues = activeCandidateIds
    .map((id) => state.pressureStates[id]?.pressureLevel || 0)
    .filter((p) => p > 0) // Only consider candidates with pressure > 0

  const averagePressure =
    pressureValues.length > 0
      ? pressureValues.reduce((sum, p) => sum + p, 0) / pressureValues.length
      : 0

  // Scale average pressure (0-100) to 0-25 points
  const pressureTension = (averagePressure / 100) * 25
  tension += pressureTension

  // Factor 4: Clash events (15 points)
  // Each clash adds 5 tension, max 15 points (3 clashes)
  const clashTension = Math.min(state.clashHistory.length * 5, 15)
  tension += clashTension

  // Factor 5: Phase (10 points)
  const phaseTension = getPhaseTension(state.phase)
  tension += phaseTension

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(tension)))
}

/**
 * Gets tension value based on current game phase.
 */
function getPhaseTension(phase: GameState['phase']): number {
  switch (phase) {
    case 'introduction':
      return 0 // No tension yet
    case 'roster':
      return 2 // Slight tension building
    case 'questioning':
      return 5 // Questions start creating tension
    case 'elimination':
      return 8 // High tension moment
    case 'voting':
      return 10 // Maximum tension
    case 'consequence':
      return 5 // Tension releases into reflection
    case 'credits':
      return 0 // Tension resolved
  }
}

/**
 * Gets the tension category for CSS styling and visual effects.
 *
 * - Low (0-30): Normal state, subtle breathing animation
 * - Medium (31-60): Vignette tightens, particles speed up
 * - High (61-80): Color desaturation, subtle shake
 * - Critical (81-100): Heavy vignette, rapid pulse, border flicker
 */
export function getTensionCategory(tensionLevel: number): TensionLevel {
  if (tensionLevel <= 30) return 'low'
  if (tensionLevel <= 60) return 'medium'
  if (tensionLevel <= 80) return 'high'
  return 'critical'
}

/**
 * Gets the data-tension attribute value for body element.
 */
export function getTensionDataAttribute(tensionLevel: number): string {
  return getTensionCategory(tensionLevel)
}
