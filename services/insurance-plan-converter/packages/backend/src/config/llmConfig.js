import process from 'process';

/**
 * Retrieves the OpenAI API key from environment variables.
 */
function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY;
}

/**
 * Retrieves the Google API key from environment variables.
 * This key is used by @google/genai if not using Vertex AI via ADC.
 * For Vertex AI via @google/genai, ADC is primary, so this key is optional.
 */
function getGoogleApiKey() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY not set. This is OK if using ADC for Vertex AI.');
  }
  return apiKey;
}

/**
 * Retrieves the Google Cloud Project ID from environment variables.
 * Essential when using @google/genai to target Vertex AI.
 */
function getGoogleProjectId() {
  const projectId = process.env.GOOGLE_PROJECT_ID;
  if (!projectId && (process.env.LLM_PROVIDER || 'openai').toLowerCase() === 'google') {
    console.error(
      'Error: GOOGLE_PROJECT_ID environment variable is required when LLM_PROVIDER is "google".',
    );
  }
  return projectId;
}

/**
 * Retrieves the Google Cloud Location ID (region) from environment variables.
 * Essential when using @google/genai to target Vertex AI.
 */
function getGoogleLocationId() {
  const locationId = process.env.GOOGLE_LOCATION_ID;
  if (!locationId && (process.env.LLM_PROVIDER || 'openai').toLowerCase() === 'google') {
    console.error(
      'Error: GOOGLE_LOCATION_ID environment variable is required when LLM_PROVIDER is "google".',
    );
  }
  return locationId;
}

/**
 * Retrieves the configuration for the selected LLM.
 */
function getLlmConfig() {
  const llmProvider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();

  if (llmProvider === 'openai') {
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key (OPENAI_API_KEY) is required when LLM_PROVIDER is "openai".');
    }
    return {
      provider: 'openai',
      apiKey,
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
    };
  }

  if (llmProvider === 'google') {
    const projectId = getGoogleProjectId();
    const locationId = getGoogleLocationId();
    const apiKey = getGoogleApiKey();

    if (!projectId) {
      throw new Error(
        'GOOGLE_PROJECT_ID is required when LLM_PROVIDER is "google" (for Vertex AI).',
      );
    }
    if (!locationId) {
      throw new Error(
        'GOOGLE_LOCATION_ID is required when LLM_PROVIDER is "google" (for Vertex AI).',
      );
    }

    return {
      provider: 'google',
      apiKey,
      projectId,
      locationId,
      defaultModel: process.env.GEMINI_MODEL_NAME || 'gemini-pro',
    };
  }

  const errorMsg = `Unsupported or misconfigured LLM provider: ${llmProvider}. Ensure all required environment variables are set.`;
  console.error(`Error: LLM provider "${llmProvider}" is not supported or not fully configured.`);
  throw new Error(errorMsg);
}

export default {
  getLlmConfig,
  getOpenAIApiKey,
  getGoogleApiKey,
  getGoogleProjectId,
  getGoogleLocationId,
};
