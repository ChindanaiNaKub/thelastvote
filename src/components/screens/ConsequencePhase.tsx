// ============================================================================
// Consequence Phase Screen
// ============================================================================
// Reveals the aftermath of the player's choice. Creates doubt and regret.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'

export function ConsequencePhase() {
  const { state, dispatch } = useGame()
  const chosenCandidate = state.candidates.find(c => c.id === state.playerVote)

  const handlePlayAgain = () => {
    dispatch(gameActions.resetGame())
    dispatch(gameActions.setPhase('introduction'))
  }

  return (
    <div className="screen consequence-screen">
      <h2>The Aftermath</h2>

      <div className="consequence-content">
        <p className="your-choice">
          You voted for: <strong>{chosenCandidate?.name}</strong>
        </p>

        <div className="consequence-section">
          <h3>Immediate Outcome</h3>
          <p className="placeholder">
            [Immediate consequences will be revealed here]
          </p>
        </div>

        <div className="consequence-section">
          <h3>Hidden Truths</h3>
          <p className="placeholder">
            [Secrets will be revealed here]
          </p>
        </div>

        <div className="consequence-section">
          <h3>Long-Term Consequences</h3>
          <p className="placeholder">
            [The ultimate outcome will be shown here]
          </p>
        </div>
      </div>

      <button onClick={handlePlayAgain} className="btn-primary">
        Play Again
      </button>
    </div>
  )
}
