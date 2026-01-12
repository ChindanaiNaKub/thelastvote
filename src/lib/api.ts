// ============================================================================
// API Client for The Last Vote
// ============================================================================
// Three-tier mode system: FALLBACK → MOCK → API
// Game always works, never breaks, graceful degradation guaranteed.
// ============================================================================

import type { Candidate, ConversationEntry, CandidateArchetype } from '../types/game'
import { candidates } from '../data/candidates'
import { buildCandidatePrompt, type BuiltPrompt } from '../prompts/candidate-prompts'

// ----------------------------------------------------------------------------

/**
 * Request parameters for generating a candidate response
 */
export interface CandidateResponseRequest {
  /** ID of candidate responding (e.g., 'candidate_1') */
  candidateId: string
  /** Player's question in Thai */
  question: string
  /** Previous conversation for context */
  conversationHistory: ConversationEntry[]
  /** Force specific mode (optional, default: 'auto' detects) */
  mode?: 'auto' | 'fallback' | 'mock' | 'api'
  /** Configuration overrides (optional) */
  config?: Partial<ApiConfig>
}

/**
 * Response from candidate
 */
export interface CandidateResponse {
  /** The candidate's response text in Thai */
  content: string
  /** Which mode was actually used */
  modeUsed: ApiMode
  /** Response metadata */
  metadata: {
    candidateId: string
    candidateName: string
    timestamp: number
    responseTime: number // milliseconds
    retryCount?: number
    fellBackFrom?: ApiMode // if degradation occurred
  }
}

/**
 * API mode type
 */
export type ApiMode = 'fallback' | 'mock' | 'api'

/**
 * API configuration
 */
interface ApiConfig {
  /** Backend API URL (for API mode) */
  apiUrl: string
  /** Request timeout in milliseconds (default: 10000) */
  timeout: number
  /** Max retry attempts (default: 3) */
  maxRetries: number
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay: number
  /** Exponential backoff multiplier (default: 2) */
  retryMultiplier: number
  /** Whether to enable mock delays in fallback mode (default: false) */
  enableMockDelays: boolean
}

// ----------------------------------------------------------------------------

/**
 * Thai fallback responses by archetype
 * These are used when backend is unavailable or in FALLBACK/MOCK modes
 */
const FALLBACK_RESPONSES: Record<CandidateArchetype, string[]> = {
  charismatic_reformer: [
    "ผมเชื่อว่าสิ่งที่เมืองเราต้องการคือการเปลี่ยนแปลงที่กล้าหาญ เราไม่สามารถอยู่กับเก่าๆ ที่ล้มเหลวอีกต่อไป",
    "ฟังนะ... ปัญหาพวกนี้ไม่ได้เกิดขึ้นรุ่นเดียว แต่ผมสัญญาว่าในฐานะผู้นำ ผมจะทำให้สิ่งที่ทุกคนคาดไม่ถึง",
    "คำถามที่ดี แต่มาดูภาพรวมกันก่อน... สิ่งที่เราต้องการคือวิสัยทัศน์ ไม่ใช่แค่แก้ปัญหาชั่วคราว",
  ],
  pragmatic_technocrat: [
    "ข้อมูลแสดงให้เห็นว่าแนวทางที่มีประสิทธิภาพที่สุดคือ X ซึ่งจะเพิ่มผลลัพธ์โดยรวม 23% ภายใน 6 เดือน",
    "ให้ฉันวิเคราะห์ตัวเลขให้... สถิติบอกว่าแนวทางอื่นมีความเสี่ยงมากกว่า 84% เราต้องเลือกสิ่งที่เหมาะสมที่สุด",
    "มันซับซ้อนกว่าที่คิด แต่ถ้าดูจากข้อมูลแล้ว ทางเลือกที่ชัดเจนที่สุดคือ...",
  ],
  healer_protector: [
    "ห่วงใยที่ถามนะ แต่อย่ากังวลไป... ฉันจะดูแลให้ทุกคนปลอดภัย ไม่มีใครต้องกลัวอะไรอีกแล้ว",
    "ลูกๆ ทุกคนสำคัญกับฉัน ฉันสัญญาว่าจะทำทุกอย่างเพื่อปกป้องพวกคุณ แม้ว่าบางท่าจะต้องเสียสละบางอย่าง",
    "ฉันเข้าใจความกังวล... แต่ไว้ใจฉันนะ ฉันจะไม่ปล่อยให้ใครเดือดร้อย",
  ],
  cynical_realist: [
    "มาซื่อสุจิตกันเถอะ... ไม่มีทางออกที่ดีนะ ทั้งหมดแย่ แต่ถ้าจะเลือก เลือกที่แย่น้อยสุดละกัน",
    "เธอคิดว่ามีคำตอบที่สมบูรณ์? ไม่มีหรอก ทั้งหมดคือการเลือกสิ่งที่จะทำลายเราน้อยสุด",
    "เคยได้ยินมั้ย? 'ความหวังเป็นอันตราย' ผมเชื่อสิ่งนั้น... แต่ก็ยังมีทางที่จะไปต่อ",
  ],
  radical_outsider: [
    "พวกเขาโกหกกันหมด! ระบบทั้งระบบเน่าทั้งเป็น เราต้องเผามันทิ้งแล้วเริ่มใหม่!",
    "ตื่นตามาสิ! พวกเขาขโมยกันและเราก็นั่งมองอยู่ พอแล้วกันเถอะ!",
    "ไม่มีทางเลือกปานกลาง หรือเราเปลี่ยนแปลงทั้งหมด หรือเราตาย",
  ]
}

