/**
 * OmniDub - Popup UI Logic
 * Manifest V3 Compliant - Controls live dubbing, language selection, settings & API Key modal.
 * Fully Internationalized (English Default & Persian Full Support).
 */

import { SUPPORTED_LANGUAGES, filterLanguages, getLanguageByCode } from '../services/language_list.js';
import { t, applyTranslations } from '../services/i18n.js';

// DOM Elements - Header & Brand
const statusBadge = document.getElementById('status-badge');
const apiStatusIndicator = document.getElementById('api-status-indicator');
const missingKeyAlert = document.getElementById('missing-key-alert');
const btnQuickConfig = document.getElementById('btn-quick-config');
const btnLangEn = document.getElementById('btn-lang-en');
const btnLangFa = document.getElementById('btn-lang-fa');

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
const selectDuckLevel = document.getElementById('select-duck-level');
const toggleSubtitles = document.getElementById('toggle-subtitles');
const toggleBilingual = document.getElementById('toggle-bilingual');
const toggleRecord = document.getElementById('toggle-record');
const toggleAllSites = document.getElementById('toggle-all-sites');

// Modal Elements
const btnApiModal = document.getElementById('btn-api-modal');
const apiModal = document.getElementById('api-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const apiKeyForm = document.getElementById('api-key-form');
const inputApiKey = document.getElementById('input-api-key');
const selectModel = document.getElementById('select-model');
const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
const btnTestKey = document.getElementById('btn-test-key');
const testKeyStatus = document.getElementById('test-key-status');

// Local State
let uiLang = 'en'; // Default UI language is English
let targetDubLang = 'fa'; // Default target translation language is Persian
let recordingState = 'idle'; // 'idle' | 'starting' | 'recording' | 'stopping'
let hasApiKey = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoredSettings();
  setupLanguageSwitcher();
  setupLanguageDropdown();
  setupVoiceSelector();
  setupDuckLevelSelector();
  setupEventListeners();
  await syncRecordingState();
});

/**
 * Load persisted user settings from chrome.storage.local
 */
