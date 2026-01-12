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

    // Set processing state (for future AI integration)
    dispatch(gameActions.setProcessing(true))

    // Note: In Phase 2 (AI Integration), this will:
    // 1. Call the AI API with the question and conversation history
    // 2. Add candidate responses to the conversation
    // 3. Clear the processing state
    //
    // For now, we simulate a response delay for testing
    setTimeout(() => {
      dispatch(gameActions.setProcessing(false))

      // Demo: Add a mock response from targeted candidate (or all if none targeted)
      const responderId = targetCandidateId || state.candidates[0].id
      const responder = state.candidates.find(c => c.id === responderId)

      if (responder) {
        dispatch(gameActions.addConversationEntry({
          type: 'response',
          speaker: responder.id,
          content: `[This is a placeholder response from ${responder.name}. AI integration will be added in Phase 2.]`,
        }))
      }
    }, 1000)
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
        <h2>Ask Your Questions</h2>
        <p className={`questions-remaining ${state.questionsRemaining <= 1 ? 'urgent' : ''}`}>
          Questions Remaining: <strong>{state.questionsRemaining}</strong>
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
        <h3>Candidates {selectedCandidate && `(Click to deselect ${selectedCandidate.name})`}</h3>
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
          {state.questionsRemaining > 0 ? 'Ask more questions first' : 'Vote Now'}
        </button>
      </div>
    </div>
  )
}
