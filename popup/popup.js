/**
 * OmniDub - Popup UI Logic
 * Manifest V3 Compliant - Controls live dubbing, language selection, settings & API Key modal.
 */

import { SUPPORTED_LANGUAGES, filterLanguages, getLanguageByCode } from '../services/language_list.js';

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const apiStatusIndicator = document.getElementById('api-status-indicator');
const missingKeyAlert = document.getElementById('missing-key-alert');
const btnQuickConfig = document.getElementById('btn-quick-config');

// Language Dropdown Elements
const dropdownTrigger = document.getElementById('dropdown-trigger');
const dropdownPanel = document.getElementById('dropdown-panel');
const languageSearch = document.getElementById('language-search');
const languageList = document.getElementById('language-list');
const selectedLangFlag = document.getElementById('selected-lang-flag');
const selectedLangName = document.getElementById('selected-lang-name');
const selectedLangCode = document.getElementById('selected-lang-code');

// Action Elements
const btnToggleDub = document.getElementById('btn-toggle-dub');
const actionIcon = document.getElementById('action-icon');
const actionText = document.getElementById('action-text');
const audioWave = document.getElementById('audio-wave');

// Toggles & Sliders
const toggleDubbedAudio = document.getElementById('toggle-dubbed-audio');
const sliderVolume = document.getElementById('slider-volume');
const valVolume = document.getElementById('val-volume');
const sliderSpeed = document.getElementById('slider-speed');
const valSpeed = document.getElementById('val-speed');
const selectTtsVoice = document.getElementById('select-tts-voice');
const toggleSubtitles = document.getElementById('toggle-subtitles');
const toggleBilingual = document.getElementById('toggle-bilingual');
const toggleRecord = document.getElementById('toggle-record');
const toggleAllSites = document.getElementById('toggle-all-sites');

// Quota Elements
const quotaRemainingText = document.getElementById('quota-remaining-text');
const quotaProgressBar = document.getElementById('quota-progress-bar');
const quotaResetTimer = document.getElementById('quota-reset-timer');

// Modal Elements
const btnApiModal = document.getElementById('btn-api-modal');
const apiModal = document.getElementById('api-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const apiKeyForm = document.getElementById('api-key-form');
const inputApiKey = document.getElementById('input-api-key');
const selectModel = document.getElementById('select-model');
const selectTtsModel = document.getElementById('select-tts-model');
const selectChunkDuration = document.getElementById('select-chunk-duration');
const selectDuckLevel = document.getElementById('select-duck-level');
const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
const btnTestKey = document.getElementById('btn-test-key');
const testKeyStatus = document.getElementById('test-key-status');

// Local State
let currentLang = 'fa';
let recordingState = 'idle'; // 'idle' | 'starting' | 'recording' | 'stopping'
let hasApiKey = false;
const MAX_DAILY_SECONDS = 45 * 60; // 45 Minutes

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoredSettings();
  setupLanguageDropdown();
  setupVoiceSelector();
  setupEventListeners();
  await syncRecordingState();
  updateQuotaUI();
});

/**
 * Load persisted user settings from chrome.storage.local
 */
async function loadStoredSettings() {
  const data = await chrome.storage.local.get([
    'geminiApiKey',
    'geminiModel',
    'targetLang',
    'dubbedAudio',
    'volume',
    'speed',
    'voiceUri',
    'subtitles',
    'bilingual',
    'record',
    'allSites',
    'quotaUsedSeconds',
    'quotaLastReset'
  ]);

  // API Key & Model
  if (data.geminiApiKey && data.geminiApiKey.trim().length > 0) {
    hasApiKey = true;
    inputApiKey.value = data.geminiApiKey;
    apiStatusIndicator.classList.add('configured');
    apiStatusIndicator.title = 'API Key Configured';
    missingKeyAlert.style.display = 'none';
  } else {
    hasApiKey = false;
    apiStatusIndicator.classList.remove('configured');
    apiStatusIndicator.title = 'API Key Required';
    missingKeyAlert.style.display = 'flex';
  }

  if (data.geminiModel) {
    selectModel.value = data.geminiModel;
  }

  if (data.ttsModel && selectTtsModel) {
    selectTtsModel.value = data.ttsModel;
  }

  if (data.chunkDuration && selectChunkDuration) {
    selectChunkDuration.value = data.chunkDuration;
  }

  if (data.duckLevel && selectDuckLevel) {
    selectDuckLevel.value = data.duckLevel;
  }

  // Selected Language
  if (data.targetLang) {
    currentLang = data.targetLang;
  }
  updateSelectedLanguageUI(currentLang);

  // Toggles
  if (typeof data.dubbedAudio === 'boolean') toggleDubbedAudio.checked = data.dubbedAudio;
  if (typeof data.subtitles === 'boolean') toggleSubtitles.checked = data.subtitles;
  if (typeof data.bilingual === 'boolean') toggleBilingual.checked = data.bilingual;
  if (typeof data.record === 'boolean') toggleRecord.checked = data.record;
  if (typeof data.allSites === 'boolean') toggleAllSites.checked = data.allSites;

  // Sliders
  if (data.volume) {
    sliderVolume.value = data.volume;
    valVolume.textContent = `${data.volume}%`;
  }
  if (data.speed) {
    sliderSpeed.value = data.speed;
    valSpeed.textContent = `${Number(data.speed).toFixed(1)}x`;
  }
}

