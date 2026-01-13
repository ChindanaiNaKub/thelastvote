// ============================================================================
// App Footer - Navigation and Theme Toggle
// ============================================================================

import './AppFooter.css'
import { useTheme } from '../../context/ThemeContext'

export function AppFooter() {
  const { theme, toggleTheme } = useTheme()

  return (
    <footer className="app-footer">
      <div className="app-footer__content">
        <div className="app-footer__brand">
          <span className="app-footer__title">The Last Vote</span>
          <span className="app-footer__version">v1.0</span>
        </div>

        <div className="app-footer__actions">
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            aria-label="Toggle theme"
          >
            <span className="theme-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            <span className="theme-text">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>
        </div>
      </div>

      <div className="app-footer__meta">
        <span className="app-footer__copy">
          A psychological game about trust, doubt, and irreversible decisions
        </span>
      </div>
    </footer>
  )
}
