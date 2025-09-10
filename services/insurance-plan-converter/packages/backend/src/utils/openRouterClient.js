import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL = 'deepseek/deepseek-chat';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate JSON response using OpenRouter API
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} [options] - Additional options
 * @param {number} [options.temperature=0.1] - Temperature for response generation
 * @param {number} [options.maxTokens=2000] - Maximum tokens in the response
 * @returns {Promise<string>} The generated JSON response as a string
 */
async function generateJson(prompt, options = {}) {
  const { temperature = 0.1, maxTokens = 2000 } = options;

  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️  OPENROUTER_API_KEY not set in environment variables');
    throw new Error('OpenRouter API key is required');
  }

  try {
    const response = await axios({
      method: 'post',
      url: OPENROUTER_API_URL,
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      },
      timeout: 30000,
    });

    const content = response.data.choices[0]?.message?.content || '{}';

    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim();
      }
    }

    return content;
  } catch (error) {
    console.error('Error in OpenRouter client:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw new Error(
        `OpenRouter API request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`,
      );
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error(
        'No response received from OpenRouter API. Please check your network connection.',
      );
    } else {
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}

export { generateJson };