/**
 * Populate Voice Selector dropdown with Studio Neural AI voices & available browser voices
 */
function setupVoiceSelector() {
  if (!selectTtsVoice) return;

  const populate = () => {
    chrome.storage.local.get(['voiceUri', 'aiVoice'], (data) => {
      const savedUri = data.voiceUri || 'gemini:Aoede';

      selectTtsVoice.innerHTML = `
        <optgroup label="Studio Neural AI Voices (Fluent Persian & 50+ Languages)">
          <option value="gemini:Aoede" ${savedUri === 'gemini:Aoede' ? 'selected' : ''}>Aoede (Studio AI - Warm Female) [Recommended]</option>
          <option value="gemini:Kore" ${savedUri === 'gemini:Kore' ? 'selected' : ''}>Kore (Studio AI - Clear Female)</option>
          <option value="gemini:Puck" ${savedUri === 'gemini:Puck' ? 'selected' : ''}>Puck (Studio AI - Energetic Male)</option>
          <option value="gemini:Charon" ${savedUri === 'gemini:Charon' ? 'selected' : ''}>Charon (Studio AI - Deep Male)</option>
          <option value="gemini:Fenrir" ${savedUri === 'gemini:Fenrir' ? 'selected' : ''}>Fenrir (Studio AI - Expressive Male)</option>
          <option value="gemini:Leda" ${savedUri === 'gemini:Leda' ? 'selected' : ''}>Leda (Studio AI - Professional Female)</option>
          <option value="gemini:Zephyr" ${savedUri === 'gemini:Zephyr' ? 'selected' : ''}>Zephyr (Studio AI - Smooth Female)</option>
          <option value="gemini:Orus" ${savedUri === 'gemini:Orus' ? 'selected' : ''}>Orus (Studio AI - Confident Male)</option>
        </optgroup>
      `;

      if ('speechSynthesis' in window) {
        const browserVoices = window.speechSynthesis.getVoices();
        if (browserVoices.length > 0) {
          const group = document.createElement('optgroup');
          group.label = 'Browser System Voices (Offline)';
          browserVoices.forEach((v) => {
            const opt = document.createElement('option');
            opt.value = v.voiceURI || v.name;
            opt.textContent = `${v.name} (${v.lang})${v.default ? ' — Default' : ''}`;
            if (opt.value === savedUri) opt.selected = true;
            group.appendChild(opt);
          });
          selectTtsVoice.appendChild(group);
        }
      }
    });
  };

  populate();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populate;
  }

  selectTtsVoice.addEventListener('change', async (e) => {
    const val = e.target.value;
    const aiVoice = val.startsWith('gemini:') ? val.replace('gemini:', '') : 'Aoede';
    await chrome.storage.local.set({ voiceUri: val, aiVoice });
    broadcastSettings({ voiceUri: val, aiVoice });
  });
}

/**
 * Sync status with background service worker
 */
async function syncRecordingState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' });
    if (response && response.state) {
      applyRecordingState(response.state);
    }
  } catch (e) {
    applyRecordingState('idle');
  }
}

/**
 * Update UI for current recording state
 */
