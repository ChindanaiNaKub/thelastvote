// ============================================================================
// ScreenTransition Component
// ============================================================================
// Wraps screens with phase-specific transition animations.
// Phase 4: Enhanced with dramatic transitions for key moments.
// ============================================================================

import { useEffect, useState } from 'react'
import { useGame } from '../../context/GameContext'
import type { GamePhase } from '../../types/game'
import './ScreenTransition.css'

export interface ScreenTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Phase-specific transition configuration.
 */
interface TransitionConfig {
  duration: number // Animation duration in ms
  type: 'fade' | 'slide-up' | 'shake-fade' | 'dramatic-fade' | 'slow-zoom'
}

const TRANSITION_STYLES: Record<GamePhase, TransitionConfig> = {
  introduction: { duration: 400, type: 'fade' },
  roster: { duration: 500, type: 'slide-up' },
  questioning: { duration: 300, type: 'fade' },
  elimination: { duration: 600, type: 'shake-fade' }, // Phase 4: Enhanced for impact
  voting: { duration: 800, type: 'dramatic-fade' }, // Phase 4: Enhanced for weight
  consequence: { duration: 1000, type: 'slow-zoom' }, // Phase 4: Enhanced for reveal
  credits: { duration: 600, type: 'fade' },
}

export function ScreenTransition({ children, className = '' }: ScreenTransitionProps) {
  const { state } = useGame()
  const [isVisible, setIsVisible] = useState(false)

  // Get transition config for current phase
  const transitionConfig = TRANSITION_STYLES[state.phase]

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <div
      className={`screen-transition screen-transition--${transitionConfig.type} ${
        isVisible ? 'screen-transition--visible' : ''
      } ${className}`}
      style={{
        transitionDuration: `${transitionConfig.duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
