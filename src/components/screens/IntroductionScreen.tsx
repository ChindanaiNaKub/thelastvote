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
          You are the final voter in a fictional town. Five candidates seek your trust.
        </p>
        <p className="lead">
          Some lie. Some tell the truth. None reveal everything.
        </p>
        <p className="warning">
          You may ask only <strong>three questions</strong> before your vote becomes final.
        </p>
        <p className="reflection">
          Choose wisely.
        </p>
      </div>

      <button onClick={handleBegin} className="btn-primary">
        Begin
      </button>
    </div>
  )
}
