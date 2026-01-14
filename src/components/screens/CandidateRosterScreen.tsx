// ============================================================================
// Candidate Roster Screen
// ============================================================================
// Introduces all 5 candidates to the player.
// ============================================================================

import './CandidateRosterScreen.css'
import { useGame } from '../../context/GameContext'
import { gameActions } from '../../context/GameContext'
import { CandidateCard } from '../ui/CandidateCard'

export function CandidateRosterScreen() {
  const { state, dispatch } = useGame()

  const handleContinue = () => {
    dispatch(gameActions.setPhase('questioning'))
  }

  return (
    <div className="screen roster-screen">
      <h2>พบกับ Candidates</h2>
      <p className="subtitle">
        5 คนที่ต่างตามหาคะแนนเสียงจากคุณ มารู้จักพวกเขา
      </p>

      <div className="candidates-grid">
        {state.candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            variant="compact"
          />
        ))}

        {/* Hidden Senator Card (Easter Egg / Introduction) */}
        <div
          className="candidate-card candidate-card--compact candidate-card--hidden-senator"
          style={{
            opacity: 0.7,
            filter: 'grayscale(100%) blur(2px)',
            pointerEvents: 'none',
            position: 'relative'
          }}
        >
          <div className="candidate-card__portrait">🤴</div>
          <h3 className="candidate-card__name">ท่าน สว. ปราบ</h3>
          <p className="candidate-card__personality">
            ผู้มีอำนาจเหนือกว่า... คอยจับตาดูอยู่
          </p>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            border: '4px solid red',
            color: 'red',
            padding: '10px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            opacity: 0.6,
            textTransform: 'uppercase'
          }}>
            LOCKED
          </div>
        </div>
      </div>

      <button onClick={handleContinue} className="btn-primary">
        ไปยังการถามคำถาม
      </button>
    </div>
  )
}
