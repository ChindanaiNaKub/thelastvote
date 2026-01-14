// ============================================================================
// Plot Twist System - Tracking Utilities
// ============================================================================
// This file contains analysis functions for tracking game state.
// All mechanics are deterministic and testable.
// ============================================================================

import type { GameState, PressureState, ClashEvent, TopicEntry, Candidate } from '../types/game'

// ----------------------------------------------------------------------------
// Topic Analysis
// ----------------------------------------------------------------------------

/**
 * Topic keywords for Thai question analysis.
 * Maps topic names to arrays of related keywords.
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'เศรษฐกิจ': ['เศรษฐกิจ', 'เงิน', 'รายได้', 'ความจน', 'งบประมาณ', 'รายจ่าย', 'ภาษี', 'เงินเฟ้อ', 'ว่างงาน', 'โต๊ะเงิน'],
  'การศึกษา': ['การศึกษา', 'โรงเรียน', 'มหาวิทยาลัย', 'เรียน', 'ครู', 'นักเรียน', 'ประกาศนียบัตร', 'วิชา'],
  'ความปลอดภัย': ['ความปลอดภัย', 'อาชญากรรม', 'ตำรวจ', 'ความรู้สึกปลอดภัย', 'อาวุธ', 'ป้องกัน', 'คุกมัก'],
  'คอร์รัปชัน': ['โกหก', 'โปร่งใส', 'ทุจริต', 'คอร์รัปชัน', 'ซื้อเสียง', 'ลับหลัง', 'ความซื่อสัตย์', 'ฉ้อฉล'],
  'สิทธิมนุษยชน': ['สิทธิ', 'คน', 'ชุมชน', 'ความเสมอภาค', 'เสรีภาพ', 'เลือกตั้ง', 'ประชาธิปไตย'],
  'สิ่งแวดล้อม': ['สิ่งแวดล้อม', 'มลพิษ', 'ขยะ', 'น้ำ', 'อากาศ', 'ต้นไม้', 'ธรรมชาติ', 'พลังงาน'],
  'สุขภาพ': ['สุขภาพ', 'โรงพยาบาล', 'แพทย์', 'ยา', 'ป่วย', 'รักษา', 'วัคซีน', 'การดูแลสุขภาพ'],
  'การท่องเที่ยว': ['ท่องเที่ยว', 'นักท่องเที่ยว', 'โรงแรม', 'ร้านอาหาร', 'แหล่งท่องเที่ยว'],
  'โครงสร้างพื้นฐาน': ['โครงสร้างพื้นฐาน', 'ถนน', 'สะพาน', 'รถไฟ', 'คมนาคม', 'ขนส่ง', 'ไฟฟ้า', 'น้ำประปา'],
  'ความมั่งคั่ง': ['ความมั่งคั่ง', 'คนรวย', 'คนจน', 'ล้างต่าง', 'การกระจายรายได้'],
}

/**
 * Analyzes a question and detects topics.
 *
 * @param question - The player's question text
 * @returns Array of detected topics
 *
 * @example
 * analyzeQuestionTopics("คุณจะแก้ปัญหาเศรษฐกิจและความจนอย่างไร")
 * // Returns: ['เศรษฐกิจ']
 */
export function analyzeQuestionTopics(question: string): string[] {
  const topics: string[] = []

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    // Check if any keyword appears in the question
    if (keywords.some(kw => question.includes(kw))) {
      topics.push(topic)
    }
  }

  return topics
}

/**
 * Tracks a question with its detected topics.
 * Creates a TopicEntry for the game state.
 *
 * @param question - The player's question text
 * @param targetedCandidate - Optional candidate ID if question was targeted
 * @returns TopicEntry object
 */
export function trackTopic(question: string, targetedCandidate?: string): TopicEntry {
  const topics = analyzeQuestionTopics(question)

  return {
    question,
    topics,
    targetedCandidate,
    timestamp: Date.now(),
  }
}

// ----------------------------------------------------------------------------
// Pressure Calculation
// ----------------------------------------------------------------------------

