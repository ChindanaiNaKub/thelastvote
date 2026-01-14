// Quick test to verify GLM API key works
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const API_KEY = process.env.ZHIPUAI_API_KEY

console.log('🔑 API Key:', API_KEY ? `${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}` : 'NOT FOUND')
console.log('')

async function testAPI() {
  try {
    console.log('📡 Testing Zhipu AI API connection...')
    console.log('')

    const glm = new ZhipuAI({ apiKey: API_KEY })

    console.log('🤖 Calling glm-4 model with simple test...')
    const response = await glm.createCompletions({
      model: 'glm-4',
      messages: [
        { role: 'user', content: 'Say "API works!" in exactly those words.' }
      ],
      stream: false,
    })

    console.log('✅ SUCCESS!')
    console.log('')
    console.log('Response:', response.choices[0].message.content)
    console.log('')
    console.log('Full response data:', JSON.stringify(response, null, 2))

  } catch (error) {
    console.log('❌ FAILED!')
    console.log('')
    console.log('Full error object:', JSON.stringify(error, null, 2))
    console.log('')
    console.log('Error message:', error.message)
    console.log('Error stack:', error.stack)
    if (error.response) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2))
    }
    if (error.cause) {
      console.log('Error cause:', error.cause)
    }
  }
}

testAPI()
