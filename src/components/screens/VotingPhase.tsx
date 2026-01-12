// ============================================================================
// Voting Phase Screen
// ============================================================================
// Player casts their final vote for one candidate.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { CandidateCard } from '../ui/CandidateCard'

export function VotingPhase() {
  const { state, dispatch } = useGame()

  const handleVote = (candidateId: string) => {
    const confirmed = window.confirm(
      `You are about to cast your vote for ${state.candidates.find(c => c.id === candidateId)?.name}. This cannot be undone. Are you sure?`
    )

    if (confirmed) {
      dispatch(gameActions.setVote(candidateId))
      dispatch(gameActions.setPhase('consequence'))
    }
  }

  return (
    <div className="screen voting-screen">
      <h2>Cast Your Vote</h2>
      <p className="subtitle">
        Choose one candidate. Your decision is final.
      </p>

      <div className="candidates-grid">
        {state.candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            variant="voting"
            onClick={() => handleVote(candidate.id)}
          />
        ))}
      </div>
    </div>
  )
}
