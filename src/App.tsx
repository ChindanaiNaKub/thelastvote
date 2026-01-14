// ============================================================================
// Main App Component
// ============================================================================
// Implements phase-based routing and wraps the app with GameProvider.
// Phase 4: Added ErrorBoundary for robust error handling.
// ============================================================================

import { useEffect } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { IntroductionScreen } from './components/screens/IntroductionScreen'
import { CandidateRosterScreen } from './components/screens/CandidateRosterScreen'
import { QuestioningPhase } from './components/screens/QuestioningPhase'
import { EliminationPhase } from './components/screens/EliminationPhase'
import { VotingPhase } from './components/screens/VotingPhase'
import { ConsequencePhase } from './components/screens/ConsequencePhase'
import { CreditsScreen } from './components/screens/CreditsScreen'
import { AppFooter } from './components/ui/AppFooter'
import { useTension } from './hooks/useTension'
import './App.css'

// ============================================================================
// AppContent - Inner component that uses the game context
// ============================================================================

function AppContent() {
  const { state } = useGame()

  // Phase 4: Tension system - automatically calculates and applies tension effects
  useTension()

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
// Phase 4: Wrapped in ErrorBoundary for robust error handling
// ============================================================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
