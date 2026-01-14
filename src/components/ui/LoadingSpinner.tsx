// ============================================================================
// Loading Spinner Component
// ============================================================================
// A loading indicator for API calls and async operations.
// Uses pure CSS animations for performance.
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
  }

  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div
        className="spinner-ring"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      ></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}
