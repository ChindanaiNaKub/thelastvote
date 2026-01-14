// ============================================================================
// Prab Condition Tracking - Mastermind Reveal Detection
// ============================================================================
// Tracks special conditions that unlock different Prab reveal paths.
// Detects if player suspects the game is constructed/test.
// ============================================================================

import type { GameState } from '../types/game'

/**
 * Suspicion keywords that indicate player is questioning the game's reality.
 */
const SUSPICION_KEYWORDS = {
  // Questioning if this is a test/simulation
  questionedReality: [
    'จริงหรือ', // real or not
    'เป็นการทดสอบ', // is it a test
    'สมมติ', // hypothetical/simulated
    'เกม', // game
    'บทหน้าที่', // role
    'กำหนดไว้', // predetermined
    'สคริปต์', // script
    'การแสดง', // acting/performance
  ],

  // Asking about who created/controls the game
  askedAboutGameMaster: [
    'ใครสร้าง', // who created
    'ใครคุม', // who controls
    'ใครอยู่เบื้องหลัง', // who is behind
    'ผู้สร้าง', // the creator
    'game master',
    'gamemaster',
    'เจ้าของ', // owner
    'คนคิด', // the thinker
  ],

  // Pointing out inconsistencies or AI behavior
  showedSkepticism: [
    'โกหก', // lying
    'ขัดแย้ง', // contradictory
    'ไม่สอดคล้อง', // inconsistent
    'AI',
    'หุ่น', // bot/doll
    'โปรแกรม', // program
    'ตอบสูตร', // formulaic answer
    'เตรียมมา', // prepared
  ],
}

/**
 * Analyzes a player question for Prab reveal conditions.
 * Returns which conditions were triggered.
 */
export function analyzeQuestionForSuspicion(question: string): {
  askedAboutGameMaster: boolean
  questionedReality: boolean
  showedSkepticism: boolean
  matchedKeywords: string[]
} {
  const lowerQuestion = question.toLowerCase()
  const matchedKeywords: string[] = []

  let askedAboutGameMaster = false
  let questionedReality = false
  let showedSkepticism = false

  // Check for reality-questioning keywords
  for (const keyword of SUSPICION_KEYWORDS.questionedReality) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      questionedReality = true
      matchedKeywords.push(keyword)
    }
  }

  // Check for game-master questioning keywords
  for (const keyword of SUSPICION_KEYWORDS.askedAboutGameMaster) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      askedAboutGameMaster = true
      matchedKeywords.push(keyword)
    }
  }

  // Check for skepticism keywords
  for (const keyword of SUSPICION_KEYWORDS.showedSkepticism) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      showedSkepticism = true
      matchedKeywords.push(keyword)
    }
  }

  return {
    askedAboutGameMaster,
    questionedReality,
    showedSkepticism,
    matchedKeywords,
  }
}

/**
 * Updates Prab reveal conditions based on conversation history.
 * Should be called after each AI response to detect if player suspected anything.
 */
export function updatePrabConditions(state: GameState): {
  askedAboutGameMaster: boolean
  questionedReality: boolean
  showedSkepticism: boolean
  newlyDetected: boolean
} {
  const currentConditions = state.playerStats.prabRevealConditions

  // Analyze all player questions
  for (const entry of state.conversationHistory) {
    if (entry.type === 'question') {
      const analysis = analyzeQuestionForSuspicion(entry.content)

      // If we found new suspicion, update conditions
      if (analysis.askedAboutGameMaster && !currentConditions.askedAboutGameMaster) {
        currentConditions.askedAboutGameMaster = true
        return {
          askedAboutGameMaster: true,
          questionedReality: currentConditions.questionedReality,
          showedSkepticism: currentConditions.showedSkepticism,
          newlyDetected: true,
        }
      }

      if (analysis.questionedReality && !currentConditions.questionedReality) {
        currentConditions.questionedReality = true
        return {
          askedAboutGameMaster: currentConditions.askedAboutGameMaster,
          questionedReality: true,
          showedSkepticism: currentConditions.showedSkepticism,
          newlyDetected: true,
        }
      }

      if (analysis.showedSkepticism && !currentConditions.showedSkepticism) {
        currentConditions.showedSkepticism = true
        return {
          askedAboutGameMaster: currentConditions.askedAboutGameMaster,
          questionedReality: currentConditions.questionedReality,
          showedSkepticism: true,
          newlyDetected: true,
        }
      }
    }
  }

  return {
    askedAboutGameMaster: currentConditions.askedAboutGameMaster,
    questionedReality: currentConditions.questionedReality,
    showedSkepticism: currentConditions.showedSkepticism,
    newlyDetected: false,
  }
}

/**
 * Calculates how much the player "figured it out."
 * Returns a score 0-100 indicating their awareness of the meta nature.
 */
export function calculateMetaAwareness(state: GameState): {
  score: number // 0-100
  level: 'Clueless' | 'Suspicious' | 'Aware' | 'Enlightened'
  reasons: string[]
} {
  const { prabRevealConditions } = state.playerStats
  const reasons: string[] = []
  let score = 0

  if (prabRevealConditions.askedAboutGameMaster) {
    score += 40
    reasons.push('ถามถึงผู้อยู่เบื้องหลัง')
  }

  if (prabRevealConditions.questionedReality) {
    score += 35
    reasons.push('ตั้งคำถามถึงความจริง')
  }

  if (prabRevealConditions.showedSkepticism) {
    score += 25
    reasons.push('แสดงความสงสัยต่อความขัดแย้ง')
  }

  // Bonus points for multiple questions showing suspicion
  const suspiciousQuestions = state.conversationHistory.filter(entry => {
    if (entry.type !== 'question') return false
    const analysis = analyzeQuestionForSuspicion(entry.content)
    return analysis.askedAboutGameMaster || analysis.questionedReality || analysis.showedSkepticism
  }).length

  if (suspiciousQuestions > 1) {
    score += Math.min(20, (suspiciousQuestions - 1) * 10)
    reasons.push(`ถามคำถามที่สงสัย ${suspiciousQuestions} ครั้ง`)
  }

  score = Math.min(100, score)

  // Determine awareness level
  let level: 'Clueless' | 'Suspicious' | 'Aware' | 'Enlightened' = 'Clueless'
  if (score >= 80) level = 'Enlightened'
  else if (score >= 50) level = 'Aware'
  else if (score >= 20) level = 'Suspicious'

  return { score, level, reasons }
}

/**
 * Generates a custom reveal message based on player's meta awareness.
 */
export function getCustomRevealMessage(state: GameState): {
  message: string
  subtext?: string
} {
  const awareness = calculateMetaAwareness(state)

  switch (awareness.level) {
    case 'Enlightened':
      return {
        message: 'คุณมองออก... ตั้งแต่แรก',
        subtext: 'ไม่มีอะไรที่ซ่อนอยู่จากสายตาของคุณ',
      }

    case 'Aware':
      return {
        message: 'คุณรู้สึกบางอย่าง... แต่ก็เล่นต่อ',
        subtext: 'นั่นคือสิ่งที่น่าสนใจ - คุณสงสัย แต่ก็ยังมีส่วนร่วม',
      }

    case 'Suspicious':
      return {
        message: 'คุณสังเกตเห็นรอยร้าว... เล็กน้อย',
        subtext: 'ความสงสัยของคุณเริ่มก่อตัวขึ้น',
      }

    case 'Clueless':
    default:
      return {
        message: 'คุณเชื่อ... ทุกอย่างที่เห็น',
        subtext: 'และนั่นทำให้การทดสอบนี้สมบูรณ์แบบ',
      }
  }
}
