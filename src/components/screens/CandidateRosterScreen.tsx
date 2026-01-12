// ============================================================================
// Candidate Roster Screen
// ============================================================================
// Introduces all 5 candidates to the player.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { CandidateCard } from '../ui/CandidateCard'

export function CandidateRosterScreen() {
  const { state, dispatch } = useGame()

  const handleContinue = () => {
    dispatch(gameActions.setPhase('questioning'))
  }

  return (
    <div className="screen roster-screen">
      <h2>Meet the Candidates</h2>
      <p className="subtitle">
        Five people seek your vote. Get to know them.
      </p>

      <div className="candidates-grid">
        {state.candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            variant="compact"
          />
        ))}
      </div>

      <button onClick={handleContinue} className="btn-primary">
        Continue to Questioning
      </button>
    </div>
  )
}
