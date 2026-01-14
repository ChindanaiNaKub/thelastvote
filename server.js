// ============================================================================
// Local Development Server
// ============================================================================
// Express server for local development with AI API integration.
// Run with: node server.js
// ============================================================================

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'development' })
})

// Chat endpoint - generates AI responses for candidates using OpenRouter
app.post('/api/chat', async (req, res) => {
  try {
    const { question, candidatePrompt, conversationHistory, candidateId } = req.body

    // Validate request
    if (!question || !candidatePrompt) {
      return res.status(400).json({
        error: 'Missing required fields: question, candidatePrompt'
      })
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured'
      })
    }

    console.log(`[API] Processing question for candidate ${candidateId}`)
    console.log(`[API] Question: "${question}"`)
    console.log(`[API] Conversation history length: ${conversationHistory?.length || 0}`)

    // Format conversation history for OpenRouter
    const messages = []

    // Add system prompt at the beginning
    if (candidatePrompt) {
      messages.push({ role: 'system', content: candidatePrompt })
    }

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

    // Call OpenRouter API with timeout and retry logic
    const startTime = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    let response
    let retries = 0
    const maxRetries = 2

    while (retries <= maxRetries) {
      try {
        response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'The Last Vote',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: messages,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        break // Success, exit retry loop
      } catch (fetchError) {
        clearTimeout(timeout)
        retries++

        if (retries > maxRetries) {
          console.error(`[API] Fetch failed after ${maxRetries} retries:`, fetchError.message)
          throw fetchError
        }

        console.log(`[API] Retry ${retries}/${maxRetries} for candidate ${candidateId}`)
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] OpenRouter error:', errorText)
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const duration = Date.now() - startTime

    const aiResponse = data.choices[0].message.content

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
  console.log(`\n🔑 OpenRouter API key: ${OPENROUTER_API_KEY ? 'configured' : 'NOT configured'}`)
  console.log(`🤖 Model: ${OPENROUTER_MODEL}`)
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
