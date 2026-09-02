/**
 * OmniDub - Gemini AI Service
 * Real-time Speech-to-Text, Translation & Studio-Quality Neural AI Dubbing.
 * Compatible with all official Gemini 3 and Gemini 2.5 models.
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Transcribes audio and translates it into the target language.
 *
 * @param {Object} params
 * @param {string} params.base64Audio - Base64-encoded audio chunk (16kHz WAV)
 * @param {string} params.mimeType - Audio mime type (e.g. 'audio/wav')
 * @param {string} params.targetLangName - Target language name (e.g. 'Persian')
 * @param {string} params.apiKey - User Gemini API Key
 * @param {string} [params.model='gemini-2.5-flash'] - Gemini model name
 * @returns {Promise<{hasSpeech: boolean, originalText: string, translatedText: string, latencyMs: number}>}
 */
export async function translateAudioChunk({
  base64Audio,
  mimeType = 'audio/wav',
  targetLangName = 'Persian',
  apiKey,
  model = 'gemini-2.5-flash'
}) {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set your key in the OmniDub popup.');
  }

  const cleanModel = model.trim();
  const url = `${GEMINI_API_ENDPOINT}/${cleanModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const startTime = Date.now();

  const prompt = `You are an elite film & video dubbing translator.
Translate the speech in this audio stream for live voice dubbing and subtitles.
Instructions:
1. Transcribe the original speech into "originalText".
2. Translate into natural, fluent, conversational ${targetLangName} into "translatedText".
   - Flow: Output complete, eloquent grammatical sentences suitable for voice actors.
   - Quality: Avoid fragmented or dangling clauses. Combine related phrases into meaningful spoken thoughts.
3. If there is no human speech, silence, background music only, or unintelligible noise, set hasSpeech to false.
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
          translatedText: { type: 'STRING' }
        },
        required: ['hasSpeech', 'originalText', 'translatedText']
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
    return { hasSpeech: false, originalText: '', translatedText: '', latencyMs };
  }

  try {
    const parsed = JSON.parse(textResponse);
    const hasSpeech = Boolean(parsed.hasSpeech && parsed.translatedText?.trim());

    console.log(
      `%c[OmniDub Gemini] ✅ ${cleanModel} in ${latencyMs}ms | Speech: ${hasSpeech}`,
      'color: #10b981; font-weight: bold;',
      hasSpeech ? {
        original: parsed.originalText,
        translated: parsed.translatedText
      } : '(silence)'
    );

    return {
      hasSpeech,
      originalText: parsed.originalText || '',
      translatedText: parsed.translatedText || '',
      latencyMs
    };
  } catch (err) {
    console.warn(`%c[OmniDub Gemini] ⚠️ JSON parse fallback:`, 'color: #f59e0b;', textResponse);
    return {
      hasSpeech: textResponse.trim().length > 0,
      originalText: '',
      translatedText: textResponse.trim(),
      latencyMs
    };
  }
}

/**
 * Synthesizes studio-quality neural AI voice in the target language (e.g. Persian)
 * using official Gemini TTS models (gemini-2.5-flash-preview-tts or gemini-3.1-flash-tts-preview).
 *
 * @param {Object} params
 * @param {string} params.text - The translated text to speak (e.g. in Persian)
 * @param {string} params.apiKey - Gemini API Key
 * @param {string} [params.voiceName='Aoede'] - Gemini prebuilt voice (Aoede, Kore, Puck, Charon, Fenrir, Leda, Zephyr, Orus)
 * @param {string} [params.ttsModel='gemini-2.5-flash-preview-tts'] - TTS model
 * @returns {Promise<string|null>} - base64 Data URL (data:audio/wav;base64,...) or null
 */
export async function synthesizeGeminiSpeech({
  text,
  apiKey,
  voiceName = 'Aoede',
  ttsModel = 'gemini-2.5-flash-preview-tts'
}) {
  if (!apiKey || !text || !text.trim()) return null;

  const url = `${GEMINI_API_ENDPOINT}/${ttsModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  const startTime = Date.now();

  const payload = {
    contents: [
      {
        parts: [
          {
            text: text.trim()
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName
          }
        }
      }
    }
  };

  try {
    console.log(`%c[OmniDub AI TTS] 🎙️ Synthesizing speech with voice "${voiceName}" [${ttsModel}]:`, 'color: #8b5cf6;', text);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`%c[OmniDub AI TTS ⚠️] Status ${res.status}:`, 'color: #f59e0b;', err.error?.message || res.statusText);
      return null;
    }

    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'audio/pcm;rate=24000';
      const duration = Date.now() - startTime;
      console.log(`%c[OmniDub AI TTS] ✅ Speech synthesized in ${duration}ms (${mime})`, 'color: #10b981; font-weight: bold;');

      if (mime.includes('pcm')) {
        const rateMatch = mime.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const wavBase64 = pcmToWavBase64(part.inlineData.data, sampleRate);
        return `data:audio/wav;base64,${wavBase64}`;
      } else {
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    console.warn('%c[OmniDub AI TTS ⚠️] Failed to synthesize AI speech:', 'color: #f59e0b;', err);
    return null;
  }
}

/**
 * Wraps raw 16-bit PCM audio in a valid 44-byte WAV header so browsers can play it immediately.
 */
function pcmToWavBase64(base64Pcm, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const binaryString = atob(base64Pcm);
  const pcmBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  // file length minus 8
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  // format chunk identifier
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  // data chunk length
  view.setUint32(40, dataSize, true);

  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(new Uint8Array(header), 0);
  wavBytes.set(pcmBytes, 44);

  let binary = '';
  for (let i = 0; i < wavBytes.length; i++) {
    binary += String.fromCharCode(wavBytes[i]);
  }
  return btoa(binary);
}

/**
 * Validates the API key by testing a minimal generation call.
 *
 * @param {string} apiKey
 * @param {string} [model='gemini-2.5-flash']
 * @returns {Promise<boolean>}
 */
export async function validateApiKey(apiKey, model = 'gemini-2.5-flash') {
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
