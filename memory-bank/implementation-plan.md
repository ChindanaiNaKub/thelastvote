# Implementation Plan — The Last Vote

> This file outlines the step-by-step build plan. No code here — only actions and phases.

---

## Status

**PLANNED** — Detailed implementation plan created. Ready for Phase 1.

**Date:** 2026-01-12

---

## High-Level Development Phases

### Phase 0: Planning ✅ COMPLETE

**Goal:** Design the project before any coding.

**Completed:**
- [x] Read all memory-bank files
- [x] Summarize understanding of the game
- [x] Define core player experience and game loop
- [x] Propose core mechanics
- [x] Design high-level architecture
- [x] Create step-by-step implementation plan
- [x] Update memory-bank with planning outcomes

**Deliverables:**
- Plan file created: `/home/prab/.claude/plans/structured-hatching-aurora.md`
- `memory-bank/architecture.md` updated
- `memory-bank/implementation-plan.md` updated
- `memory-bank/tech-stack.md` updated
- `memory-bank/progress.md` updated

---

### Phase 1: Foundation (Week 1)

**Goal:** Set up development environment and build static prototype.

**Success Criteria:**
- Playable game from start to finish with static content
- No AI integration yet
- Ugly but functional UI

**Tasks:**

#### 1.1 Initialize Project
- [x] Create new React project (Next.js or Vite + TypeScript)
- [x] Set up basic folder structure
- [ ] Configure ESLint and Prettier
- [x] Create `.gitignore` and `package.json`

**Commands:**
```bash
# Option A: Next.js
npx create-next-app@latest thelastvote --typescript

# Option B: Vite
npm create vite@latest thelastvote -- --template react-ts
```

#### 1.2 Create Type Definitions
- [x] Create `/src/types/game.ts` with all TypeScript interfaces
- [x] Define: GameState, Candidate, ConversationEntry, ConsequenceData

#### 1.3 Create Static Data
- [x] Create `/src/data/candidates.ts` with 5 candidate definitions
- [ ] Create `/src/data/consequences.ts` with pre-written consequence templates
- [ ] Define: names, personalities, hidden agendas, secrets

#### 1.4 Implement Game State Manager
- [x] Create `/src/context/GameContext.tsx`
- [x] Set up Context + useReducer pattern
- [x] Define initial state and all actions
- [x] Implement phase transitions

#### 1.5 Create Component Skeleton
- [x] Create `/src/App.tsx` with phase-based routing
- [x] Create `/src/components/screens/IntroductionScreen.tsx`
- [x] Create `/src/components/screens/CandidateRosterScreen.tsx`
- [x] Create `/src/components/screens/QuestioningPhase.tsx`
- [x] Create `/src/components/screens/VotingPhase.tsx`
- [x] Create `/src/components/screens/ConsequencePhase.tsx`
- [x] Create `/src/components/screens/CreditsScreen.tsx`

#### 1.6 Implement Basic UI Components
- [ ] Create `/src/components/ui/DialogueBox.tsx`
- [ ] Create `/src/components/ui/QuestionInput.tsx`
- [ ] Create `/src/components/ui/CandidateCard.tsx`

