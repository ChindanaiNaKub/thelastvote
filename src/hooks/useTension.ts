// ============================================================================
// useTension Hook (Phase 4)
// ============================================================================
// Automatically calculates game tension and updates body attributes.
// This hook should be used in the App component to apply tension effects.
// ============================================================================

import { useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { gameActions } from '../context/GameContext'
import { calculateTension, getTensionDataAttribute } from '../lib/tension'

/**
 * useTension - Custom hook to manage tension system.
 *
 * This hook:
 * 1. Calculates tension based on current game state
 * 2. Updates game state with new tension level
 * 3. Applies tension data attribute to body element for CSS styling
 *
 * Usage in App.tsx:
 *   useTension()
 *
 * The body element will have: data-tension="low|medium|high|critical"
 */
export function useTension() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    // Calculate new tension level based on current state
    const newTension = calculateTension(state)

    // Update game state if tension changed
    if (newTension !== state.tensionLevel) {
      dispatch(gameActions.setTension(newTension))
    }

    // Apply tension data attribute to body for CSS styling
    const tensionAttr = getTensionDataAttribute(newTension)
    document.body.setAttribute('data-tension', tensionAttr)

    // Cleanup: remove attribute on unmount
    return () => {
      document.body.removeAttribute('data-tension')
    }
  }, [
    state.phase,
    state.questionsRemaining,
    state.eliminatedCandidateIds.length,
    state.pressureStates,
    state.clashHistory.length,
    state.tensionLevel,
    dispatch,
  ])
}
