/**
 * OmniDub - Content Script (Subtitle Overlay, In-Tab Dubbing & Video Audio Ducking)
 * Injected into web pages to display floating subtitles, speak translated audio, and duck video volume.
 */

(() => {
  if (window.__omnidub_injected) return;
  window.__omnidub_injected = true;

  console.log('%c[OmniDub] 🎬 In-page Video Overlay & Dubbing Controller Injected.', 'color: #818cf8; font-weight: bold;');

  let container = null;
  let box = null;
  let translatedEl = null;
  let originalEl = null;
  let langBadgeEl = null;
  let hideTimeout = null;

  // Audio ducking state
  const originalVolumes = new WeakMap();
  let isDucked = false;

  // Settings
  let showSubtitles = true;
  let showBilingual = false;

  // =========================================================================
  // In-Tab Speech Synthesis (TTS Dubbing Engine)
  // =========================================================================
  class InTabDubbingEngine {
    constructor() {
      this.queue = [];
      this.isSpeaking = false;
      this.cachedVoices = [];
      this.initVoices();
    }

    initVoices() {
      if (!('speechSynthesis' in window)) {
        console.warn('%c[OmniDub Dubbing ⚠️] speechSynthesis is not supported in this window.', 'color: #ef4444;');
        return;
      }

      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        console.log(`%c[OmniDub Dubbing] 🎙️ Loaded ${this.cachedVoices.length} browser/system voices.`, 'color: #3b82f6;');
      };
    }

    speak({ text, phoneticText, targetLang = 'fa', volume = 0.9, rate = 1.0, preferredVoice = 'auto' }) {
      if (!text || !text.trim()) return;

      // Keep queue responsive to live stream (max 2 pending)
      if (this.queue.length >= 2) {
        const dropped = this.queue.shift();
        console.log('%c[OmniDub Dubbing] ⏩ Dropping older queued utterance to keep pace with video:', 'color: #94a3b8;', dropped.text);
      }

      this.queue.push({
        text: text.trim(),
        phoneticText: (phoneticText || text).trim(),
        targetLang,
        volume,
        rate,
        preferredVoice
      });

      if (!this.isSpeaking) {
        this._processNext();
      }
    }

    _processNext() {
      if (this.queue.length === 0) {
        this.isSpeaking = false;
        endDucking();
        return;
      }

      if (!('speechSynthesis' in window)) {
        this.queue = [];
        return;
      }

      this.isSpeaking = true;
      const item = this.queue.shift();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      let matchedVoice = null;

      if (item.preferredVoice && item.preferredVoice !== 'auto') {
        matchedVoice = voices.find(v => v.voiceURI === item.preferredVoice || v.name === item.preferredVoice);
      }

      const cleanLang = (item.targetLang || 'fa').toLowerCase();
      if (!matchedVoice) {
        // Exact match
        matchedVoice = voices.find(v => v.lang.toLowerCase() === cleanLang || v.lang.toLowerCase().replace('_', '-') === cleanLang);
        // Prefix match
        if (!matchedVoice) {
          const prefix = cleanLang.split('-')[0];
          matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
        }
      }

      let textToSpeak = item.text;
      let voiceToUse = null;

      if (matchedVoice) {
        voiceToUse = matchedVoice;
        textToSpeak = item.text;
        console.log(`%c[OmniDub Dubbing 🔊] Speaking with native voice "${matchedVoice.name}" (${matchedVoice.lang}):`, 'color: #10b981; font-weight: bold;', textToSpeak);
      } else {
        // Fallback for languages not installed in OS (e.g. Persian on English Windows)
        voiceToUse = voices.find(v => v.default) || voices[0] || null;
        // Non-native voices (like Microsoft David) skip non-Latin Unicode!
        // We use phonetic Romanization so the English voice actually speaks the words!
        textToSpeak = item.phoneticText || item.text;

        console.warn(
          `%c[OmniDub Dubbing ⚠️] No native speech voice for "${item.targetLang}" installed in Windows. Speaking phonetic transliteration via fallback voice "${voiceToUse?.name || 'Default'}":`,
          'color: #f59e0b; font-weight: bold;',
          textToSpeak
        );
        console.info(
          '%c[OmniDub Dubbing 💡] Tip: To install a native Persian voice on Windows: Windows Settings > Time & Language > Speech > Add Voices.',
          'color: #38bdf8;'
        );
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.volume = Math.max(0.1, Math.min(1.0, item.volume || 0.9));
      utterance.rate = Math.max(0.5, Math.min(1.8, item.rate || 1.0));

      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.onstart = () => {
        startDucking(0.2);
      };

      utterance.onend = () => {
        this._processNext();
      };

      utterance.onerror = (e) => {
        console.error('%c[OmniDub Dubbing ❌] TTS error:', 'color: #ef4444; font-weight: bold;', e.error);
        this._processNext();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('%c[OmniDub Dubbing ❌] Exception during speechSynthesis.speak:', 'color: #ef4444;', err);
        this._processNext();
      }
    }

    stop() {
      this.queue = [];
      this.isSpeaking = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      endDucking();
      console.log('%c[OmniDub Dubbing ⏹️] Stopped all active speech and cleared queue.', 'color: #94a3b8;');
    }
  }

  const dubbingEngine = new InTabDubbingEngine();

  // =========================================================================
  // Floating Subtitles Overlay UI
  // =========================================================================
  function initOverlay() {
    if (document.getElementById('omnidub-subtitle-container')) {
      container = document.getElementById('omnidub-subtitle-container');
      box = container.querySelector('.omnidub-box');
      translatedEl = container.querySelector('.omnidub-translated');
      originalEl = container.querySelector('.omnidub-original');
      langBadgeEl = container.querySelector('.omnidub-badge-text');
      return;
    }

    container = document.createElement('div');
    container.id = 'omnidub-subtitle-container';
    container.className = 'omnidub-hidden';

    container.innerHTML = `
      <div class="omnidub-box">
        <div class="omnidub-header">
          <div class="omnidub-badge">
            <span class="omnidub-dot"></span>
            <span class="omnidub-badge-text">OmniDub Live</span>
          </div>
          <div class="omnidub-controls">
            <button class="omnidub-btn-icon" id="omnidub-btn-close" title="Hide subtitles">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="omnidub-content">
          <div class="omnidub-translated"></div>
          <div class="omnidub-original" style="display: none;"></div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(container);

    box = container.querySelector('.omnidub-box');
    translatedEl = container.querySelector('.omnidub-translated');
    originalEl = container.querySelector('.omnidub-original');
    langBadgeEl = container.querySelector('.omnidub-badge-text');

    const btnClose = container.querySelector('#omnidub-btn-close');
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.add('omnidub-hidden');
    });

    makeDraggable(box, container);
  }

  function makeDraggable(handle, target) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = target.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      target.style.transform = 'none';
      target.style.left = `${initialLeft}px`;
      target.style.top = `${initialTop}px`;
      target.style.bottom = 'auto';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxX = window.innerWidth - target.offsetWidth - 10;
      const maxY = window.innerHeight - target.offsetHeight - 10;

      newLeft = Math.max(10, Math.min(newLeft, maxX));
      newTop = Math.max(10, Math.min(newTop, maxY));

      target.style.left = `${newLeft}px`;
      target.style.top = `${newTop}px`;
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  function renderSubtitle(translated, original, targetLang) {
    if (!showSubtitles) return;
    initOverlay();

    if (langBadgeEl && targetLang) {
      langBadgeEl.textContent = `OmniDub [${targetLang.toUpperCase()}]`;
    }

    translatedEl.textContent = translated || '';

    if (showBilingual && original && original.trim()) {
      originalEl.textContent = original;
      originalEl.style.display = 'block';
    } else {
      originalEl.style.display = 'none';
    }

    container.classList.remove('omnidub-hidden');
    console.log(`%c[OmniDub Subtitle] 💬 Displayed: "${translated}"`, 'color: #38bdf8;');

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (container) {
        container.classList.add('omnidub-hidden');
      }
    }, 7000);
  }

  // =========================================================================
  // Video Volume Ducking
  // =========================================================================
  function startDucking(duckTo = 0.2) {
    if (isDucked) return;
    isDucked = true;

    const mediaElements = Array.from(document.querySelectorAll('video, audio'));
    if (mediaElements.length === 0) return;

    console.log(`%c[OmniDub Ducking 🔉] Lowering ${mediaElements.length} media element(s) volume to ${Math.round(duckTo * 100)}%`, 'color: #f59e0b;');

    mediaElements.forEach((el) => {
      if (!originalVolumes.has(el)) {
        originalVolumes.set(el, el.volume);
      }
      fadeVolume(el, el.volume, Math.min(el.volume, duckTo), 120);
    });
  }

  function endDucking() {
    if (!isDucked) return;
    isDucked = false;

    const mediaElements = Array.from(document.querySelectorAll('video, audio'));
    if (mediaElements.length === 0) return;

    console.log(`%c[OmniDub Ducking 🔊] Restoring video volume back to normal.`, 'color: #10b981;');

    mediaElements.forEach((el) => {
      const original = originalVolumes.get(el) ?? 1.0;
      fadeVolume(el, el.volume, original, 200);
    });
  }

  function fadeVolume(el, fromVol, toVol, durationMs) {
    const steps = 8;
    const stepTime = durationMs / steps;
    const stepDelta = (toVol - fromVol) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        el.volume = Math.max(0, Math.min(1, toVol));
        clearInterval(timer);
      } else {
        el.volume = Math.max(0, Math.min(1, el.volume + stepDelta));
      }
    }, stepTime);
  }

  // =========================================================================
  // Message Listener from Background & Popup
  // =========================================================================
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'DISPLAY_SUBTITLE':
        renderSubtitle(message.translatedText, message.originalText, message.targetLang);
        sendResponse({ received: true });
        break;

      case 'PLAY_DUBBED_AUDIO':
        console.log('%c[OmniDub Content] 📨 Dubbing speech requested:', 'color: #ec4899;', {
          translated: message.translatedText,
          phonetic: message.phoneticText
        });
        dubbingEngine.speak({
          text: message.translatedText,
          phoneticText: message.phoneticText,
          targetLang: message.targetLang,
          volume: message.volume,
          rate: message.rate,
          preferredVoice: message.voiceUri
        });
        sendResponse({ queued: true });
        break;

      case 'START_AUDIO_DUCKING':
        startDucking(message.duckLevel || 0.2);
        sendResponse({ ducked: true });
        break;

      case 'END_AUDIO_DUCKING':
        endDucking();
        sendResponse({ restored: true });
        break;

      case 'UPDATE_CONTENT_CONFIG':
        if (typeof message.subtitles === 'boolean') {
          showSubtitles = message.subtitles;
          if (!showSubtitles && container) {
            container.classList.add('omnidub-hidden');
          }
        }
        if (typeof message.bilingual === 'boolean') {
          showBilingual = message.bilingual;
          if (originalEl) {
            originalEl.style.display = showBilingual && originalEl.textContent ? 'block' : 'none';
          }
        }
        sendResponse({ updated: true });
        break;

      case 'CLEAR_SUBTITLES':
        if (container) {
          container.classList.add('omnidub-hidden');
        }
        dubbingEngine.stop();
        endDucking();
        sendResponse({ cleared: true });
        break;
    }
    return false;
  });
})();
