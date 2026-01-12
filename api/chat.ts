// ============================================================================
// Vercel Serverless Function - Chat Endpoint
// ============================================================================
// Handles AI-powered candidate responses for production deployment.
// ============================================================================

import Anthropic from '@anthropic-ai/sdk'
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

    // Initialize Anthropic client with server-side API key
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'API key not configured'
      })
    }

    // Format conversation history for Claude
    const messages: Anthropic.MessageParam[] = []

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

    // Call Claude API
    const startTime = Date.now()
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      system: candidatePrompt,
      messages: messages,
    })
    const duration = Date.now() - startTime

    // Get text response from content blocks
    const contentBlock = response.content[0]
    const aiResponse = contentBlock.type === 'text' ? contentBlock.text : 'ไม่สามารถสร้างคำตอบได้'

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
