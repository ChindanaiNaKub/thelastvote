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
export type RelationshipType = 'ally' | 'rival' | 'neutral' | 'secret_enemy' | 'secret_ally'

/**
 * EnhancedRelationshipType defines more granular relationships for pair mechanics.
 * Added for Part 2 of meta-gaming update.
 */
export type EnhancedRelationshipType =
  | 'best_friend'      // Always defends, takes bullet (+50 pressure when eliminated)
  | 'ally'             // Supports, defends when attacked
  | 'friendly_rival'   // Banter but respects, defends from outsiders
  | 'rival'            // Openly competitive, critical
  | 'enemy'            // Hostile, will attack
  | 'secret_friend'    // Publicly neutral, privately ally
  | 'secret_enemy'     // Publicly neutral, privately hostile
  | 'neutral'          // No strong feelings either way

/**
 * CandidateRelationship defines a relationship between two candidates.
 * Some relationships are hidden from the player (isSecret: true).
 */
export interface CandidateRelationship {
  targetId: string // Which candidate this relationship is with
  type: RelationshipType // Nature of the relationship
  strength: number // 0-100, how strong this relationship is
  isSecret: boolean // If true, player doesn't know about this
}

/**
 * EnhancedRelationship defines more detailed relationship dynamics.
 * Used for pair mechanics and advanced clash detection.
 */
export interface EnhancedRelationship {
  targetId: string
  type: EnhancedRelationshipType
  strength: number // 0-100, affects reaction intensity
  isSecret: boolean // Hide from player until revealed
}

/**
 * PlayerStats tracks player behavior throughout the game.
 * Revealed at the end to show playstyle patterns.
 * Added for Part 3 of meta-gaming update.
 */
export interface PlayerStats {
  // Question patterns
  totalQuestionsAsked: number
  questionsPerCandidate: Record<string, number> // candidate_1: 2, candidate_2: 1, etc.
  topicsAsked: Record<string, number> // เศรษฐกิจ: 3, ความปลอดภัย: 1, etc.

  // Aggression
  candidatesTargeted: string[] // Who player attacked most (in order)
  aggressiveQuestions: number // Questions that challenge/interrupt

  // Favoritism
  favoriteCandidate: string | null // Most questioned
  ignoredCandidates: string[] // Never questioned

  // Elimination patterns
  eliminatedAllies: string[] // Allies that were eliminated
  eliminatedRivals: string[] // Rivals that were eliminated
  ruthlessScore: number // 0-100, based on ally eliminations vs rival eliminations

  // Decision speed
  decisionTimestamps: number[] // Timestamps of major decisions
  averageDecisionTime: number // Seconds per decision
  rushedDecisions: number // Quick eliminations (< 5 sec)

  // Consistency
  flipFlopScore: number // How often changed mind (0-100)

  // Prab-specific triggers (for Part 4)
  prabRevealConditions: {
    askedAboutGameMaster: boolean
    questionedReality: boolean
    showedSkepticism: boolean
  }

  // Game completion timestamp
  gameCompletedAt: number | null
}

/**
 * PressureState tracks how much pressure a candidate is under.
 * High pressure leads to slip-ups during questioning.
 */
export interface PressureState {
  candidateId: string
  pressureLevel: number // 0-100, where >70 triggers slip-ups
  triggers: {
    questionsTargeted: number // How many times player asked this candidate
    alliesEliminated: number // How many of their allies were eliminated
    contradictionsExposed: number // How many times they were caught contradicting
  }
  hasSlippedUp: boolean // Whether they've already had a slip-up event
}

/**
 * TopicEntry tracks a question and its detected topics.
 * Used for dynamic consequence generation.
 */
export interface TopicEntry {
  question: string // The actual question text
  topics: string[] // Detected topics: ['เศรษฐกิจ', 'คอร์รัปชัน', ...]
  targetedCandidate?: string // If question was targeted at someone
  timestamp: number // When asked
}

/**
 * SecretKnowledge represents what one candidate knows about another.
 * Revealed through mid-game events and consequences.
 */
export interface SecretKnowledge {
  knowers: string[] // Candidate IDs who know this secret
  targetId: string // Who the secret is about
  secretType: 'hiddenSecret' | 'activeLie' | 'hiddenMotivation' | 'coreTruth'
  revealCondition: {
    type: 'question_topic' | 'ally_eliminated' | 'pressure_threshold' | 'never'
    value: string | number
  }
  revealed: boolean // Whether this has been revealed to player
}

/**
 * ClashEmotion represents the emotional intensity of a clash.
 */
export type ClashEmotion = 'angry' | 'defensive' | 'mocking' | 'desperate' | 'triumphant'

/**
 * ClashDialogueLine represents one line of dialogue in a clash.
 */
export interface ClashDialogueLine {
  speaker: string // Candidate ID
  content: string // What they said
  emotion: ClashEmotion // How they said it
}

/**
 * ClashTriggerType represents what caused a clash to occur.
 */
export type ClashTriggerType = 'contradiction' | 'ally_defense' | 'rival_attack' | 'pressure'

/**
 * ClashEvent represents candidates publicly attacking each other.
 * These appear as special conversation entries.
 */
export interface ClashEvent {
  id: string
  timestamp: number
  initiator: string // Candidate who interrupted
  target: string // Candidate being interrupted
  topic: string // What sparked the clash
  dialogueExchange: ClashDialogueLine[] // The back-and-forth
  triggers: {
    type: ClashTriggerType
    context: string // Description of what triggered this
  }
}

/**
 * ParadigmTwistType represents the type of end-game meta twist.
 */
