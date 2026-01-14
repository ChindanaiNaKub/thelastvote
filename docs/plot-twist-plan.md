# Plot Twist System Implementation Plan
# The Last Vote - Creative Enhancement

**Goal:** Add never-before-seen plot twist mechanics while maintaining testability and stability.

**User Requirements:**
- ✅ Mix everything - creative + never-before-seen
- ✅ Balance - testable, not experimental chaos
- ✅ Focus: Betrayal + Elimination regret + Paradigm shift

---

## Overview

### 5 Core Mechanics

| Mechanic | Impact | Complexity | Phase |
|----------|--------|------------|-------|
| **Pressure Slip-ups** | Candidates crack under questioning | Medium | 2 |
| **Candidate Clashes** | Public attacks between candidates | Medium | 2 |
| **Dynamic Consequences** | Outcomes based on actual decisions | Medium | 3 |
| **Secret Knowledge** | Who knows what about whom | Low | 3 |
| **Paradigm Shift** | "No honest candidate" meta twist | Low | 4 |

### Key Design Principles

1. **Deterministic, Not Random** - Every event triggered by explicit conditions
2. **Debug Mode** - Console visibility into all tracking
3. **Template-Based** - Testable combinations, no wild AI generation
4. **Psychological Impact** - Creates doubt, regret, paradigm shifts

---

## Phase 1: Foundation (Tracking System) ✅ COMPLETE

**Status:** Phase 1 complete - All type definitions, tracking utilities, and state management implemented.

**Completed Files:**
- ✅ `/src/types/game.ts` - Extended with 7 new interfaces
- ✅ `/src/lib/tracking.ts` - Analysis utilities created (450+ lines)
- ✅ `/src/context/GameContext.tsx` - 5 new reducer cases + debug mode

**What's Working:**
- ✅ Topic analysis: `analyzeQuestionTopics()` detects Thai topics
- ✅ Pressure calculation: `calculatePressure()` for all candidates
- ✅ Clash detection: `checkClashConditions()` with 3 trigger types
- ✅ Debug mode: `window.TLV_DEBUG` accessible in browser console

---

## Phase 2: Mid-Game Events

### 2A. Pressure Slip-ups

**Concept:** When pressure > 70, candidates accidentally reveal hints.

**Files to Modify:**

1. **`/src/lib/api.ts`** - Inject pressure into prompts
   ```typescript
   // In generateCandidateResponse()
   const pressure = calculatePressure(candidateId, gameState)

   if (pressure.pressureLevel > 70 && !pressure.hasSlippedUp) {
     systemPrompt += `

⚠️ ความดันสูง
คุณรู้สึกกดดัน แสดงสัญญาณเล็กน้อย: hesitation, deflection, การพูดซ้ำ
อย่าเปิดเผยความลับ แต่แสดงความกดดันให้เห็น`
   }
   ```

2. **`/src/data/candidates.ts`** - Add slip-up responses
   ```typescript
   slipUpResponses: {
     mild: ["ผม... อืม... ผมจะแก้ปัญหานี้ให้"],
     severe: ["ไม่ใช่แบบนั้นนะ! ผม... ผมไม่ได้..."]
   }
   ```

### 2B. Candidate Clashes

**Concept:** Candidates interrupt each other during response phase.

**Files to Modify:**

1. **`/src/lib/clashGenerator.ts`** (NEW) - Generate clash events
   ```typescript
   export function generateClashEvent(state: GameState): ClashEvent | null {
     // Check conditions: contradiction, ally_defense, rival_attack
     // Return clash data or null
   }
   ```

2. **`/src/components/ui/ClashCard.tsx`** (NEW) - Display clashes
   - Special visual style (different from normal responses)
   - Show both candidates' portraits
   - Animated reveal

3. **`/src/components/screens/QuestioningPhase.tsx`** - Trigger clashes
   ```typescript
   // After response generation
   const clash = generateClashEvent(gameState)
   if (clash) {
     dispatch(gameActions.addClash(clash))
   }
   ```

4. **`/src/components/ui/ResponsesGrid.tsx`** - Render clashes
   - Handle 'clash' entry type
   - Insert ClashCard components

### Testing

- [ ] Ask same candidate 3+ questions → pressure > 70
- [ ] Verify slip-up appears in response
- [ ] Trigger clash by asking about sensitive topics
- [ ] Verify ClashCard displays correctly

**Estimated Time:** 2-3 days

---

## Phase 3: Dynamic Consequences

**Concept:** Consequences change based on questions asked, elimination order, etc.

### Files to Modify

1. **`/src/data/consequences.ts`** - Make generation dynamic
   ```typescript
   export function generateDynamicConsequences(
     chosenCandidateId: string,
     gameState: GameState // NEW: Full state
   ): ConsequenceData {
     // Analyze topics never asked
     // Analyze elimination order
     // Override templates with dynamic content
   }
   ```

