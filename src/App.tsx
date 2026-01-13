// ============================================================================
// Main App Component
// ============================================================================
// Implements phase-based routing and wraps the app with GameProvider.
// ============================================================================

import { GameProvider, useGame } from './context/GameContext'
import { IntroductionScreen } from './components/screens/IntroductionScreen'
import { CandidateRosterScreen } from './components/screens/CandidateRosterScreen'
import { QuestioningPhase } from './components/screens/QuestioningPhase'
import { VotingPhase } from './components/screens/VotingPhase'
import { ConsequencePhase } from './components/screens/ConsequencePhase'
import { CreditsScreen } from './components/screens/CreditsScreen'
import { ScreenTransition } from './components/ui/ScreenTransition'
import { AmbientEffects } from './components/ui/AmbientEffects'
import './App.css'

// ============================================================================
// AppContent - Inner component that uses the game context
// ============================================================================
function AppContent() {
  const { state } = useGame()

  // Phase-based routing: render the appropriate screen based on current phase
  const renderScreen = () => {
    switch (state.phase) {
      case 'introduction':
        return <IntroductionScreen />
      case 'roster':
        return <CandidateRosterScreen />
      case 'questioning':
        return <QuestioningPhase />
      case 'voting':
        return <VotingPhase />
      case 'consequence':
        return <ConsequencePhase />
      case 'credits':
        return <CreditsScreen />
      default:
        // This should never happen due to TypeScript exhaustiveness
        return <IntroductionScreen />
    }
  }

  // Wrap in ScreenTransition with key to re-trigger animation on phase change
  return (
    <ScreenTransition key={state.phase}>
      {renderScreen()}
    </ScreenTransition>
  )
}

// ============================================================================
// App - Root component that provides game context
// ============================================================================
function App() {
  return (
    <GameProvider>
      <AmbientEffects />
      <AppContent />
    </GameProvider>
  )
}

export default App
