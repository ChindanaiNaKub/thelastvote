// ============================================================================
// Type Definitions for The Last Vote
// ============================================================================
// This file contains all TypeScript interfaces and types used throughout the game.
// Based on architecture.md data models.
// ============================================================================

// ----------------------------------------------------------------------------

/**
 * GamePhase represents all possible states/phases of the game.
 * The game progresses linearly through these phases.
 */
export type GamePhase =
  | 'introduction' // Opening screen, sets the mood
  | 'roster' // Introduce the 5 candidates
  | 'questioning' // Player asks questions to candidates
  | 'elimination' // Player eliminates one candidate
  | 'voting' // Player casts their final vote
  | 'consequence' // Reveal aftermath and create doubt
  | 'credits' // End screen with replay option

// ----------------------------------------------------------------------------

/**
 * CandidateArchetype represents the 5 distinct personality types.
 * Each archetype has unique traits, deception patterns, and motivations.
 */
export type CandidateArchetype =
  | 'charismatic_reformer' // Confident, inspiring, arrogant. Seeks power.
  | 'pragmatic_technocrat' // Data-driven, cold, logical. Values efficiency over people.
  | 'healer_protector' // Warm, empathetic, parental. Creates dependency for control.
  | 'cynical_realist' // World-weary, bitter, honest. Has given up, manages decline.
  | 'radical_outsider' // Passionate, disruptive, paranoid. Anger-driven, no real plan.

/**
 * RelationshipType defines how candidates relate to each other.
 * This influences their behavior (interruptions, attacks, defenses).
 */
export type RelationshipType = 'ally' | 'rival' | 'neutral'

/**
 * Candidate represents one of the 5 candidates in the game.
 * Contains both public-facing information and hidden data (never shown to player).
 */
export interface Candidate {
  // ------------------------------------------------------------------
  // Static Identity (visible to player)
  // ------------------------------------------------------------------
  id: string // "candidate_1" through "candidate_5"
  name: string // Display name, e.g., "Marcus Hale"
  archetype: CandidateArchetype // Personality category
  portrait: string // Emoji or image filename
  colorTheme: string // CSS color for UI theming

  // ------------------------------------------------------------------
  // Personality (visible to player)
  // ------------------------------------------------------------------
  personality: string // Detailed description of their character
  speakingStyle: string // How they talk (formal, casual, aggressive, etc.)
  publicStance: string // What they claim to want (may be lies)

  // ------------------------------------------------------------------
  // Hidden Data (NEVER shown to player - for AI prompting only)
  // ------------------------------------------------------------------
  hiddenMotivation: string // True agenda, what they actually want
  coreTruth: string // What they genuinely believe
  partialTruth: string // What they admit but distort
  activeLie: string // What they defend that is false
  hiddenSecret: string // What they will never tell

  // ------------------------------------------------------------------
  // Dynamic State (changes during gameplay)
  // ------------------------------------------------------------------
  hasSpoken: boolean // Whether this candidate has responded yet
  trustLevel: number // 0-100, internal tracking for AI behavior
  relationships: Record<string, RelationshipType> // How they view other candidates

  // ------------------------------------------------------------------
  // Elimination State (for elimination mechanic)
  // ------------------------------------------------------------------
  isEliminated: boolean // Whether this candidate has been eliminated
  eliminatedAtRound?: number // Which round they were eliminated (1 or 2)
  eliminatedByPlayerChoice?: boolean // Whether player explicitly chose to eliminate them
}

// ----------------------------------------------------------------------------

/**
 * ConversationEntryType categorizes different kinds of conversation events.
 */
export type ConversationEntryType =
  | 'question' // Player asked a question
  | 'response' // Candidate responded
  | 'interruption' // Candidate jumped in
  | 'system' // Game event (e.g., "Questions remaining: 2")

/**
 * ConversationEntry represents a single event in the conversation history.
 * This tracks the dialogue flow and is passed to AI for context.
 */
export interface ConversationEntry {
  id: string // Unique identifier for this entry
  timestamp: number // When this entry was created
  type: ConversationEntryType // What kind of entry this is
  speaker: 'player' | string // "player" or candidate ID
  content: string // The actual text content
  targetedCandidate?: string // If question was directed at someone specific
}

// ----------------------------------------------------------------------------

/**
 * ImmediateAftermath describes the short-term outcome after the player votes.
 * This creates initial doubt when results don't match expectations.
 */
export interface ImmediateAftermath {
  timeframe: string // e.g., "6 months later"
  outcome: string // What actually happened
  expectedOutcome: string // What the player thought would happen
  unexpectedOutcome: string // The surprise element
}

/**
 * OtherCandidateSecret tracks secrets about candidates the player didn't choose.
 * These make the player rethink their decision.
 */
