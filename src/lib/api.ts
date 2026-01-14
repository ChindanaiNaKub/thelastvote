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
// Session ID Management
// ----------------------------------------------------------------------------

/**
 * Generate or retrieve a persistent session ID for rate limiting
 * Stored in localStorage to persist across page reloads
 */
let sessionId: string | null = null

function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('tlv_session_id')
    if (!sessionId) {
      // Generate a random UUID for session tracking
      sessionId = crypto.randomUUID()
      localStorage.setItem('tlv_session_id', sessionId)
    }
  }
  return sessionId
}

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
 * API error types for Phase 4: Priority 4.5.2 (Enhanced Error Handling)
 * Specific error types allow for better user feedback and graceful degradation
 */
export enum ApiErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * User-friendly Thai error messages for Phase 4: Priority 4.5.2
 * Provides clear feedback to players when errors occur
 */
const THAI_ERROR_MESSAGES: Record<ApiErrorType, string> = {
  RATE_LIMIT: 'ขออภัย คุณถามคำถามมากเกินไป กรุณารอสักครู่',
  TIMEOUT: 'การเชื่อมต่อใช้เวลานาน กำลังลองใหม่...',
  NETWORK: 'ไม่สามารถเชื่อมต่อได้ ใช้คำตอบสำรอง',
  INVALID_RESPONSE: 'เกิดข้อผิดพลาด ใช้คำตอบสำรอง',
  UNKNOWN: 'เกิดข้อผิดพลาดบางอย่าง ใช้คำตอบสำรอง'
}

/**
 * Detects error type from Error object
 * Helps determine appropriate user feedback
 */
function detectErrorType(error: unknown): ApiErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Rate limit errors
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return ApiErrorType.RATE_LIMIT
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
      return ApiErrorType.TIMEOUT
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ApiErrorType.NETWORK
    }

    // Invalid response errors
    if (message.includes('api error') || message.includes('invalid') || message.includes('parse')) {
      return ApiErrorType.INVALID_RESPONSE
    }
  }

  return ApiErrorType.UNKNOWN
}

/**
 * Gets user-friendly Thai error message
 * Used in console warnings for transparency
 */
function getThaiErrorMessage(errorType: ApiErrorType): string {
  return THAI_ERROR_MESSAGES[errorType]
}

// ----------------------------------------------------------------------------

/**
 * Thai fallback responses by archetype
 * These are used when backend is unavailable or in FALLBACK/MOCK modes
 * Expanded to 100+ responses for variety when API limit is reached
 */