/**
 * Calculates pressure level for a candidate based on game state.
 *
 * Pressure increases when:
 * - Player targets this candidate with questions (+20 per question)
 * - Their allies get eliminated (+30 per ally, +50 for best friend)
 * - They're caught in contradictions (+15 per contradiction)
 *
 * Enhanced Relationship Modifiers (Part 2):
 * - best_friend eliminated: +50 pressure (vs +30 for ally)
 * - ally eliminated: +30 pressure
 * - friendly_rival eliminated: +15 pressure
 * - Lone wolf (ทาม): +20 base pressure from isolation
 *
 * @param candidateId - The candidate to calculate pressure for
 * @param state - Current game state
 * @returns PressureState object
 *
 * @example
 * const pressure = calculatePressure('candidate_1', gameState)
 * // Returns: { candidateId: 'candidate_1', pressureLevel: 60, triggers: {...}, hasSlippedUp: false }
 */
export function calculatePressure(candidateId: string, state: GameState): PressureState {
  const candidate = state.candidates.find(c => c.id === candidateId)
  if (!candidate) {
    // Return zero pressure if candidate not found
    return {
      candidateId,
      pressureLevel: 0,
      triggers: {
        questionsTargeted: 0,
        alliesEliminated: 0,
        contradictionsExposed: 0,
      },
      hasSlippedUp: false,
    }
  }

  // Get existing pressure state or initialize
  const existingPressure = state.pressureStates[candidateId] || {
    pressureLevel: 0,
    triggers: {
      questionsTargeted: 0,
      alliesEliminated: 0,
      contradictionsExposed: 0,
    },
    hasSlippedUp: false,
  }

  // Count questions targeting this candidate
  const questionsTargeted = state.conversationHistory.filter(entry =>
    entry.type === 'question' && entry.targetedCandidate === candidateId
  ).length

  // Count pressure from eliminated allies/enhanced relationships
  let alliesEliminated = 0
  let pressureFromEliminations = 0

  if (candidate.enhancedRelationships) {
    for (const [otherId, rel] of Object.entries(candidate.enhancedRelationships)) {
      if (state.eliminatedCandidateIds.includes(otherId)) {
        alliesEliminated++

        // Enhanced relationship pressure modifiers
        switch (rel.type) {
          case 'best_friend':
            pressureFromEliminations += 50 // Massive pressure from best friend loss
            break
          case 'ally':
            pressureFromEliminations += 30 // Standard ally loss
            break
          case 'friendly_rival':
            pressureFromEliminations += 15 // Mild pressure from friendly rival loss
            break
          case 'secret_friend':
            pressureFromEliminations += 40 // Secret friend revealed as eliminated
            break
          default:
            // No pressure from neutral, rival, enemy eliminations
            break
        }
      }
    }
  } else if (candidate.relationships) {
    // Fallback to basic relationships if enhanced not available
    for (const [otherId, relationship] of Object.entries(candidate.relationships)) {
      if (relationship === 'ally' && state.eliminatedCandidateIds.includes(otherId)) {
        alliesEliminated++
        pressureFromEliminations += 30
      }
    }
  }

  // Lone wolf bonus (ทาม - candidate_5): +20 base pressure from isolation
  const loneWolfBonus = (candidate.id === 'candidate_5') ? 20 : 0

  // Calculate pressure (capped at 100)
  // Formula: (questions × 20) + (elimination pressure) + (contradictions × 15) + (lone wolf bonus)
  const pressureLevel = Math.min(100, (
    questionsTargeted * 20 +
    pressureFromEliminations +
    existingPressure.triggers.contradictionsExposed * 15 +
    loneWolfBonus
  ))

  return {
    candidateId,
    pressureLevel,
    triggers: {
      questionsTargeted,
      alliesEliminated,
      contradictionsExposed: existingPressure.triggers.contradictionsExposed,
    },
    hasSlippedUp: existingPressure.hasSlippedUp,
  }
}

/**
 * Recalculates pressure for all active (non-eliminated) candidates.
 *
 * @param state - Current game state
 * @returns Record of candidate IDs to their PressureStates
 */
export function calculateAllPressures(state: GameState): Record<string, PressureState> {
  const pressures: Record<string, PressureState> = {}

  for (const candidate of state.candidates) {
    // Skip eliminated candidates
    if (candidate.isEliminated) continue

    pressures[candidate.id] = calculatePressure(candidate.id, state)
  }

  return pressures
}