2. **`/src/data/consequenceTemplates.ts`** (NEW) - Template variations
   ```typescript
   export const consequenceModifiers = {
     neverAskedAbout: {
       'เศรษฐกิจ': "คุณไม่เคยถามเรื่องเศรษฐกิจ แค่ฟังคำมั่วสัญญา",
       'คอร์รัปชัน': "ทำไมไม่เคยถามเรื่องความโปร่งใส?"
     },
     eliminatedFirst: {
       'candidate_1': "ถ้าเก็บ พัฒน์ ไว้ เขาจะไม่สร้างอนุสาวรีย์ตัวเอง",
       'candidate_2': "ถ้าเก็บ เนติ ไว้ เธอจะไม่ใช้ spreadsheet คัดกรองประชาชน"
     }
   }
   ```

3. **`/src/hooks/useConsequences.ts`** - Pass full state
   ```typescript
   const consequences = generateDynamicConsequences(vote, state)
   ```

### Testing

- [ ] Play game asking only economy questions → consequences mention missing topics
- [ ] Play game asking no questions about corruption → severe consequences
- [ ] Test different elimination orders → different "question never asked" text

**Estimated Time:** 1-2 days

---

## Phase 4: Paradigm Shift

**Concept:** End-game meta twist "No Honest Candidate"

### Files to Modify

1. **`/src/data/paradigmTwists.ts`** (NEW) - Twist definitions
   ```typescript
   export const paradigmTwists = {
     noHonestCandidate: {
       revealSequence: [
         {
           timing: 'after_phase3',
           content: "คุณเชื่อใจ {CHOSEN_CANDIDATE}...",
           referencesGameplay: true
         },
         {
           timing: 'very_end',
           content: "แต่ไม่มีใครซื่อสัตย์จริงๆ ทุกคนโกหก ทุกคนซ่อนอะไรไว้",
           referencesGameplay: false
         }
       ]
     }
   }
   ```

2. **`/src/components/screens/ConsequencePhase.tsx`** - Add Phase 4
   - After alternative paths
   - Cinematic text reveal
   - Insert gameplay references: `content.replace('{CHOSEN_CANDIDATE}', name)`

### Testing

- [ ] Play full game
- [ ] Verify twist appears after alternative paths
- [ ] Check gameplay references are accurate

**Estimated Time:** 1 day

---

## Summary

### Files to Create (NEW)

1. ✅ `/src/lib/tracking.ts` - Analysis utilities (COMPLETE)
2. `/src/lib/clashGenerator.ts` - Clash event generation
3. `/src/components/ui/ClashCard.tsx` - Clash UI component
4. `/src/data/consequenceTemplates.ts` - Dynamic consequence templates
5. `/src/data/paradigmTwists.ts` - End-game twist definitions

### Files to Modify (CRITICAL ORDER)

1. ✅ `/src/types/game.ts` - Foundation (COMPLETE)
2. ✅ `/src/context/GameContext.tsx` - State management (COMPLETE)
3. ✅ `/src/lib/tracking.ts` - Analysis engine (COMPLETE)
4. `/src/lib/api.ts` - Pressure integration
5. `/src/data/candidates.ts` - Slip-up data
6. `/src/data/consequences.ts` - Dynamic generation
7. `/src/components/screens/QuestioningPhase.tsx` - Clash triggers
8. `/src/components/ui/ResponsesGrid.tsx` - Clash display
9. `/src/components/screens/ConsequencePhase.tsx` - Twist reveal

### Total Estimated Time

- ✅ Phase 1: 1-2 days (COMPLETE)
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Phase 4: 1 day
- **Total: 5-8 days**

---

## Debug Mode Setup ✅ ACTIVE

Debug mode is enabled in GameContext:

```typescript
if (import.meta.env.DEV) {
  window.TLV_DEBUG = {
    getState: () => state,
    getPressure: (id) => state.pressureStates[id],
    getTopics: () => state.topicHistory,
    getClashes: () => state.clashHistory,
    getSecrets: () => state.secretReveals,
    triggerClash: () => dispatch({type: 'FORCE_CLASH'})
  }
}
```

**Access in browser console:**
- `TLV_DEBUG.getState()` - View full game state
- `TLV_DEBUG.getPressure('candidate_1')` - Check pressure
- `TLV_DEBUG.getTopics()` - See tracked topics
- `TLV_DEBUG.getClashes()` - View clash history
- `TLV_DEBUG.getSecrets()` - See revealed secrets
- `TLV_DEBUG.triggerClash()` - Manually trigger clash (testing)

---

## Verification

After implementation, verify:

✅ **Testability:** All mechanics deterministic, no randomness
✅ **Creativity:** 5 unique mechanics never seen in similar games
✅ **Doubt Created:** Betrayal, regret, paradigm shift all present
✅ **Replay Value:** Different decisions → different outcomes
✅ **Stability:** TypeScript compiles, console logs clean, no runtime errors

**Playtest Checklist:**
- [ ] Play 5 full games with different strategies
- [ ] Each playthrough feels unique
- [ ] Doubt/regret created at end
- [ ] Paradigm twist hits hard

---

**Next Steps:**

1. Choose a phase to implement (2A, 2B, 3, or 4)
2. Follow the file modification list
3. Use debug mode to test
4. Verify each phase before moving to the next

**For Collaborators:**

Start by reading:
- `/memory-bank/progress.md` - Development history
- `/memory-bank/game-design-document.md` - Core design
- `/memory-bank/architecture.md` - System structure

Then choose a phase and begin implementation!