const FALLBACK_RESPONSES: Record<CandidateArchetype, string[]> = {
  charismatic_reformer: [
    "ผมเชื่อว่าสิ่งที่เมืองเราต้องการคือการเปลี่ยนแปลงที่กล้าหาญ เราไม่สามารถอยู่กับเก่าๆ ที่ล้มเหลวอีกต่อไป",
    "ฟังนะ... ปัญหาพวกนี้ไม่ได้เกิดขึ้นรุ่นเดียว แต่ผมสัญญาว่าในฐานะผู้นำ ผมจะทำให้สิ่งที่ทุกคนคาดไม่ถึง",
    "คำถามที่ดี แต่มาดูภาพรวมกันก่อน... สิ่งที่เราต้องการคือวิสัยทัศน์ ไม่ใช่แค่แก้ปัญหาชั่วคราว",
    "ผมมีความฝันที่จะเห็นเมืองนี้เติบโต และผมรู้ว่าคุณก็ฝันแบบเดียวกัน มาร่วมกันสร้างอนาคตกันเถอะ",
    "มองข้ามรายละเอียดเล็กๆ นะ สิ่งสำคัญคือเรากำลังจะไปที่ไหน และผมจะพาคุณไปให้ถึง",
    "คนอื่นมองแค่อดีต แต่ผมมองไปที่อนาคตที่เป็นไปได้ และมันสวยงามกว่าที่คุณคิด",
    "ผมไม่ใช่ผู้นำแบบเก่า ผมมาเพื่อทำลายกฎที่ไม่เหมาะสมและสร้างสิ่งใหม่ที่ดีกว่า",
    "ความเปลี่ยนแปลงมันน่ากลัว แต่การยืนอยู่กับที่ที่ล้มเหลวนั้นน่ากลัวกว่า ไว้ใจผมนะ",
    "ผมจะพิสูจน์ให้เห็นว่าความเชื่อของคุณไม่ผิดหวัง แค่ให้ผมได้โอกาส",
    "เมื่อผมพูดถึงการเปลี่ยนแปลง ผมหมายถึงการกระทำ ไม่ใช่แค่คำพูด",
    "ดูสิ่งที่เราทำได้เมื่อเรามีความกล้าหายใจที่จะลองทำสิ่งใหม่",
    "ผมไม่ได้มาพร้อมกับคำตอบทั้งหมด แต่ผมมาพร้อมกับความกล้าที่จะหาคำตอบเหล่านั้น",
    "เหนือสิ่งอื่นใด ผมอยากให้คุณเชื่อในตัวเอง เพราะผมเชื่อในความเป็นไปได้ของคุณ",
    "ประวัติศาสตร์จะจดจำเราว่าเป็นคนที่กล้าที่จะเปลี่ยนแปลง หรือคนที่ยอมแพ้",
    "ทุกวันนี้เราเผชิญกับโอกาสครั้งใหญ่ มาสร้างมันไปด้วยกัน",
    "ผมรู้ว่าคุณกังวล แต่จงไว้วางใจ... ผมมีแผนที่จะนำพาเราผ่านช่วงเวลานี้",
    "สิ่งที่ทำให้เราต่างจากคนอื่นคือเราไม่กลัวที่จะทำสิ่งที่ถูกต้องแม้มันจะยาก",
    "ผมอาจไม่ใช่คนที่สมบูรณ์แบบ แต่ผมสัญญาว่าจะทำด้วยหัวใจที่สุด",
    "เชื่อผมสักครั้ง แล้วคุณจะเห็นว่าอนาคตสดใสกว่าที่เคยเป็น",
    "คำถามเหล่านี้สำคัญ แต่คำตอบที่สำคัญที่สุดคือการกระทำของเรา",
    "ผมมองไกลกว่าคนอื่น และนั่นคือเหตุผลที่ผมควรเป็นผู้นำ",
    "เรากำลังจะสร้างประวัติศาสตร์ด้วยกัน ไม่ใช่แค่ดูมันผ่านไป",
  ],
  pragmatic_technocrat: [
    "ข้อมูลแสดงให้เห็นว่าแนวทางที่มีประสิทธิภาพที่สุดคือ X ซึ่งจะเพิ่มผลลัพธ์โดยรวม 23% ภายใน 6 เดือน",
    "ให้ฉันวิเคราะห์ตัวเลขให้... สถิติบอกว่าแนวทางอื่นมีความเสี่ยงมากกว่า 84% เราต้องเลือกสิ่งที่เหมาะสมที่สุด",
    "มันซับซ้อนกว่าที่คิด แต่ถ้าดูจากข้อมูลแล้ว ทางเลือกที่ชัดเจนที่สุดคือ...",
    "ตามแบบจำลองของฉัน แนวทางนี้จะลดความเสี่ยงได้ 67% แต่ต้องแลกกับการลดทอนบางอย่าง",
    "ประสิทธิภาพคือกุญแจสำคัญ การเลือกทางเลือกที่มีผลลัพธ์สูงสุดต่อหน่วยทรัพยากร",
    "ฉันไม่ได้พูดเรื่องความรู้สึก แต่พูดถึงสิ่งที่วัดได้และพิสูจน์ได้",
    "ข้อมูลชี้ว่าแนวทางปัจจุบันใช้ทรัพยากรอย่างไม่มีประสิทธิภาพ 40% สามารถปรับปรุงได้",
    "ตัวเลขไม่โกหก การตัดสินใจตามอารมณ์จะนำไปสู่ผลลัพธ์ที่แย่กว่า 73%",
    "ฉันมีแผนที่คำนวณแล้ว เริ่มต้นด้วยการจัดลำดับความสำคัญตามผลกระทบ",
    "ความเสี่ยงสามารถจัดการได้ถ้าเรามีข้อมูลเพียงพอ และฉันมีข้อมูลอยู่ในมือ",
    "ทางเลือกที่ดีที่สุดไม่ใช่ทางเลือกที่ดูเรียบร้อย แต่เป็นทางเลือกที่ให้ผลลัพธ์ที่ดีที่สุด",
    "อย่าให้อารมณ์มาบังคับการตัดสินใจที่สำคัญ ใช้ข้อมูลและตรรกะ",
    "ฉันสามารถแสดงให้เห็นว่าแนวทางของฉันมีประสิทธิภาพเหนือกว่าด้วยกราฟและตัวเลข",
    "การเลือกทางเลือกที่ไม่มีข้อมูลสนับสนุนคือการพนัน และฉันไม่ได้เป็นนักพนัน",
    "อัตราผลตอบแทนต่อการลงทุนที่ฉันเสนอจะสูงกว่า 2.3 เท่าในระยะยาว",
    "มีสิ่งที่ต้องแลกเปลี่ยนเสมอ แต่เราต้องคำนวณให้ดีว่าอะไรคุ้มค่า",
    "ฉันได้ทำการวิเคราะห์ทุกแนวทางแล้ว ตัวเลือกของฉันมีความน่าจะเป็นที่จะสำเร็จสูงสุด",
    "ปัญหาคือความซับซ้อน แต่การแก้ปัญหาต้องอาศัยวิธีการที่ชัดเจนและเป็นระบบ",
    "ไม่มีทางเลือกที่สมบูรณ์ มีแต่ทางเลือกที่เหมาะสมที่สุดตามข้อมูลที่มี",
    "การลงทุนในปัจจุบันจะให้ผลตอบแทนในอนาคตถ้าเราวางแผนอย่างถูกต้อง",
    "ฉันไม่แคร์ว่าใครจะชอบหรือเกลียด แคร์ว่าอะไรใช้ได้ผลจริงตามตัวเลข",
  ],
  healer_protector: [
    "ห่วงใยที่ถามนะ แต่อย่ากังวลไป... ฉันจะดูแลให้ทุกคนปลอดภัย ไม่มีใครต้องกลัวอะไรอีกแล้ว",
    "ลูกๆ ทุกคนสำคัญกับฉัน ฉันสัญญาว่าจะทำทุกอย่างเพื่อปกป้องพวกคุณ แม้ว่าบางท่าจะต้องเสียสละบางอย่าง",
    "ฉันเข้าใจความกังวล... แต่ไว้ใจฉันนะ ฉันจะไม่ปล่อยให้ใครเดือดร้อย",
    "แม่รู้ว่าลูกหวั่นไหว แต่จงมั่นใจว่าแม่จะไม่ปล่อยให้อะไรเจ็บลูก",
    "ความปลอดภัยของคุณคือสิ่งสำคัญที่สุดสำหรับฉัน ฉันจะทำทุกวิถีทางเพื่อรักษามัน",
    "ไม่ต้องกลัวนะ เมื่อคุณอยู่กับฉัน ไม่มีสิ่งใดสามารถทำร้ายคุณได้",
    "ฉันรักทุกคนเหมือนลูกหลานของตัวเอง และแม่ไม่เคยทอดทิ้งลูก",
    "บางครั้งการปกป้องคุณต้องการการตัดสินใจที่ยาก แต่ฉันยอมรับมัน",
    "ฉันรับฟังทุกคำพูดของคุณ และฉันจะดูแลให้ทุกอย่างดีขึ้น",
    "อย่ากังวลกับอนาคต ฉันมีแผนที่จะนำพาทุกคนไปสู่ที่ที่ปลอดภัย",
    "ความเจ็บปวดของคุณคือความเจ็บปวดของฉัน มาเผชิญหน้ามันด้วยกัน",
    "ฉันอาจไม่ใช่คนที่เข้มแข็งที่สุด แต่ฉันจะใช้ความรักเพื่อปกป้องทุกคน",
    "บางที่คุณอาจไม่เข้าใจการตัดสินใจของฉัน แต่รู้ไว้ว่ามันเพื่อดีของคุณ",
    "ไม่มีใครต้องเผชิญความยากลำบากเพียงลำพัง ฉันอยู่ที่นี่เสมอ",
    "ฉันจะสร้างโลกที่ทุกคนรู้สึกอบอุ่นและปลอดภัย แค่ไว้ใจฉัน",
    "ความเข้าใจของฉันไม่ใช่แค่คำพูด แต่เป็นการดูแลที่แท้จริง",
    "บางครั้งคุณต้องเชื่อใจผู้ใหญ่ และฉันสัญญาว่าจะไม่ทำให้คุณผิดหวัง",
    "ฉันจะเป็นกำแพงที่ปกป้องคุณจากพายุทุกประการ",
    "การเสียสละบางอย่างเพื่อความปลอดภัยของคุณคือสิ่งที่ฉันยินดีทำ",
    "อย่ากลัวที่จะพึ่งพาฉัน นั่นคือสิ่งที่ฉันอยู่ที่นี่เพื่อ",
    "ฉันจะดูแลคุณเหมือนที่ฉันดูแลครอบครัวของตัวเอง เพราะคุณคือครอบครัว",
  ],
  cynical_realist: [
    "มาซื่อสุจิตกันเถอะ... ไม่มีทางออกที่ดีนะ ทั้งหมดแย่ แต่ถ้าจะเลือก เลือกที่แย่น้อยสุดละกัน",
    "เธอคิดว่ามีคำตอบที่สมบูรณ์? ไม่มีหรอก ทั้งหมดคือการเลือกสิ่งที่จะทำลายเราน้อยสุด",
    "เคยได้ยินมั้ย? 'ความหวังเป็นอันตราย' ผมเชื่อสิ่งนั้น... แต่ก็ยังมีทางที่จะไปต่อ",
    "ไม่ต้องหาทางออกที่สวยงาม มันไม่มีอยู่จริงหรอก เลือกแค่วิธีที่จะไม่ตาย",
    "ทุกคนที่นี่มีแก้ตัวเตรียมไว้แล้ว แต่ไม่มีใครพูดถึงความจริง",
    "ผมได้เห็นผู้นำมากมายพังทลาย ไม่ต่างกับคนที่นี่หรอก",
    "จงซื่อสัตย์กับตัวเองสิ เรากำลังจมและไม่มีใครมาช่วย",
    "การเลือกตัวเลือกที่แย่น้อยที่สุดก็ยังดีกว่าการหลงกล แต่ทั้งหมดก็แย่อยู่ดี",
    "พวกเขาพูดถึงวิสัยทัศน์ แต่จริงๆ แล้วแค่อยากได้อำนาจ",
    "ผมเหนื่อยแล้วที่จะเชื่อในสิ่งที่ดีงาม มันไม่เคยเป็นจริง",
    "ทุกอย่างล้มเหลวในท้ายที่สุด เพียงแต่เราไม่รู้ว่ามันจะล้มเมื่อไหร่",
    "ไม่ต้องคาดหวังอะไรดีๆ แล้วคุณจะไม่ผิดหวัง",
    "ผมพูดเรื่องนี้มาหลายปีแล้ว แต่ไม่มีใครฟังหรอก",
    "ระบบมันเสียหายไปหมดแล้ว การพยายามซ่อมมันคือการเสียเวลา",
    "คุณอาจคิดว่าผมทำลายความหวัง แต่ผมแค่พูดความจริง",
    "ดูประวัติศาสตร์สิ มันซ้ำรอยกันเสมอ ไม่มีอะไรเปลี่ยนแปลง",
    "ความหวังคืออาวุธที่ผู้มีอำนาจใช้เพื่อควบคุมเรา",
    "ผมอาจดูนิสัยไม่ดี แต่ผมคือคนเดียวที่บอกความจริง",
    "ทุกคนมีแรงจูงใจที่ซ่อนอยู่ และมันไม่เคยดีเท่าที่พูด",
    "จบลงแบบเดิมๆ ทุกที ไม่มีอะไรเปลี่ยนแปลงจริงๆ",
    "ถ้าคุณคิดว่ามีใครมาช่วยคุณได้ คุณคิดผิดแล้ว ช่วยตัวเองเอา",
    "ผมไม่ได้หมายถึงให้ยอมแพ้ แต่ให้รู้ว่าเราต่อสู้อะไรอยู่",
    "ความเป็นจริงอาจทำให้เจ็บ แต่มันยังดีกว่าการถูกหลอก",
  ],
  radical_outsider: [
    "พวกเขาโกหกกันหมด! ระบบทั้งระบบเน่าทั้งเป็น เราต้องเผามันทิ้งแล้วเริ่มใหม่!",
    "ตื่นตามาสิ! พวกเขาขโมยกันและเราก็นั่งมองอยู่ พอแล้วกันเถอะ!",
    "ไม่มีทางเลือกปานกลาง หรือเราเปลี่ยนแปลงทั้งหมด หรือเราตาย",
    "พวกเขาเล่นงานเรามานาน แล้วคุณจะยังเชื่อพวกเขาอีกหรือ?",
    "ระบบนี้สร้างมาเพื่อประโยชน์ของพวกเขา ไม่ใช่เรา! พังมันทิ้งสิ!",
    "คำสัญญาของพวกเขามีค่าเท่ากับศูนย์! มาทำสิ่งจริงกันเถอะ!",
    "พวกเขาเห็นเราเป็นแค่ตัวเลข! เราต้องแสดงให้เห็นว่าเราคืออะไร!",
    "ไม่มีการปฏิรูป! มีแต่การปฏิวัติ! เลือกด้านที่คุณอยู่!",
    "พวกเขาพูดถึงการเปลี่ยนแปลง แต่ทำอะไรไปบ้าง? ไม่มีซะสักอย่าง!",
    "ระบบนี้เป็นศัตรูของประชาชน! และเราคือประชาชน!",
    "เวลาที่จะเรียกร้องนั้นมาถึงแล้ว! ไม่มีการรอคอย!",
    "พวกเขาคิดว่าเราโง่! พวกเขาคิดว่าเราจะทน! ผิดนะ!",
    "ทุกวันนี้เรามีข้อได้เปรียบที่พวกเขาไม่มี... เรามีความจริง!",
    "พวกเขาอาจมีเงินและอำนาจ แต่เรามีจำนวน! เราคืออำนาจ!",
    "หยุดฟังข่าวปลอมของพวกเขา! เปิดตาและดูสิ!",
    "คุณคิดว่าการลงคะแนนจะเปลี่ยนอะไรได้จริงหรือ? มันถูกจัดการไปแล้ว!",
    "เดินตามผม หรือออกไปจากวิถีทางเดิม! ไม่มีทางอื่น!",
    "พวกเขากลัวเรา! นั่นคือเหตุผลที่พวกเขาพยายามหยุดเรา!",
    "การปฏิวัติไม่ได้เกิดขึ้นที่โต๊ะประชุม มันเกิดที่ถนน!",
    "ตอนนี้หรือไม่มีเลย! อนาคตอยู่ในมือเรา!",
    "อย่าปล่อยให้พวกเขาทำให้คุณเชื่อว่าการต่อสู้เป็นเรื่องไร้ความหวัง!",
    "เราไม่ใช่คนร้าย! พวกเขาที่ยัดเยียดความผิดให้เรา!",
    "ดูสิว่าพวกเขากลัวอะไรมากที่สุด... แล้วทำมัน!",
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
    // Phase 4: Enhanced error handling with user-friendly Thai messages
    const errorType = detectErrorType(error)
    const thaiMessage = getThaiErrorMessage(errorType)
    console.warn(`[API] ${mode} mode failed:`, error)
    console.warn(`[API] ${thaiMessage}`)

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
        // Phase 4: Enhanced error handling for fallback errors too
        const fallbackErrorType = detectErrorType(fallbackError)
        const fallbackThaiMessage = getThaiErrorMessage(fallbackErrorType)
        console.error(`[API] Fallback to ${fallbackMode} also failed:`, fallbackError)
        console.error(`[API] ${fallbackThaiMessage}`)
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
  const apiMode = import.meta.env.VITE_API_MODE
  const apiUrl = import.meta.env.VITE_API_URL

  // Check explicit API mode first (for Vite proxy setup)
  if (apiMode === 'api') {
    return 'api'
  }

  // Check for explicit API URL (for production deployment)
  if (apiUrl) {
    return 'api'
  }

  // Check for mock mode
  if (apiMode === 'mock') {
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

  // Determine API URL
  // - If VITE_API_URL is set, use it (production deployment)
  // - Otherwise, use /api/chat (Vite proxy to local backend)
  const apiUrl = import.meta.env.VITE_API_URL || '/api/chat'

  // Build prompt using existing function from candidate-prompts.ts
  const prompt = buildCandidatePrompt(candidate, {
    question: request.question,
    conversationHistory: request.conversationHistory,
    includeConversationHistory: true,
    maxHistoryEntries: 7, // Reduced from 10 to save tokens (saves ~99 tokens/call)
  })

  // Call backend with retry logic
  const responseText = await fetchWithRetry(
    () => callBackendApi(apiUrl, prompt, candidate.id),
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
  prompt: BuiltPrompt,
  candidateId: string
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': getSessionId(), // Add session ID for rate limiting
    },
    body: JSON.stringify({
      question: prompt.userPrompt,
      candidatePrompt: prompt.systemPrompt,
      candidateId: candidateId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.response || data.content
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
