// ============================================================================
// QuestionInput Component
// ============================================================================
// Handles player question submission with character limit and validation.
// Used in QuestioningPhase to capture player input.
// ============================================================================

import { useState, useCallback, useEffect } from 'react'
import type { Candidate } from '../../types/game'
import './QuestionInput.css'

// ----------------------------------------------------------------------------

const MAX_CHARS = 500
const WARNING_THRESHOLD = 450

/**
 * Props for the QuestionInput component.
 */
export interface QuestionInputProps {
  /** Called when player submits a question */
  onSubmit: (question: string, targetCandidateId?: string) => void
  /** Disable input entirely */
  disabled?: boolean
  /** Show loading state */
  isProcessing?: boolean
  /** Number of questions remaining (affects button text) */
  questionsRemaining?: number
  /** Currently selected candidate for targeting */
  selectedCandidate?: Candidate | null
}

// ----------------------------------------------------------------------------

/**
 * QuestionInput provides a text input field with character counter and submit button.
 * Handles validation, disabled states, and candidate targeting display.
 */
export function QuestionInput({
  onSubmit,
  disabled = false,
  isProcessing = false,
  questionsRemaining = 3,
  selectedCandidate = null,
}: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  // Compute whether input should be disabled
  const isDisabled = disabled || isProcessing || questionsRemaining === 0

  // Compute character counter state
  const charCount = question.length
  const isNearLimit = charCount >= WARNING_THRESHOLD
  const isAtLimit = charCount >= MAX_CHARS
  const counterClass = isAtLimit ? 'question-input__char-counter--error' : isNearLimit ? 'question-input__char-counter--warning' : ''

  // Compute submit button state
  const canSubmit = !isDisabled && question.trim().length > 0 && charCount <= MAX_CHARS

  // Get submit button text
  const getSubmitText = () => {
    if (questionsRemaining === 0) return 'No questions remaining'
    if (isProcessing) return 'Asking...'
    return questionsRemaining === 1 ? 'Ask (1 left)' : `Ask (${questionsRemaining} left)`
  }

  // Handle text input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setQuestion(text)
    }
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const trimmed = question.trim()
    if (trimmed.length === 0 || trimmed.length > MAX_CHARS || isDisabled) {
      return
    }

    onSubmit(trimmed, selectedCandidate?.id)
    setQuestion('') // Clear input after submit
  }, [question, onSubmit, selectedCandidate, isDisabled])

  // Handle clear button
  const handleClear = useCallback(() => {
    setQuestion('')
  }, [])

  // Handle keyboard shortcut (Ctrl+Enter / Cmd+Enter to submit)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  // Clear input when questions remaining changes to 0
  useEffect(() => {
    if (questionsRemaining === 0) {
      setQuestion('')
    }
  }, [questionsRemaining])

  return (
    <div className="question-input">
      {/* Selected candidate display */}
      {selectedCandidate && (
        <div className="question-input__target" style={{ color: selectedCandidate.colorTheme }}>
          Asking: {selectedCandidate.name} {selectedCandidate.portrait}
        </div>
      )}

      {/* Warning when 1 question remaining */}
      {questionsRemaining === 1 && !isDisabled && (
        <div className="question-input__warning">
          ⚠️ This is your last question. Make it count!
        </div>
      )}

      {/* Text input field */}
      <textarea
        className={`question-input__field ${isDisabled ? 'question-input__field--disabled' : ''}`}
        value={question}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={selectedCandidate ? `Ask ${selectedCandidate.name.split(' ')[0]} a question...` : 'Ask the candidates a question...'}
        rows={3}
        maxLength={MAX_CHARS}
      />

      {/* Character counter and action buttons */}
      <div className="question-input__footer">
        <div className={`question-input__char-counter ${counterClass}`}>
          {charCount} / {MAX_CHARS}
        </div>

        <div className="question-input__actions">
          {/* Clear button */}
          {question.length > 0 && !isDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className="question-input__clear"
              disabled={isDisabled}
            >
              Clear
            </button>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            className={`question-input__submit ${!canSubmit ? 'question-input__submit--disabled' : ''}`}
            disabled={!canSubmit}
          >
            {getSubmitText()}
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      {!isDisabled && (
        <div className="question-input__hint">
          Press Ctrl+Enter to submit
        </div>
      )}
    </div>
  )
}
