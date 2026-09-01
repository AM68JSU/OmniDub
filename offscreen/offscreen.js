/**
 * OmniDub - Offscreen Audio Processor
 * Captures tab audio via chromeMediaSourceId, routes to speakers,
 * chunks audio into 16kHz mono WAV segments, and dispatches to Gemini API.
 */

import { translateAudioChunk, synthesizeGeminiSpeech } from '../services/gemini_api.js';
import { getLanguageByCode } from '../services/language_list.js';

let audioContext = null;
let mediaStream = null;
let processorNode = null;
let sourceNode = null;
let gainNode = null;

let isCapturing = false;
let currentConfig = null;
let pcmBuffer = [];
let bufferSampleCount = 0;
let isProcessingChunk = false;
let cooldownUntil = 0; // Timestamp to wait if rate-limited (HTTP 429)

// 4.8 seconds per chunk balances low latency with free-tier rate limits (12 RPM)
const DEFAULT_CHUNK_DURATION = 4.8;
const TARGET_SAMPLE_RATE = 16000;

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_OFFSCREEN_CAPTURE') {
    console.log('%c[OmniDub Offscreen] 🚀 START_OFFSCREEN_CAPTURE received.', 'color: #10b981; font-weight: bold;', message.config);
    startCapture(message.streamId, message.config)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  } else if (message.type === 'STOP_OFFSCREEN_CAPTURE') {
    console.log('%c[OmniDub Offscreen] 🛑 STOP_OFFSCREEN_CAPTURE received.', 'color: #ef4444;');
    stopCapture();
    sendResponse({ success: true });
    return false;
  } else if (message.type === 'UPDATE_OFFSCREEN_CONFIG') {
    if (message.config) {
      currentConfig = { ...currentConfig, ...message.config };
      console.log('%c[OmniDub Offscreen] ⚙️ Configuration updated:', 'color: #38bdf8;', currentConfig);
    }
    sendResponse({ success: true });
    return false;
  }
});

/**
 * Start capturing tab audio stream
 */
async function startCapture(streamId, config) {
  if (isCapturing) {
    stopCapture();
  }

  currentConfig = config || {};
  cooldownUntil = 0;
  isProcessingChunk = false;

  try {
    console.log(`%c[OmniDub Offscreen] 🎙️ Initializing capture for tab stream ID: ${streamId}`, 'color: #38bdf8;');

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioContext.createMediaStreamSource(mediaStream);

    // Route audio to speakers so the user can continue hearing the tab video
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Audio chunking buffer setup
    pcmBuffer = [];
    bufferSampleCount = 0;
    const bufferSize = 4096;
    processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);

    const sourceSampleRate = audioContext.sampleRate;
    const chunkSec = Number(currentConfig.chunkDuration) || DEFAULT_CHUNK_DURATION;
    const samplesPerChunk = sourceSampleRate * chunkSec;

    console.log(`%c[OmniDub Offscreen] 🔊 AudioContext active | Source: ${sourceSampleRate}Hz | Chunk Duration: ${chunkSec}s (~${samplesPerChunk} samples)`, 'color: #10b981;');

    processorNode.onaudioprocess = (e) => {
      if (!isCapturing) return;
      const inputData = e.inputBuffer.getChannelData(0);
      pcmBuffer.push(new Float32Array(inputData));
      bufferSampleCount += inputData.length;

      if (bufferSampleCount >= samplesPerChunk) {
        processChunk(sourceSampleRate);
      }
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);

    isCapturing = true;
    console.log('%c[OmniDub Offscreen] ✅ Audio stream pipeline initialized successfully.', 'color: #10b981; font-weight: bold;');
  } catch (err) {
    console.error('%c[OmniDub Offscreen ❌] Failed to capture audio stream in offscreen:', 'color: #ef4444; font-weight: bold;', err);
    stopCapture();
    throw err;
  }
}

/**
 * Process accumulated PCM audio and send to Gemini API
 */
