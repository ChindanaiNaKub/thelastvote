// ============================================================================
// Introduction Screen
// ============================================================================
// The first screen players see. Sets the mood and explains the premise.
// ============================================================================

import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'

export function IntroductionScreen() {
  const { dispatch } = useGame()

  const handleBegin = () => {
    dispatch(gameActions.setPhase('roster'))
  }

  return (
    <div className="screen introduction-screen">
      <h1>The Last Vote</h1>

      <div className="intro-content">
        <p className="lead">
          คุณเป็นผู้ลงคะแนนคนสุดท้ายในเมืองสมมติ ห้า candidates ต่างมองหาความไว้วางใจจากคุณ
        </p>
        <p className="lead">
          บางคนโกหก บางคนบอกความจริง แต่ไม่มีใครเปิดเผยทุกอย่าง
        </p>
        <p className="warning">
          คุณสามารถถามได้เพียง <strong>สามคำถาม</strong> ก่อนที่การลงคะแนนจะเป็นที่สิ้นสุด
        </p>
        <p className="reflection">
          เลือกอย่างรอบคอบ
        </p>
      </div>

      <button onClick={handleBegin} className="btn-primary">
        เริ่มเกม
      </button>
    </div>
  )
}
