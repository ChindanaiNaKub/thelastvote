// ============================================================================
// DialogueBox Component
// ============================================================================
// Displays conversation history with player questions and candidate responses.
// Used in QuestioningPhase to show the dialogue between player and candidates.
// ============================================================================

import { useEffect, useRef } from 'react'
import type { Candidate, ConversationEntry } from '../../types/game'
import './DialogueBox.css'

// ----------------------------------------------------------------------------

/**
 * Props for the DialogueBox component.
 */
export interface DialogueBoxProps {
  /** Conversation history to display */
  entries: ConversationEntry[]
  /** All candidates (for lookups by ID) */
  candidates: Candidate[]
  /** Show "thinking..." indicator */
  isProcessing?: boolean
}

// ----------------------------------------------------------------------------

/**
 * DialogueBox displays the conversation history with proper styling.
 * Handles auto-scroll to latest message and shows empty state.
 */
export function DialogueBox({ entries, candidates, isProcessing = false }: DialogueBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, isProcessing])

  // Find candidate by ID
  const getCandidate = (id: string): Candidate | undefined => {
    return candidates.find((c) => c.id === id)
  }

  // Check if entry is from player
  const isPlayerEntry = (entry: ConversationEntry): boolean => {
    return entry.speaker === 'player'
  }

  return (
    <div className="dialogue-box" ref={scrollRef}>
      {/* Render conversation entries */}
      {entries.map((entry) => {
        const isPlayer = isPlayerEntry(entry)
        const candidate = isPlayer ? null : getCandidate(entry.speaker)

        return (
          <div
            key={entry.id}
            className={`dialogue-entry ${isPlayer ? 'dialogue-entry--player' : 'dialogue-entry--candidate'} dialogue-entry--${entry.type}`}
          >
            {/* Candidate portrait (left side) */}
            {!isPlayer && candidate && (
              <div className="dialogue-entry__portrait">{candidate.portrait}</div>
            )}

            {/* Content container */}
            <div className="dialogue-entry__content">
              {/* Speaker name (for candidates) */}
              {!isPlayer && candidate && (
                <div className="dialogue-entry__speaker" style={{ color: candidate.colorTheme }}>
                  {candidate.name}
                </div>
              )}

              {/* Message content */}
              <div className="dialogue-entry__message">{entry.content}</div>

              {/* Timestamp */}
              <div className="dialogue-entry__timestamp">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Thinking indicator */}
      {isProcessing && (
        <div className="dialogue-box__thinking">
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
          <span className="thinking-dot"></span>
        </div>
      )}

      {/* Empty state hint */}
      {entries.length === 0 && !isProcessing && (
        <div className="dialogue-box__empty-hint">
          Type your question below to begin...
        </div>
      )}
    </div>
  )
}