// ----------------------------------------------------------------------------

/**
 * Generate a candidate response to a player's question
 *
 * This is the main entry point for the API client. It handles:
 * - Mode detection (fallback/mock/api)
 * - Graceful degradation on errors
 * - Retry logic with exponential backoff
 * - Guaranteed response (never returns error)
 *
 * @param request - Question request parameters
 * @returns Promise with candidate response
 *
 * @example
 * const response = await generateCandidateResponse({
 *   candidateId: 'candidate_1',
 *   question: 'คุณจะแก้ปัญหาเศรษฐกิจอย่างไร',
 *   conversationHistory: [],
 *   mode: 'auto'
 * })
 */
export async function generateCandidateResponse(
  request: CandidateResponseRequest
): Promise<CandidateResponse> {
  const startTime = Date.now()
  const candidate = candidates.find(c => c.id === request.candidateId)

  if (!candidate) {
    throw new Error(`Candidate not found: ${request.candidateId}`)
  }

  // Detect mode
  const mode = detectApiMode(request.mode || 'auto')

  try {
    const response = await executeInMode(mode, request, candidate)
    return response
  } catch (error) {
    console.warn(`[API] ${mode} mode failed:`, error)

    // Attempt fallback
    const fallbackMode = getNextMode(mode)
    if (fallbackMode) {
      console.log(`[API] Falling back from ${mode} to ${fallbackMode}`)
      try {
        const fallbackResponse = await executeInMode(fallbackMode, request, candidate)
        return {
          ...fallbackResponse,
          metadata: {
            ...fallbackResponse.metadata,
            fellBackFrom: mode,
          }
        }
      } catch (fallbackError) {
        console.error(`[API] Fallback to ${fallbackMode} also failed:`, fallbackError)
      }
    }

    // Last resort: guaranteed fallback response
    return createGuaranteedFallbackResponse(candidate, request.question, startTime)
  }
}

// ----------------------------------------------------------------------------

/**
 * Detect which API mode to use based on environment and request
 */
function detectApiMode(requestedMode: string): ApiMode {
  // If mode explicitly requested, use it
  if (requestedMode !== 'auto') {
    return requestedMode as ApiMode
  }

  // Auto-detect based on environment variables
  const apiUrl = import.meta.env.VITE_API_URL
  const mockMode = import.meta.env.VITE_API_MODE

  if (apiUrl) {
    return 'api'
  }

  if (mockMode === 'mock') {
    return 'mock'
  }

  return 'fallback' // Default
}

