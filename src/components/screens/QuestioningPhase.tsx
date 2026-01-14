// ============================================================================
// Questioning Phase Screen
// ============================================================================
// The main gameplay loop. Player asks questions and candidates respond.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { ResponsesGrid } from '../ui/ResponsesGrid'
import { QuestionInput } from '../ui/QuestionInput'
import { generateCandidateResponse } from '../../lib/api'
import { useState, useEffect } from 'react'
import './QuestioningPhase.css'

export function QuestioningPhase() {
  const { state, dispatch } = useGame()
  const [apiModeNotice, setApiModeNotice] = useState<string | null>(null)

  // Determine if game should feel tense (low on questions)
  const isTense = state.questionsRemaining <= 1

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
        // Generate responses from ALL 5 candidates simultaneously
        const responsePromises = state.candidates.map(async (candidate) => {
          try {
            const response = await generateCandidateResponse({
              candidateId: candidate.id,
              question: question,
              conversationHistory: state.conversationHistory,
              mode: 'auto', // Automatically detect best mode
            })
            return {
              success: true,
              candidateId: candidate.id,
              content: response.content,
              modeUsed: response.modeUsed,
            }
          } catch (error) {
            console.error(`[API] Error for ${candidate.id}:`, error)
            // Return failed response for this candidate
            return {
              success: false,
              candidateId: candidate.id,
            }
          }
        })

        // Wait for all responses (parallel execution for speed)
        const allResponses = await Promise.all(responsePromises)

        // Separate successful and failed responses
        const successfulResponses = allResponses.filter((r) => r.success)
        const failedResponses = allResponses.filter((r) => !r.success)

        // Show mode notice for transparency
        const modesUsed = new Set(successfulResponses.map((r: any) => r.modeUsed))
        if (modesUsed.has('fallback')) {
          setApiModeNotice('📴 กำลังเล่นแบบออฟไลน์ - ใช้คำตอบที่เตรียมไว้')
          setTimeout(() => setApiModeNotice(null), 3000)
        } else if (modesUsed.has('mock')) {
          setApiModeNotice('🧪 โหมดทดสอบ - จำลองการตอบสนอง')
          setTimeout(() => setApiModeNotice(null), 2000)
        }

        // Add successful responses to conversation
        successfulResponses.forEach((response: any) => {
          console.log(`[QuestioningPhase] Adding successful response for ${response.candidateId}`)
          dispatch(gameActions.addConversationEntry({
            type: 'response',
            speaker: response.candidateId,
            content: response.content,
          }))
        })

        // Add fallback for failed responses
        failedResponses.forEach((response: any) => {
          console.log(`[QuestioningPhase] Adding fallback response for ${response.candidateId}`)
          dispatch(gameActions.addConversationEntry({
            type: 'response',
            speaker: response.candidateId,
            content: 'ขอโทษที่มีปัญหาทางเทคนิค แต่ฉันได้ยินคำถามของคุณ',
          }))
        })

        // Clear processing state
        dispatch(gameActions.setProcessing(false))

        console.log(`[API] Generated ${successfulResponses.length} successful responses, ${failedResponses.length} failed`)

      } catch (error) {
        // This should rarely happen due to fallbacks, but handle gracefully
        console.error('[API] Fatal error:', error)
        dispatch(gameActions.setProcessing(false))
      }
    }

    generateResponse()
  }

  // Suggested questions for players who need ideas
  const suggestedQuestions = [
    'คุณจะแก้ปัญหาเศรษฐกิจอย่างไร',
    'เหตุผลที่คุณควรได้รับเลือกคืออะไร',
    'คุณมีแผนอะไรสำหรับอนาคตเมืองนี้บ้าง',
  ]

  // Count how many questions have been asked
  const questionsAsked = state.conversationHistory.filter(entry => entry.type === 'question').length

  // Apply tense state to body as questions run out
  useEffect(() => {
    if (questionsAsked >= 2 && state.questionsRemaining <= 1) {
      document.body.classList.add('tense')
    } else {
      document.body.classList.remove('tense')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('tense')
    }
  }, [state.questionsRemaining, questionsAsked])

  const handleSuggestedQuestion = (question: string) => {
    if (!state.isProcessing && state.questionsRemaining > 0) {
      handleQuestionSubmit(question)
    }
  }

  return (
    <div className={`screen questioning-screen ${isTense ? 'questioning-screen--tense' : ''}`}>
      <div className="question-header">
        <h2>ถามคำถามของคุณ</h2>
        <p className="subtitle">ทุกคนจะตอบคำถามของคุณ</p>
        <p className={`questions-remaining ${state.questionsRemaining <= 1 ? 'urgent' : ''}`}>
          คำถามที่เหลือ: <strong>{state.questionsRemaining}</strong>
        </p>
      </div>

      {/* API mode notice */}
      {apiModeNotice && (
        <div className="api-mode-notice">{apiModeNotice}</div>
      )}

      {/* Suggested questions - show for first 3 rounds */}
      {state.questionsRemaining > 0 && !state.isProcessing && questionsAsked < 3 && (
        <div className="suggested-questions">
          <p className="suggested-questions__title">💡 คำถามแนะนำ:</p>
          <div className="suggested-questions__list">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="suggested-question-btn"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Responses Grid - Shows all candidate responses */}
      <ResponsesGrid
        entries={state.conversationHistory}
        candidates={state.candidates}
        isProcessing={state.isProcessing}
      />

      <QuestionInput
        onSubmit={handleQuestionSubmit}
        disabled={state.questionsRemaining === 0}
        isProcessing={state.isProcessing}
        questionsRemaining={state.questionsRemaining}
      />

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
