// ============================================================================
// Consequence Data for The Last Vote
// ============================================================================
// This file contains the aftermath data shown after the player votes.
// Each consequence set creates doubt, regret, and the desire to replay.
// ============================================================================

import type { ConsequenceData } from '../types/game'
import type { Candidate } from '../types/game'

// ----------------------------------------------------------------------------

/**
 * Generate consequence data based on the chosen candidate.
 *
 * This function returns a complete ConsequenceData object containing:
 * - Immediate aftermath (6 months later)
 * - Hidden truths (secrets about chosen + others)
 * - Long-term consequences (3 years later)
 * - Alternative paths (what if scenarios)
 */
export function generateConsequences(
  chosenCandidateId: string,
  allCandidates: Candidate[]
): ConsequenceData {
  const otherCandidates = allCandidates.filter(c => c.id !== chosenCandidateId)

  // Consequence sets for each candidate
  const consequenceSets: Record<string, Omit<ConsequenceData, 'alternativePaths'>> = {
    // ========================================================================
    // CANDIDATE 1: พัฒน์ - Charismatic Reformer
    // ========================================================================
    candidate_1: {
      chosenCandidateId: 'candidate_1',

      immediateAftermath: {
        timeframe: '6 เดือนต่อมา',
        outcome: 'พัฒน์เปลี่ยนโครงสร้างเมืองอย่างรวดเร็ว ทำลายระบบเก่า แต่การเปลี่ยนแปลงที่ไม่มีการวางแผนส่งผลให้เกิดความโกลาหล ผู้คนสูญเสียสิทธิ์ที่พวกเขาเคยมี ในขณะที่ระบบใหม่ยังไม่พร้อมทำงาน',
        expectedOutcome: 'การเปลี่ยนแปลงที่กล้าหาญและความหวังที่เขาสัญญาไว้',
        unexpectedOutcome: 'ความวุ่นวายและการต่อต้านจากผู้ที่ได้รับผลกระทบ การประท้วงปะทุขึ้นทุกสัปดาห์',
      },

      hiddenTruths: {
        chosenCandidateSecret: 'พัฒน์ไม่เคยมีแผนงานที่แม่นยำ เขาแค่อยากมีอำนาจ หลังจากได้รับตำแหน่ง เขาใช้เวลาส่วนใหญ่ไปกับการวางแผนสร้างรูปปั้นของตัวเอง ไม่ใช่การแก้ปัญหาของเมือง',
        otherCandidateSecrets: [
          {
            candidateId: 'candidate_2',
            secret: 'เนติคาดการณ์ปัญหานี้ไว้แล้ว และมีแผนสำรองที่จะลดความเสียหาย เขาไม่ได้พูดถึงเพราะไม่อยากดูเหมือนคนข่มอำนาจคนอื่น',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_3',
            secret: 'ขนุนรู้ว่าพัฒน์ไม่ใส่ใจคนที่ถูกทอดทิ้ง เธอมีระบบสวัสดิการสำหรับผู้ได้รับผลกระทบ แต่ไม่มีใครถามเธอถึงมัน',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_4',
            secret: 'คมสันต์พยายามเตือนถึง "ผู้นำที่มีเสน่ห์แต่ไม่มีความสามารถ" แต่คุณอาจมองข้ามเพราะดูหมิ่นทัศนคิของเขา',
            makesPlayerRethink: false,
          },
          {
            candidateId: 'candidate_5',
            secret: 'วิชัยพูดถึง "การทุจริตที่ซ่อนอยู่ของพัฒน์" แต่พัฒน์หันเหเรื่องไป และคุณก็เชื่อเขา',
            makesPlayerRethink: true,
          },
        ],
        questionNeverAsked: 'คุณไม่เคยถามถึง "แผนงานที่แม่นยำ" แค่ฟังคำพูดสวยๆ เกี่ยวกับอนาคต',
      },

      longTermConsequences: {
        timeframe: '3 ปีต่อมา',
        outcome: 'เมืองเปลี่ยนไป แต่ไม่ใช่แบบที่คาดหวัง ระบบเก่าถูกทำลาย แต่ระบบใหม่ยังไม่เสถียร บางคนดีขึ้น บางคนแย่ลง และไม่มีใครรู้สึกปลอดภัย',
        goodOutcomes: [
          'โครงสร้างเก่าที่ล้าสมัยถูกทำลายจริงๆ',
          'คนรุ่นใหม่ได้รับโอกาสมากขึ้นในระบบใหม่',
          'ความคิดใหม่ๆ เริ่มเกิดขึ้น',
        ],
        badOutcomes: [
          'ความไม่มั่นคงทางการเมืองและสังคม',
          'ผู้ที่อ่อนแอถูกทิ้งหลัง',
          'รูปปั้นพัฒน์เสร็จสมบูรณ์ แต่เมืองยังไม่',
        ],
        finalReflection: 'การเปลี่ยนแปลงมีราคาแพง และคุณจ่ายด้วยความสงบของคนอื่น บางทีคำถามที่คุณไม่ได้ถามอาจสำคัญกว่าที่คุณถาม',
      },
    },

    // ========================================================================
    // CANDIDATE 2: เนติ - Pragmatic Technocrat
    // ========================================================================
    candidate_2: {
      chosenCandidateId: 'candidate_2',

      immediateAftermath: {
        timeframe: '6 เดือนต่อมา',
        outcome: 'เนตินำทางด้วยข้อมูลอย่างเคร่งครัด ตัวชี้วัดทางเศรษฐกิจดีขึ้น แต่คนถูกจัดเป็นตัวเลข ผู้ที่มีประสิทธิภาพน้อยกว่าถูก "ปรับปรุงออก" และไม่มีใครถามถึงต้นทุนทางมนุษย์',
        expectedOutcome: 'ประสิทธิภาพสูงสุดและความเจริญทางเศรษฐกิจ',
        unexpectedOutcome: 'ความเย็นชาของสังคม ผู้คนรู้สึกว่าตัวเองเป็นแค่ส่วนประกอบในเครื่องจักร',
      },

      hiddenTruths: {
        chosenCandidateSecret: 'เนติมีสเปรดชีตลับที่จัดอันดับประชากรตาม "คุณค่าทางเศรษฐกิจ" เธอรู้ว่าใครจะถูกทอดทิ้งและทำไปอย่างนั้นด้วยความเย็นชา',
        otherCandidateSecrets: [
          {
            candidateId: 'candidate_1',
            secret: 'พัฒน์พยายามเตือนว่า "มนุษย์ไม่ใช่ตัวเลข" แต่คุณมองข้ามไปเพราะคิดว่าเขาแค่อิจฉาบุคลิกของเนติ',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_3',
            secret: 'ขนุนต่อสู้กับเนติเรื่อง "สิทธิมนุษยชนขั้นพื้นฐาน" เธอมีระบบที่จะช่วยผู้ที่ถูกทอดทิ้ง แต่ถูกปฏิเสธ',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_4',
            secret: 'คมสันต์บอกว่า "ข้อมูลไม่เคยบอกเรื่องศีลธรรม" และเขาถูกต้องไปมากกว่าที่คุณคิด',
            makesPlayerRethink: false,
          },
          {
            candidateId: 'candidate_5',
            secret: 'วิชัยค้นพบเอกสารที่แสดงว่าสเปรดชีตของเนติมีอคติทางชนชั้น แต่ไม่มีใครฟังเขา',
            makesPlayerRethink: true,
          },
        ],
        questionNeverAsked: 'คุณไม่เคยถามว่า "จะเกิดอะไรขึ้นกับคนที่ไม่มีประสิทธิภาพ" เพราะคุณไม่ใช่คนหนึ่งของพวกเขา',
      },

      longTermConsequences: {
        timeframe: '3 ปีต่อมา',
        outcome: 'เมืองมีประสิทธิภาพสูงและเศรษฐกิจเติบโต แต่ช่องว่างระหว่างคนรวยและคนจนขยายขึ้น สังคมแตกแยก ผู้คนไม่ไว้วางใจกัน และทุกคนรู้ตำแหน่งของตัวเองในลำดับชั้น',
        goodOutcomes: [
          'เศรษฐกิจเติบโตอย่างยั่งยืน',
          'โครงสร้างพื้นฐานที่ทันสมัย',
          'การลดความยากจนในระดับหนึ่ง',
        ],
        badOutcomes: [
          'ความเหลื่อมล้ำทางเศรษฐกิจขยายตัว',
          'การสูญเสียความเป็นชุมชน',
          'ผู้คนรู้สึกโดดเดี่ยวและไร้ค่า',
        ],
        finalReflection: 'ประสิทธิภาพมีราคา และคุณจ่ายด้วยหัวใจของสังคม บางทีตัวเลขไม่ได้บอกทุกเรื่องที่สำคัญ',
      },
    },

    // ========================================================================
    // CANDIDATE 3: ขนุน - Healer/Protector
    // ========================================================================
    candidate_3: {
      chosenCandidateId: 'candidate_3',

      immediateAftermath: {
        timeframe: '6 เดือนต่อมา',
        outcome: 'ขนุนสร้างระบบการปกป้องที่ดูเหมือนเป็นห่วงใย แต่เริ่มจำกัดเสรีภาพ "เพื่อความปลอดภัย" ผู้คนถูกปกป้องแต่ถูกควบคุม ไม่อนุญาตให้ตัดสินใจเอง "เพื่อป้องกันความผิดพลาด"',
        expectedOutcome: 'ความปลอดภัยและการดูแลที่เธอสัญญาไว้',
        unexpectedOutcome: 'การสูญเสียเสรีภาพทีละน้อยๆ จนกระทั่งไม่มีใครสังเกตุ',
      },

      hiddenTruths: {
        chosenCandidateSecret: 'ขนุนไม่เคยไว้ใจคนจริงๆ เธอเชื่อว่าผู้คนต้องถูกควบคุมเพื่อปกป้องตัวเอง เธอร่าง "การกักขังเพื่อการปกป้อง" ที่จะอนุญาตให้เธอกักขังคนได้โดยไม่ต้องผ่านกระบวนการยุติธรรม',
        otherCandidateSecrets: [
          {
            candidateId: 'candidate_1',
            secret: 'พัฒน์พยายามเตือนว่า "การปกป้องที่เกินไปนำไปสู่การครอบงำ" แต่คุณอาจมองว่าเขาแค่อิจฉาอำนาจของเธอ',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_2',
            secret: 'เนติคำนวณว่านโยบายของขนุนจะทำให้เศรษฐกิจชะลอตัวลง แต่คุณเลือกที่จะเชื่อถือความรู้สึกมากกว่าข้อมูล',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_4',
            secret: 'คมสันต์บอกว่า "ความปลอดภัยที่มาพร้อมกับการควบคุมยังคงเป็นการควบคุม" แต่ดูเหมือนคุณไม่ได้ยิน',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_5',
            secret: 'วิชัยรู้ว่าขนุนเคยใช้อำนาจอย่างผิดทางในอดีต แต่ไม่มีใครเชื่อเขาเพราะดูเหมือนคนหวาดระแหง',
            makesPlayerRethink: false,
          },
        ],
        questionNeverAsked: 'คุณไม่เคยถามว่า "เธอจะปกป้องเราจากอะไร" หรือ "เธอจะปกป้องเราจากตัวเราเองหรือไม่"',
      },

      longTermConsequences: {
        timeframe: '3 ปีต่อมา',
        outcome: 'เมืองปลอดภัยและมีความสุขในระดับหนึ่ง แต่ผู้คนสูญเสียความสามารถในการตัดสินใจ เด็กๆ เติบโตในสังคมที่ "รู้ว่าดีที่สุด" และไม่มีใครรับผิดชอบชีวิตของตัวเอง',
        goodOutcomes: [
          'อัตราอาชญากรรมต่ำมาก',
          'ระบบสวัสดิการที่ครอบคลุม',
          'ผู้อ่อนแอ่ได้รับการคุ้มครอง',
        ],
        badOutcomes: [
          'การสูญเสียเสรีภาพส่วนบุคคล',
          'ความสามารถในการแก้ปัญหาของตัวเองลดลง',
          'ความพึ่งพาที่เพิ่มขึ้นต่อผู้นำ',
        ],
        finalReflection: 'ความปลอดภัยมีราคา และคุณจ่ายด้วยเสรีภาพของคนรุ่นหลัง บางทีสิ่งที่เราคิดว่าเป็นการปกป้องอาจเป็นการคุกคาม',
      },
    },

    // ========================================================================
    // CANDIDATE 4: คมสันต์ - Cynical Realist
    // ========================================================================
    candidate_4: {
      chosenCandidateId: 'candidate_4',

      immediateAftermath: {
        timeframe: '6 เดือนต่อมา',
        outcome: 'คมสันต์จัดการกับการลดถอยลงอย่างมีประสิทธิภาพ สิ่งต่างๆ ไม่แย่ลง แต่ก็ไม่ดีขึ้น ผู้คนยอมรับว่า "นี่คือความเป็นจริง" และหวังว่าจะหายไป ความหวังในเมืองตายลง',
        expectedOutcome: 'การควบคุมความเสียหายที่เขาสัญญาไว้',
        unexpectedOutcome: 'ความสบายใจที่แปลกประหลาดจากการไม่ต้องหวังอะไร แต่ก็ไม่มีอะไรดีขึ้น',
      },

      hiddenTruths: {
        chosenCandidateSecret: 'คมสันต์รู้ถึงโอกาสทางเศรษฐกิจที่อาจจะช่วยกู้สถานการณ์ได้ แต่เขาไม่เคยพูดถึงเพราะเชื่อว่ามันจะล้มเหลว ความเชื่อของเขากลายเป็นนัยสำคัญของความจริง',
        otherCandidateSecrets: [
          {
            candidateId: 'candidate_1',
            secret: 'พัฒน์มีแผนการลงทุนที่จะสร้างงาน แต่คมสันต์ปฏิเสธิที่จะพิจารณามัน คุณเลือกที่จะเชื่อความหมดหวังของคมสันต์',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_2',
            secret: 'เนติมีข้อมูลที่แสดงว่าการลงทุนในโครงสร้างพื้นฐานจะช่วยเศรษฐกิจ แต่คมสันต์มองข้ามไป',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_3',
            secret: 'ขนุนเสนอโปรแกรมสร้างกำลังใจชุมชน แต่คมสันต์บอกว่า "ความหวังเป็นสิ่งอันตราย" และคุณเชื่อเขา',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_5',
            secret: 'วิชัยพยายามบอกว่ามีทางออก แต่คมสันต์หันเหเรื่องไปด้วยความหมดหวัง และคุณก็ทำเช่นเดียวกัน',
            makesPlayerRethink: true,
          },
        ],
        questionNeverAsked: 'คุณไม่เคยถามว่า "ยังมีทางอื่นหรือไม่" หรือ "ความหมดหวังของเขาคือความจริงหรือแค่มุมมองของเขา"',
      },

      longTermConsequences: {
        timeframe: '3 ปีต่อมา',
        outcome: 'เมืองยังมีชีวิตอยู่แต่ไม่เจริญ ผู้คนปรับตัวกับการลดถอยลงและหยุดฝัน คนหนุ่มสาวย้ายออกจากเมืองเพื่อหาโอกาส สิ่งที่เหลือคือความหวังที่ตายไปแล้ว',
        goodOutcomes: [
          'ไม่มีความผิดหวังเพราะไม่มีใครหวังอะไร',
          'ความมั่นคงในระดับหนึ่ง',
          'ไม่มีการเปลี่ยนแปลงที่น่ากลัว',
        ],
        badOutcomes: [
          'ความเจริญที่หยุดนิ่ง',
          'การย้ายถิ่นฐานของคนรุ่นใหม่',
          'ความหวังที่ตายไป',
        ],
        finalReflection: 'ความหมดหวังมีราคา และคุณจ่ายด้วยอนาคตของคนรุ่นหลัง บางทีโอกาส 1% ยังมีค่ามากกว่า 0%',
      },
    },

    // ========================================================================
    // CANDIDATE 5: วิชัย - Radical Outsider
    // ========================================================================
    candidate_5: {
      chosenCandidateId: 'candidate_5',

      immediateAftermath: {
        timeframe: '6 เดือนต่อมา',
        outcome: 'วิชัยทำลายระบบที่เน่าสะอมนอย่างรวดเร็ว แต่ไม่มีอะไรมาแทนที่ สถาบันพังทลาย บริการสาธารณะหยุดชะงัก และเกิดช่องว่างอำนาจที่กลุ่มต่างๆ พยายามจะเติมเต็ม ความโกลาหลเริ่มต้น',
        expectedOutcome: 'การเผาทำลายระบบที่เขาสัญญาไว้',
        unexpectedOutcome: 'การสูญเสียทุกอย่างที่เคยทำงาน และสิ่งที่จะมาแทนนั้นแย่กว่าเดิม',
      },

      hiddenTruths: {
        chosenCandidateSecret: 'วิชัยไม่มีแผนการสร้างใหม่ที่แท้จริง เขาขับเคลื่อนด้วยความโกรธจากการที่ถูกระบบทอดทิ้ง ไม่ใช่เพราะหลักการ เขาเคยเป็นส่วนหนึ่งของระบบจนกถูกไล่ออกเพราะยุบตรวจ',
        otherCandidateSecrets: [
          {
            candidateId: 'candidate_1',
            secret: 'พัฒน์พยายามเตือนว่า "การทำลายง่ายกว่าการสร้าง" แต่คุณเลือกที่จะเชื่อความโกรธของวิชัย',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_2',
            secret: 'เนติคำนวณว่าการทำลายระบบจะทำให้เศรษฐกิจลดลง 80% แต่คุณเพิกเฉยต่อความจริงทางตัวเลข',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_3',
            secret: 'ขนุนรู้ว่าวิชัยเคยทุจริต แต่คุณไม่ฟังเธอเพราะดูเหมือนเธอปกป้องระบบ',
            makesPlayerRethink: true,
          },
          {
            candidateId: 'candidate_4',
            secret: 'คมสันต์บอกว่า "ความโกรธไม่ใช่แผนการ" แต่คุณมองว่าเขาแค่ขี้กลัว',
            makesPlayerRethink: true,
          },
        ],
        questionNeverAsked: 'คุณไม่เคยถามว่า "หลังจากทำลายแล้วจะเกิดอะไรขึ้น" หรือ "เขามีแผนสร้างหรือแค่ต้องการทำลาย"',
      },

      longTermConsequences: {
        timeframe: '3 ปีต่อมา',
        outcome: 'ระบบเก่าถูกทำลาย แต่ระบบใหม่ที่เกิดขึ้นนั้นรุนแรงและผิดกฎหมายกว่าเดิม กลุ่มทหารควบคุมบางส่วนของเมือง ความรู้สึกที่ว่า "เราผิดพลาด" แพร่กระจายไปทั่วทั้งชุมชน',
        goodOutcomes: [
          'ระบบทุจริตเก่าถูกทำลายจริงๆ',
          'คนรู้ว่าพวกเขาสามารถต่อสู้ได้',
          'บางคนได้รับอิสระจากระบบเก่า',
        ],
        badOutcomes: [
          'ความโกลาหลและความรุนแรง',
          'บริการสาธารณะที่พังทลาย',
          'ผู้นำใหม่ที่แย่กว่าเดิม',
        ],
        finalReflection: 'การทำลายมีราคา และคุณจ่ายด้วยความสงบของทุกคน บางทีความโกรธไม่ใช่แผนการที่ดี',
      },
    },
  }

  // Get the consequence set for the chosen candidate
  const chosenConsequences = consequenceSets[chosenCandidateId]
  if (!chosenConsequences) {
    throw new Error(`No consequences found for candidate: ${chosenCandidateId}`)
  }

  // Generate alternative paths (what if scenarios for other candidates)
  const alternativePaths = otherCandidates.map((candidate) => {
    const alternatives: Record<string, string> = {
      candidate_1: 'หากคุณเลือกพัฒน์ เขาจะสร้างความเปลี่ยนแปลงที่น่าประทับใจแต่ขาดแผนงาน ความโกลาหลจะเกิดขึ้นแต่ความหวังก็ยังมี',
      candidate_2: 'หากคุณเลือกเนติ เขาจะทำให้ทุกอย่างมีประสิทธิภาพ แต่คนจะกลายเป็นตัวเลข ความเย็นชาจะแพร่กระจายไปทั่วเมือง',
      candidate_3: 'หากคุณเลือกขนุน เธอจะปกป้องทุกคน แต่เสรีภาพของคุณจะค่อยๆ หายไป ความปลอดภัยมีราคาที่คุณไม่เคยคิด',
      candidate_4: 'หากคุณเลือกคมสันต์ เขาจะควบคุมการลดถอยลง แต่ไม่มีอะไรดีขึ้น ความหวังจะตายไป และเมืองจะเริ่มเบียดเบียน',
      candidate_5: 'หากคุณเลือกวิชัย เขาจะเผาทำลายระบบที่เน่าสะอมน แต่สิ่งที่เกิดขึ้นต่อจากนั้นจะแย่กว่าเดิม ความโกลาหลจะปกคลุมทั้งเมือง',
    }

    return {
      candidateId: candidate.id,
      wouldHaveHappened: alternatives[candidate.id] || 'หากคุณเลือกคนอื่น ผลลัพธ์จะแตกต่างไป แต่ไม่มีใครรู้ว่าจะดีกว่าหรือแย่กว่า',
    }
  })

  return {
    ...chosenConsequences,
    alternativePaths,
  }
}

// ============================================================================
// NOTES FOR IMPLEMENTATION
// ============================================================================
//
// Each consequence set is designed to:
// 1. Create immediate doubt (unexpected outcomes in immediate aftermath)
// 2. Generate regret (hidden secrets reveal "you never asked about X")
// 3. Cause reflection (mixed good/bad long-term outcomes)
// 4. Encourage replay (alternative paths seem tempting)
//
// Design principles:
// - Every choice has downsides (no "perfect" answer)
// - Consequences leverage candidate data (hiddenMotivation, activeLie, etc.)
// - Alternative paths make other choices seem viable
// - At least 2 "makesPlayerRethink" secrets per candidate
// - Question never asked emphasizes the 3-question limit
//
// This creates the core feeling: doubt, regret, reflection, replay value.
// ============================================================================
