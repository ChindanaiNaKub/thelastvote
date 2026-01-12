// ============================================================================
// Questioning Phase Screen
// ============================================================================
// The main gameplay loop. Player asks questions and candidates respond.
// ============================================================================

import { useMemo } from 'react'
import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { DialogueBox } from '../ui/DialogueBox'
import { QuestionInput } from '../ui/QuestionInput'
import { generateCandidateResponse } from '../../lib/api'

export function QuestioningPhase() {
  const { state, dispatch } = useGame()

  const handleVoteNow = () => {
    if (state.questionsRemaining === 0) {
      dispatch(gameActions.setPhase('voting'))
    }
  }

  // Handle question submission
  const handleQuestionSubmit = (question: string, targetCandidateId?: string) => {
    // Add conversation entry
    dispatch(gameActions.addConversationEntry({
      type: 'question',
      speaker: 'player',
      content: question,
      targetedCandidate: targetCandidateId,
    }))

    // Decrement questions remaining
    dispatch(gameActions.decrementQuestions())

    // Set processing state (for AI integration)
    dispatch(gameActions.setProcessing(true))

    // Generate candidate response using API client
    const generateResponse = async () => {
      try {
        // Determine which candidate should respond
        const responderId = targetCandidateId || state.candidates[0].id
        const responder = state.candidates.find(c => c.id === responderId)

        if (!responder) {
          throw new Error('Candidate not found')
        }

        // Call API to generate response
        const response = await generateCandidateResponse({
          candidateId: responderId,
          question: question,
          conversationHistory: state.conversationHistory,
          mode: 'auto', // Automatically detect best mode
        })

        // Clear processing state
        dispatch(gameActions.setProcessing(false))

        // Add response to conversation
        dispatch(gameActions.addConversationEntry({
          type: 'response',
          speaker: responder.id,
          content: response.content,
        }))

        console.log(`[API] Response generated using ${response.modeUsed} mode`)

      } catch (error) {
        // This should rarely happen due to fallbacks, but handle gracefully
        console.error('[API] Fatal error:', error)
        dispatch(gameActions.setProcessing(false))

        // Determine responder for fallback
        const responderId = targetCandidateId || state.candidates[0].id
        const responder = state.candidates.find(c => c.id === responderId)

        // Last resort: Use hardcoded fallback
        dispatch(gameActions.addConversationEntry({
          type: 'response',
          speaker: responder?.id || state.candidates[0].id,
          content: 'ขอโทษที่มีปัญหาทางเทคนิค แต่ฉันได้ยินคำถามของคุณ',
        }))
      }
    }

    generateResponse()
  }

  // Handle candidate selection
  const handleCandidateClick = (candidateId: string) => {
    const currentSelection = state.selectedCandidate
    // Toggle: if already selected, deselect; otherwise select
    dispatch(gameActions.selectCandidate(currentSelection === candidateId ? null : candidateId))
  }

  // Get selected candidate object for QuestionInput
  const selectedCandidate = useMemo(() => {
    if (!state.selectedCandidate) return null
    return state.candidates.find(c => c.id === state.selectedCandidate) || null
  }, [state.selectedCandidate, state.candidates])

  return (
    <div className="screen questioning-screen">
      <div className="question-header">
        <h2>ถามคำถามของคุณ</h2>
        <p className={`questions-remaining ${state.questionsRemaining <= 1 ? 'urgent' : ''}`}>
          คำถามที่เหลือ: <strong>{state.questionsRemaining}</strong>
        </p>
      </div>

      <DialogueBox
        entries={state.conversationHistory}
        candidates={state.candidates}
        isProcessing={state.isProcessing}
      />

      <QuestionInput
        onSubmit={handleQuestionSubmit}
        disabled={state.questionsRemaining === 0}
        isProcessing={state.isProcessing}
        questionsRemaining={state.questionsRemaining}
        selectedCandidate={selectedCandidate}
      />

      <div className="candidates-list">
        <h3>Candidates {selectedCandidate && `(คลิกเพื่อยกเลิกเลือก ${selectedCandidate.name})`}</h3>
        {state.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`candidate-item ${state.selectedCandidate === candidate.id ? 'candidate-item--selected' : ''}`}
            onClick={() => handleCandidateClick(candidate.id)}
            style={{ cursor: 'pointer', border: state.selectedCandidate === candidate.id ? `2px solid ${candidate.colorTheme}` : 'none' }}
          >
            <span className="candidate-emoji">{candidate.portrait}</span>
            <span>{candidate.name}</span>
            {candidate.hasSpoken && <span className="spoken-indicator">✓</span>}
            {state.selectedCandidate === candidate.id && <span className="selected-indicator">🎯</span>}
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          onClick={handleVoteNow}
          disabled={state.questionsRemaining > 0}
          className="btn-primary"
        >
          {state.questionsRemaining > 0 ? 'ถามคำถามเพิ่มเติมก่อน' : 'ลงคะแนนทันที'}
        </button>
      </div>
    </div>
  )
}
