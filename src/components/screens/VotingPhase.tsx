// ============================================================================
// Voting Phase Screen
// ============================================================================
// Player casts their final vote for one candidate.
// ============================================================================

import './VotingPhase.css'
import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { CandidateCard } from '../ui/CandidateCard'
import { useConsequences } from '../../hooks/useConsequences'

export function VotingPhase() {
  const { state, dispatch } = useGame()
  const { generateConsequences } = useConsequences()

  // CRITICAL: Filter out eliminated candidates - only show remaining 3
  const activeCandidates = state.candidates.filter(c => !c.isEliminated)

  console.log(`[VotingPhase] Final vote: ${activeCandidates.length} candidates remaining (should be 3)`)

  const handleVote = (candidateId: string) => {
    const confirmed = window.confirm(
      `คุณกำลังจะลงคะแนนให้ ${state.candidates.find(c => c.id === candidateId)?.name} การกระทำนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?`
    )

    if (confirmed) {
      // Part 3: Track final decision timing
      dispatch({
        type: 'TRACK_DECISION',
        payload: { timestamp: Date.now() }
      } as any)

      // Part 3: Mark game as completed
      dispatch({
        type: 'COMPLETE_GAME',
        payload: Date.now()
      } as any)

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
        {activeCandidates.map((candidate) => (
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
