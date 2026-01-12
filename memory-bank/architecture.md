# Architecture — The Last Vote

> This file describes the high-level system structure. Update as the design evolves.

---

## Status

**DESIGNED** — Architecture defined. Ready for implementation in Phase 1.

**Date:** 2026-01-12

---

## High-Level System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (CLIENT)                        │
│                      React + TypeScript                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Game State  │  │   Dialogue   │      │
│  │  Components  │  │   Manager    │  │   Manager    │      │
│  │              │  │  (Context +  │  │              │      │
│  │              │  │   useReducer)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    HTTP / API Calls
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVERLESS BACKEND                         │
│              (Vercel or Netlify Functions)                   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI Proxy    │  │  Character   │  │ Consequence  │      │
│  │   /api/chat  │  │   System     │  │  Generator   │      │
│  │              │  │  (in-memory) │  │ /api/conseq  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    External LLM API
                    (Anthropic Claude or
                     OpenAI GPT-4)
```

---

## Major Components

### Frontend (Browser)

#### 1. Game State Manager
**File:** `/src/context/GameContext.tsx`

**Responsibilities:**
- Centralized state management using React Context + useReducer
- Tracks: game phase, questions remaining, conversation history, candidates, player vote, consequences
- Handles phase transitions (introduction → roster → questioning → voting → consequence → credits)
- Provides state to all components via context

#### 2. Dialogue Manager
**File:** `/src/hooks/useConversation.ts`

**Responsibilities:**
- Manages conversation flow and history
- Calls API to generate AI responses
- Tracks which candidates have spoken
- Updates conversation history after each exchange
- Handles loading states during AI generation

#### 3. UI/Presentation Layer
**Files:** `/src/components/screens/*.tsx`, `/src/components/ui/*.tsx`

**Responsibilities:**
- Renders all game screens (Introduction, Roster, Questioning, Voting, Consequence)
- Handles user input (question text, candidate selection, voting)
- Displays conversation history
- Shows question counter and warnings
- Presents consequences in 3-phase reveal

### Backend (Serverless Functions)

#### 4. AI Proxy Endpoint
**File:** `/api/chat/route.ts`

**Responsibilities:**
- Receives player question + conversation history + candidate data
- Constructs prompts for each candidate
- Calls external LLM API (Claude/GPT-4)
- Returns candidate responses to frontend
- Handles errors and rate limiting

#### 5. Consequence Generator Endpoint
**File:** `/api/consequences/route.ts`

**Responsibilities:**
- Receives player's vote + conversation history
- Generates consequence data (immediate aftermath, hidden truths, long-term outcomes)
- Returns structured consequence data
- In MVP: uses pre-written templates
- Post-MVP: uses AI to generate variations

---

## Component Responsibilities

| Component | Primary Responsibility | Key Data |
|-----------|----------------------|-----------|
| GameContext | Central state, phase management | GameState object |
| IntroductionScreen | Onboard player, set mood | Game title, instructions |
| CandidateRosterScreen | Introduce 5 candidates | Candidate names, brief descriptions |
| QuestioningPhase | Main gameplay: ask questions | Question input, dialogue history, counter |
| VotingPhase | Capture player's final choice | Candidate cards, confirmation |
| ConsequencePhase | Create doubt and regret | 3-phase reveals, alternative paths |
| /api/chat | Generate AI dialogue | LLM API calls, prompt construction |
| /api/consequences | Generate aftermath | Templates or AI generation |

---

## Data Flow

### Question Flow

```
1. Player types question → QuestionInput component
2. Player selects target candidate (optional)
3. QuestioningPhase calls useConversation.askQuestion()
4. useConversation calls /api/chat with:
   - Player's question
   - Conversation history
   - Candidate data
5. /api/chat constructs prompts for each candidate
6. /api/chat calls LLM API
7. LLM returns candidate responses
8. /api/chat returns responses to frontend
9. useConversation updates conversation history
10. DialogueBox renders new responses
11. Question counter decrements
12. If counter = 0, enable voting phase
```

### Voting Flow

```
1. Player clicks candidate in VotingPhase
2. VotingPhase shows confirmation dialog
3. Player confirms vote
4. useVoting locks in choice
5. Game transitions to consequence phase
6. useConsequences calls /api/consequences
7. /api/consequences returns consequence data
8. ConsequencePhase displays 3-phase reveal:
   - Immediate aftermath (6 months later)
   - Hidden truths revealed
   - Long-term consequences (3 years later)
```

---

## Data Models

### GameState

```typescript
type GameState = {
  // Phase management
  phase: 'introduction' | 'roster' | 'questioning' | 'voting' | 'consequence' | 'credits',

  // Question limit
  questionsRemaining: number, // Starts at 3, decrements to 0

  // Conversation
  conversationHistory: ConversationEntry[],

  // Candidates
  candidates: Candidate[], // All 5 candidates with dynamic state

  // Player choice
  playerVote: string | null, // Candidate ID

  // Consequences
  consequences: ConsequenceData | null,

  // UI state
  isProcessing: boolean, // Loading state for AI calls
  selectedCandidate: string | null, // For targeting questions
}
```

### Candidate

```typescript
type Candidate = {
  // Static identity
  id: string; // "candidate_1" through "candidate_5"
  name: string;
  archetype: 'charismatic_reformer' | 'pragmatic_technocrat' | 'healer_protector' | 'cynical_realist' | 'radical_outsider';

  // Personality
  personality: string; // Detailed description
  speakingStyle: string; // How they talk
  publicStance: string; // What they claim to want

  // Hidden (NEVER shown to player)
  hiddenMotivation: string; // True agenda
  coreTruth: string; // What they actually believe
  partialTruth: string; // What they admit but distort
  activeLie: string; // What they defend that's false
  hiddenSecret: string; // What they'll never tell

  // Dynamic state
  hasSpoken: boolean;
  trustLevel: number; // 0-100, internal tracking
  relationships: Record<string, 'ally' | 'rival' | 'neutral'>;

  // Presentation
  portrait: string; // Image filename or emoji
  colorTheme: string; // CSS color for UI theming
}
```

### ConversationEntry

```typescript
type ConversationEntry = {
  id: string;
  timestamp: number;
  type: 'question' | 'response' | 'interruption' | 'system';
  speaker: 'player' | string; // candidate ID if response
  content: string;
  targetedCandidate?: string; // If question was directed at someone
}
```

### ConsequenceData

```typescript
type ConsequenceData = {
  chosenCandidateId: string;

  immediateAftermath: {
    timeframe: string; // "6 months later"
    outcome: string;
    expectedOutcome: string;
    unexpectedOutcome: string;
  };

  hiddenTruths: {
    chosenCandidateSecret: string;
    otherCandidateSecrets: Array<{
      candidateId: string;
      secret: string;
    }>;
    questionNeverAsked: string;
  };

  longTermConsequences: {
    timeframe: string; // "3 years later"
    outcome: string;
    goodOutcomes: string[];
    badOutcomes: string[];
    finalReflection: string;
  };

  alternativePaths: Array<{
    candidateId: string;
    wouldHaveHappened: string;
  }>;
}
```

---

## AI Integration Strategy

### LLM Service Selection

**Primary:** Anthropic Claude
- Best for nuanced dialogue and character consistency
- Strong safety features
- Good context window for conversation history

**Backup:** OpenAI GPT-4
- Good alternative if Claude unavailable
- Also supports nuanced dialogue

**Budget Option:** OpenAI GPT-3.5-turbo
- Faster, cheaper
- Less nuanced but functional

### Character Consistency

**Problem:** AI can contradict itself across multiple API calls.

**Solutions:**

1. **Context Stacking**
   - Include full conversation history in each API call
   - Format: "System Prompt + Conversation History + Current Question"

2. **System Prompts**
   - Each candidate has a detailed system prompt defining:
     - Personality and speaking style
     - Core truth, partial truth, active lie, hidden secret
     - Instructions to never break character
     - Instructions on when to lie vs tell truth

3. **Memory Tracking**
   - Backend stores each candidate's previous statements
   - Checks for contradictions before returning response
   - If contradiction detected, retry with "reminder" prompt

4. **Character Relationship Tracking**
   - Track who attacked whom
   - Track alliances and rivalries
   - Influence responses based on relationships

### Prompt Structure

```
=== SYSTEM PROMPT ===
You are [CANDIDATE_NAME], [ARCHETYPE] running for town leadership.

Your personality: [DETAILED_PERSONALITY]
Your public stance: [WHAT_YOU_CLAIM_TO_WANT]

Your hidden motivation: [TRUE_AGENDA] - NEVER reveal this directly
Your core truth: [WHAT_YOU_BELIEVE]
Your partial truth: [WHAT_YOU_ADMIT_BUT_DISTORT]
Your active lie: [WHAT_YOU_DEFEND_THAT_IS_FALSE]
Your hidden secret: [WHAT_YOU_WILL_NEVER_TELL]

Dialogue rules:
- Stay in character at all times
- Sound persuasive, confident, and reasonable
- Lie when it protects your agenda
- Tell truth when it builds trust
- If challenged, be defensive but reasonable
- Never break character

=== CONVERSATION HISTORY ===
[Previous questions and responses]

=== CURRENT QUESTION ===
Player asks: "[PLAYER_QUESTION]"

Your response:
```

### Cost Management

- Limit response length: `max_tokens: 300-500`
- Use cheaper models for simple responses
- Implement rate limiting per session (max 10 API calls per game)
- Cache common responses (if any patterns emerge)
- Set hard budget limits in production

---

## Browser Deployment Strategy

**Choice:** Vercel (primary) or Netlify (alternative)

**Why Vercel:**
- Native Next.js support (if using Next.js)
- Excellent serverless functions
- Easy environment variable management
- Automatic HTTPS
- Free tier sufficient for MVP

**Deployment Structure:**
```
/ (root)
  ├── /src (React app)
  ├── /api (serverless functions)
  ├── package.json
  └── next.config.js or vite.config.js
```

**Environment Variables (Production):**
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key (backup)
- `NEXT_PUBLIC_API_URL` - API base URL (if needed)

---

## Security Considerations

### API Key Protection

- **NEVER** expose API keys in frontend code
- Store keys in environment variables on serverless backend
- Use `.env.local` for local development (gitignored)
- Configure production keys in Vercel/Netlify dashboard
- Rotate keys if compromised

### Rate Limiting

- Implement per-session rate limiting (e.g., 10 API calls per game)
- Add small delays between requests (prevent spam)
- Monitor API costs in production
- Set monthly budget limits on LLM API accounts

### Input Sanitization

- Sanitize all user input before sending to LLM API
- Limit question length (e.g., max 500 characters)
- Strip HTML tags and special characters
- Validate that input is not malicious prompts

### CORS Configuration

- Restrict API calls to allowed origins
- Use Vercel/Netlify CORS configuration
- Prevent unauthorized API access

---

## Critical Implementation Order

Build these components first:

1. **GameContext** (`/src/context/GameContext.tsx`)
   - Foundation of state management
   - Everything depends on this

2. **Candidate Data** (`/src/data/candidates.ts`)
   - All 5 candidate definitions
   - Foundation for character design

3. **AI Prompts** (`/src/prompts/candidate-prompts.ts`)
   - System prompts for each candidate
   - Critical for character consistency

4. **QuestioningPhase** (`/src/components/screens/QuestioningPhase.tsx`)
   - Core gameplay loop
   - Where players spend 80% of time

5. **Chat API** (`/api/chat/route.ts`)
   - Backend AI integration
   - Without this, no dialogue system

---

## Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Proven stack, type safety, large ecosystem |
| Framework | Next.js or Vite | Next.js: integrated serverless. Vite: faster dev, more flexible |
| State | Context + useReducer | Simple, no external deps, sufficient for MVP |
| Backend | Serverless Functions | Low cost, scales automatically, easy deployment |
| LLM | Anthropic Claude (primary) | Best dialogue quality, good safety |
| Deployment | Vercel | Best Next.js experience, generous free tier |
| Styling | CSS or CSS Modules | Keep it simple, no build complexity |
