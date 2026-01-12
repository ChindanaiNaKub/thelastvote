// ============================================================================
// Credits Screen
// ============================================================================
// Simple end screen. Shown after consequences (optional phase).
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'

export function CreditsScreen() {
  const { dispatch } = useGame()

  const handlePlayAgain = () => {
    dispatch(gameActions.resetGame())
    dispatch(gameActions.setPhase('introduction'))
  }

  return (
    <div className="screen credits-screen">
      <h1>The End</h1>

      <div className="credits-content">
        <p>Thank you for playing The Last Vote.</p>
        <p className="reflection">
          Every choice has consequences. Every vote matters.
        </p>
      </div>

      <button onClick={handlePlayAgain} className="btn-primary">
        Play Again
      </button>
    </div>
  )
}