// ----------------------------------------------------------------------------
// Clash Detection
// ----------------------------------------------------------------------------

/**
 * Checks if conditions are met for a candidate clash event.
 *
 * Clash triggers:
 * 1. **Contradiction**: Candidates disagree on same topic
 * 2. **Ally Defense**: Candidate jumps in to defend eliminated ally
 * 3. **Rival Attack**: Candidate attacks rival after they speak
 * 4. **Pressure**: High-pressure candidate lashing out
 *
 * @param state - Current game state
 * @returns ClashEvent object or null if no clash should occur
 *
 * @example
 * const clash = checkClashConditions(gameState)
 * if (clash) {
 *   // Display clash event to player
 * }
 */
export function checkClashConditions(state: GameState): ClashEvent | null {
  // Only trigger clashes during questioning phase
  if (state.phase !== 'questioning') return null

  // Don't trigger if there's already a clash in progress (last entry is a clash)
  const lastEntry = state.conversationHistory[state.conversationHistory.length - 1]
  if (lastEntry?.type === 'clash') return null

  // Get active (non-eliminated) candidates
  const activeCandidates = state.candidates.filter(c => !c.isEliminated)
  if (activeCandidates.length < 2) return null

  // Check for ally defense trigger (highest priority)
  const allyDefenseClash = checkAllyDefenseTrigger(state, activeCandidates)
  if (allyDefenseClash) return allyDefenseClash

  // Check for rival attack trigger
  const rivalAttackClash = checkRivalAttackTrigger(state, activeCandidates)
  if (rivalAttackClash) return rivalAttackClash

  // Check for pressure trigger (lowest pressure threshold)
  const pressureClash = checkPressureTrigger(state, activeCandidates)
  if (pressureClash) return pressureClash

  // No clash conditions met
  return null
}

/**
 * Checks for ally defense clash trigger.
 * Occurs when a candidate's ally has been eliminated.
 *
 * Enhanced Relationship Mechanics (Part 2):
 * - best_friend eliminated: Always triggers clash with eliminator (high priority)
 * - ally eliminated: Triggers clash if rival available
 * - friendly_rival eliminated: May trigger defense clash with eliminator
 * - secret_friend eliminated: Reveals secret friendship, triggers clash
 */
function checkAllyDefenseTrigger(state: GameState, activeCandidates: Candidate[]): ClashEvent | null {
  // Must have at least one elimination
  if (state.eliminationHistory.length === 0) return null

  const lastEliminated = state.eliminationHistory[state.eliminationHistory.length - 1].eliminatedCandidateId

  // Find candidates who have enhanced relationships with the eliminated candidate
  for (const candidate of activeCandidates) {
    if (candidate.enhancedRelationships?.[lastEliminated]) {
      const relationship = candidate.enhancedRelationships[lastEliminated]

      // Check if this relationship should trigger a defense clash
      const shouldTrigger = ['best_friend', 'ally', 'friendly_rival', 'secret_friend'].includes(relationship.type)

      if (shouldTrigger) {
        // Find someone to attack (prioritize: eliminator if known, then rivals, then anyone)
        let target: Candidate | undefined

        // Try to find who eliminated them (if we can track that)
        // For now, pick a rival or enemy
        target = activeCandidates.find(c =>
          c.id !== candidate.id &&
          candidate.enhancedRelationships?.[c.id] &&
          ['enemy', 'rival'].includes(candidate.enhancedRelationships[c.id].type)
        )

        // Fallback to anyone else
        if (!target) {
          target = activeCandidates.find(c => c.id !== candidate.id)
        }

        if (target) {
          const triggerType = relationship.type === 'best_friend' ? 'ally_defense' : 'rival_attack'

          // Generate contextual message based on relationship type
          let contextMessage = ''
          switch (relationship.type) {
            case 'best_friend':
              contextMessage = `${candidate.name} บ้าคลั่งหลังเพื่อนสนิทถูกคัดออก! โจมตี ${target.name} ทันที`
              break
            case 'ally':
              contextMessage = `${candidate.name} ปกป้องพันธมิตรที่ถูกคัดออก โจมตี ${target.name}`
              break
            case 'friendly_rival':
              contextMessage = `${candidate.name} โต้แย้ง ${target.name} หลังจากคู่แข่งตัวยงถูกคัดออก`
              break
            case 'secret_friend':
              contextMessage = `${candidate.name} เปิดเผยความลับ! เคยสนิทกับคนที่ถูกคัดออก โจมตี ${target.name}`
              break
            default:
              contextMessage = `${candidate.name} โจมตี ${target.name} หลังจากการคัดคนออก`
          }

          return generateClashEvent({
            initiator: candidate.id,
            target: target.id,
            triggerType,
            topic: 'การคัดคนออก',
            context: contextMessage,
          })
        }
      }
    }
    // Fallback to basic relationships
    else if (candidate.relationships?.[lastEliminated] === 'ally') {
      // Find a rival to attack
      const rival = activeCandidates.find(c =>
        c.id !== candidate.id &&
        (candidate.relationships?.[c.id] === 'rival')
      )

      if (rival) {
        return generateClashEvent({
          initiator: candidate.id,
          target: rival.id,
          triggerType: 'ally_defense',
          topic: 'การคัดคนออก',
          context: `${candidate.name} โจมตี ${rival.name} หลังจากพันธมิตรถูกคัดออก`,
        })
      }
    }
  }

  return null
}

