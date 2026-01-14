// ============================================================================
// Elimination Phase Screen
// ============================================================================
// Player eliminates one candidate after each question round.
// Creates tension and irreversible decisions.
// ============================================================================

import './EliminationPhase.css'
import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import type { ConversationEntry } from '../../types/game'

export function EliminationPhase() {
  const { state, dispatch } = useGame()

  // Filter to show only active (not eliminated) candidates
  const activeCandidates = state.candidates.filter(
    (c) => !state.eliminatedCandidateIds.includes(c.id)
  )

  // CRITICAL: Get latest responses for each candidate to show in elimination cards
  const latestResponses = state.conversationHistory
    .filter((entry) => entry.type === 'response')
    .reduce((acc, entry) => {
      // Only keep the most recent response for each speaker
      const speaker = entry.speaker as string
      if (!acc[speaker] || entry.timestamp > acc[speaker].timestamp) {
        acc[speaker] = entry
      }
      return acc
    }, {} as Record<string, ConversationEntry>)

  // Calculate current round (questionsRemaining starts at 3)
  // After Q1: questionsRemaining = 2, round = 1
  // After Q2: questionsRemaining = 1, round = 2
  // After Q3: questionsRemaining = 0, round = 3
  const currentRound = 3 - state.questionsRemaining

  // Count how many questions have been asked
  const questionsAsked = state.conversationHistory.filter(entry => entry.type === 'question').length
  const currentEliminationCount = state.eliminatedCandidateIds.length

  // Check if elimination is already done for this round
  const isEliminationDone = questionsAsked === currentEliminationCount

  const handleEliminate = (candidateId: string) => {
    const candidate = state.candidates.find((c) => c.id === candidateId)
    if (!candidate) return

    // Show confirmation dialog (Thai)
    const confirmed = window.confirm(
      `คัด ${candidate.name} ออก?\n\n⚠️ การตัดสินใจนี้ไม่สามารถย้อนกลับได้`
    )

    if (!confirmed) return

    // Part 3: Track decision timing
    dispatch({
      type: 'TRACK_DECISION',
      payload: { timestamp: Date.now() }
    } as any)

    // Dispatch elimination action
    dispatch(gameActions.eliminateCandidate(candidateId))

    // Determine next phase
    // After Q1 (questionsRemaining=2) or Q2 (questionsRemaining=1): go back to questioning
    // After Q3 (questionsRemaining=0): go to voting
    const nextPhase = state.questionsRemaining > 0 ? 'questioning' : 'voting'
    dispatch(gameActions.setPhase(nextPhase))
  }

  const handleContinue = () => {
    // Go to next phase (questioning or voting)
    const nextPhase = state.questionsRemaining > 0 ? 'questioning' : 'voting'
    dispatch(gameActions.setPhase(nextPhase))
  }

  // If elimination is done, show continue screen instead of elimination candidates
  if (isEliminationDone) {
    return (
      <div className="screen elimination-screen">
        <div className="elimination-header">
          <h2>คัดคนออก</h2>
          <div className="round-badge">รอบที่ {currentRound}</div>
          <p className="candidates-count">
            เหลือ <strong>{activeCandidates.length}</strong> คน
          </p>
        </div>

        <div className="elimination-complete">
          <p className="elimination-complete__text">
            ✅ คัดคนออกครบรอบที่ {currentRound} แล้ว
          </p>
          <p className="elimination-complete__subtext">
            คุณได้คัดคนออก {currentEliminationCount} คนแล้ว
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="btn-primary elimination-continue-btn"
        >
          ดำเนินการต่อ →
        </button>
      </div>
    )
  }

  return (
    <div className="screen elimination-screen">
      <div className="elimination-header">
        <h2>คัดคนออก</h2>
        <div className="round-badge">รอบที่ {currentRound}</div>
        <p className="candidates-count">
          เหลือ <strong>{activeCandidates.length}</strong> คน
        </p>
        <p className="warning-text">
          ⚠️ เลือกคนที่คุณคิดว่าน่าสงสัยที่สุด
        </p>
      </div>

      <div className="candidates-grid">
        {activeCandidates.map((candidate) => {
          const latestResponse = latestResponses[candidate.id]

          return (
            <div
              key={candidate.id}
              className="candidate-card elimination-card"
              style={{ borderColor: candidate.colorTheme }}
            >
              <div className="candidate-portrait">{candidate.portrait}</div>
              <h3 className="candidate-name">{candidate.name}</h3>
              <p className="candidate-archetype">{candidate.personality}</p>

              {/* NEW: Show latest response to help player make informed decision */}
              {latestResponse && (
                <div className="latest-response">
                  <p className="latest-response__label">คำตอบล่าสุด:</p>
                  <p className="latest-response__content">{latestResponse.content}</p>
                </div>
              )}

              <button
                className="eliminate-btn"
                onClick={() => handleEliminate(candidate.id)}
                style={{ backgroundColor: candidate.colorTheme }}
              >
                คัดออก
              </button>
            </div>
          )
        })}
      </div>

      <div className="elimination-info">
        <p className="elimination-info__text">
          💡 หลังจากคัดคนออกแล้ว คุณจะไม่สามารถย้อนกลับได้
        </p>
      </div>
    </div>
  )
}