#### 1.7 Implement Basic Game Flow
- [ ] Wire up navigation between screens
- [ ] Implement state updates for phase transitions
- [ ] Add basic styling (just enough to see what's happening)

#### 1.8 Test Static Prototype
- [ ] Play through full game with static content
- [ ] Verify all phase transitions work
- [ ] Verify state updates correctly

---

### Phase 2: AI Integration (Week 1-2) ✅ COMPLETE

**Goal:** Connect AI for dialogue generation.

**Success Criteria:**
- ✅ Player can ask questions and get AI-generated responses
- ✅ Each candidate feels distinct and in character
- ✅ Conversation history is maintained

**Tasks:**

#### 2.1 Set Up Backend ✅
- [x] Create `/api` directory structure
- [x] Set up Vercel/Netlify for serverless functions
- [x] Configure environment variables (`.env.local`)
- [x] Add API keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`

#### 2.2 Create Chat Endpoint ✅
- [x] Create `/api/chat/route.ts`
- [x] Implement POST endpoint
- [x] Add request validation
- [x] Add error handling

#### 2.3 Integrate LLM API ✅
- [x] Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- [x] Implement basic prompt construction
- [x] Test API call with simple prompt
- [x] Verify response handling

#### 2.4 Create AI System Prompts ✅
- [x] Create `/src/prompts/candidate-prompts.ts`
- [x] Write detailed prompts for each of 5 candidates
- [x] Define: personality, truth/lie pattern, dialogue rules
- [x] Test prompts for character consistency

#### 2.5 Create API Client ✅
- [x] Create `/src/lib/api.ts`
- [x] Implement `askQuestion()` function
- [x] Add loading states
- [x] Add error handling and retry logic

#### 2.6 Connect Frontend to AI ✅
- [x] Update `QuestioningPhase` to call AI API
- [x] Replace static dialogue with AI responses
- [x] Add loading indicators during AI generation
- [x] Handle API errors gracefully

#### 2.7 Implement Conversation History ✅
- [x] Track all questions and responses
- [x] Pass history to AI API calls
- [x] Display conversation in DialogueBox
- [x] Test character consistency across multiple questions

#### 2.8 Test AI Integration ✅
- [x] Play multiple rounds with different questions
- [x] Verify each candidate sounds distinct
- [x] Verify characters stay consistent
- [x] Verify no obvious contradictions

---

### Phase 3: Core Mechanics (Week 2)

**Goal:** Implement 3-question limit and voting.

**Success Criteria:**
- Complete game loop works end-to-end
- Tension is created through scarcity
- Consequences create doubt and regret

**Tasks:**

#### 3.1 Implement Question Limit
- [ ] Create `/src/hooks/useQuestionLimit.ts`
- [ ] Track questions remaining (starts at 3)
- [ ] Decrement counter after each question
- [ ] Disable input after 0 questions remaining

#### 3.2 Create Question Counter UI
- [ ] Create `/src/components/ui/QuestionCounter.tsx`
- [ ] Display: "Questions Remaining: 3 | 2 | 1 | 0"
- [ ] Add visual warning styling when low
- [ ] Add warning dialog before final question

#### 3.3 Implement Candidate Selection
- [ ] Allow player to target specific candidates
- [ ] Add visual feedback for selected candidate
- [ ] Handle "open question" (anyone can answer)

#### 3.4 Implement Voting Phase
- [ ] Create `/src/hooks/useVoting.ts`
- [ ] Show all candidates with pull quotes
- [ ] Add vote buttons for each candidate
- [ ] Implement confirmation dialog: "You cannot change your mind"
- [ ] Lock in vote and transition to consequence phase

#### 3.5 Implement Consequence System
- [ ] Create `/src/hooks/useConsequences.ts`
- [ ] Create `/src/api/consequences/route.ts` (or use templates)
- [ ] Implement 3-phase reveal:
  - [ ] Immediate aftermath (6 months later)
  - [ ] Hidden truths revealed
  - [ ] Long-term consequences (3 years later)
- [ ] Add alternative paths ("If you had chosen X...")

#### 3.6 Create Consequence UI
- [ ] Create `/src/components/ui/ConsequenceDisplay.tsx`
- [ ] Implement staged reveals with delays (build tension)
- [ ] Show "Continue" buttons between sections
- [ ] Display alternative paths at end

#### 3.7 Implement Replay Functionality
- [ ] Add "Play Again" button
- [ ] Reset game state to initial
- [ ] Optionally randomize some elements

#### 3.8 Test Full Game Loop
- [ ] Play complete game multiple times
- [ ] Verify all phases work correctly
- [ ] Verify tension is created
- [ ] Verify regret/doubt is achieved

---

### Phase 4: Polish & Feel (Week 2-3)

**Goal:** Enhance tension, atmosphere, and replay value.

**Success Criteria:**
- Game feels tense and atmospheric
- Player doubts themselves after voting
- Replayability is evident

**Tasks:**

#### 4.1 Visual Design
- [ ] Design color scheme for each candidate
- [ ] Create candidate portraits or silhouettes
- [ ] Design typography for readability
- [ ] Add visual tension cues (dimming as questions run out)
- [ ] Polish all UI components

#### 4.2 Atmosphere Enhancements
- [ ] Add smooth transitions between phases
- [ ] Add loading animations for AI generation
- [ ] Add delays before consequences (2-3 seconds for tension)
- [ ] Consider adding sound effects (optional)

#### 4.3 Dialogue Refinement
- [ ] Test AI prompts extensively
- [ ] Adjust prompts based on character quality
- [ ] Add "interruption" mechanic (candidates jump in)
- [ ] Implement candidate relationships (allies/rivals)
- [ ] Improve character consistency checks

#### 4.4 Replay Value Enhancements
- [ ] Implement randomized secrets per playthrough
- [ ] Track and show "what if" scenarios
- [ ] Add simple achievements (optional)
- [ ] Add playthrough statistics (optional)

#### 4.5 Error Handling & Edge Cases
- [ ] Handle AI API failures gracefully
- [ ] Handle empty/invalid questions
- [ ] Handle page refresh mid-game
- [ ] Implement rate limiting
- [ ] Add timeout handling

#### 4.6 Testing & Iteration
- [ ] Play test with multiple users
- [ ] Gather feedback on tension/doubt/regret
- [ ] Iterate on prompts and timing
- [ ] Fix reported bugs

---

### Phase 5: Deployment (Week 3)

**Goal:** Deploy game and gather feedback.

**Success Criteria:**
- Game is live and playable
- No critical bugs
- Core feeling is achieved

**Tasks:**

#### 5.1 Prepare for Deployment
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Optimize bundle size
- [ ] Set up production environment variables
- [ ] Final security check

#### 5.2 Deploy to Vercel
- [ ] Connect repository to Vercel
- [ ] Configure build settings
- [ ] Set up environment variables in dashboard
- [ ] Deploy to production
- [ ] Test live version

#### 5.3 Monitor & Iterate
- [ ] Monitor API costs and usage
- [ ] Set up budget alerts
- [ ] Gather initial player feedback
- [ ] Identify critical bugs
- [ ] Deploy hotfixes as needed

#### 5.4 Polish Pass
- [ ] Fix critical bugs
- [ ] Adjust AI prompts if characters feel off
- [ ] Tweak consequence timing for maximum impact
- [ ] Polish remaining rough edges

---

## Dependencies Between Phases

**Critical Path (must follow this order):**
```
Phase 0: Planning
    ↓
Phase 1: Foundation
    ↓
Phase 2: AI Integration
    ↓
Phase 3: Core Mechanics
    ↓
Phase 4: Polish & Feel
    ↓
Phase 5: Deployment
```

**Rationale:**
- Cannot do AI Integration (Phase 2) without Foundation (Phase 1)
- Cannot do Core Mechanics (Phase 3) without AI Integration (Phase 2)
- Cannot do Polish (Phase 4) without Core Mechanics (Phase 3)
- Cannot Deploy (Phase 5) without core game working

**Parallel Work Possible:**
- Visual design can happen alongside AI integration
- Consequence system can be built in parallel with question system
- Error handling can be added throughout all phases

---

## Step-by-Step Build Plan

### Week 1: Foundation + Start AI Integration

**Day 1-2:** Phase 1 (Foundation)
- Initialize project
- Create type definitions
- Set up static data
- Build game state manager
- Create component skeleton

**Day 3-4:** Phase 1 (Foundation continued)
- Implement basic UI components
- Wire up game flow
- Test static prototype
- Verify all screens work

**Day 5-7:** Phase 2 (AI Integration - start)
- Set up backend
- Create chat endpoint
- Integrate LLM API
- Create AI system prompts
- Test basic AI responses

### Week 2: AI Integration + Core Mechanics

**Day 8-10:** Phase 2 (AI Integration - finish)
- Create API client
- Connect frontend to AI
- Implement conversation history
- Test AI integration thoroughly

**Day 11-14:** Phase 3 (Core Mechanics)
- Implement question limit
- Create question counter UI
- Implement candidate selection
- Implement voting phase
- Implement consequence system
- Test full game loop

### Week 3: Polish + Deployment

**Day 15-17:** Phase 4 (Polish)
- Visual design
- Atmosphere enhancements
- Dialogue refinement
- Replay value enhancements
- Error handling

**Day 18-19:** Phase 5 (Deployment)
- Prepare for deployment
- Deploy to Vercel
- Test live version
- Monitor and iterate

**Day 20-21:** Buffer for unforeseen issues
- Fix bugs
- Additional polish
- Gather feedback
- Final iteration

---

## Definition of Done

The game is complete when:

- [ ] Player can meet all five candidates
- [ ] Player can ask questions and receive responses
- [ ] Player can cast a final vote
- [ ] Consequences are revealed based on the choice
- [ ] The experience creates tension, doubt, and reflection
- [ ] The game runs in a browser
- [ ] Replay value exists (different playthroughs feel meaningful)
- [ ] AI characters feel distinct and stay in character
- [ ] No critical bugs
- [ ] Deployed and accessible to players

---

## MVP Scope Definition

**Minimum Playable Version includes:**

1. **5 Candidates**
   - Distinct personalities and archetypes
   - AI-generated dialogue
   - Each has hidden motivations and secrets

2. **3-Question Limit**
   - Total (not per candidate)
   - Creates scarcity and tension
   - Clear counter and warnings

3. **Question & Answer System**
   - Free text input
   - AI-generated responses from candidates
   - Conversation history displayed

4. **Voting Mechanics**
   - Choose from 5 candidates
   - Confirmation dialog
   - Vote is final

5. **Consequence System**
   - 3-phase reveal (immediate → hidden truths → long-term)
   - Alternative paths shown
   - Creates doubt and regret

6. **Replayability**
   - "Play Again" button
   - Different questions → different dialogue

**NOT in MVP:**
- No fancy graphics (text-based is fine)
- No sound effects
- No complex animations
- No save/load system
- No achievements
- AI-generated consequences (use templates first)
- Candidate interruptions and debates
- Randomized elements

**Post-MVP (Polish Phase):**
- Visual polish (portraits, colors, animations)
- Sound design (tension cues)
- AI-generated consequences
- Candidate interruptions
- Randomized secrets
- Achievements

---

## Critical Files (Implementation Order)

Build these 5 files first:

### 1. `/src/context/GameContext.tsx`
**Why:** Central state management. Everything depends on this.
**Contains:**
- Game state reducer
- Context provider
- All state and actions
- Phase transition logic

### 2. `/src/data/candidates.ts`
**Why:** Defines all candidates. Foundation for character design.
**Contains:**
- 5 candidate definitions
- Personalities, motivations, secrets
- Archetypes
- Presentation data (colors, portraits)

### 3. `/src/prompts/candidate-prompts.ts`
**Why:** AI system prompts. Critical for character consistency.
**Contains:**
- Detailed prompts for each candidate
- Personality definitions
- Truth/lie patterns
- Dialogue rules

### 4. `/src/components/screens/QuestioningPhase.tsx`
**Why:** Core gameplay loop. Where players spend 80% of time.
**Contains:**
- Question input
- Dialogue display
- Candidate selection
- Question counter

### 5. `/api/chat/route.ts`
**Why:** Backend AI integration. Without this, no dialogue system.
**Contains:**
- POST endpoint
- LLM API calls
- Prompt construction
- Response handling
- Error handling

---

## Risk Mitigation

### Risk: AI Quality Inconsistency
**Mitigation:**
- Test prompts extensively before implementation
- Have backup prompts ready
- Implement fallback to static dialogue if AI fails
- Monitor AI output quality in production

### Risk: API Cost Overrun
**Mitigation:**
- Implement hard rate limits (10 calls per game max)
- Use `max_tokens` to limit response length
- Monitor costs daily
- Set budget alerts on API accounts

### Risk: Players Don't Feel Regret
**Mitigation:**
- Playtest early and often
- Iterate on consequence timing and content
- Ensure every choice has downsides
- Make alternative paths tempting

### Risk: Technical Complexity Overwhelms MVP
**Mitigation:**
- Start with static consequences (no AI)
- Skip candidate interruptions initially
- Use simple CSS (no complex animations)
- Focus on dialogue quality over visuals

---

## Next Actions (After Planning Approval)

1. **Initialize React project** (Phase 1.1)
2. **Create type definitions** (Phase 1.2)
3. **Create static candidate data** (Phase 1.3)
4. **Build game state manager** (Phase 1.4)
5. **Create component skeleton** (Phase 1.5)

---

*Implementation plan created: 2026-01-12*
