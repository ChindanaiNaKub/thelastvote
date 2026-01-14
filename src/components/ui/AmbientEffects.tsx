// ============================================================================
// Ambient Effects Component
// ============================================================================
// Subtle background particles that add depth and life to the game.
// Pure CSS, no JavaScript, no performance cost.
// ============================================================================

export function AmbientEffects() {
  return (
    <div className="ambient-effects">
      <div className="ambient-particle ambient-particle--1"></div>
      <div className="ambient-particle ambient-particle--2"></div>
      <div className="ambient-particle ambient-particle--3"></div>
    </div>
  )
}