function applyRecordingState(state) {
  recordingState = state;

  btnToggleDub.classList.remove('btn-start', 'btn-stop');
  statusBadge.classList.remove('live', 'connecting');

  if (state === 'recording') {
    btnToggleDub.classList.add('btn-stop');
    btnToggleDub.disabled = false;
    actionIcon.classList.add('hidden');
    audioWave.classList.remove('hidden');
    actionText.textContent = 'Stop Live Dubbing';
    statusBadge.textContent = 'Live Dubbing';
    statusBadge.classList.add('live');
  } else if (state === 'starting') {
    btnToggleDub.classList.add('btn-start');
    btnToggleDub.disabled = true;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = 'Connecting...';
    statusBadge.textContent = 'Connecting...';
    statusBadge.classList.add('connecting');
  } else if (state === 'stopping') {
    btnToggleDub.classList.add('btn-stop');
    btnToggleDub.disabled = true;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = 'Stopping...';
    statusBadge.textContent = 'Finishing...';
  } else {
    // idle
    btnToggleDub.classList.add('btn-start');
    btnToggleDub.disabled = false;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = 'Start Live Dubbing';
    statusBadge.textContent = 'Ready';
  }
}

/**
 * Setup custom searchable language dropdown
 */
function setupLanguageDropdown() {
  renderLanguageList(SUPPORTED_LANGUAGES);

  dropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
    toggleDropdown(!isExpanded);
  });

  languageSearch.addEventListener('input', (e) => {
    const filtered = filterLanguages(e.target.value);
    renderLanguageList(filtered);
  });

  dropdownPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    toggleDropdown(false);
  });
}

function toggleDropdown(show) {
  if (show) {
    dropdownPanel.classList.remove('hidden');
    dropdownTrigger.setAttribute('aria-expanded', 'true');
    languageSearch.value = '';
    renderLanguageList(SUPPORTED_LANGUAGES);
    setTimeout(() => languageSearch.focus(), 50);
  } else {
    dropdownPanel.classList.add('hidden');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
  }
}

function renderLanguageList(languages) {
  languageList.innerHTML = '';
  if (languages.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'lang-item';
    emptyLi.style.justifyContent = 'center';
    emptyLi.style.color = '#64748b';
    emptyLi.textContent = 'No language found';
    languageList.appendChild(emptyLi);
    return;
  }

  languages.forEach((lang) => {
    const li = document.createElement('li');
    li.className = `lang-item ${lang.code === currentLang ? 'selected' : ''}`;
    li.setAttribute('role', 'option');
    li.setAttribute('data-code', lang.code);

    li.innerHTML = `
      <div class="lang-item-content">
        <span class="lang-flag">${lang.flag}</span>
        <div class="lang-item-meta">
          <span class="lang-item-title">${lang.name}</span>
          <span class="lang-item-sub">${lang.nativeName}</span>
        </div>
      </div>
      ${lang.code === currentLang ? '<span class="lang-item-check">✓</span>' : `<span class="lang-code">${lang.code}</span>`}
    `;

    li.addEventListener('click', async () => {
      currentLang = lang.code;
      updateSelectedLanguageUI(lang.code);
      toggleDropdown(false);
      await chrome.storage.local.set({ targetLang: lang.code });
      
      chrome.runtime.sendMessage({
        type: 'SETTINGS_CHANGED',
        settings: { targetLang: lang.code }
      }).catch(() => {});
    });

    languageList.appendChild(li);
  });
}

function updateSelectedLanguageUI(code) {
  const lang = getLanguageByCode(code);
  selectedLangFlag.textContent = lang.flag;
  selectedLangName.textContent = `${lang.name} (${lang.nativeName})`;
  selectedLangCode.textContent = lang.code;
}

/**
 * Setup event listeners for switches, sliders, buttons & modals
 */
