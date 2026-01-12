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
      <h2>ผลที่ตามมา</h2>

      <div className="consequence-content">
        <p className="your-choice">
          คุณลงคะแนนให้: <strong>{chosenCandidate?.name}</strong>
        </p>

        <div className="consequence-section">
          <h3>ผลลัพธ์ทันที</h3>
          <p className="placeholder">
            [ผลทันทีจะแสดงที่นี่]
          </p>
        </div>

        <div className="consequence-section">
          <h3>ความจริงที่ซ่อนอยู่</h3>
          <p className="placeholder">
            [ความลับจะเปิดเผยที่นี่]
          </p>
        </div>

        <div className="consequence-section">
          <h3>ผลกระทบในระยะยาว</h3>
          <p className="placeholder">
            [ผลลัพธ์สุดท้ายจะแสดงที่นี่]
          </p>
        </div>
      </div>

      <button onClick={handlePlayAgain} className="btn-primary">
        เล่นอีกครั้ง
      </button>
    </div>
  )
}
