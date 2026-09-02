/**
 * OmniDub - Offscreen Audio Processor & Live Translation Engine
 * Supports:
 * 1. Real-time Live Speech-to-Speech streaming via `gemini-3.5-live-translate-preview` over WebSockets.
 * 2. Fallback Batch Chunking via Gemini 3 / 2.5 REST API.
 */

import { translateAudioChunk, synthesizeGeminiSpeech } from '../services/gemini_api.js';
import { getLanguageByCode } from '../services/language_list.js';
import { GeminiLiveTranslateClient } from '../services/gemini_live_client.js';

let audioContext = null;
let mediaStream = null;
let processorNode = null;
let sourceNode = null;
let gainNode = null;

let isCapturing = false;
let currentConfig = null;
let liveClient = null;
let streamPlayer = null;

// Streaming audio accumulation for 100ms 16kHz PCM chunks
let pcm100msBuffer = [];
let pcm100msSampleCount = 0;
const SAMPLES_PER_100MS = 1600; // 100ms at 16kHz

// Batch mode fallback variables
let batchBuffer = [];
let batchSampleCount = 0;
let isProcessingChunk = false;
let cooldownUntil = 0;
let lastTranslatedText = '';

/**
 * Continuous PCM Stream Player for 24kHz audio from Gemini Live
 */
class StreamAudioPlayer {
  constructor(ctx) {
    this.ctx = ctx;
    this.nextPlayTime = 0;
  }

  playChunk(base64Pcm24k) {
    try {
      const binary = atob(base64Pcm24k);
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      const startTime = Math.max(now, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;
    } catch (e) {
      console.warn('[OmniDub StreamPlayer] PCM chunk decode error:', e);
    }
  }

  reset() {
    this.nextPlayTime = 0;
  }
}

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
      if (gainNode) {
        const duck = Number(currentConfig.duckLevel ?? 0.05);
        gainNode.gain.value = duck;
      }
      console.log('%c[OmniDub Offscreen] ⚙️ Configuration updated:', 'color: #38bdf8;', currentConfig);
    }
    sendResponse({ success: true });
    return false;
  }
});

/**
 * Start capturing tab audio stream and launch Live Translate
 */
async function startCapture(streamId, config) {
  if (isCapturing) {
    stopCapture();
  }

  currentConfig = config || {};
  cooldownUntil = 0;
  isProcessingChunk = false;
  lastTranslatedText = '';
  pcm100msBuffer = [];
  pcm100msSampleCount = 0;

  const isLiveModel = !currentConfig.model || currentConfig.model.includes('live') || currentConfig.model.includes('gemini-3.5-live-translate');

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

    // Audio pass-through to user speakers with ducking applied directly in Web Audio pipeline
    gainNode = audioContext.createGain();
    const duckLevel = Number(currentConfig.duckLevel ?? 0.05);
    gainNode.gain.value = duckLevel; // Duck original video volume smoothly to 5%
    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    streamPlayer = new StreamAudioPlayer(audioContext);

    // Connect to Gemini Live Translation API if live model is selected (default)
    if (isLiveModel && currentConfig.apiKey) {
      try {
        liveClient = new GeminiLiveTranslateClient({
          apiKey: currentConfig.apiKey,
          targetLang: currentConfig.targetLang || 'fa',
          voiceName: currentConfig.aiVoice || 'Aoede',
          onAudioChunk: (base64Pcm24k) => {
            // Play continuous 24kHz stream
            streamPlayer.playChunk(base64Pcm24k);
          },
          onOutputTranscript: (text) => {
            console.log('%c[OmniDub Live 💬] Translated Transcript:', 'color: #10b981;', text);
            chrome.runtime.sendMessage({
              type: 'NEW_TRANSLATION_RESULT',
              translatedText: text,
              targetLang: currentConfig.targetLang || 'fa',
              timestamp: Date.now()
            }).catch(() => {});
          },
          onInputTranscript: (text) => {
            chrome.runtime.sendMessage({
              type: 'NEW_ORIGINAL_TRANSCRIPT',
              originalText: text
            }).catch(() => {});
          },
          onError: (err) => {
            console.error('[OmniDub Live] Live translation error:', err);
          },
          onClose: () => {
            console.log('[OmniDub Live] Live session ended.');
          }
        });

        await liveClient.connect();
        console.log('%c[OmniDub Offscreen] 🌟 Gemini Live Translate Pipeline Active!', 'color: #10b981; font-weight: bold;');
      } catch (liveErr) {
        console.warn('%c[OmniDub Offscreen ⚠️] Could not start Live Translate WebSocket, falling back to batch:', 'color: #f59e0b;', liveErr);
        liveClient = null;
      }
    }

    const sourceSampleRate = audioContext.sampleRate;

    // Frame receiver from AudioWorklet or ScriptProcessor
    const onAudioFrame = (frameData) => {
      if (!isCapturing) return;

      // Mode 1: Live WebSocket Streaming (100ms chunks at 16kHz)
      if (liveClient && liveClient.isSetupComplete) {
        // Downsample frame to 16kHz
        const downsampled = downsampleBuffer(frameData, sourceSampleRate, 16000);
        pcm100msBuffer.push(downsampled);
        pcm100msSampleCount += downsampled.length;

        if (pcm100msSampleCount >= SAMPLES_PER_100MS) {
          const merged = new Float32Array(pcm100msSampleCount);
          let offset = 0;
          for (const c of pcm100msBuffer) {
            merged.set(c, offset);
            offset += c.length;
          }
          pcm100msBuffer = [];
          pcm100msSampleCount = 0;

          // Convert Float32Array to 16-bit PCM (little-endian)
          const pcm16Base64 = float32ToPcm16Base64(merged);
          liveClient.sendAudioChunk(pcm16Base64);
        }
        return;
      }

      // Mode 2: Batch Chunker Fallback
      batchBuffer.push(frameData);
      batchSampleCount += frameData.length;
      const minBatchSamples = Math.round(sourceSampleRate * 3.8);
      if (batchSampleCount >= minBatchSamples && !isProcessingChunk) {
        processBatchChunk(sourceSampleRate);
      }
    };

    try {
      const workletUrl = chrome.runtime.getURL('offscreen/audio_processor.js');
      await audioContext.audioWorklet.addModule(workletUrl);
      const workletNode = new AudioWorkletNode(audioContext, 'omnidub-audio-processor');
      workletNode.port.onmessage = (e) => {
        if (e.data) onAudioFrame(e.data);
      };
      sourceNode.connect(workletNode);
      processorNode = workletNode;
      console.log('%c[OmniDub Offscreen] 🚀 High-performance AudioWorkletNode active.', 'color: #10b981; font-weight: bold;');
    } catch (workletErr) {
      console.warn('%c[OmniDub Offscreen ⚠️] AudioWorklet fallback to ScriptProcessor:', 'color: #f59e0b;', workletErr);
      const bufferSize = 4096;
      processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        onAudioFrame(new Float32Array(inputData));
      };
      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);
    }

    isCapturing = true;
    console.log('%c[OmniDub Offscreen] ✅ Audio stream pipeline initialized successfully.', 'color: #10b981; font-weight: bold;');
  } catch (err) {
    console.error('%c[OmniDub Offscreen ❌] Failed to capture audio stream in offscreen:', 'color: #ef4444; font-weight: bold;', err);
    stopCapture();
    throw err;
  }
}

