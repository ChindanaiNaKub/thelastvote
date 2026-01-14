// ============================================================================
// Game State Manager - React Context + useReducer
// ============================================================================
// This is the central state management system for the game.
// All game state flows through this context. All components use the useGame hook.
// ============================================================================

import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { GameState, GameAction, ConversationEntry } from '../types/game'
import { initialGameState } from '../types/game'
import { candidates } from '../data/candidates'

// ----------------------------------------------------------------------------

/**
 * gameReducer - Reducer function that handles all game state transitions.
 *
 * This reducer processes actions and returns updated state.
 * It follows the standard Redux pattern: (state, action) => newState
 *
 * Action types handled:
 * - SET_PHASE: Transition to a new game phase
 * - DECREMENT_QUESTIONS: Decrease questions remaining (max 2)
 * - ADD_CONVERSATION_ENTRY: Add a conversation event to history
 * - ELIMINATE_CANDIDATE: Mark a candidate as eliminated
 * - SET_VOTE: Record the player's final choice
 * - SET_CONSEQUENCES: Store aftermath data
 * - SET_PROCESSING: Toggle loading state for AI calls
 * - SELECT_CANDIDATE: Target a candidate for questioning
 * - RESET_GAME: Return to initial state
 * - TRACK_TOPIC: Track question topics for analysis
 * - UPDATE_PRESSURE: Update candidate pressure level
 * - ADD_CLASH: Add a candidate clash event
 * - REVEAL_SECRET: Reveal a secret to player
 * - SET_PARADIGM_SHIFT: Set the end-game meta twist
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      }

    case 'DECREMENT_QUESTIONS':
      return {
        ...state,
        questionsRemaining: Math.max(0, state.questionsRemaining - 1),
      }

    case 'ADD_CONVERSATION_ENTRY': {
      const newEntry = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }

      return {
        ...state,
        conversationHistory: [...state.conversationHistory, newEntry],
      }
    }

    case 'ELIMINATE_CANDIDATE': {
      const candidateId = action.payload

      // Prevent duplicate elimination
      if (state.eliminatedCandidateIds.includes(candidateId)) {
        return state
      }

      // Calculate current round (questionsRemaining starts at 3)
      // After Q1: questionsRemaining = 2, round = 1
      // After Q2: questionsRemaining = 1, round = 2
      // After Q3: questionsRemaining = 0, round = 3
      const currentRound = 3 - state.questionsRemaining

      return {
        ...state,
        eliminatedCandidateIds: [...state.eliminatedCandidateIds, candidateId],
        eliminationHistory: [
          ...state.eliminationHistory,
          {
            round: currentRound,
            eliminatedCandidateId: candidateId,
            remainingCandidates: state.candidates
              .filter((c) => c.id !== candidateId && !state.eliminatedCandidateIds.includes(c.id))
              .map((c) => c.id),
            timestamp: Date.now(),
          },
        ],
        candidates: state.candidates.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                isEliminated: true,
                eliminatedAtRound: currentRound,
                eliminatedByPlayerChoice: true,
              }
            : c
        ),
      }
    }

    case 'SET_VOTE':
      return {
        ...state,
        playerVote: action.payload,
      }

    case 'SET_CONSEQUENCES':
      return {
        ...state,
        consequences: action.payload,
      }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      }

    case 'SELECT_CANDIDATE':
      return {
        ...state,
        selectedCandidate: action.payload,
      }

    case 'RESET_GAME': {
      // Reset to initial state, but keep the candidates array
      return {
        ...initialGameState,
        candidates: state.candidates.map((c) => ({
          ...c,
          hasSpoken: false,
          trustLevel: 50,
          relationships: {},
          isEliminated: false,
          eliminatedAtRound: undefined,
          eliminatedByPlayerChoice: undefined,
        })),
        eliminatedCandidateIds: [],
        eliminationHistory: [],
      }
    }

    // ----------------------------------------------------------------------
    // Plot Twist System Actions
    // ----------------------------------------------------------------------

    case 'TRACK_TOPIC': {
      return {
        ...state,
        topicHistory: [...state.topicHistory, action.payload],
      }
    }

    case 'UPDATE_PRESSURE': {
      const { candidateId, pressureState } = action.payload

      return {
        ...state,
        pressureStates: {
          ...state.pressureStates,
          [candidateId]: pressureState,
        },
      }
    }

    case 'ADD_CLASH': {
      // Create conversation entry for the clash
      const clashEntry = {
        id: `clash_${Date.now()}`,
        timestamp: Date.now(),
        type: 'clash' as const,
        speaker: 'system',
        content: `⚔️ การปะทะ: ${action.payload.initiator} vs ${action.payload.target}`,
        clashData: action.payload,
      }

      return {
        ...state,
        conversationHistory: [...state.conversationHistory, clashEntry],
        clashHistory: [...state.clashHistory, action.payload],
      }
    }

    case 'REVEAL_SECRET': {
      // Prevent duplicate reveals
      if (state.secretReveals.some(s =>
        s.knowers.join() === action.payload.knowers.join() &&
        s.targetId === action.payload.targetId &&
        s.secretType === action.payload.secretType
      )) {
        return state
      }

      return {
        ...state,
        secretReveals: [...state.secretReveals, { ...action.payload, revealed: true }],
      }
    }

    case 'SET_PARADIGM_SHIFT': {
      return {
        ...state,
        paradigmShift: action.payload,
      }
    }

    // ----------------------------------------------------------------------
    // Phase 4: Polish & Feel Actions
    // ----------------------------------------------------------------------

    case 'SET_TENSION': {
      return {
        ...state,
        tensionLevel: action.payload,
      }
    }

    default:
      // TypeScript exhaustiveness check - will error if any action type is missed
      return state
  }
}

// ----------------------------------------------------------------------------

/**
 * GameContext - The React Context for game state.
 *
 * Components access game state and dispatch functions through this context.
 */