/**
 * Checks for rival attack clash trigger.
 * Occurs when a rival speaks after being attacked.
 *
 * Enhanced Relationship Mechanics (Part 2):
 * - friendly_rival: Banter exchanges, but defend from outsiders
 * - rival: Standard rival attacks
 * - enemy: Hostile attacks
 */
function checkRivalAttackTrigger(state: GameState, activeCandidates: Candidate[]): ClashEvent | null {
  // Check last few conversation entries for rival tensions
  const recentEntries = state.conversationHistory.slice(-5)

  for (const entry of recentEntries) {
    if (entry.type === 'response') {
      const speaker = state.candidates.find(c => c.id === entry.speaker)
      if (!speaker || speaker.isEliminated) continue

      // Find someone who has an enhanced relationship with this speaker
      for (const candidate of activeCandidates) {
        if (candidate.id === speaker.id) continue

        // Check for enhanced relationships
        if (candidate.enhancedRelationships?.[speaker.id]) {
          const relationship = candidate.enhancedRelationships[speaker.id]

          // Check if this relationship should trigger a clash
          const shouldTrigger = ['rival', 'enemy', 'friendly_rival'].includes(relationship.type)

          if (shouldTrigger) {
            // Check if candidate has high enough pressure
            const pressure = state.pressureStates[candidate.id]

            // Lower threshold for friendly_rival (they like to banter)
            const pressureThreshold = relationship.type === 'friendly_rival' ? 30 : 50

            if (pressure && pressure.pressureLevel > pressureThreshold) {
              let contextMessage = ''

              switch (relationship.type) {
                case 'friendly_rival':
                  contextMessage = `${candidate.name} จัดการ ${speaker.name} ด้วยมุกตะโกน "คู่แข่งตัวยง"`
                  break
                case 'rival':
                  contextMessage = `${candidate.name} โจมตี ${speaker.name} ทันทีหลังจากพูด`
                  break
                case 'enemy':
                  contextMessage = `${candidate.name} บ้าคลั่ง! โจมตี ${speaker.name} ด้วยความเกลียดชัง`
                  break
                default:
                  contextMessage = `${candidate.name} โจมตี ${speaker.name}`
              }

              return generateClashEvent({
                initiator: candidate.id,
                target: speaker.id,
                triggerType: relationship.type === 'enemy' ? 'ally_defense' : 'rival_attack',
                topic: 'ความขัดแย้งส่วนตัว',
                context: contextMessage,
              })
            }
          }
        }
        // Fallback to basic relationships
        else if (candidate.relationships?.[speaker.id] === 'rival') {
          // Check if candidate has high pressure
          const pressure = state.pressureStates[candidate.id]
          if (pressure && pressure.pressureLevel > 50) {
            return generateClashEvent({
              initiator: candidate.id,
              target: speaker.id,
              triggerType: 'rival_attack',
              topic: 'ความขัดแย้งส่วนตัว',
              context: `${candidate.name} โจมตี ${speaker.name} ทันทีหลังจากพูด`,
            })
          }
        }
      }
    }
  }

  return null
}