/**
 * Convert Float32Array to 16-bit linear PCM base64 (little-endian)
 */
function float32ToPcm16Base64(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Fallback: Process batch chunk via REST API
 */
async function processBatchChunk(sourceSampleRate) {
  if (batchBuffer.length === 0 || isProcessingChunk) return;

  isProcessingChunk = true;
  const totalLength = batchSampleCount;
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of batchBuffer) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  batchBuffer = [];
  batchSampleCount = 0;

  const downsampled = downsampleBuffer(merged, sourceSampleRate, 16000);
  const wavBase64 = encodeWAV(downsampled, 16000);
  const langInfo = getLanguageByCode(currentConfig.targetLang || 'fa');
  const targetLangName = langInfo ? langInfo.name : 'Persian';

  try {
    const result = await translateAudioChunk({
      base64Audio: wavBase64,
      mimeType: 'audio/wav',
      targetLangName,
      apiKey: currentConfig.apiKey,
      model: currentConfig.model || 'gemini-3.7-flash'
    });

    if (result && result.hasSpeech && result.translatedText) {
      const cleanText = result.translatedText.trim();
      if (cleanText !== lastTranslatedText) {
        lastTranslatedText = cleanText;
        chrome.runtime.sendMessage({
          type: 'NEW_TRANSLATION_RESULT',
          originalText: result.originalText,
          translatedText: cleanText,
          targetLang: currentConfig.targetLang || 'fa',
          timestamp: Date.now()
        }).catch(() => {});

        if (currentConfig.dubbedAudio !== false) {
          const audioDataUrl = await synthesizeGeminiSpeech({
            text: cleanText,
            apiKey: currentConfig.apiKey,
            voiceName: currentConfig.aiVoice || 'Aoede',
            ttsModel: currentConfig.ttsModel || 'gemini-2.5-flash-preview-tts'
          }).catch(() => null);

          if (audioDataUrl) {
            chrome.runtime.sendMessage({
              type: 'PLAY_DUBBED_AUDIO_CHUNK',
              translatedText: cleanText,
              audioDataUrl,
              targetLang: currentConfig.targetLang || 'fa'
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.warn('[OmniDub Offscreen] Batch fallback error:', err);
  } finally {
    isProcessingChunk = false;
  }
}

/**
 * Downsample audio buffer to target rate
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

  if (liveClient) {
    liveClient.disconnect();
    liveClient = null;
  }

  if (streamPlayer) {
    streamPlayer.reset();
    streamPlayer = null;
  }

  if (processorNode) {
    try {
      if (processorNode.port) {
        processorNode.port.postMessage({ paused: true });
      }
      processorNode.disconnect();
      if (processorNode.onaudioprocess) {
        processorNode.onaudioprocess = null;
      }
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

  pcm100msBuffer = [];
  pcm100msSampleCount = 0;
  batchBuffer = [];
  batchSampleCount = 0;
  cooldownUntil = 0;
  isProcessingChunk = false;
  lastTranslatedText = '';
  console.log('%c[OmniDub Offscreen] ⏹️ Audio capture stopped and offscreen resources released.', 'color: #94a3b8;');
}
