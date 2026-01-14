// ============================================================================
// ResponsesGrid Component
// ============================================================================
// Displays all candidate responses in a grid layout
// Shows each candidate's response in a separate card
// ============================================================================

import type { Candidate, ConversationEntry } from '../../types/game'
import { CandidateResponseCard } from './CandidateResponseCard'
import './ResponsesGrid.css'

// ----------------------------------------------------------------------------

/**
 * Props for the ResponsesGrid component.
 */
export interface ResponsesGridProps {
  /** All candidates */
  candidates: Candidate[]
  /** Conversation history entries */
  entries: ConversationEntry[]
  /** Show "thinking..." indicator */
  isProcessing?: boolean
}

// ----------------------------------------------------------------------------

/**
 * ResponsesGrid displays candidate responses in a grid layout.
 * Filters for response entries and groups by candidate.
 */
export function ResponsesGrid({ candidates, entries, isProcessing = false }: ResponsesGridProps) {
  // Debug: log entries
  console.log('[ResponsesGrid] Total entries:', entries.length)
  console.log('[ResponsesGrid] All entries:', entries)

  // Filter only response entries (not player questions)
  const responseEntries = entries.filter(entry => entry.type === 'response')
  console.log('[ResponsesGrid] Response entries:', responseEntries.length)

  // Group responses by candidate
  const candidateResponses = candidates.map(candidate => {
    // Get the most recent response from this candidate
    const candidateEntries = responseEntries
      .filter(entry => entry.speaker === candidate.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    console.log(`[ResponsesGrid] ${candidate.name}: ${candidateEntries.length} responses`)

    return {
      candidate,
      latestEntry: candidateEntries[0] || null,
    }
  })

  return (
    <div className="responses-grid">
      {candidateResponses.map(({ candidate, latestEntry }) => (
        <div key={candidate.id} className="responses-grid__item">
          {latestEntry ? (
            <CandidateResponseCard
              candidate={candidate}
              entry={latestEntry}
              highlight={!isProcessing}
            />
          ) : (
            <div
              className="candidate-response-card candidate-response-card--empty"
              style={{ '--candidate-color': candidate.colorTheme } as React.CSSProperties}
            >
              <div className="candidate-response-card__header">
                <div className="candidate-response-card__portrait">{candidate.portrait}</div>
                <div className="candidate-response-card__name">{candidate.name}</div>
              </div>
              <div className="candidate-response-card__empty-state">
                ยังไม่ได้พูด...
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Thinking indicator overlay */}
      {isProcessing && (
        <div className="responses-grid__thinking">
          <div className="thinking-indicator">
            <span className="thinking-dot"></span>
            <span className="thinking-dot"></span>
            <span className="thinking-dot"></span>
          </div>
          <p className="thinking-text">กำลังคิด...</p>
        </div>
      )}
    </div>
  )
}
