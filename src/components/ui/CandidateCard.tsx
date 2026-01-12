// ============================================================================
// CandidateCard Component
// ============================================================================
// Reusable candidate display card with multiple variants.
// Used in CandidateRosterScreen and VotingPhase.
// ============================================================================

import type { Candidate } from '../../types/game'
import './CandidateCard.css'

// ----------------------------------------------------------------------------

/**
 * Props for the CandidateCard component.
 * Supports multiple variants: compact (roster), detailed, and voting.
 */
export interface CandidateCardProps {
  candidate: Candidate
  variant?: 'compact' | 'detailed' | 'voting'
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  showDescription?: boolean
}

// ----------------------------------------------------------------------------

/**
 * CandidateCard displays a candidate with portrait, name, and optional details.
 * Supports clickable variant for voting phase.
 */
export function CandidateCard({
  candidate,
  variant = 'compact',
  onClick,
  selected = false,
  disabled = false,
  showDescription = true,
}: CandidateCardProps) {
  // Build CSS classes based on props
  const cardClasses = [
    'candidate-card',
    variant && `candidate-card--${variant}`,
    selected && 'candidate-card--selected',
    disabled && 'candidate-card--disabled',
  ]
    .filter(Boolean)
    .join(' ')

  // Get first name for voting button
  const firstName = candidate.name.split(' ')[0]

  // Truncate personality to 3 sentences for compact view
  const getCompactPersonality = (text: string): string => {
    // Split by sentence endings (period, exclamation, question mark)
    const sentences = text.split(/(?<=[.!?])\s+/)
    const maxSentences = 3
    if (sentences.length <= maxSentences) return text
    return sentences.slice(0, maxSentences).join(' ')
  }

  return (
    <div
      className={cardClasses}
      style={{ borderColor: candidate.colorTheme }}
      onClick={!disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Portrait (emoji) */}
      <div className="candidate-card__portrait">{candidate.portrait}</div>

      {/* Name */}
      <h3 className="candidate-card__name">{candidate.name}</h3>

      {/* Personality description (shown in compact/detailed variants) */}
      {showDescription && variant !== 'voting' && (
        <p className="candidate-card__personality">
          {variant === 'compact'
            ? getCompactPersonality(candidate.personality)
            : candidate.personality}
        </p>
      )}

      {/* Voting button (only in voting variant) */}
      {variant === 'voting' && onClick && (
        <button
          className="candidate-card__vote-btn"
          style={{ backgroundColor: candidate.colorTheme }}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          ลงคะแนนให้ {firstName}
        </button>
      )}
    </div>
  )
}
