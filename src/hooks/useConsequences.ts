// ============================================================================
// useConsequences Hook
// ============================================================================
// Wrapper hook for consequence generation.
// Encapsulates the logic for generating aftermath data based on player's vote.
// ============================================================================

import { useCallback } from 'react'
import { generateConsequences as generateConsequencesData } from '../data/consequences'
import type { ConsequenceData } from '../types/game'
import type { Candidate } from '../types/game'

/**
 * Custom hook for generating consequences.
 *
 * Provides a memoized function to generate consequence data
 * based on the chosen candidate and all candidates.
 *
 * @returns Object containing generateConsequences function
 */
export function useConsequences() {
  /**
   * Generate consequence data for the chosen candidate.
   *
   * This function is memoized to prevent unnecessary re-renders.
   *
   * @param chosenCandidateId - ID of the candidate the player voted for
   * @param candidates - Array of all candidates in the game
   * @returns Complete ConsequenceData object with aftermath information
   */
  const generateConsequences = useCallback(
    (chosenCandidateId: string, candidates: Candidate[]): ConsequenceData => {
      return generateConsequencesData(chosenCandidateId, candidates)
    },
    []
  )

  return { generateConsequences }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================
//
// In a component (e.g., VotingPhase.tsx):
//
// import { useConsequences } from '../hooks/useConsequences'
//
// export function VotingPhase() {
//   const { generateConsequences } = useConsequences()
//   const { state, dispatch } = useGame()
//
//   const handleVote = (candidateId: string) => {
//     const confirmed = window.confirm('...')
//
//     if (confirmed) {
//       dispatch(gameActions.setVote(candidateId))
//
//       // Generate consequences BEFORE phase transition
//       const consequences = generateConsequences(candidateId, state.candidates)
//       dispatch(gameActions.setConsequences(consequences))
//
//       dispatch(gameActions.setPhase('consequence'))
//     }
//   }
//
//   // ...
// }
// ============================================================================