/**
 * Checks for pressure-based clash trigger.
 * Occurs when a candidate is under extreme pressure (>80).
 */
function checkPressureTrigger(state: GameState, activeCandidates: Candidate[]): ClashEvent | null {
  // Find candidates with extreme pressure
  const highPressureCandidates = activeCandidates.filter(candidate => {
    const pressure = state.pressureStates[candidate.id]
    return pressure && pressure.pressureLevel > 80 && !pressure.hasSlippedUp
  })

  if (highPressureCandidates.length === 0) return null

  // Pick the highest pressure candidate
  const initiator = highPressureCandidates.reduce((highest, current) =>
    (state.pressureStates[current.id]!.pressureLevel > state.pressureStates[highest.id]!.pressureLevel)
      ? current : highest
  )

  // Find someone to attack (prefer rivals, then anyone else)
  const target = activeCandidates.find(c =>
    c.id !== initiator.id && initiator.relationships?.[c.id] === 'rival'
  ) || activeCandidates.find(c => c.id !== initiator.id)

  if (!target) return null

  return generateClashEvent({
    initiator: initiator.id,
    target: target.id,
    triggerType: 'pressure',
    topic: 'การถูกกดดัน',
    context: `${initiator.name} แตกสลายภายใต้ความดันสูงและโจมตี ${target.name}`,
  })
}

/**
 * Generates a clash event with dialogue.
 */
function generateClashEvent(params: {
  initiator: string
  target: string
  triggerType: 'contradiction' | 'ally_defense' | 'rival_attack' | 'pressure'
  topic: string
  context: string
}): ClashEvent {
  return {
    id: `clash_${Date.now()}_${params.initiator}_${params.target}`,
    timestamp: Date.now(),
    initiator: params.initiator,
    target: params.target,
    topic: params.topic,
    dialogueExchange: [
      {
        speaker: params.target,
        content: `[Interrupted by ${params.initiator}]`,
        emotion: 'defensive',
      },
      {
        speaker: params.initiator,
        content: generateClashDialogue(params.triggerType, params.initiator),
        emotion: params.triggerType === 'ally_defense' ? 'angry' : 'desperate',
      },
    ],
    triggers: {
      type: params.triggerType,
      context: params.context,
    },
  }
}

/**
 * Generates dialogue for clash events based on trigger type.
 * In production, this would use candidate-specific templates.
 * For now, returns placeholder text.
 */
function generateClashDialogue(triggerType: string, _initiatorId: string): string {
  // TODO: Implement candidate-specific dialogue templates
  // For now, return generic responses

  const templates: Record<string, string[]> = {
    ally_defense: [
      "คุณไม่มีสิทธิ์พูดเรื่องพวกเขา!",
      "เธอไม่รู้อะไรเลย หยุดพูด!",
      "คนที่คุณคัดออกเขาเก่งกว่าคุณพอ!",
    ],
    rival_attack: [
      "คุณโกหก ฉันจำได้ว่าคุณพูดต่างไป!",
      "อย่าฟังเขา เขาแค่อิจฉา!",
      "คำพูดของคุณไม่มีค่าเลย!",
    ],
    pressure: [
      "คุณถามมากเกินไปแล้ว!",
      "พอแล้ว! ฉันไม่ได้รับผิดชอบ!",
      "ไม่ใช่ฉัน! ถามคนอื่นสิ!",
    ],
    contradiction: [
      "แต่ก่อนนี้คุณพูดต่างไปนะ!",
      "คุณขัดแย้งตัวเอง!",
      "ฉันจำได้ว่าคำสัญญาไม่ใช่แบบนี้!",
    ],
  }

  const responses = templates[triggerType] || templates.contradiction
  return responses[Math.floor(Math.random() * responses.length)]
}

// ----------------------------------------------------------------------------
// Debug Utilities
// ----------------------------------------------------------------------------

/**
 * Returns all tracking data for debugging purposes.
 * Only works in development mode.
 */
export function getDebugTrackingData(state: GameState) {
  if (import.meta.env.DEV) {
    return {
      topics: state.topicHistory,
      pressures: state.pressureStates,
      clashes: state.clashHistory,
      secrets: state.secretReveals,
    }
  }
  return null
}