export interface OtherCandidateSecret {
  candidateId: string
  secret: string
  makesPlayerRethink: boolean // Whether this should make player doubt their choice
}

/**
 * HiddenTruths contains secrets revealed after the vote.
 * This creates regret when player realizes "I never asked about that."
 */
export interface HiddenTruths {
  chosenCandidateSecret: string // Damaging secret about who player voted for
  otherCandidateSecrets: OtherCandidateSecret[] // Secrets about others
  questionNeverAsked: string // "You never asked about [topic]"
}

/**
 * LongTermConsequences describes the ultimate outcome years later.
 * Shows mixed results to create reflection and doubt.
 */
export interface LongTermConsequences {
  timeframe: string // e.g., "3 years later"
  outcome: string // Summary of what happened
  goodOutcomes: string[] // Positive results
  badOutcomes: string[] // Negative results
  finalReflection: string // Creates lingering doubt
}

/**
 * AlternativePath shows what would have happened with other choices.
 * Creates replay value and "what if" thinking.
 */
export interface AlternativePath {
  candidateId: string
  wouldHaveHappened: string // "If you had chosen X, Y would have happened"
}

/**
 * ConsequenceData contains all the aftermath information shown after voting.
 * Structured in 3 phases for dramatic revelation.
 */
export interface ConsequenceData {
  chosenCandidateId: string // Who the player voted for
  immediateAftermath: ImmediateAftermath // Phase 1: Short-term results
  hiddenTruths: HiddenTruths // Phase 2: Secrets revealed
  longTermConsequences: LongTermConsequences // Phase 3: Ultimate outcome
  alternativePaths: AlternativePath[] // What if scenarios
}

// ----------------------------------------------------------------------------

/**
 * EliminationEvent tracks when a candidate is eliminated by the player.
 * Creates tension and irreversible decisions.
 */
export interface EliminationEvent {
  round: number // Which round (1 or 2)
  eliminatedCandidateId: string // Who was eliminated
  remainingCandidates: string[] // IDs of candidates still in the game
  timestamp: number // When the elimination happened
}

// ----------------------------------------------------------------------------

/**
 * GameState is the central state object for the entire game.
 * Managed by React Context + useReducer pattern.
 */
export interface GameState {
  // ------------------------------------------------------------------
  // Phase Management
  // ------------------------------------------------------------------
  phase: GamePhase // Current game phase
  questionsRemaining: number // Starts at 2, decrements to 0 (reduced from 3 for elimination mechanic)

  // ------------------------------------------------------------------
  // Conversation
  // ------------------------------------------------------------------
  conversationHistory: ConversationEntry[] // All dialogue so far

  // ------------------------------------------------------------------
  // Candidates
  // ------------------------------------------------------------------
  candidates: Candidate[] // All 5 candidates with dynamic state

  // ------------------------------------------------------------------
  // Elimination Tracking
  // ------------------------------------------------------------------
  eliminatedCandidateIds: string[] // IDs of eliminated candidates
  eliminationHistory: EliminationEvent[] // Record of all eliminations

  // ------------------------------------------------------------------
  // Player Choice
  // ------------------------------------------------------------------
  playerVote: string | null // Candidate ID player voted for

  // ------------------------------------------------------------------
  // Consequences
  // ------------------------------------------------------------------
  consequences: ConsequenceData | null // Populated after voting

  // ------------------------------------------------------------------
  // UI State
  // ------------------------------------------------------------------
  isProcessing: boolean // Loading state for AI calls
  selectedCandidate: string | null // For targeting questions
}

// ----------------------------------------------------------------------------

/**
 * Action types for the game state reducer.
 * These are all the possible actions that can modify game state.
 */
export type GameAction =
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'DECREMENT_QUESTIONS' }
  | { type: 'ADD_CONVERSATION_ENTRY'; payload: Omit<ConversationEntry, 'id' | 'timestamp'> }
  | { type: 'ELIMINATE_CANDIDATE'; payload: string } // Eliminate a candidate by ID
  | { type: 'SET_VOTE'; payload: string }
  | { type: 'SET_CONSEQUENCES'; payload: ConsequenceData }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SELECT_CANDIDATE'; payload: string | null }
  | { type: 'RESET_GAME' }

// ----------------------------------------------------------------------------

/**
 * Initial state when the game first loads.
 */
export const initialGameState: GameState = {
  phase: 'introduction',
  questionsRemaining: 3, // Start with 3 questions
  conversationHistory: [],
  candidates: [], // Populated from data/candidates.ts
  eliminatedCandidateIds: [], // No eliminations at start
  eliminationHistory: [], // Empty at start
  playerVote: null,
  consequences: null,
  isProcessing: false,
  selectedCandidate: null,
}
