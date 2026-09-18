/**
 * OmniDub - Service Worker (Background Script)
 * Manifest V3 Core Orchestrator.
 * Manages tab audio capture, offscreen lifecycle, TTS audio ducking, quota, and state locking.
 */

import { QuotaManager } from '../services/quota_manager.js';
import { ttsEngine } from '../services/tts_engine.js';
import { sessionRecorder } from '../utils/audio_recorder.js';
import { getLanguageByCode } from '../services/language_list.js';

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';

// Initialize session state on service worker startup
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.session.set({
    recordingState: 'idle', // 'idle' | 'starting' | 'recording' | 'stopping'
    activeTabId: null
  });
  console.log('%c[OmniDub SW] 🚀 Extension installed and session state initialized.', 'color: #818cf8; font-weight: bold;');
});

/**
 * Configure TTS Ducking Callbacks for fallback TTS
 */
ttsEngine.setCallbacks({
  onStart: async () => {
    const { activeTabId } = await chrome.storage.session.get(['activeTabId']);
    if (activeTabId) {
      console.log('%c[OmniDub SW] Fallback TTS started. Sending ducking start to tab...', 'color: #f59e0b;');
      chrome.tabs.sendMessage(activeTabId, {
        type: 'START_AUDIO_DUCKING',
        duckLevel: 0.2
      }).catch(() => {});
    }
  },
  onEnd: async () => {
    const { activeTabId } = await chrome.storage.session.get(['activeTabId']);
    if (activeTabId) {
      console.log('%c[OmniDub SW] Fallback TTS finished. Sending ducking restore to tab...', 'color: #f59e0b;');
      chrome.tabs.sendMessage(activeTabId, {
        type: 'END_AUDIO_DUCKING'
      }).catch(() => {});
    }
  }
});

/**
 * Main Message Router
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'GET_RECORDING_STATE': {
        const { recordingState = 'idle' } = await chrome.storage.session.get(['recordingState']);
        sendResponse({ state: recordingState });
        break;
      }

      case 'START_RECORDING': {
        console.log('%c[OmniDub SW] 🎬 Received START_RECORDING request with config:', 'color: #6366f1;', message.config);
        const result = await handleStartRecording(message.config);
        sendResponse(result);
        break;
      }

      case 'STOP_RECORDING': {
        console.log('%c[OmniDub SW] 🛑 Received STOP_RECORDING request', 'color: #ef4444;');
        const result = await handleStopRecording();
        sendResponse(result);
        break;
      }

      case 'NEW_TRANSLATION_RESULT': {
        await handleTranslationResult(message);
        sendResponse({ processed: true });
        break;
      }

      case 'PLAY_DUBBED_AUDIO_CHUNK': {
        const { activeTabId, sessionConfig } = await chrome.storage.session.get(['activeTabId', 'sessionConfig']);
        if (activeTabId && (!sessionConfig || sessionConfig.dubbedAudio !== false)) {
          chrome.tabs.sendMessage(activeTabId, {
            type: 'PLAY_DUBBED_AUDIO',
            translatedText: message.translatedText,
            audioDataUrl: message.audioDataUrl,
            targetLang: message.targetLang,
            volume: (sessionConfig?.volume ?? 95) / 100,
            rate: sessionConfig?.speed ?? 1.0,
            voiceUri: sessionConfig?.voiceUri || 'auto'
          }).catch(() => {});
        }
        sendResponse({ forwarded: true });
        break;
      }

      case 'NEW_ORIGINAL_TRANSCRIPT': {
        const { activeTabId } = await chrome.storage.session.get(['activeTabId']);
        if (activeTabId) {
          chrome.tabs.sendMessage(activeTabId, {
            type: 'DISPLAY_SUBTITLE',
            originalText: message.originalText
          }).catch(() => {});
        }
        sendResponse({ received: true });
        break;
      }

      case 'SETTINGS_CHANGED': {
        console.log('%c[OmniDub SW] ⚙️ Settings updated:', 'color: #38bdf8;', message.settings);
        await handleSettingsUpdate(message.settings);
        sendResponse({ updated: true });
        break;
      }

      default:
        sendResponse({ unknown: true });
    }
  })();
  return true; // Keep message channel open for async response
});

/**
 * Start tab capture, launch offscreen, configure ducking and quota timer
 */
