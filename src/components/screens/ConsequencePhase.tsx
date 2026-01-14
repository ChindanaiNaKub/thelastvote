// ============================================================================
// Consequence Phase Screen
// ============================================================================
// Reveals the aftermath of the player's choice. Creates doubt and regret.
// Phase 4: Enhanced with dynamic timing based on impact level.
// ============================================================================

import './ConsequencePhase.css'
import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { getPhaseTiming } from '../../lib/consequenceTiming'
import './ConsequencePhase.css'

export function ConsequencePhase() {
  const { state, dispatch } = useGame()
  const [revealPhase, setRevealPhase] = useState(0)

  const chosenCandidate = state.candidates.find(c => c.id === state.playerVote)
  const consequences = state.consequences

  // Phase 4: Calculate dynamic timing for initial reveal
  useEffect(() => {
    if (!consequences) return

    const timing = getPhaseTiming(consequences, 1)
    const timer = setTimeout(() => {
      setRevealPhase(1)
    }, timing.delay)

    return () => clearTimeout(timer)
  }, [consequences])

  // Phase 4: Get timing for each reveal phase
  const getTimingForPhase = (phase: 1 | 2 | 3 | 4) => {
    if (!consequences) return { delay: 1500, animation: 'fade' as const }
    return getPhaseTiming(consequences, phase)
  }

  const handlePlayAgain = () => {
    dispatch(gameActions.resetGame())
    dispatch(gameActions.setPhase('introduction'))
  }

  // Guard clause - if no consequences, show loading
  if (!consequences) {
    return (
      <div className="screen consequence-screen">
        <h2>ผลที่ตามมา</h2>
        <p className="placeholder">กำลังคำนวณผลลัพธ์...</p>
      </div>
    )
  }

  // Phase 4: Get animation class for each phase
  const getAnimationClass = (phase: number) => {
    const timing = getTimingForPhase(phase as 1 | 2 | 3 | 4)
    return `consequence-section--${timing.animation}`
  }

  return (
    <div className="screen consequence-screen">
      <h2>ผลที่ตามมา</h2>

      {/* Chosen candidate display */}
      <div
        className="chosen-candidate"
        style={{ borderColor: chosenCandidate?.colorTheme }}
      >
        <span className="chosen-candidate__portrait">{chosenCandidate?.portrait}</span>
        <strong className="chosen-candidate__name">{chosenCandidate?.name}</strong>
      </div>

      {/* Phase 1: Immediate Aftermath */}
      {revealPhase >= 1 && (
        <div className={`consequence-section ${getAnimationClass(1)}`}>
          <h3 className="consequence-section__title">
            ผลลัพธ์ทันที
            <span className="consequence-section__timeframe">
              ({consequences.immediateAftermath.timeframe})
            </span>
          </h3>
          <p className="consequence-section__content">
            {consequences.immediateAftermath.outcome}
          </p>
          <div className="consequence-section__details">
            <p className="consequence-section__expected">
              <strong>ที่คาดหวัง:</strong> {consequences.immediateAftermath.expectedOutcome}
            </p>
            <p className="consequence-section__unexpected">
              <strong>ที่เกิดขึ้นจริง:</strong> {consequences.immediateAftermath.unexpectedOutcome}
            </p>
          </div>
        </div>
      )}

      {revealPhase === 1 && (
        <button
          onClick={() => setRevealPhase(2)}
          className="btn-primary consequence-screen__continue-btn"
        >
          ดำเนินการต่อ
        </button>
      )}

      {/* Phase 2: Hidden Truths */}
      {revealPhase >= 2 && (
        <div className={`consequence-section ${getAnimationClass(2)}`}>
          <h3 className="consequence-section__title">ความจริงที่ซ่อนอยู่</h3>
          <p className="consequence-section__content secret">
            {consequences.hiddenTruths.chosenCandidateSecret}
          </p>
          <div className="consequence-section__other-secrets">
            <p className="consequence-section__question">
              <em>{consequences.hiddenTruths.questionNeverAsked}</em>
            </p>
            {consequences.hiddenTruths.otherCandidateSecrets.map((secret) => (
              <p
                key={secret.candidateId}
                className={`consequence-section__other-secret ${
                  secret.makesPlayerRethink ? 'consequence-section__other-secret--rethink' : ''
                }`}
              >
                {state.candidates.find(c => c.id === secret.candidateId)?.name}: {secret.secret}
              </p>
            ))}
          </div>
        </div>
      )}

      {revealPhase === 2 && (
        <button
          onClick={() => setRevealPhase(3)}
          className="btn-primary consequence-screen__continue-btn"
        >
          ดำเนินการต่อ
        </button>
      )}

      {/* Phase 3: Long-term Consequences */}
      {revealPhase >= 3 && (
        <div className={`consequence-section ${getAnimationClass(3)}`}>
          <h3 className="consequence-section__title">
            ผลกระทบในระยะยาว
            <span className="consequence-section__timeframe">
              ({consequences.longTermConsequences.timeframe})
            </span>
          </h3>
          <p className="consequence-section__content">
            {consequences.longTermConsequences.outcome}
          </p>
          <div className="consequence-section__reflection">
            <p className="consequence-section__good">
              <span className="consequence-section__label">สิ่งที่ดี:</span>{' '}
              {consequences.longTermConsequences.goodOutcomes.join(' • ')}
            </p>
            <p className="consequence-section__bad">
              <span className="consequence-section__label">สิ่งที่เสีย:</span>{' '}
              {consequences.longTermConsequences.badOutcomes.join(' • ')}
            </p>
            <p className="consequence-section__final">
              <em>{consequences.longTermConsequences.finalReflection}</em>
            </p>
          </div>
        </div>
      )}

      {revealPhase === 3 && (
        <button
          onClick={() => setRevealPhase(4)}
          className="btn-primary consequence-screen__continue-btn"
        >
          ดูสิ่งที่อาจเกิดขึ้น
        </button>
      )}

      {/* Phase 4: Alternative Paths + Play Again */}
      {revealPhase >= 4 && (
        <>
          <div className={`consequence-section consequence-section--alternatives ${getAnimationClass(4)}`}>
            <h3 className="consequence-section__title">หากคุณเลือกคนอื่น...</h3>
            {consequences.alternativePaths.map((path) => {
              const candidate = state.candidates.find(c => c.id === path.candidateId)
              return (
                <p key={path.candidateId} className="consequence-section__alternative">
                  <span
                    className="consequence-section__alternative-portrait"
                    style={{ color: candidate?.colorTheme }}
                  >
                    {candidate?.portrait}
                  </span>{' '}
                  {path.wouldHaveHappened}
                </p>
              )
            })}
          </div>

          <div className="consequence-screen__actions">
            <button onClick={handlePlayAgain} className="btn-primary">
              เล่นอีกครั้ง
            </button>
          </div>
        </>
      )}
    </div>
  )
}