async function processChunk(sourceSampleRate) {
  if (pcmBuffer.length === 0) return;

  // Check rate-limit cooldown
  const now = Date.now();
  if (now < cooldownUntil) {
    const waitSec = Math.ceil((cooldownUntil - now) / 1000);
    console.warn(`%c[OmniDub Offscreen ⏳] In 429 cooldown. Dropping chunk, waiting ${waitSec}s...`, 'color: #f59e0b;');
    pcmBuffer = [];
    bufferSampleCount = 0;
    return;
  }

  // Flatten accumulated buffer
  const totalLength = bufferSampleCount;
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of pcmBuffer) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  // Reset buffer for next chunk
  pcmBuffer = [];
  bufferSampleCount = 0;

  // Volume check to skip silence
  let sumSquares = 0;
  for (let i = 0; i < merged.length; i += 8) {
    sumSquares += merged[i] * merged[i];
  }
  const rms = Math.sqrt(sumSquares / (merged.length / 8));
  if (rms < 0.0035) {
    return; // Silent/inaudible chunk
  }

  // Downsample to 16kHz mono WAV
  const downsampled = downsampleBuffer(merged, sourceSampleRate, TARGET_SAMPLE_RATE);
  const wavBase64 = encodeWAV(downsampled, TARGET_SAMPLE_RATE);

  const langInfo = getLanguageByCode(currentConfig.targetLang || 'fa');
  const targetLangName = langInfo ? langInfo.name : 'Persian';

  isProcessingChunk = true;
  console.log(`%c[OmniDub Offscreen] 📦 Chunk ready | RMS: ${rms.toFixed(4)} | Size: ${Math.round(wavBase64.length * 0.75 / 1024)}KB | Target: ${targetLangName}`, 'color: #818cf8;');

  try {
    const result = await translateAudioChunk({
      base64Audio: wavBase64,
      mimeType: 'audio/wav',
      targetLangName,
      apiKey: currentConfig.apiKey,
      model: currentConfig.model || 'gemini-2.0-flash'
    });

    if (result && result.hasSpeech && result.translatedText) {
      let audioDataUrl = null;
      if (currentConfig.dubbedAudio !== false) {
        audioDataUrl = await synthesizeGeminiSpeech({
          text: result.translatedText,
          apiKey: currentConfig.apiKey,
          voiceName: currentConfig.aiVoice || 'Aoede',
          ttsModel: currentConfig.ttsModel || 'gemini-2.5-flash-preview-tts'
        }).catch(() => null);
      }

      console.log('%c[OmniDub Offscreen] 💬 Forwarding translation & AI dubbing to background:', 'color: #10b981;', {
        original: result.originalText,
        translated: result.translatedText,
        hasAiAudio: Boolean(audioDataUrl)
      });

      chrome.runtime.sendMessage({
        type: 'NEW_TRANSLATION_RESULT',
        originalText: result.originalText,
        translatedText: result.translatedText,
        audioDataUrl,
        targetLang: currentConfig.targetLang || 'fa',
        timestamp: Date.now()
      }).catch((e) => console.warn('Could not forward translation result:', e));
    }
  } catch (err) {
    if (err.status === 429) {
      const wait = (err.retryAfterSec || 5) * 1000;
      cooldownUntil = Date.now() + wait;
      console.warn(`%c[OmniDub Offscreen ⏳] Rate limit hit. Pausing audio chunks for ${Math.round(wait / 1000)}s...`, 'color: #f59e0b; font-weight: bold;');
    } else {
      console.error('%c[OmniDub Offscreen ❌] Gemini translation error:', 'color: #ef4444;', err);
    }
  } finally {
    // 2.8s gap ensures no concurrent requests and prevents rate limits
    setTimeout(() => {
      isProcessingChunk = false;
    }, 2800);
  }
}

/**
 * Downsample audio buffer to 16000Hz
 */
function downsampleBuffer(buffer, sourceRate, targetRate) {
  if (sourceRate === targetRate) return buffer;
  const ratio = sourceRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : buffer[offsetBuffer];
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

/**
 * Encode Float32Array into base64 WAV (16-bit PCM mono)
 */
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Stop capturing and clean up resources
 */
function stopCapture() {
  isCapturing = false;

  if (processorNode) {
    try {
      processorNode.disconnect();
      processorNode.onaudioprocess = null;
    } catch (e) {}
    processorNode = null;
  }

  if (sourceNode) {
    try { sourceNode.disconnect(); } catch (e) {}
    sourceNode = null;
  }

  if (gainNode) {
    try { gainNode.disconnect(); } catch (e) {}
    gainNode = null;
  }

  if (audioContext && audioContext.state !== 'closed') {
    try { audioContext.close(); } catch (e) {}
    audioContext = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }

  pcmBuffer = [];
  bufferSampleCount = 0;
  cooldownUntil = 0;
  console.log('%c[OmniDub Offscreen] ⏹️ Audio capture stopped and offscreen resources released.', 'color: #94a3b8;');
}
