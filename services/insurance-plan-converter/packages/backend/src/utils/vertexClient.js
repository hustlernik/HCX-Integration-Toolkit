const { VertexAI } = require('@google-cloud/vertexai');

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const modelName = process.env.VERTEX_MODEL || 'gemini-2.5-pro';
const hasVertexEnv = !!project && !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!hasVertexEnv) {
  console.warn(
    '[VertexAI] Missing GOOGLE_CLOUD_PROJECT or GOOGLE_APPLICATION_CREDENTIALS. Running in MOCK mode.',
  );
}

const vertexAI = hasVertexEnv ? new VertexAI({ project, location }) : null;

function getModel(config = {}) {
  if (!hasVertexEnv) return null;
  return vertexAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      ...config,
    },
  });
}

/**
 * Generate JSON-only response from a prompt.
 * @param {string} prompt
 * @param {object} [genConfig]
 * @returns {Promise<string>} Raw JSON string
 */
async function generateJson(prompt, genConfig = {}) {
  if (!hasVertexEnv) {
    const mock = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'InsurancePlan',
            status: 'active',
            name: 'Mock Health Plan',
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/insurance-plan-type',
                    code: 'medical',
                    display: 'Medical',
                  },
                ],
              },
            ],
          },
        },
      ],
    };
    return JSON.stringify(mock);
  }

  try {
    const model = getModel(genConfig);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    console.log(
      '---- FULL AI RESPONSE ----\n',
      JSON.stringify(result.response, null, 2),
      '\n---------------------------------',
    );

    const candidates = result?.response?.candidates || [];
    const text = candidates[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      const finishReason = result?.response?.candidates?.[0]?.finishReason || 'UNKNOWN';
      const safetyRatings = result?.response?.candidates?.[0]?.safetyRatings || [];
      throw new Error(
        `Empty response from Vertex AI. Finish Reason: ${finishReason}. Safety Ratings: ${JSON.stringify(safetyRatings)}`,
      );
    }
    return text;
  } catch (error) {
    console.error('Error during Vertex AI call. Raw error object:', error);
    if (error.cause && error.cause.response) {
      const rawResponse = await error.cause.response.text();
      console.error('Raw response from API:', rawResponse);
    }
    throw error;
  }
}

module.exports = { generateJson };