/**
 * Execute request in specific mode
 */
async function executeInMode(
  mode: ApiMode,
  request: CandidateResponseRequest,
  candidate: Candidate
): Promise<CandidateResponse> {
  switch (mode) {
    case 'fallback':
      return generateFallbackResponse(candidate, request.question, Date.now())
    case 'mock':
      return generateMockResponse(candidate, request.question, Date.now())
    case 'api':
      return generateApiResponse(candidate, request)
  }
}

/**
 * FALLBACK mode: Instant Thai response (no backend required)
 */
function generateFallbackResponse(
  candidate: Candidate,
  question: string,
  timestamp: number
): CandidateResponse {
  const responses = FALLBACK_RESPONSES[candidate.archetype]

  // Use hash-based selection for consistency
  const index = Math.abs(hashString(question)) % responses.length
  const content = responses[index]

  return {
    content,
    modeUsed: 'fallback',
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
      timestamp,
      responseTime: 0,
    }
  }
}

/**
 * MOCK mode: Simulated delay + Thai response (for testing)
 */
async function generateMockResponse(
  candidate: Candidate,
  question: string,
  timestamp: number
): Promise<CandidateResponse> {
  // Simulate network delay (1-3 seconds)
  const delay = 1000 + Math.random() * 2000
  await sleep(delay)

  const responses = FALLBACK_RESPONSES[candidate.archetype]
  const index = Math.abs(hashString(question)) % responses.length
  const content = responses[index]

  return {
    content,
    modeUsed: 'mock',
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
      timestamp,
      responseTime: delay,
    }
  }
}

/**
 * API mode: Real backend call with AI-generated response
 */
async function generateApiResponse(
  candidate: Candidate,
  request: CandidateResponseRequest
): Promise<CandidateResponse> {
  const startTime = Date.now()
  const apiUrl = import.meta.env.VITE_API_URL

  // Build prompt using existing function from candidate-prompts.ts
  const prompt = buildCandidatePrompt(candidate, {
    question: request.question,
    conversationHistory: request.conversationHistory,
    includeConversationHistory: true,
    maxHistoryEntries: 10,
  })

  // Call backend with retry logic
  const responseText = await fetchWithRetry(
    () => callBackendApi(apiUrl, prompt),
    { timeout: 10000, maxRetries: 3 }
  )

  return {
    content: responseText,
    modeUsed: 'api',
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
      timestamp: startTime,
      responseTime: Date.now() - startTime,
    }
  }
}

/**
 * Make actual HTTP call to backend API
 */
async function callBackendApi(
  apiUrl: string,
  prompt: BuiltPrompt
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.content
}

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  config: { timeout: number; maxRetries: number }
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fetcher()
    } catch (error) {
      lastError = error as Error

      // Don't retry after last attempt
      if (attempt < config.maxRetries) {
        // Exponential backoff: 0ms, 1000ms, 2000ms, 4000ms...
        const delay = 1000 * Math.pow(2, attempt)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

// ----------------------------------------------------------------------------

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Helper: Hash string for consistent response selection
 * Ensures same question always gets same response
 */
function hashString(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

/**
 * Helper: Get next fallback mode in degradation chain
 */
function getNextMode(current: ApiMode): ApiMode | null {
  const fallbackChain: Record<ApiMode, ApiMode | null> = {
    api: 'mock',
    mock: 'fallback',
    fallback: null,
  }
  return fallbackChain[current]
}

/**
 * Last resort: Guaranteed response when everything fails
 * This should never happen, but game must continue
 */
function createGuaranteedFallbackResponse(
  candidate: Candidate,
  _question: string,
  timestamp: number
): CandidateResponse {
  return {
    content: `ฉันได้ยินคำถามของคุณแล้ว และฉันเคารพความกังวลของคุณ`,
    modeUsed: 'fallback',
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
      timestamp,
      responseTime: 0,
    }
  }
}
