// ============================================================================
// Voting Phase Screen
// ============================================================================
// Player casts their final vote for one candidate.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { CandidateCard } from '../ui/CandidateCard'
import { useConsequences } from '../../hooks/useConsequences'

export function VotingPhase() {
  const { state, dispatch } = useGame()
  const { generateConsequences } = useConsequences()

  const handleVote = (candidateId: string) => {
    const confirmed = window.confirm(
      `คุณกำลังจะลงคะแนนให้ ${state.candidates.find(c => c.id === candidateId)?.name} การกระทำนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?`
    )

    if (confirmed) {
      dispatch(gameActions.setVote(candidateId))

      // Generate consequences BEFORE phase transition
      const consequences = generateConsequences(candidateId, state.candidates)
      dispatch(gameActions.setConsequences(consequences))

      dispatch(gameActions.setPhase('consequence'))
    }
  }

  return (
    <div className="screen voting-screen">
      <h2>ลงคะแนนของคุณ</h2>
      <p className="subtitle">
        เลือก candidate หนึ่งคน การตัดสินใจของคุณจะเป็นที่สิ้นสุด
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