async function handleStartRecording(config = {}) {
  const { recordingState = 'idle' } = await chrome.storage.session.get(['recordingState']);

  // State locking against double clicks
  if (recordingState === 'starting' || recordingState === 'stopping') {
    return { error: 'Operation already in progress.' };
  }

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    return { error: 'No active tab found to capture.' };
  }

  // Fetch API key and model
  const stored = await chrome.storage.local.get(['geminiApiKey', 'geminiModel']);
  const apiKey = stored.geminiApiKey;
  const model = stored.geminiModel || config.model || 'gemini-2.5-flash';

  if (!apiKey) {
    return { error: 'Please set your Google Gemini API Key first.' };
  }

  console.log(`%c[OmniDub SW] 🎯 Targeting Tab ID: ${tab.id} (${tab.title || tab.url}) using model: ${model}`, 'color: #10b981;');

  await chrome.storage.session.set({
    recordingState: 'starting',
    activeTabId: tab.id,
    sessionConfig: { ...config, model }
  });
  broadcastState('starting');

  try {
    // 1. Ensure Offscreen document exists
    await ensureOffscreenDocument();

    // 2. Obtain tab capture media stream ID
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    console.log(`%c[OmniDub SW] 🔑 Captured tab MediaStream ID: ${streamId}`, 'color: #3b82f6;');

    // 3. Ensure content scripts are injected in target tab
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_scripts/subtitle_overlay.js']
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content_scripts/subtitle_overlay.css']
      });
      console.log('%c[OmniDub SW] 💉 Injected subtitle & dubbing scripts into tab.', 'color: #10b981;');
    } catch (e) {
      console.log('%c[OmniDub SW] Note: Script already injected or tab is restricted.', 'color: #94a3b8;');
    }

    // 4. Send capture instruction to offscreen document (with handshake retry)
    let offscreenStarted = false;
    let lastError = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'START_OFFSCREEN_CAPTURE',
          streamId,
          config: {
            ...config,
            apiKey,
            model
          }
        });
        if (response && response.error) {
          throw new Error(response.error);
        }
        offscreenStarted = true;
        break;
      } catch (e) {
        lastError = e;
        // Wait 120ms for offscreen document scripts to load
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    if (!offscreenStarted) {
      throw lastError || new Error('Offscreen document failed to initialize.');
    }

    // 5. Update session recorder if recording is enabled
    if (config.record) {
      sessionRecorder.start();
    }

    // 6. Set active badge & alarms
    await chrome.action.setBadgeText({ text: 'LIVE' });
    await chrome.action.setBadgeBackgroundColor({ color: '#10B981' });

    await chrome.storage.session.set({ recordingState: 'recording' });
    broadcastState('recording');

    console.log('%c[OmniDub SW] ✅ Dubbing session is now LIVE!', 'color: #10b981; font-weight: bold;');
    return { success: true };
  } catch (err) {
    console.error('%c[OmniDub SW ❌] Failed to start dubbing session:', 'color: #ef4444; font-weight: bold;', err);
    await handleStopRecording();
    return { error: err.message || 'Failed to start stream' };
  }
}

/**
 * Stop dubbing, release streams, close offscreen, export files if requested
 */
async function handleStopRecording() {
  await chrome.storage.session.set({ recordingState: 'stopping' });
  broadcastState('stopping');

  try {
    // 1. Stop offscreen audio processing
    try {
      await chrome.runtime.sendMessage({ type: 'STOP_OFFSCREEN_CAPTURE' });
    } catch (e) {}

    // 2. Stop any active TTS
    ttsEngine.stop();

    // 3. Close offscreen document to free memory
    await closeOffscreenDocument();

    // 4. Clear badge
    await chrome.action.setBadgeText({ text: '' });

    // 5. Notify content script to restore volume and hide subtitles
    const { activeTabId, sessionConfig } = await chrome.storage.session.get(['activeTabId', 'sessionConfig']);
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { type: 'CLEAR_SUBTITLES' }).catch(() => {});
    }

    // 6. If user chose to record, export SRT file
    if (sessionConfig && sessionConfig.record) {
      const exportResult = sessionRecorder.exportSRT(sessionConfig.bilingual);
      if (exportResult && exportResult.url && activeTabId) {
        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: (url, filename) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
          },
          args: [exportResult.url, 'OmniDub_Subtitles.srt']
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('%c[OmniDub SW ⚠️] Error during stop cleanup:', 'color: #f59e0b;', err);
  } finally {
    await chrome.storage.session.set({
      recordingState: 'idle',
      activeTabId: null
    });
    broadcastState('idle');
    console.log('%c[OmniDub SW] ⏹️ Dubbing session stopped cleanly.', 'color: #6366f1;');
  }

  return { success: true };
}

