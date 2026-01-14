// ============================================================================
// Questioning Phase Screen
// ============================================================================
// The main gameplay loop. Player asks questions and candidates respond.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { ResponsesGrid } from '../ui/ResponsesGrid'
import { QuestionInput } from '../ui/QuestionInput'
import { ClashCard } from '../ui/ClashCard'
import { generateCandidateResponse } from '../../lib/api'
import { checkClashConditions, analyzeQuestionTopics } from '../../lib/tracking'
import { useState, useEffect } from 'react'
import './QuestioningPhase.css'

export function QuestioningPhase() {
  const { state, dispatch } = useGame()
  const [apiModeNotice, setApiModeNotice] = useState<string | null>(null)
  const [currentClash, setCurrentClash] = useState<typeof state.clashHistory[number] | null>(null)

  // Determine if game should feel tense (low on questions)
  const isTense = state.questionsRemaining <= 1

  // Count how many questions have been asked
  const questionsAsked = state.conversationHistory.filter(entry => entry.type === 'question').length

  // CRITICAL: Check if player must eliminate someone before asking more questions
  // With 3 questions, we can eliminate up to 3 candidates (after Q1, Q2, Q3)
  // This leaves 2 candidates for the final vote
  const totalEliminationsExpected = 3 // We expect up to 3 eliminations total (after Q1, Q2, Q3)
  const currentEliminationCount = state.eliminatedCandidateIds.length

  // Player must eliminate if:
  // 1. We have responses from the latest question AND
  // 2. We haven't eliminated someone for the current round yet
  // 3. We still have questions remaining (not final round)
  const hasLatestResponses = state.conversationHistory.some(e => e.type === 'response')
  const needsElimination = hasLatestResponses &&
                         questionsAsked > currentEliminationCount &&
                         currentEliminationCount < totalEliminationsExpected &&
                         state.questionsRemaining > 0

  const handleVoteNow = () => {
    // CRITICAL: Must have at least one round of responses before proceeding
    const responseEntries = state.conversationHistory.filter(e => e.type === 'response')

    if (responseEntries.length === 0) {
      // Don't allow proceeding without seeing responses
      alert('กรุณารอสักครู่ คำตอบจาก candidates ยังไม่ปรากฏ')
      return
    }

    // After responses are shown, route to elimination phase
    // (unless it's the final round, then go directly to voting)
    if (state.questionsRemaining === 0) {
      // No more questions - go straight to voting (3 candidates remain)
      dispatch(gameActions.setPhase('voting'))
    } else {
      // Go to elimination phase to eliminate one candidate
      dispatch(gameActions.setPhase('elimination'))
    }
  }

  // Handle question submission
  const handleQuestionSubmit = (question: string, targetCandidateId?: string) => {
    // CRITICAL: Prevent asking more questions if elimination is needed
    if (needsElimination) {
      alert('⚠️ คุณต้องคัดคนออก 1 คนก่อนถึงจะถามคำถามต่อได้\n\nกด "ถัดไป - คัดคนออก" เพื่อไปยังหน้าคัดคนออก')
      return
    }

    // Part 3: Track question statistics
    const topics = analyzeQuestionTopics(question)
    const actualTargetId = targetCandidateId || state.candidates.find(c => !c.isEliminated)?.id || ''

    // Dispatch TRACK_QUESTION action
    dispatch({
      type: 'TRACK_QUESTION',
      payload: {
        candidateId: actualTargetId,
        topics,
      }
    } as any)

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
        // CRITICAL: Filter out eliminated candidates to save tokens
        // This ensures we only generate responses for active candidates
        const activeCandidates = state.candidates.filter(
          (c) => !state.eliminatedCandidateIds.includes(c.id)
        )

        console.log(`[QuestioningPhase] Generating for ${activeCandidates.length} active candidates (eliminated: ${state.eliminatedCandidateIds.length})`)

        // Generate responses from active candidates only
        const responsePromises = activeCandidates.map(async (candidate) => {
          try {
            // Get pressure level for this candidate (Priority 4.3.2)
            const pressureLevel = state.pressureStates[candidate.id]?.pressureLevel || 0

            const response = await generateCandidateResponse({
              candidateId: candidate.id,
              question: question,
              conversationHistory: state.conversationHistory,
              mode: 'auto', // Automatically detect best mode
              pressureLevel, // Pass pressure for stress responses
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

        // Check for clash conditions after all responses are received
        const clash = checkClashConditions(state)
        if (clash) {
          console.log('[QuestioningPhase] Clash detected!', clash)
          // Add clash to game state
          dispatch(gameActions.addClash(clash))
          // Set current clash for display
          setCurrentClash(clash)
        } else {
          // Clear current clash if no new clash
          setCurrentClash(null)
        }

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

  // Apply tense state to body as questions run out
  useEffect(() => {
    if (questionsAsked >= 1 && state.questionsRemaining <= 1) {
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
        <p className="subtitle">ทุกคนจะตอบคำถามของคุณ (คนที่ไม่ถูกคัดออก)</p>
        <p className={`questions-remaining ${state.questionsRemaining <= 1 ? 'urgent' : ''}`}>
          คำถามที่เหลือ: <strong>{state.questionsRemaining}</strong>
        </p>
      </div>

      {/* API mode notice */}
      {apiModeNotice && (
        <div className="api-mode-notice">{apiModeNotice}</div>
      )}

      {/* CRITICAL: Warning message when elimination is required */}
      {needsElimination && (
        <div className="elimination-required-notice">
          <p>⚠️ <strong>ต้องคัดคนออกก่อน!</strong></p>
          <p>คุณต้องคัด 1 คนออกก่อนถึงจะถามคำถามต่อได้</p>
          <p>กดปุ่ม "ถัดไป - คัดคนออก" ด้านล่าง</p>
        </div>
      )}

      {/* Suggested questions - show for first 2 rounds */}
      {state.questionsRemaining > 0 && !state.isProcessing && !needsElimination && questionsAsked < 2 && (
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

      {/* Clash Card - Shows when candidates attack each other */}
      {currentClash && (
        <ClashCard
          clashEvent={currentClash}
          candidates={state.candidates}
        />
      )}

      <QuestionInput
        onSubmit={handleQuestionSubmit}
        disabled={state.questionsRemaining === 0 || needsElimination}
        isProcessing={state.isProcessing}
        questionsRemaining={state.questionsRemaining}
      />

      <div className="actions">
        <button
          onClick={handleVoteNow}
          disabled={state.isProcessing}
          className="btn-primary"
        >
          {state.questionsRemaining === 0 ? 'ลงคะแนนทันที' : 'ถัดไป - คัดคนออก'}
        </button>
      </div>
    </div>
  )
}
