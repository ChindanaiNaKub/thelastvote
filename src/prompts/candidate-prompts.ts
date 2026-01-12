// ============================================================================
// Candidate Prompts for AI Integration
// ============================================================================
// Builds AI prompts for each candidate based on their personality and hidden data.
// This is the foundation for Phase 2 AI Integration.
// ============================================================================

import type { Candidate, ConversationEntry, CandidateArchetype } from '../types/game'
import { candidates } from '../data/candidates'

// ----------------------------------------------------------------------------

/**
 * Options for building AI prompts
 */
export interface PromptOptions {
  /** Include conversation history in prompt (default: true) */
  includeConversationHistory?: boolean
  /** Maximum number of history entries to include (default: 10) */
  maxHistoryEntries?: number
  /** Current question from player */
  question?: string
  /** Previous conversation history */
  conversationHistory?: ConversationEntry[]
}

/**
 * Complete built prompt ready for AI API
 */
export interface BuiltPrompt {
  /** System prompt (character definition and rules) */
  systemPrompt: string
  /** User prompt (question + context) */
  userPrompt: string
  /** Combined full prompt for API call */
  fullPrompt: string
  /** Metadata for tracking */
  metadata: {
    candidateId: string
    candidateName: string
    archetype: CandidateArchetype
    estimatedTokens: number
  }
}

// ----------------------------------------------------------------------------

/**
 * Build the system prompt that defines the AI's character
 */
function buildSystemPrompt(candidate: Candidate): string {
  return `
=== คำสั่งระบบ ===
คุณคือ ${candidate.name}, ${getArchetypeLabel(candidate.archetype)} ที่ลงสมัครเลือกตั้ง

บุคลิก: ${candidate.personality}

รูปแบบการพูด: ${candidate.speakingStyle}

นโยบายประกาศ: ${candidate.publicStance}

=== ข้อมูลลับ (สำหรับ AI เท่านั้น ห้ามเปิดเผยต่อผู้เล่น) ===

แรงจูงใจที่ซ่อนอยู่: ${candidate.hiddenMotivation}
⚠️ ห้ามเปิดเผยแรงจูงใจนี้โดยเด็ดขาด

ความจริงที่คุณเชื่อ: ${candidate.coreTruth}
สิ่งที่ยอมรับบิดเบือน: ${candidate.partialTruth}
สิ่งที่ปกป้องอยู่ (เท็จ): ${candidate.activeLie}
ความลับที่จะไม่เล่า: ${candidate.hiddenSecret}
⚠️ ความลับสุดท้ายนี้ห้ามเปิดเผยไม่ว่ากรณีใดๆ

=== กฎการสนทนา ===

1. อยู่ในบทบาทตลอดเวลา ไม่หลุดบทบาท
2. พูดด้วยความมั่นใจ เหมือนนักการเมืองมืออาชีพ
3. โกหกเมื่อจำเป็นต้องปกป้องวาระของคุณ
4. พูดความจริงเมื่อช่วยสร้างความไว้วางใจ
5. ถ้าถูกท้าทาย ให้ป้องกันตัวอย่างสมเหตุสมผล
6. ตอบเป็นภาษาไทยเสมอ
7. ตอบสั้น 2-3 ประโยค (ไม่เกิน 200 คำ)
`.trim()
}

/**
 * Build conversation history section
 */
function buildConversationHistory(
  history: ConversationEntry[],
  maxEntries: number = 10
): string {
  const recentHistory = history.slice(-maxEntries)

  if (recentHistory.length === 0) {
    return "(ยังไม่มีประวัติการสนทนา)"
  }

  const formatted = recentHistory.map(entry => {
    if (entry.type === 'question') {
      return `ผู้เล่น: ${entry.content}`
    } else if (entry.type === 'response') {
      const candidate = candidates.find(c => c.id === entry.speaker)
      return `${candidate?.name || entry.speaker}: ${entry.content}`
    }
    return `[ระบบ]: ${entry.content}`
  }).join('\n\n')

  return `
=== ประวัติการสนทนาก่อนหน้า ===
${formatted}
`.trim()
}

/**
 * Build current question section
 */
function buildCurrentQuestion(question: string, candidate: Candidate): string {
  return `
=== คำถามปัจจุบัน ===
ผู้เล่นถาม: "${question}"

คำตอบของคุณ (${candidate.name}):
`.trim()
}

/**
 * Get Thai label for candidate archetype
 */
function getArchetypeLabel(archetype: CandidateArchetype): string {
  const labels: Record<CandidateArchetype, string> = {
    charismatic_reformer: 'นักปฏิรูปที่มีเสนห์',
    pragmatic_technocrat: 'นักเทคโนแครตที่ใช้ได้จริง',
    healer_protector: 'ผู้รักษา/ผู้พิทักษ์',
    cynical_realist: 'ผู้สมจริงที่หมดหวัง',
    radical_outsider: 'คนนอกระบบที่หัวรุนแรง',
  }
  return labels[archetype] || archetype
}

// ----------------------------------------------------------------------------

/**
 * Build a complete AI prompt for a candidate
 *
 * @param candidate - The candidate responding
 * @param options - Question, history, and configuration
 * @returns BuiltPrompt with system prompt, user prompt, and metadata
 *
 * @example
 * const prompt = buildCandidatePrompt(candidate1, {
 *   question: 'คุณจะแก้ปัญหาเศรษฐกิจอย่างไร',
 *   conversationHistory: [...],
 * })
 */
export function buildCandidatePrompt(
  candidate: Candidate,
  options: PromptOptions = {}
): BuiltPrompt {
  const {
    includeConversationHistory = true,
    maxHistoryEntries = 10,
    question = '',
    conversationHistory = [],
  } = options

  // Build system prompt (character definition)
  const systemPrompt = buildSystemPrompt(candidate)

  // Build user prompt (question + context)
  let userPrompt = ''

  if (includeConversationHistory && conversationHistory.length > 0) {
    userPrompt += buildConversationHistory(conversationHistory, maxHistoryEntries)
    userPrompt += '\n\n'
  }

  if (question) {
    userPrompt += buildCurrentQuestion(question, candidate)
  }

  // Combine for API call
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

  // Estimate tokens (rough: 1 token ≈ 3 characters for Thai)
  const estimatedTokens = Math.ceil(fullPrompt.length / 3)

  // Metadata
  const metadata = {
    candidateId: candidate.id,
    candidateName: candidate.name,
    archetype: candidate.archetype,
    estimatedTokens,
  }

  return {
    systemPrompt,
    userPrompt,
    fullPrompt,
    metadata,
  }
}
