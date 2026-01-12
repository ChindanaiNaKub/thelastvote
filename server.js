// ============================================================================
// Local Development Server
// ============================================================================
// Express server for local development with AI API integration.
// Run with: node server.js
// ============================================================================

import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'development' })
})

// Chat endpoint - generates AI responses for candidates
app.post('/api/chat', async (req, res) => {
  try {
    const { question, candidatePrompt, conversationHistory, candidateId } = req.body

    // Validate request
    if (!question || !candidatePrompt) {
      return res.status(400).json({
        error: 'Missing required fields: question, candidatePrompt'
      })
    }

    console.log(`[API] Processing question for candidate ${candidateId}`)
    console.log(`[API] Question: "${question}"`)
    console.log(`[API] Conversation history length: ${conversationHistory?.length || 0}`)

    // Format conversation history for Claude
    const messages = []

    // Add conversation history if present
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((entry) => {
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

    const aiResponse = response.content[0].text

    console.log(`[API] Response generated in ${duration}ms`)
    console.log(`[API] Response: "${aiResponse.substring(0, 100)}..."`)

    // Return response
    res.json({
      success: true,
      response: aiResponse,
      candidateId: candidateId,
      mode: 'api',
      duration: duration,
    })

  } catch (error) {
    console.error('[API] Error:', error)

    // Return error with details
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`)
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`)
  console.log(`\n🔑 Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'NOT configured'}`)
  console.log(`\n⚙️  Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 API server shutting down...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n👋 API server shutting down...')
  process.exit(0)
})