function setupEventListeners() {
  // Start / Stop Dubbing Button
  btnToggleDub.addEventListener('click', async () => {
    if (!hasApiKey) {
      openApiModal('Please configure your Gemini API Key first to enable live AI dubbing.');
      return;
    }

    if (recordingState === 'idle') {
      applyRecordingState('starting');
      try {
        const stored = await chrome.storage.local.get(['voiceUri', 'aiVoice', 'geminiModel', 'ttsModel', 'chunkDuration', 'duckLevel']);
        const response = await chrome.runtime.sendMessage({
          type: 'START_RECORDING',
          config: {
            targetLang: currentLang,
            model: stored.geminiModel || selectModel.value || 'gemini-3.5-live-translate-preview',
            ttsModel: stored.ttsModel || selectTtsModel?.value || 'gemini-2.5-flash-preview-tts',
            aiVoice: stored.aiVoice || (stored.voiceUri?.startsWith('gemini:') ? stored.voiceUri.replace('gemini:', '') : 'Aoede'),
            chunkDuration: Number(stored.chunkDuration || selectChunkDuration?.value || 2.4),
            duckLevel: Number(stored.duckLevel || selectDuckLevel?.value || 0.05),
            dubbedAudio: toggleDubbedAudio.checked,
            subtitles: toggleSubtitles.checked,
            bilingual: toggleBilingual.checked,
            volume: Number(sliderVolume.value),
            speed: Number(sliderSpeed.value),
            voiceUri: stored.voiceUri || 'gemini:Aoede',
            record: toggleRecord.checked,
            allSites: toggleAllSites.checked
          }
        });

        if (response && response.error) {
          alert(`Could not start capture: ${response.error}`);
          applyRecordingState('idle');
        } else {
          applyRecordingState('recording');
        }
      } catch (err) {
        console.error('Failed to start recording:', err);
        applyRecordingState('idle');
      }
    } else if (recordingState === 'recording') {
      applyRecordingState('stopping');
      try {
        await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
      } catch (err) {
        console.error('Failed to stop recording:', err);
      } finally {
        applyRecordingState('idle');
      }
    }
  });

  // Sliders
  sliderVolume.addEventListener('input', async (e) => {
    const val = e.target.value;
    valVolume.textContent = `${val}%`;
    await chrome.storage.local.set({ volume: Number(val) });
    broadcastSettings({ volume: Number(val) });
  });

  sliderSpeed.addEventListener('input', async (e) => {
    const val = Number(e.target.value).toFixed(1);
    valSpeed.textContent = `${val}x`;
    await chrome.storage.local.set({ speed: Number(val) });
    broadcastSettings({ speed: Number(val) });
  });

  // Toggles
  toggleDubbedAudio.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ dubbedAudio: e.target.checked });
    broadcastSettings({ dubbedAudio: e.target.checked });
  });

  toggleSubtitles.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ subtitles: e.target.checked });
    broadcastSettings({ subtitles: e.target.checked });
  });

  toggleBilingual.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ bilingual: e.target.checked });
    broadcastSettings({ bilingual: e.target.checked });
  });

  toggleRecord.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ record: e.target.checked });
    broadcastSettings({ record: e.target.checked });
  });

  toggleAllSites.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ allSites: e.target.checked });
    broadcastSettings({ allSites: e.target.checked });
  });

  if (selectDuckLevel) {
    selectDuckLevel.addEventListener('change', async (e) => {
      const val = Number(e.target.value);
      await chrome.storage.local.set({ duckLevel: val });
      broadcastSettings({ duckLevel: val });
    });
  }

  // Gemini API Key Modal
  btnApiModal.addEventListener('click', () => openApiModal());
  btnQuickConfig.addEventListener('click', () => openApiModal());
  btnCloseModal.addEventListener('click', () => apiModal.close());

  apiModal.addEventListener('click', (e) => {
    if (e.target === apiModal) apiModal.close();
  });

  btnToggleKeyVisibility.addEventListener('click', () => {
    const isPassword = inputApiKey.type === 'password';
    inputApiKey.type = isPassword ? 'text' : 'password';
  });

  // Test Connection
  btnTestKey.addEventListener('click', async () => {
    const key = inputApiKey.value.trim();
    if (!key) {
      showTestStatus('Please enter an API Key first.', 'error');
      return;
    }

    const model = selectModel.value;

    // Test Gemini Live models via WebSocket
    if (model.includes('live')) {
      showTestStatus(`Connecting to Gemini Live WebSocket for ${model}...`, 'testing');
      const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(key)}`;
      let wsResolved = false;

      try {
        const ws = new WebSocket(endpoint);

        ws.onopen = () => {
          ws.send(JSON.stringify({
            setup: {
              model: `models/${model}`,
              generationConfig: {
                responseModalities: ['AUDIO'],
                translationConfig: {
                  targetLanguageCode: 'fa',
                  echoTargetLanguage: true
                }
              }
            }
          }));
        };

        ws.onmessage = async (e) => {
          try {
            let text = e.data;
            if (text instanceof Blob) {
              text = await text.text();
            } else if (text instanceof ArrayBuffer) {
              text = new TextDecoder().decode(text);
            }
            const data = JSON.parse(text);
            console.log('%c[OmniDub WS Test Message]', 'color: #3b82f6;', data);
            if (data.setupComplete || data.setup_complete) {
              wsResolved = true;
              showTestStatus(`Live Stream Connected! ${model} is active and ready for real-time dubbing.`, 'success');
              ws.close(1000, 'Test completed');
            } else if (data.error) {
              wsResolved = true;
              showTestStatus(`Validation Error: ${data.error.message || JSON.stringify(data.error)}`, 'error');
              ws.close();
            }
          } catch (err) {
            console.warn('[OmniDub Test WS Parse Error]', err);
          }
        };

        ws.onerror = (e) => {
          if (!wsResolved) {
            showTestStatus(`Live WebSocket connection error. Please verify network/VPN.`, 'error');
          }
        };

        ws.onclose = (e) => {
          if (!wsResolved) {
            if (e.code === 1000) {
              // Code 1000 is WS_NORMAL_CLOSURE - connection and setup was clean!
              showTestStatus(`Live Stream Connected! ${model} is active and verified.`, 'success');
            } else {
              showTestStatus(`Live connection closed (Code ${e.code}: ${e.reason || 'Check API key permissions'})`, 'error');
            }
          }
        };

        setTimeout(() => {
          if (!wsResolved && ws.readyState === WebSocket.OPEN) {
            ws.close();
            showTestStatus('Connection timed out. Please check network/VPN.', 'error');
          }
        }, 7000);
      } catch (err) {
        showTestStatus(`WebSocket initialization error: ${err.message}`, 'error');
      }
      return;
    }

    // Test Standard REST Models
    showTestStatus(`Testing connection with ${model}...`, 'testing');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with "OK"' }] }]
        })
      });

      if (res.ok) {
        showTestStatus(`Connection successful! ${model} is active and responding.`, 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${res.status} Error`;
        showTestStatus(`Validation failed: ${msg}`, 'error');
      }
    } catch (err) {
      showTestStatus(`Network error: ${err.message}`, 'error');
    }
  });

  // Save Key & Model
  apiKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = inputApiKey.value.trim();
    const model = selectModel.value;
    const ttsModel = selectTtsModel ? selectTtsModel.value : 'gemini-2.5-flash-preview-tts';
    const chunkDuration = selectChunkDuration ? selectChunkDuration.value : '4.8';

    if (!key) return;

    await chrome.storage.local.set({
      geminiApiKey: key,
      geminiModel: model,
      ttsModel: ttsModel,
      chunkDuration: chunkDuration
    });

    hasApiKey = true;
    apiStatusIndicator.classList.add('configured');
    apiStatusIndicator.title = 'API Key Configured';
    missingKeyAlert.style.display = 'none';

    broadcastSettings({ model, ttsModel, chunkDuration });

    apiModal.close();
    showTestStatus('', '');
  });

  // Runtime listener for background messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'RECORDING_STATE_CHANGED') {
      applyRecordingState(message.state);
    } else if (message.type === 'QUOTA_UPDATED') {
      updateQuotaUI(message.usedSeconds);
    }
  });
}

