import { SAMPLE_FOODS } from '../data/sampleFoods';

// Storage keys
export const GEMINI_API_KEY_STORAGE = 'nutriscan_gemini_api_key';
export const USE_MOCK_STORAGE = 'nutriscan_use_mock_mode';
export const PREFERRED_MODEL_STORAGE = 'nutriscan_preferred_model';

export const hasBuiltInApiKey = () => {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim());
};

export const getCustomApiKey = () => {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
};

export const getStoredApiKey = () => {
  const custom = getCustomApiKey();
  if (custom && custom.trim()) return custom.trim();
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
};

export const setStoredApiKey = (key) => {
  if (!key || !key.trim()) {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }
};

export const getStoredMockMode = () => {
  const saved = localStorage.getItem(USE_MOCK_STORAGE);
  if (saved !== null) return saved === 'true';
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  // If permanent API key is baked in, default to live AI
  return !Boolean(envKey && envKey.trim());
};

export const setStoredMockMode = (enabled) => {
  localStorage.setItem(USE_MOCK_STORAGE, enabled ? 'true' : 'false');
};

export const getStoredPreferredModel = () => {
  return localStorage.getItem(PREFERRED_MODEL_STORAGE) || 'auto';
};

export const setStoredPreferredModel = (model) => {
  localStorage.setItem(PREFERRED_MODEL_STORAGE, model);
};

/**
 * Standard priority list favoring models with generous free-tier quotas (1,500 RPD)
 * while placing restricted models (e.g. gemini-3.8-flash with only 20 RPD) at the end.
 */
export const MODEL_PRIORITY_ORDER = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-2.5-pro',
  'gemini-pro',
  'gemini-3.8-flash', // Strict 20 requests/day quota on free tier
];

/**
 * Compresses and converts an image file or canvas dataURL to base64 jpeg
 */
export async function optimizeImage(imageSource, maxWidth = 1024, maxHeight = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve({
        dataUrl,
        base64: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
      });
    };
    img.onerror = (err) => reject(err);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    } else {
      reject(new Error('Unsupported image format'));
    }
  });
}

/**
 * Queries Google ModelService to detect supported models for the provided key
 * and returns them sorted by quota stability.
 */