/**
 * Handle new translation chunk received from offscreen
 */
async function handleTranslationResult(data) {
  const { activeTabId, sessionConfig } = await chrome.storage.session.get(['activeTabId', 'sessionConfig']);
  const { originalText, translatedText, audioDataUrl, targetLang } = data;

  if (!translatedText) return;

  console.log('%c[OmniDub SW 🤖] Translation Result Received:', 'color: #818cf8; font-weight: bold;', {
    original: originalText,
    translated: translatedText,
    hasAiAudio: Boolean(audioDataUrl),
    targetLang
  });

  // 1. Add to session recorder
  if (sessionConfig && sessionConfig.record) {
    sessionRecorder.addSubtitle(originalText, translatedText);
  }

  // 2. Send subtitles to active tab content script
  if (activeTabId && (!sessionConfig || sessionConfig.subtitles !== false)) {
    chrome.tabs.sendMessage(activeTabId, {
      type: 'DISPLAY_SUBTITLE',
      originalText,
      translatedText,
      targetLang
    }).catch((err) => {
      console.warn('%c[OmniDub SW] Could not send DISPLAY_SUBTITLE to tab:', 'color: #f59e0b;', err);
    });
  }

  // 3. Play dubbed audio directly in tab (where speech synthesis and video volume ducking are live!)
  if (!sessionConfig || sessionConfig.dubbedAudio !== false) {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        type: 'PLAY_DUBBED_AUDIO',
        translatedText,
        audioDataUrl,
        originalText,
        targetLang,
        volume: (sessionConfig?.volume ?? 90) / 100,
        rate: sessionConfig?.speed ?? 1.0,
        voiceUri: sessionConfig?.voiceUri || 'auto'
      }).then(() => {
        console.log('%c[OmniDub SW 🔊] Dispatched PLAY_DUBBED_AUDIO to active tab ' + activeTabId, 'color: #10b981;');
      }).catch((err) => {
        console.warn('%c[OmniDub SW ⚠️] Tab speech unreachable, trying fallback chrome.tts:', 'color: #f59e0b;', err);
        const langObj = getLanguageByCode(targetLang);
        const ttsCode = langObj ? langObj.tts : 'fa-IR';
        ttsEngine.speak(translatedText, {
          lang: ttsCode,
          volume: (sessionConfig?.volume ?? 90) / 100,
          rate: sessionConfig?.speed ?? 1.0
        });
      });
    } else {
      const langObj = getLanguageByCode(targetLang);
      const ttsCode = langObj ? langObj.tts : 'fa-IR';
      ttsEngine.speak(translatedText, {
        lang: ttsCode,
        volume: (sessionConfig?.volume ?? 90) / 100,
        rate: sessionConfig?.speed ?? 1.0
      });
    }
  }
}

/**
 * Handle settings updates live while streaming
 */
async function handleSettingsUpdate(newSettings) {
  const { activeTabId, sessionConfig } = await chrome.storage.session.get(['activeTabId', 'sessionConfig']);
  const updated = { ...sessionConfig, ...newSettings };
  await chrome.storage.session.set({ sessionConfig: updated });

  // Update offscreen config
  chrome.runtime.sendMessage({
    type: 'UPDATE_OFFSCREEN_CONFIG',
    config: updated
  }).catch(() => {});

  // Update content script overlay config
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      type: 'UPDATE_CONTENT_CONFIG',
      subtitles: updated.subtitles,
      bilingual: updated.bilingual
    }).catch(() => {});
  }
}

/**
 * Broadcast state changes to popup
 */
function broadcastState(state) {
  chrome.runtime.sendMessage({
    type: 'RECORDING_STATE_CHANGED',
    state
  }).catch(() => {});
}

/**
 * Ensure an Offscreen Document is running
 */
async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;

  console.log('%c[OmniDub SW] 📄 Creating offscreen document...', 'color: #38bdf8;');
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['USER_MEDIA'],
    justification: 'Capture and process tab audio for live dubbing'
  });
}

/**
 * Close Offscreen Document
 */
async function closeOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    console.log('%c[OmniDub SW] 🗑️ Closing offscreen document...', 'color: #94a3b8;');
    await chrome.offscreen.closeDocument();
  }
}