function openApiModal(hint = '') {
  if (hint) {
    showTestStatus(hint, 'testing');
  } else {
    showTestStatus('', '');
  }
  apiModal.showModal();
}

function showTestStatus(text, statusClass) {
  if (!text) {
    testKeyStatus.classList.add('hidden');
    testKeyStatus.textContent = '';
    testKeyStatus.className = 'test-status hidden';
    return;
  }
  testKeyStatus.className = `test-status ${statusClass}`;
  testKeyStatus.textContent = text;
  testKeyStatus.classList.remove('hidden');
}

function broadcastSettings(settings) {
  chrome.runtime.sendMessage({
    type: 'SETTINGS_CHANGED',
    settings
  }).catch(() => {});
}

/**
 * Quota UI calculation and timer
 */
async function updateQuotaUI(providedSeconds) {
  let used = providedSeconds;
  if (typeof used !== 'number') {
    const data = await chrome.storage.local.get(['quotaUsedSeconds']);
    used = data.quotaUsedSeconds || 0;
  }

  const remaining = Math.max(0, MAX_DAILY_SECONDS - used);
  const remainingMins = Math.floor(remaining / 60);
  const remainingSecs = remaining % 60;

  quotaRemainingText.textContent = `${remainingMins}m ${remainingSecs}s remaining`;
  const pct = Math.max(0, Math.min(100, (remaining / MAX_DAILY_SECONDS) * 100));
  quotaProgressBar.style.width = `${pct}%`;

  if (pct < 15) {
    quotaProgressBar.style.background = '#ef4444';
  } else if (pct < 40) {
    quotaProgressBar.style.background = '#f59e0b';
  } else {
    quotaProgressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #6366f1 100%)';
  }

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diffMs = midnight - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  quotaResetTimer.textContent = `Resets in: ${hours}h ${mins}m`;
}
