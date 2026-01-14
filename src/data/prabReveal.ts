// ============================================================================
// Prab Mastermind Reveal Data
// ============================================================================
// Contains content for the end-game plot twist revealing Prab as the creator.
// This creates a meta moment where the game breaks the fourth wall.
// ============================================================================

import type { PlayerStats } from '../types/game'

/**
 * Personalized message from Prab based on player behavior.
 */
export interface PrabMessage {
  title: string
  message: string
  archetype: string
}

/**
 * Gets Prab's personalized message based on player stats.
 */
export function getPrabMessage(stats: PlayerStats): PrabMessage {
  const { ruthlessScore, eliminatedAllies, eliminatedRivals, ignoredCandidates, averageDecisionTime } = stats

  // Ruthless player - eliminated allies quickly
  if (ruthlessScore >= 60) {
    return {
      title: 'ผู้ตัดสินใจอย่างกล้าหาญ',
      message: `คุณเลือกแบบรุนแรง... กล้าตัดสินใจของคุณน่าประทับใจ ไม่กลัวที่จะสูญเสียพันธมิตรเพื่อบรรลุเป้าหมาย`,
      archetype: 'รุนแรง',
    }
  }

  // Conservative player - saved allies
  if (eliminatedAllies.length === 0 && eliminatedRivals.length > 0) {
    return {
      title: 'ผู้ภักดีต่อความสัมพันธ์',
      message: `คุณใส่ใจความรู้สึกคนอื่น... เหมือนเดิมทุกปี พยายามรักษาพันธมิตรและสร้างความแข็งแกร่งร่วมกัน`,
      archetype: 'อนุรักษ์',
    }
  }

  // Analytical player - asked everyone equally
  if (ignoredCandidates.length === 0 && averageDecisionTime > 10) {
    return {
      title: 'นักคิดเชิงกลยุทธ์',
      message: `คุณพยายามเก็บข้อมูลให้ครบ... มีสติทางเลือกตั้ง ใช้เวลาวิเคราะห์ทุกตัวเลือกอย่างละเอียด`,
      archetype: 'วิเคราะห์',
    }
  }

  // Impulsive player - quick decisions
  if (averageDecisionTime < 5 && stats.totalQuestionsAsked > 0) {
    return {
      title: 'ผู้ตัดสินใจด้วยไหวพริบ',
      message: `คุณตัดสินใจเร็วมาก... เชื่อมั่นในสัญชาตญาณของตัวเอง บางครั้งความรวดเร็วก็เป็นจังหวะสำคัญ`,
      archetype: 'ไหวพริบ',
    }
  }

  // Skeptical player - questioned the game
  if (stats.prabRevealConditions.questionedReality || stats.prabRevealConditions.askedAboutGameMaster) {
    return {
      title: 'ผู้สังเกตแห่งความจริง',
      message: `คุณมองออก... คุณสงสัยตั้งแต่แรกใช่ไหม นั่นคือสิ่งที่น่าสนใจ - แม้แต่ในเกมสมมติ คุณก็ยังมองเห็นสิ่งที่ซ่อนอยู่`,
      archetype: 'สงสัย',
    }
  }

  // Default message
  return {
    title: 'ผู้เล่นแห่งการเดินทาง',
    message: `คุณผ่านการทดสอบของฉัน ทางเลือกของคุณแสดงให้เห็นว่าคุณเป็นใคร... และนั่นก็เพียงพอแล้ว`,
    archetype: 'สมดุล',
  }
}

/**
 * Main reveal text displayed to player.
 */
export function getMainRevealText(stats: PlayerStats): string {
  const suspected = stats.prabRevealConditions.questionedReality ||
                   stats.prabRevealConditions.askedAboutGameMaster ||
                   stats.prabRevealConditions.showedSkepticism

  let revealText = `ทุกอย่างที่คุณเห็น... ถูกออกแบบมาอย่างดี

แต่ละคำตอบ แต่ละการตัดสินใจ
ทุกความลับที่ถูกเปิดเผย...

ถูกคำนวณมาเพื่อทดสอบคุณ

ผู้ที่อยู่เบื่องหลังทั้งหมดนี้...

คือ ปราบ ✨`

  if (suspected) {
    revealText += `

และคุณ... คุณสงสัยตั้งแต่แรกใช่ไหม

ฉันรู้... ตอนที่คุณถามคำถามที่ลึกซึ้งเหล่านั้น
คุณมองผ่านหน้ากากและเห็นสิ่งที่อยู่เบื้องหลัง`
  }

  revealText += `

"สร้างเกมนี้ขึ้นมาเพื่อดูว่า
เพื่อนๆ จะเลือกกันอย่างไร...
เมื่อเผชิญกับความลับ และแรงกดดัน"

คุณผ่านการทดสอบแล้วไหม? 🎭`

  return revealText
}

/**
 * Prab signature variations.
 */
export const PRAB_SIGNATURES = [
  '— ปราบ, ผู้สร้าง • The Architect',
  '— ปราบ ✨',
  '— Your Friend, Prab',
  '— ปราบ, Game Master',
]

/**
 * Get a random Prab signature.
 */
export function getRandomPrabSignature(): string {
  return PRAB_SIGNATURES[Math.floor(Math.random() * PRAB_SIGNATURES.length)]
}

/**
 * Suspicion detection - returns true if player showed skepticism about the game.
 */
export function detectPlayerSuspicion(stats: PlayerStats): {
  suspected: boolean
  clues: string[]
} {
  const clues: string[] = []

  if (stats.prabRevealConditions.askedAboutGameMaster) {
    clues.push('ถามถึงผู้อยู่เบื้องหลังเกม')
  }

  if (stats.prabRevealConditions.questionedReality) {
    clues.push('ตั้งคำถามถึงความจริงของสถานการณ์')
  }

  if (stats.prabRevealConditions.showedSkepticism) {
    clues.push('แสดงความสงสัยต่อความขัดแย้ง')
  }

  return {
    suspected: clues.length > 0,
    clues,
  }
}