export type ParadigmTwistType = 'no_honest' | 'tested' | 'previous_cycle' | 'unreliable_narrator'

/**
 * ParadigmRevealTiming represents when a twist revelation occurs.
 */
export type ParadigmRevealTiming = 'before_consequences' | 'after_phase1' | 'after_phase2' | 'after_phase3' | 'very_end'

/**
 * ParadigmRevealSequence represents one step in revealing the meta twist.
 */
export interface ParadigmRevealSequence {
  timing: ParadigmRevealTiming // When this reveal happens
  content: string // The reveal text (may contain placeholders)
  referencesGameplay: boolean // If true, dynamically insert gameplay data
  dramaticPause: number // Milliseconds to pause after this reveal
}

/**
 * ParadigmShift represents the end-game meta twist.
 * Revealed after consequences to shatter player's assumptions.
 */
export interface ParadigmShift {
  twistType: ParadigmTwistType
  revealSequence: ParadigmRevealSequence[]
}

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
  alternativeSecrets?: string[] // Alternative secrets for replay value (Priority 4.4.1)

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

  // ------------------------------------------------------------------
  // Plot Twist System Extensions
  // ------------------------------------------------------------------
  detailedRelationships?: Record<string, CandidateRelationship> // Detailed relationship data
  knowsSecretsAbout?: SecretKnowledge[] // Secrets this candidate knows about others
  pressureThreshold?: number // When to slip up (default: 70)
  slipUpResponses?: {
    mild: string[] // Subtle hints at pressure 70-80
    severe: string[] // Obvious slips at pressure 90+
  }

  // ------------------------------------------------------------------
  // Part 2: Enhanced Pair/Rival System
  // ------------------------------------------------------------------
  enhancedRelationships?: Record<string, EnhancedRelationship> // Enhanced relationship web
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
  | 'clash' // Candidates attacked each other

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
  clashData?: ClashEvent // Present if type is 'clash'
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
  questionsRemaining: number // Starts at 3, decrements to 0

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
  tensionLevel: number // 0-100, overall game tension for visual effects (Phase 4)

  // ------------------------------------------------------------------
  // Plot Twist System Tracking
  // ------------------------------------------------------------------
  topicHistory: TopicEntry[] // Questions and their detected topics
  pressureStates: Record<string, PressureState> // Per-candidate pressure levels
  clashHistory: ClashEvent[] // All clash events that occurred
  secretReveals: SecretKnowledge[] // Secrets revealed so far
  paradigmShift: ParadigmShift | null // Which meta twist this playthrough has
  questionTopicsAnalyzed: boolean // Whether backend has analyzed topics

  // ------------------------------------------------------------------
  // Part 3: Player Stat Tracking
  // ------------------------------------------------------------------
  playerStats: PlayerStats // Tracks player behavior throughout game
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
  | { type: 'SET_TENSION'; payload: number } // Set overall tension level (Phase 4)
  // Plot Twist System Actions
  | { type: 'TRACK_TOPIC'; payload: TopicEntry } // Track question topics
  | { type: 'UPDATE_PRESSURE'; payload: { candidateId: string; pressureState: PressureState } } // Update candidate pressure
  | { type: 'ADD_CLASH'; payload: ClashEvent } // Add a clash event
  | { type: 'REVEAL_SECRET'; payload: SecretKnowledge } // Reveal a secret
  | { type: 'SET_PARADIGM_SHIFT'; payload: ParadigmShift } // Set the end-game twist
  // Part 3: Player Stat Tracking Actions
  | { type: 'TRACK_QUESTION'; payload: { candidateId: string; topics: string[]; timestamp: number } }
  | { type: 'TRACK_AGGRESSION'; payload: { candidateId: string } }
  | { type: 'TRACK_DECISION'; payload: { timestamp: number } }
  | { type: 'TRACK_PRAB_CONDITION'; payload: { condition: 'askedAboutGameMaster' | 'questionedReality' | 'showedSkepticism' } }
  | { type: 'COMPLETE_GAME'; payload: number } // Timestamp when game completed

// ----------------------------------------------------------------------------

/**
 * Initial state when the game first loads.
 */
export const initialGameState: GameState = {
  phase: 'introduction',
  questionsRemaining: 3, // Start with 3 questions (original design)
  conversationHistory: [],
  candidates: [], // Populated from data/candidates.ts
  eliminatedCandidateIds: [], // No eliminations at start
  eliminationHistory: [], // Empty at start
  playerVote: null,
  consequences: null,
  isProcessing: false,
  selectedCandidate: null,
  tensionLevel: 0, // Start with no tension (Phase 4)
  // Plot Twist System Initialization
  topicHistory: [],
  pressureStates: {}, // Will be initialized with candidates from data/candidates.ts
  clashHistory: [],
  secretReveals: [],
  paradigmShift: null,
  questionTopicsAnalyzed: false,
  // Part 3: Player Stat Tracking Initialization
  playerStats: {
    totalQuestionsAsked: 0,
    questionsPerCandidate: {},
    topicsAsked: {},
    candidatesTargeted: [],
    aggressiveQuestions: 0,
    favoriteCandidate: null,
    ignoredCandidates: [],
    eliminatedAllies: [],
    eliminatedRivals: [],
    ruthlessScore: 0,
    decisionTimestamps: [],
    averageDecisionTime: 0,
    rushedDecisions: 0,
    flipFlopScore: 0,
    prabRevealConditions: {
      askedAboutGameMaster: false,
      questionedReality: false,
      showedSkepticism: false,
    },
    gameCompletedAt: null,
  },
}
