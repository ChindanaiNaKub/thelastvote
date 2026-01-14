// ============================================================================
// ClashCard Component
// ============================================================================
// Displays a clash event between two candidates
// Shows dialogue exchange with dramatic tension styling
// ============================================================================

import type { ClashEvent, Candidate } from '../../types/game'
import './ClashCard.css'

// ----------------------------------------------------------------------------

/**
 * Props for the ClashCard component.
 */
export interface ClashCardProps {
  /** The clash event to display */
  clashEvent: ClashEvent
  /** All candidates (for finding participants) */
  candidates: Candidate[]
}

// ----------------------------------------------------------------------------

/**
 * ClashCard displays a dramatic clash between two candidates.
 * Features:
 * - Shake animation on appear
 * - Orange/red accent colors for tension
 * - Participant portraits and names
 * - Dialogue exchange with emotion indicators
 */
export function ClashCard({ clashEvent, candidates }: ClashCardProps) {
  // Find the initiator and target candidates
  const initiator = candidates.find(c => c.id === clashEvent.initiator)
  const target = candidates.find(c => c.id === clashEvent.target)

  if (!initiator || !target) {
    console.warn('[ClashCard] Missing candidates for clash:', clashEvent.id)
    return null
  }

  return (
    <div className="clash-card">
      {/* Header with clash badge */}
      <div className="clash-card__header">
        <span className="clash-badge">⚔️ การปะทะ</span>
        <span className="clash-topic">{clashEvent.topic}</span>
      </div>

      {/* Participants display */}
      <div className="clash-card__participants">
        <div className="clash-participant">
          <span
            className="clash-participant__portrait"
            style={{ '--participant-color': initiator.colorTheme } as React.CSSProperties}
          >
            {initiator.portrait}
          </span>
          <span className="clash-participant__name">{initiator.name}</span>
        </div>

        <span className="clash-vs">VS</span>

        <div className="clash-participant">
          <span
            className="clash-participant__portrait"
            style={{ '--participant-color': target.colorTheme } as React.CSSProperties}
          >
            {target.portrait}
          </span>
          <span className="clash-participant__name">{target.name}</span>
        </div>
      </div>

      {/* Dialogue exchange */}
      <div className="clash-dialogue">
        {clashEvent.dialogueExchange.map((line, index) => {
          const speaker = candidates.find(c => c.id === line.speaker)
          if (!speaker) return null

          return (
            <div key={index} className={`clash-line clash-line--${line.emotion}`}>
              <strong className="clash-line__speaker">
                {speaker.portrait} {speaker.name}:
              </strong>
              <span className="clash-line__content">{line.content}</span>
            </div>
          )
        })}
      </div>

      {/* Context footer */}
      {clashEvent.triggers.context && (
        <div className="clash-context">
          <small>{clashEvent.triggers.context}</small>
        </div>
      )}
    </div>
  )
}