async function loadStoredSettings() {
  const data = await chrome.storage.local.get([
    'uiLang',
    'geminiApiKey',
    'geminiModel',
    'targetLang',
    'dubbedAudio',
    'volume',
    'speed',
    'voiceUri',
    'duckLevel',
    'subtitles',
    'bilingual',
    'record',
    'allSites'
  ]);

  // UI Language (Default to 'en')
  uiLang = data.uiLang || 'en';
  applyLocale(uiLang);

  // API Key & Model
  if (data.geminiApiKey && data.geminiApiKey.trim().length > 0) {
    hasApiKey = true;
    inputApiKey.value = data.geminiApiKey;
    apiStatusIndicator.classList.add('configured');
    apiStatusIndicator.title = uiLang === 'fa' ? 'کلید تنظیم شده است' : 'API Key Configured';
    missingKeyAlert.style.display = 'none';
  } else {
    hasApiKey = false;
    apiStatusIndicator.classList.remove('configured');
    apiStatusIndicator.title = uiLang === 'fa' ? 'کلید API مورد نیاز است' : 'API Key Required';
    missingKeyAlert.style.display = 'flex';
  }

  if (data.geminiModel && selectModel) {
    selectModel.value = data.geminiModel;
  }

  // Selected Target Dubbing Language
  if (data.targetLang) {
    targetDubLang = data.targetLang;
  }
  updateSelectedLanguageUI(targetDubLang);

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
 * Setup and switch UI locale between English and Persian
 */
function setupLanguageSwitcher() {
  btnLangEn.addEventListener('click', () => {
    if (uiLang !== 'en') {
      setLocale('en');
    }
  });

  btnLangFa.addEventListener('click', () => {
    if (uiLang !== 'fa') {
      setLocale('fa');
    }
  });
}

async function setLocale(lang) {
  uiLang = lang;
  await chrome.storage.local.set({ uiLang: lang });
  applyLocale(lang);
}

function applyLocale(lang) {
  // Update Switcher Active Button State
  if (lang === 'fa') {
    btnLangFa.classList.add('active');
    btnLangEn.classList.remove('active');
  } else {
    btnLangEn.classList.add('active');
    btnLangFa.classList.remove('active');
  }

  // Apply all static translations to HTML tags
  applyTranslations(lang);

  // Update dynamic elements
  setupVoiceSelector();
  setupDuckLevelSelector();
  applyRecordingState(recordingState);

  // Update API status indicator tooltip
  if (hasApiKey) {
    apiStatusIndicator.title = lang === 'fa' ? 'کلید API تنظیم شده است' : 'API Key Configured';
  } else {
    apiStatusIndicator.title = lang === 'fa' ? 'کلید API مورد نیاز است' : 'API Key Required';
  }
}

/**
 * Populate Voice Selector dropdown with Studio Neural AI voices & offline browser voices
 */
function setupVoiceSelector() {
  if (!selectTtsVoice) return;

  chrome.storage.local.get(['voiceUri'], (data) => {
    const savedUri = data.voiceUri || 'gemini:Aoede';

    const groupAutoLabel = t('voiceGroupAuto', uiLang);
    const autoOption = t('voiceAutoOption', uiLang);
    const groupFemaleLabel = t('voiceGroupFemale', uiLang);
    const groupMaleLabel = t('voiceGroupMale', uiLang);
    const groupBrowserLabel = t('voiceGroupBrowser', uiLang);

    selectTtsVoice.innerHTML = `
      <optgroup label="${groupAutoLabel}">
        <option value="gemini:auto" ${savedUri === 'gemini:auto' ? 'selected' : ''}>${autoOption}</option>
      </optgroup>
      <optgroup label="${groupFemaleLabel}">
        <option value="gemini:Aoede" ${savedUri === 'gemini:Aoede' ? 'selected' : ''}>${t('voiceAoede', uiLang)}</option>
        <option value="gemini:Kore" ${savedUri === 'gemini:Kore' ? 'selected' : ''}>${t('voiceKore', uiLang)}</option>
        <option value="gemini:Leda" ${savedUri === 'gemini:Leda' ? 'selected' : ''}>${t('voiceLeda', uiLang)}</option>
        <option value="gemini:Zephyr" ${savedUri === 'gemini:Zephyr' ? 'selected' : ''}>${t('voiceZephyr', uiLang)}</option>
        <option value="gemini:Callisto" ${savedUri === 'gemini:Callisto' ? 'selected' : ''}>${t('voiceCallisto', uiLang)}</option>
      </optgroup>
      <optgroup label="${groupMaleLabel}">
        <option value="gemini:Puck" ${savedUri === 'gemini:Puck' ? 'selected' : ''}>${t('voicePuck', uiLang)}</option>
        <option value="gemini:Fenrir" ${savedUri === 'gemini:Fenrir' ? 'selected' : ''}>${t('voiceFenrir', uiLang)}</option>
        <option value="gemini:Charon" ${savedUri === 'gemini:Charon' ? 'selected' : ''}>${t('voiceCharon', uiLang)}</option>
        <option value="gemini:Orpheus" ${savedUri === 'gemini:Orpheus' ? 'selected' : ''}>${t('voiceOrpheus', uiLang)}</option>
      </optgroup>
    `;

    if ('speechSynthesis' in window) {
      const browserVoices = window.speechSynthesis.getVoices();
      if (browserVoices.length > 0) {
        const group = document.createElement('optgroup');
        group.label = groupBrowserLabel;
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

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => setupVoiceSelector();
  }
}

/**
 * Populate Ducking Level Selector with localized options
 */
function setupDuckLevelSelector() {
  if (!selectDuckLevel) return;

  chrome.storage.local.get(['duckLevel'], (data) => {
    const savedLevel = typeof data.duckLevel === 'number' ? String(data.duckLevel) : '0.05';

    selectDuckLevel.innerHTML = `
      <option value="0.05" ${savedLevel === '0.05' ? 'selected' : ''}>${t('duckOption5', uiLang)}</option>
      <option value="0.0" ${savedLevel === '0.0' ? 'selected' : ''}>${t('duckOption0', uiLang)}</option>
      <option value="0.15" ${savedLevel === '0.15' ? 'selected' : ''}>${t('duckOption15', uiLang)}</option>
      <option value="0.25" ${savedLevel === '0.25' ? 'selected' : ''}>${t('duckOption25', uiLang)}</option>
    `;
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
 * Update UI for current recording state with active localization
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
    actionText.textContent = t('btnStopDubbing', uiLang);
    statusBadge.textContent = t('statusLive', uiLang);
    statusBadge.classList.add('live');
  } else if (state === 'starting') {
    btnToggleDub.classList.add('btn-start');
    btnToggleDub.disabled = true;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = t('statusConnecting', uiLang);
    statusBadge.textContent = t('statusConnecting', uiLang);
    statusBadge.classList.add('connecting');
  } else if (state === 'stopping') {
    btnToggleDub.classList.add('btn-stop');
    btnToggleDub.disabled = true;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = t('statusStopping', uiLang);
    statusBadge.textContent = t('statusFinishing', uiLang);
  } else {
    // idle
    btnToggleDub.classList.add('btn-start');
    btnToggleDub.disabled = false;
    actionIcon.classList.remove('hidden');
    audioWave.classList.add('hidden');
    actionText.textContent = t('btnStartDubbing', uiLang);
    statusBadge.textContent = t('statusReady', uiLang);
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
    emptyLi.textContent = t('noLangFound', uiLang);
    languageList.appendChild(emptyLi);
    return;
  }

  languages.forEach((lang) => {
    const li = document.createElement('li');
    li.className = `lang-item ${lang.code === targetDubLang ? 'selected' : ''}`;
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
      ${lang.code === targetDubLang ? '<span class="lang-item-check">✓</span>' : `<span class="lang-code">${lang.code}</span>`}
    `;

    li.addEventListener('click', async () => {
      targetDubLang = lang.code;
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
  // Voice selection change
  selectTtsVoice.addEventListener('change', async (e) => {
    const val = e.target.value;
    const aiVoice = val.startsWith('gemini:') ? val.replace('gemini:', '') : 'Aoede';
    await chrome.storage.local.set({ voiceUri: val, aiVoice });
    broadcastSettings({ voiceUri: val, aiVoice });
  });

  // Duck level selection change
  selectDuckLevel.addEventListener('change', async (e) => {
    const val = Number(e.target.value);
    await chrome.storage.local.set({ duckLevel: val });
    broadcastSettings({ duckLevel: val });
  });

  // Start / Stop Dubbing Action
  btnToggleDub.addEventListener('click', async () => {
    if (!hasApiKey) {
      openApiModal(uiLang === 'fa' ? 'لطفاً ابتدا کلید API جمینای خود را وارد فرمایید.' : 'Please configure your Gemini API Key first to enable live AI dubbing.');
      return;
    }

    if (recordingState === 'idle') {
      applyRecordingState('starting');
      try {
        const stored = await chrome.storage.local.get(['voiceUri', 'aiVoice', 'geminiModel', 'duckLevel']);
        const response = await chrome.runtime.sendMessage({
          type: 'START_RECORDING',
          config: {
            targetLang: targetDubLang,
            model: stored.geminiModel || selectModel.value || 'gemini-3.5-live-translate-preview',
            aiVoice: stored.aiVoice || (stored.voiceUri?.startsWith('gemini:') ? stored.voiceUri.replace('gemini:', '') : 'Aoede'),
            duckLevel: typeof stored.duckLevel === 'number' ? stored.duckLevel : 0.05,
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
          alert(`Error: ${response.error}`);
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
      showTestStatus(t('testEnterKey', uiLang), 'error');
      return;
    }

    const model = selectModel.value;

    // Test Gemini Live models via WebSocket
    if (model.includes('live')) {
      showTestStatus(t('testConnectingWs', uiLang), 'testing');
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
              showTestStatus(t('testWsSuccess', uiLang), 'success');
              ws.close(1000, 'Test completed');
            } else if (data.error) {
              wsResolved = true;
              showTestStatus(t('testRestFailed', uiLang, { msg: data.error.message || JSON.stringify(data.error) }), 'error');
              ws.close();
            }
          } catch (err) {
            console.warn('[OmniDub Test WS Parse Error]', err);
          }
        };

        ws.onerror = () => {
          if (!wsResolved) {
            showTestStatus(t('testWsError', uiLang), 'error');
          }
        };

        ws.onclose = (e) => {
          if (!wsResolved) {
            if (e.code === 1000) {
              showTestStatus(t('testWsSuccess', uiLang), 'success');
            } else {
              showTestStatus(t('testWsClosed', uiLang, { code: e.code, reason: e.reason || 'Authentication' }), 'error');
            }
          }
        };

        setTimeout(() => {
          if (!wsResolved && ws.readyState === WebSocket.OPEN) {
            ws.close();
            showTestStatus(t('testWsTimeout', uiLang), 'error');
          }
        }, 7000);
      } catch (err) {
        showTestStatus(t('testNetworkError', uiLang, { msg: err.message }), 'error');
      }
      return;
    }

    // Fallback Test Standard REST
    showTestStatus(t('testTestingRest', uiLang), 'testing');
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'OK' }] }]
        })
      });

      if (res.ok) {
        showTestStatus(t('testRestSuccess', uiLang), 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${res.status}`;
        showTestStatus(t('testRestFailed', uiLang, { msg }), 'error');
      }
    } catch (err) {
      showTestStatus(t('testNetworkError', uiLang, { msg: err.message }), 'error');
    }
  });

  // Save Key & Model
  apiKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = inputApiKey.value.trim();
    const model = selectModel.value;

    if (!key) return;

    await chrome.storage.local.set({
      geminiApiKey: key,
      geminiModel: model
    });

    hasApiKey = true;
    apiStatusIndicator.classList.add('configured');
    apiStatusIndicator.title = uiLang === 'fa' ? 'کلید API تنظیم شده است' : 'API Key Configured';
    missingKeyAlert.style.display = 'none';

    broadcastSettings({ model });

    apiModal.close();
    showTestStatus('', '');
  });

  // Runtime listener for background messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'RECORDING_STATE_CHANGED') {
      applyRecordingState(message.state);
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

// Safety no-op for any legacy caller
function updateQuotaUI() {}



