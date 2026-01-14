// ============================================================================
// CandidateResponseCard Component
// ============================================================================
// Displays a single candidate's response in a card format
// Shows candidate portrait, name, and their response message
// ============================================================================

import type { Candidate, ConversationEntry } from '../../types/game'
import './CandidateResponseCard.css'

// ----------------------------------------------------------------------------

/**
 * Props for the CandidateResponseCard component.
 */
export interface CandidateResponseCardProps {
  /** The candidate data */
  candidate: Candidate
  /** The conversation entry to display */
  entry: ConversationEntry
  /** Optional: Show a highlight effect */
  highlight?: boolean
}

// ----------------------------------------------------------------------------

/**
 * CandidateResponseCard displays a single candidate's response with styling.
 * Used in QuestioningPhase to show all candidate responses in a grid.
 */
export function CandidateResponseCard({ candidate, entry, highlight = false }: CandidateResponseCardProps) {
  return (
    <div
      className={`candidate-response-card ${highlight ? 'candidate-response-card--highlight' : ''}`}
      style={{
        '--candidate-color': candidate.colorTheme,
      } as React.CSSProperties}
    >
      {/* Candidate header */}
      <div className="candidate-response-card__header">
        <div className="candidate-response-card__portrait">{candidate.portrait}</div>
        <div className="candidate-response-card__name">{candidate.name}</div>
      </div>

      {/* Response message */}
      <div className="candidate-response-card__message">
        {entry.content}
      </div>

      {/* Timestamp */}
      <div className="candidate-response-card__timestamp">
        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
