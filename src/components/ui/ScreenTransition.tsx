// ============================================================================
// ScreenTransition Component
// ============================================================================
// Wraps screens with fade-in/slide-up transition animation.
// Enhances polish when switching between game phases.
// ============================================================================

import { useEffect, useState } from 'react'
import './ScreenTransition.css'

export interface ScreenTransitionProps {
  children: React.ReactNode
  className?: string
}

export function ScreenTransition({ children, className = '' }: ScreenTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <div className={`screen-transition ${isVisible ? 'screen-transition--visible' : ''} ${className}`}>
      {children}
    </div>
  )
}
