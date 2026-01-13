// ============================================================================
// Credits Screen
// ============================================================================
// Simple end screen. Shown after consequences (optional phase).
// ============================================================================

import './CreditsScreen.css'
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
      <h1>จบ</h1>

      <div className="credits-content">
        <p>ขอบคุณที่มาเล่น The Last Vote</p>
        <p className="reflection">
          ทุกทางเลือกมีผลที่ตามมา ทุกเสียงมีความสำคัญ
        </p>
      </div>

      <button onClick={handlePlayAgain} className="btn-primary">
        เล่นอีกครั้ง
      </button>
    </div>
  )
}
