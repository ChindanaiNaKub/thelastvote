// ============================================================================
// Mastermind Reveal Component
// ============================================================================
// Dramatic plot twist reveal showing Prab as the game creator.
// Creates a cinematic fourth-wall-breaking moment.
// ============================================================================

import { useEffect, useState } from 'react'
import type { PlayerStats } from '../../types/game'
import { getMainRevealText, getPrabMessage, getRandomPrabSignature, detectPlayerSuspicion } from '../../data/prabReveal'

interface MastermindRevealProps {
  playerStats: PlayerStats
  onContinue: () => void
}

/**
 * MastermindReveal - The dramatic plot twist component.
 *
 * Reveals Prab as the game master in a cinematic sequence.
 * Shows personalized messages based on player behavior.
 */
export function MastermindReveal({ playerStats, onContinue }: MastermindRevealProps) {
  const [showContent, setShowContent] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)

  const prabMessage = getPrabMessage(playerStats)
  const revealText = getMainRevealText(playerStats)
  const signature = getRandomPrabSignature()
  const suspicion = detectPlayerSuspicion(playerStats)

  // Cinematic reveal timing
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500)
    const t2 = setTimeout(() => setShowSignature(true), 2500)
    const t3 = setTimeout(() => setShowQuestion(true), 4000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="mastermind-reveal">
      {/* Dramatic divider */}
      <div className="mastermind-reveal__divider" />

      {/* Main reveal content */}
      <div className={`mastermind-reveal__content ${showContent ? 'visible' : ''}`}>
        {/* Title */}
        <h2 className="mastermind-reveal__title">
          🎭 ความจริงที่ถูกซ่อนอยู่
        </h2>

        {/* Main reveal text */}
        <div className="mastermind-reveal__text">
          {revealText.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mastermind-reveal__paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Suspicion acknowledgment */}
        {suspicion.suspected && (
          <div className={`mastermind-reveal__suspicion ${showContent ? 'visible' : ''}`}>
            <div className="mastermind-reveal__suspicion-label">
              สิ่งที่คุณสังเกตเห็น:
            </div>
            <ul className="mastermind-reveal__suspicion-list">
              {suspicion.clues.map((clue, idx) => (
                <li key={idx} className="mastermind-reveal__suspicion-item">
                  • {clue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personal message from Prab */}
        <div className={`mastermind-reveal__message ${showSignature ? 'visible' : ''}`}>
          <div className="mastermind-reveal__message-title">
            {prabMessage.title}
          </div>
          <div className="mastermind-reveal__message-text">
            {prabMessage.message}
          </div>
          <div className="mastermind-reveal__archetype">
            ประเภท: <strong>{prabMessage.archetype}</strong>
          </div>
        </div>

        {/* Signature */}
        {showSignature && (
          <div className="mastermind-reveal__signature">
            {signature}
          </div>
        )}

        {/* Continue prompt */}
        {showQuestion && (
          <div className="mastermind-reveal__action">
            <button
              className="btn btn-primary mastermind-reveal__continue-btn"
              onClick={onContinue}
            >
              ดำเนินการต่อ
            </button>
          </div>
        )}
      </div>

      {/* Bottom divider */}
      <div className="mastermind-reveal__divider mastermind-reveal__divider--bottom" />
    </div>
  )
}
