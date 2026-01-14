// ============================================================================
// Error Boundary Component (Phase 4: Priority 4.5.1)
// ============================================================================
// Prevents game-breaking errors and provides graceful fallback UI.
// Catches React component tree errors and displays user-friendly message.
// ============================================================================

import { Component, ReactNode } from 'react'
import './ErrorBoundary.css'

// ----------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ----------------------------------------------------------------------------

/**
 * ErrorBoundary - Class component that catches errors in component tree.
 *
 * This component:
 * 1. Catches JavaScript errors anywhere in the child component tree
 * 2. Logs errors to console for debugging
 * 3. Displays fallback UI instead of crashing the entire app
 * 4. Provides reload button to recover from error
 *
 * Usage in App.tsx:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Update state when error is thrown
   * Called during render phase, so side-effects are not allowed
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  /**
   * Log error details for debugging
   * Called during commit phase, so side-effects are allowed
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game error caught by ErrorBoundary:', error)
    console.error('Error info:', errorInfo)
    console.error('Component stack:', errorInfo.componentStack)

    // TODO: Log to error tracking service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo)
  }

  /**
   * Reset error state and reload page
   */
  handleReload = () => {
    // Clear error state
    this.setState({ hasError: false, error: null })
    // Reload page to start fresh
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="error-fallback__content">
            <div className="error-fallback__icon">⚠️</div>
            <h1 className="error-fallback__title">เกิดข้อผิดพลาด</h1>
            <p className="error-fallback__message">
              เราขออภัยที่เกิดปัญหาขึ้น กรุณาเริ่มเกมใหม่อีกครั้ง
            </p>

            {/* Show error details in development only */}
            {import.meta.env.DEV && this.state.error && (
              <details className="error-fallback__details">
                <summary className="error-fallback__summary">
                  รายละเอียดข้อผิดพลาด (Development Mode)
                </summary>
                <pre className="error-fallback__stack">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReload}
              className="error-fallback__button"
            >
              เริ่มเกมใหม่
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================
//
// In App.tsx:
//
// import { ErrorBoundary } from './components/ErrorBoundary'
//
// function App() {
//   return (
//     <ErrorBoundary>
//       <ThemeProvider>
//         <GameProvider>
//           <AppContent />
//         </GameProvider>
//       </ThemeProvider>
//     </ErrorBoundary>
//   )
// }
//
// ============================================================================
