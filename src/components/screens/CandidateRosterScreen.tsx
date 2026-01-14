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
        5 คนที่ต่างตามหาคะแนนเสียงจากคุณ มารู้จักพวกเขา และอีกคนที่จะคอยจับตาดูอยู่
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
            position: 'relative',
            pointerEvents: 'none',
            // Remove filter from parent so child (stamp) is not affected
          }}
        >
          {/* Content Layer - Blurred & Grayscale */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--clinical-space-md)',
            opacity: 0.6,
            filter: 'grayscale(100%) blur(1px)', // Reduced blur slightly for legibility
            width: '100%'
          }}>
            <div className="candidate-card__portrait">🤴</div>
            <h3 className="candidate-card__name">ท่าน สว. ปราบ</h3>
            <p className="candidate-card__personality">
              ผู้มีอำนาจเหนือกว่า... คอยจับตาดูอยู่
            </p>
          </div>

          {/* Overlay Stamp - Sharp & Visible */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            border: '4px solid #ef4444', // Vivid Red
            color: '#ef4444',
            padding: '8px 16px',
            fontSize: '1.5rem',
            fontWeight: '800',
            opacity: 1, // Full opacity
            textTransform: 'uppercase',
            zIndex: 10,
            background: 'rgba(0,0,0,0.2)', // Semi-transparent background for contrast
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)', // Shadow for depth
            textShadow: '0 1px 2px rgba(0,0,0,0.5)', // Text shadow for readability
            backdropFilter: 'blur(0px)' // Ensure no blur leaks
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
