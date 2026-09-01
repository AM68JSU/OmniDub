/**
 * OmniDub - Gemini AI Service
 * Real-time Speech-to-Text, Translation & Phonetic Romanization using Google Gemini API.
 * Supports gemini-2.5-flash, gemini-3.7-flash, gemini-2.0-flash, gemini-1.5-flash, etc.
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Transcribes audio, translates it, and provides phonetic transliteration for TTS fallback.
 *
 * @param {Object} params
 * @param {string} params.base64Audio - Base64-encoded audio chunk (WAV/WebM)
 * @param {string} params.mimeType - Audio mime type (e.g. 'audio/wav')
 * @param {string} params.targetLangName - Target language name (e.g. 'Persian')
 * @param {string} params.apiKey - User Gemini API Key
 * @param {string} [params.model='gemini-2.0-flash'] - Gemini model name
 * @returns {Promise<{hasSpeech: boolean, originalText: string, translatedText: string, phoneticText: string, latencyMs: number}>}
 */
export async function translateAudioChunk({
  base64Audio,
  mimeType = 'audio/wav',
  targetLangName = 'Persian',
  apiKey,
  model = 'gemini-2.0-flash'
}) {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set your key in the OmniDub popup.');
  }

  const cleanModel = model.trim();
  const url = `${GEMINI_API_ENDPOINT}/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const startTime = Date.now();

  const prompt = `You are a real-time live dubbing & subtitle translator for a web video stream.
Listen to this audio chunk:
1. Transcribe the spoken words in the original language ("originalText").
2. Translate into ${targetLangName} accurately and naturally for subtitles ("translatedText").
3. For text-to-speech dubbing:
   - If ${targetLangName} does NOT use the Latin alphabet (e.g. Persian/Farsi, Arabic, Russian, Japanese, Chinese, Hindi, Greek, etc.), generate an accurate phonetic transliteration/Romanization in the Latin alphabet in "phoneticText" (e.g. for Persian: "Fekr mikonam chahar mah gozashte").
   - If ${targetLangName} uses the Latin alphabet (e.g. English, Spanish, French, German), set "phoneticText" exactly equal to "translatedText".
4. If there is no human speech, silence, background music only, or unintelligible noise, set hasSpeech to false.
Output strictly in JSON matching the specified schema.`;

  const payload = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          hasSpeech: { type: 'BOOLEAN' },
          originalText: { type: 'STRING' },
          translatedText: { type: 'STRING' },
          phoneticText: { type: 'STRING' }
        },
        required: ['hasSpeech', 'originalText', 'translatedText', 'phoneticText']
      }
    }
  };

  console.log(`%c[OmniDub Gemini] 🚀 Sending ${Math.round(base64Audio.length * 0.75 / 1024)}KB audio to "${cleanModel}"...`, 'color: #3b82f6;');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error?.message || `HTTP ${response.status} ${response.statusText}`;

    if (response.status === 429) {
      console.warn(`%c[OmniDub Gemini Rate Limit ⏳] Free tier limit reached on ${cleanModel} (HTTP 429).`, 'color: #f59e0b; font-weight: bold;', message);
      const err = new Error(`Gemini 429: Rate limit reached on ${cleanModel}. ${message}`);
      err.status = 429;
      // Extract retry delay if present in message (e.g. "Please retry in 4.66s")
      const match = message.match(/retry in ([0-9.]+)s/i);
      err.retryAfterSec = match ? parseFloat(match[1]) : 5;
      throw err;
    }

    console.error(`%c[OmniDub Gemini Error ❌] ${cleanModel} failed in ${latencyMs}ms:`, 'color: #ef4444; font-weight: bold;', message);
    throw new Error(`Gemini API [${cleanModel}] Error: ${message}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    return { hasSpeech: false, originalText: '', translatedText: '', phoneticText: '', latencyMs };
  }

  try {
    const parsed = JSON.parse(textResponse);
    const hasSpeech = Boolean(parsed.hasSpeech && parsed.translatedText?.trim());

    console.log(
      `%c[OmniDub Gemini] ✅ ${cleanModel} in ${latencyMs}ms | Speech: ${hasSpeech}`,
      'color: #10b981; font-weight: bold;',
      hasSpeech ? {
        original: parsed.originalText,
        translated: parsed.translatedText,
        phonetic: parsed.phoneticText
      } : '(silence)'
    );

    return {
      hasSpeech,
      originalText: parsed.originalText || '',
      translatedText: parsed.translatedText || '',
      phoneticText: parsed.phoneticText || parsed.translatedText || '',
      latencyMs
    };
  } catch (err) {
    console.warn(`%c[OmniDub Gemini] ⚠️ JSON parse fallback:`, 'color: #f59e0b;', textResponse);
    return {
      hasSpeech: textResponse.trim().length > 0,
      originalText: '',
      translatedText: textResponse.trim(),
      phoneticText: textResponse.trim(),
      latencyMs
    };
  }
}

/**
 * Validates the API key by testing a minimal generation call.
 *
 * @param {string} apiKey
 * @param {string} [model='gemini-2.0-flash']
 * @returns {Promise<boolean>}
 */
export async function validateApiKey(apiKey, model = 'gemini-2.0-flash') {
  if (!apiKey || !apiKey.trim()) return false;
  const cleanModel = model.trim();
  const url = `${GEMINI_API_ENDPOINT}/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'ping' }] }]
    })
  });
  return response.ok;
}
