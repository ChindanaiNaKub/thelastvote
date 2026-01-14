// ============================================================================
// Main App Component
// ============================================================================
// Implements phase-based routing and wraps the app with GameProvider.
// ============================================================================

import { useEffect } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import { IntroductionScreen } from './components/screens/IntroductionScreen'
import { CandidateRosterScreen } from './components/screens/CandidateRosterScreen'
import { QuestioningPhase } from './components/screens/QuestioningPhase'
import { EliminationPhase } from './components/screens/EliminationPhase'
import { VotingPhase } from './components/screens/VotingPhase'
import { ConsequencePhase } from './components/screens/ConsequencePhase'
import { CreditsScreen } from './components/screens/CreditsScreen'
import { AppFooter } from './components/ui/AppFooter'
import './App.css'

// ============================================================================
// AppContent - Inner component that uses the game context
// ============================================================================

function AppContent() {
  const { state } = useGame()

  // Scroll to top when phase changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.phase])

  // Phase-based routing: render the appropriate screen based on current phase
  switch (state.phase) {
    case 'introduction':
      return (
        <>
          <IntroductionScreen />
          <AppFooter />
        </>
      )

    case 'roster':
      return (
        <>
          <CandidateRosterScreen />
          <AppFooter />
        </>
      )

    case 'questioning':
      return (
        <>
          <QuestioningPhase />
          <AppFooter />
        </>
      )

    case 'elimination':
      return (
        <>
          <EliminationPhase />
          <AppFooter />
        </>
      )

    case 'voting':
      return (
        <>
          <VotingPhase />
          <AppFooter />
        </>
      )

    case 'consequence':
      return (
        <>
          <ConsequencePhase />
          <AppFooter />
        </>
      )

    case 'credits':
      return (
        <>
          <CreditsScreen />
          <AppFooter />
        </>
      )

    default:
      // This should never happen due to TypeScript exhaustiveness
      return (
        <>
          <IntroductionScreen />
          <AppFooter />
        </>
      )
  }
}

// ============================================================================
// App - Root component that provides theme and game context
// ============================================================================
function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ThemeProvider>
  )
}

export default App
