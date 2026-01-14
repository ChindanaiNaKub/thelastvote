// ============================================================================
// Vercel Serverless Function - Chat Endpoint
// ============================================================================
// Handles AI-powered candidate responses for production deployment.
// ============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question, candidatePrompt, conversationHistory, candidateId } = req.body

    // Validate request
    if (!question || !candidatePrompt) {
      return res.status(400).json({
        error: 'Missing required fields: question, candidatePrompt'
      })
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free'
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured'
      })
    }

    // Format conversation history for OpenRouter
    const messages: Array<{ role: string; content: string }> = []

    // Add system prompt at the beginning
    if (candidatePrompt) {
      messages.push({ role: 'system', content: candidatePrompt })
    }

    // Add conversation history if present
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((entry: { type: string; content: string }) => {
        if (entry.type === 'question') {
          messages.push({ role: 'user', content: entry.content })
        } else if (entry.type === 'response') {
          messages.push({ role: 'assistant', content: entry.content })
        }
      })
    }

    // Add current question
    messages.push({ role: 'user', content: question })

    // Call OpenRouter API
    const startTime = Date.now()
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.referer || 'https://thelastvote.vercel.app',
        'X-Title': 'The Last Vote',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: messages,
        max_tokens: 100, // Limit response length to control costs
        temperature: 0.7, // Balance consistency and creativity
      }),
    })
    const duration = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vercel API Error - OpenRouter:', errorText)
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content || 'ไม่สามารถสร้างคำตอบได้'

    // Return response
    res.json({
      success: true,
      response: aiResponse,
      candidateId: candidateId,
      mode: 'api',
      duration: duration,
    })

  } catch (error: unknown) {
    console.error('Vercel API Error:', error)

    // Return error with details
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