const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

// ----------------------------------------------------------------------------

/**
 * GameProviderProps - Props for the GameProvider component.
 */
interface GameProviderProps {
  children: ReactNode
}

/**
 * GameProvider - Context Provider component that wraps the application.
 *
 * This component:
 * 1. Creates the reducer with initial state
 * 2. Populates candidates from data/candidates.ts
 * 3. Initializes pressure states for all candidates
 * 4. Provides state and dispatch to all children
 * 5. Sets up debug mode in development
 *
 * Usage in App.tsx:
 *   <GameProvider>
 *     <App />
 *   </GameProvider>
 */
export function GameProvider({ children }: GameProviderProps) {
  // Initialize state with candidates from data
  const initialState: GameState = {
    ...initialGameState,
    candidates: candidates,
    // Initialize pressure states for all candidates
    pressureStates: candidates.reduce((acc, candidate) => {
      acc[candidate.id] = {
        candidateId: candidate.id,
        pressureLevel: 0,
        triggers: {
          questionsTargeted: 0,
          alliesEliminated: 0,
          contradictionsExposed: 0,
        },
        hasSlippedUp: false,
      }
      return acc
    }, {} as Record<string, GameState['pressureStates'][string]>),
  }

  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Set up debug mode in development
  if (import.meta.env.DEV) {
    // @ts-expect-error - Debug mode only available in development
    window.TLV_DEBUG = {
      getState: () => state,
      getPressure: (candidateId: string) => state.pressureStates[candidateId],
      getTopics: () => state.topicHistory,
      getClashes: () => state.clashHistory,
      getSecrets: () => state.secretReveals,
      triggerClash: () => {
        // For testing - manually trigger a clash between first two active candidates
        const activeCandidates = state.candidates.filter(c => !c.isEliminated)
        if (activeCandidates.length >= 2) {
          dispatch({
            type: 'ADD_CLASH',
            payload: {
              id: `debug_clash_${Date.now()}`,
              timestamp: Date.now(),
              initiator: activeCandidates[0].id,
              target: activeCandidates[1].id,
              topic: 'DEBUG',
              dialogueExchange: [
                {
                  speaker: activeCandidates[0].id,
                  content: '[DEBUG CLASH]',
                  emotion: 'angry',
                },
              ],
              triggers: {
                type: 'pressure',
                context: 'Debug mode - manually triggered',
              },
            },
          })
        }
      },
    }
  }

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

// ----------------------------------------------------------------------------

/**
 * useGame - Custom hook to access game state and dispatch.
 *
 * This hook provides a convenient way for components to access:
 * - state: The current game state (phase, questions, candidates, etc.)
 * - dispatch: Function to dispatch actions to update state
 *
 * Usage in components:
 *   const { state, dispatch } = useGame()
 *
 * Throws an error if used outside of GameProvider.
 */
export function useGame() {
  const context = useContext(GameContext)

  if (context === null) {
    throw new Error('useGame must be used within a GameProvider')
  }

  return context
}

// ----------------------------------------------------------------------------

/**
 * Action creators - Helper functions to dispatch common actions.
 *
 * These functions make it easier to dispatch actions with proper typing.
 * They are optional but make code more readable.
 */
export const gameActions = {
  setPhase: (phase: GameState['phase']): GameAction => ({
    type: 'SET_PHASE',
    payload: phase,
  }),

  decrementQuestions: (): GameAction => ({
    type: 'DECREMENT_QUESTIONS',
  }),

  addConversationEntry: (entry: Omit<ConversationEntry, 'id' | 'timestamp'>): GameAction => ({
    type: 'ADD_CONVERSATION_ENTRY',
    payload: entry,
  }),

  eliminateCandidate: (candidateId: string): GameAction => ({
    type: 'ELIMINATE_CANDIDATE',
    payload: candidateId,
  }),

  setVote: (candidateId: string): GameAction => ({
    type: 'SET_VOTE',
    payload: candidateId,
  }),

  setConsequences: (consequences: NonNullable<GameState['consequences']>): GameAction => ({
    type: 'SET_CONSEQUENCES',
    payload: consequences,
  }),

  setProcessing: (isProcessing: boolean): GameAction => ({
    type: 'SET_PROCESSING',
    payload: isProcessing,
  }),

  selectCandidate: (candidateId: string | null): GameAction => ({
    type: 'SELECT_CANDIDATE',
    payload: candidateId,
  }),

  resetGame: (): GameAction => ({
    type: 'RESET_GAME',
  }),

  // ----------------------------------------------------------------------
  // Plot Twist System Action Creators
  // ----------------------------------------------------------------------

  trackTopic: (topicEntry: GameState['topicHistory'][0]): GameAction => ({
    type: 'TRACK_TOPIC',
    payload: topicEntry,
  }),

  updatePressure: (candidateId: string, pressureState: GameState['pressureStates'][string]): GameAction => ({
    type: 'UPDATE_PRESSURE',
    payload: { candidateId, pressureState },
  }),

  addClash: (clashEvent: GameState['clashHistory'][0]): GameAction => ({
    type: 'ADD_CLASH',
    payload: clashEvent,
  }),

  revealSecret: (secret: GameState['secretReveals'][0]): GameAction => ({
    type: 'REVEAL_SECRET',
    payload: secret,
  }),

  setParadigmShift: (paradigmShift: NonNullable<GameState['paradigmShift']>): GameAction => ({
    type: 'SET_PARADIGM_SHIFT',
    payload: paradigmShift,
  }),

  // ----------------------------------------------------------------------
  // Phase 4: Polish & Feel Action Creators
  // ----------------------------------------------------------------------

  setTension: (tensionLevel: number): GameAction => ({
    type: 'SET_TENSION',
    payload: tensionLevel,
  }),
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
//
// In your component:
//
//   import { useGame } from '../context/GameContext'
//   import { gameActions } from '../context/GameContext'
//
//   function MyComponent() {
//     const { state, dispatch } = useGame()
//
//     const goToVoting = () => {
//       dispatch(gameActions.setPhase('voting'))
//     }
//
//     const askQuestion = (question: string) => {
//       dispatch(gameActions.addConversationEntry({
//         type: 'question',
//         speaker: 'player',
//         content: question,
//       }))
//       dispatch(gameActions.decrementQuestions())
//     }
//
//     return (
//       <div>
//         <p>Phase: {state.phase}</p>
//         <p>Questions: {state.questionsRemaining}</p>
//       </div>
//     )
//   }
//
// ============================================================================