export async function getCandidateGeminiModels(apiKey) {
  if (!apiKey || !apiKey.trim()) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to query available models (${res.status})`);
    }
    const data = await res.json();
    const models = data.models || [];

    // Filter for models supporting generateContent
    const supported = models
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''));

    console.log('Available models reported by Google for key:', supported);

    // Sort matching prioritized order
    const ordered = [];
    for (const pref of MODEL_PRIORITY_ORDER) {
      if (supported.includes(pref)) {
        ordered.push(pref);
      }
    }

    // Add any remaining supported models not in priority list
    for (const s of supported) {
      if (!ordered.includes(s) && (s.includes('flash') || s.includes('gemini'))) {
        ordered.push(s);
      }
    }

    if (ordered.length > 0) return ordered;
    return ['gemini-2.0-flash', 'gemini-1.5-flash'];
  } catch (err) {
    console.warn('Could not query ListModels, using default prioritized fallback list:', err);
    return MODEL_PRIORITY_ORDER;
  }
}

/**
 * Backwards compatibility helper for single model resolution
 */
export async function getAvailableGeminiModel(apiKey) {
  const candidates = await getCandidateGeminiModels(apiKey);
  return candidates[0] || 'gemini-2.0-flash';
}

/**
 * Tests connection and checks quota status of models for the user key
 */
export async function testGeminiModels(apiKey) {
  const models = await getCandidateGeminiModels(apiKey);
  if (models.length === 0) {
    throw new Error('No models found supporting generateContent for this API key.');
  }

  const results = [];
  let bestWorkingModel = null;

  for (const model of models.slice(0, 5)) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey.trim()
      )}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK' }] }],
        }),
      });

      if (res.ok) {
        results.push({ model, status: 'ready', message: 'Ready & quota available' });
        if (!bestWorkingModel) bestWorkingModel = model;
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `HTTP ${res.status}`;
        if (res.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          results.push({ model, status: 'exhausted', message: 'Quota exhausted (limit reached)' });
        } else {
          results.push({ model, status: 'error', message: msg });
        }
      }
    } catch (e) {
      results.push({ model, status: 'error', message: e.message || 'Network error' });
    }
  }

  return {
    bestWorkingModel,
    modelResults: results,
  };
}

/**
 * Analyzes food image using Gemini Vision API with automatic multi-model failover
 * or intelligent offline fallback
 */
export async function analyzeFoodImage({
  imageSrc,
  customHint = '',
  apiKey = '',
  forceMock = false,
}) {
  const activeKey = apiKey || getStoredApiKey();
  const mockEnabled = forceMock || getStoredMockMode();

  // If mock mode is explicitly chosen or no API key is provided, use high-fidelity demo analysis
  if (mockEnabled || !activeKey) {
    // Artificial small delay for realistic UX scan experience
    await new Promise((r) => setTimeout(r, 1000));

    // Check if the image source matches any sample food ID or url
    let matched = SAMPLE_FOODS.find((f) =>
      imageSrc?.includes(f.id) || (f.image && imageSrc?.includes(f.image.split('?')[0]))
    );

    // If no direct image match, check if customHint matches any sample name or keywords
    if (!matched && customHint) {
      const hintLower = customHint.toLowerCase();
      matched = SAMPLE_FOODS.find((f) => {
        const nameMatch = f.name.toLowerCase().includes(hintLower) || hintLower.includes(f.name.toLowerCase());
        const keywordMatch = f.keywords?.some((k) => hintLower.includes(k.toLowerCase()) || k.toLowerCase().includes(hintLower));
        return nameMatch || keywordMatch;
      });
    }

    if (matched) {
      return {
        ...matched,
        name: customHint ? `${customHint} (Matched)` : matched.name,
        foodName: customHint ? `${customHint} (Matched)` : matched.name,
        isSimulated: true,
        analyzedAt: new Date().toISOString(),
      };
    }

    // Default realistic dish if arbitrary custom image is uploaded in demo mode
    const randomPick = SAMPLE_FOODS[Math.floor(Math.random() * SAMPLE_FOODS.length)];
    return {
      ...randomPick,
      name: customHint ? `${customHint} (Estimated)` : randomPick.name,
      foodName: customHint ? `${customHint} (Estimated)` : randomPick.name,
      isSimulated: true,
      analyzedAt: new Date().toISOString(),
    };
  }

  // Optimize and extract base64
  const { base64, mimeType } = await optimizeImage(imageSrc);

  const prompt = `You are an expert clinical dietitian and computer vision nutritionist with deep expertise in Indian cuisines (North, South, East, West, Homestyle, and Street food) as well as global nutrition. 
Analyze the provided food image with high precision.
Identify all visible food items (e.g. types of bread/roti, gravies, dals, sabzis, rice varieties, paneer, chicken, snacks), estimate the portion size and total grams, and provide an accurate calorie and macronutrient breakdown taking into account typical Indian cooking preparations (tempering/tadka, oil/ghee, and spices).

${customHint ? `Context / user note about dish: "${customHint}".` : ''}

Respond ONLY with a valid, raw JSON object matching the following structure exactly (no markdown formatting, no code block backticks):
{
  "foodName": "Full descriptive name of the dish (e.g., Ghar Ka Rajma Chawal with Kachumber)",
  "cuisine": "Cuisine type (e.g. North Indian, South Indian, Punjabi, Maharashtrian, Mughlai, etc.)",
  "confidence": "High / Medium / Low",
  "estimatedWeightGrams": 350,
  "servingDescription": "Detailed serving description e.g. 1 bowl dal (200g) with 2 rotis and onion salad",
  "calories": 480,
  "healthScore": 8.5,
  "nutriGrade": "A",
  "dietaryFlags": ["High Protein", "Low Carb", "Gluten-Free"],
  "allergens": ["Dairy", "Nuts"],
  "macros": {
    "protein": 32,
    "carbs": 45,
    "fat": 18,
    "fiber": 7,
    "sugar": 4,
    "sodium": 520
  },
  "micros": [
    { "name": "Vitamin C", "amount": "45mg", "dailyValue": "50%" },
    { "name": "Iron", "amount": "3.5mg", "dailyValue": "19%" },
    { "name": "Calcium", "amount": "180mg", "dailyValue": "18%" }
  ],
  "ingredients": [
    { "name": "Main item", "amount": "150g", "calories": 200, "protein": 10, "carbs": 25, "fat": 6 },
    { "name": "Secondary item/gravy", "amount": "100g", "calories": 120, "protein": 4, "carbs": 12, "fat": 5 }
  ],
  "nutritionistReview": "Concise 1-2 sentence evidence-based dietary review highlighting nutritional merits and satiety.",
  "healthierSwaps": [
    "Practical swap 1 to optimize calories or nutrients",
    "Practical swap 2"
  ]
}`;

  // Get candidate models and respect preferred model setting
  const preferred = getStoredPreferredModel();
  let candidateModels = await getCandidateGeminiModels(activeKey);

  if (preferred && preferred !== 'auto') {
    // Put chosen preferred model at the top
    candidateModels = [preferred, ...candidateModels.filter((m) => m !== preferred)];
  }

  console.log('Candidate models for scan execution:', candidateModels);

  let parsed = null;
  let successfulModel = null;
  let lastError = null;
  let exhaustedCount = 0;

  for (const model of candidateModels) {
    try {
      console.log(`Sending image analysis to Gemini model: ${model}...`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        activeKey
      )}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errJson.error?.message || `API error ${status}: ${response.statusText}`;

        // Check if rate limited (429), high demand (503), not found (404), or quota error
        const isQuotaOrDemand =
          status === 429 ||
          status === 503 ||
          status === 404 ||
          msg.toLowerCase().includes('quota') ||
          msg.toLowerCase().includes('resource_exhausted') ||
          msg.toLowerCase().includes('high demand') ||
          msg.toLowerCase().includes('limit');

        if (isQuotaOrDemand) {
          console.warn(`Model "${model}" quota exhausted or overloaded: ${msg}. Automatically trying next model...`);
          exhaustedCount++;
          lastError = new Error(msg);
          continue; // Automatically failover to next candidate model!
        } else {
          // Critical authentication / permission error
          throw new Error(msg);
        }
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const textOutput = candidate?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error(`Model ${model} returned an empty response. Trying next model...`);
      }

      // Clean JSON output in case it wrapped with markdown backticks
      let cleaned = textOutput.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      parsed = JSON.parse(cleaned);
      successfulModel = model;
      console.log(`Scan successfully analyzed using model: ${successfulModel}`);
      break; // Scan succeeded!
    } catch (err) {
      console.warn(`Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  if (!parsed) {
    if (exhaustedCount > 0) {
      throw new Error(
        `Gemini API Quota Exceeded on free tier (${lastError?.message || 'Daily limit reached'}). Switch to Demo Mode to scan freely without waiting.`
      );
    }
    throw new Error(lastError?.message || 'Failed to analyze food image with available Gemini models.');
  }

  return {
    ...parsed,
    modelUsed: successfulModel,
    isSimulated: false,
    analyzedAt: new Date().toISOString(),
  };
}
