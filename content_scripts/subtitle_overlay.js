/**
 * OmniDub - Content Script (Subtitle Overlay, Unified Dubbing Queue & Audio Ducking)
 * Handles in-page subtitle display, sequential AI voice playback, and video volume ducking.
 */

(() => {
  if (window.__omnidub_injected) return;
  window.__omnidub_injected = true;

  console.log('%c[OmniDub] 🎬 In-page Video Overlay & Unified Dubbing Controller Injected.', 'color: #818cf8; font-weight: bold;');

  let container = null;
  let box = null;
  let translatedEl = null;
  let originalEl = null;
  let langBadgeEl = null;
  let hideTimeout = null;

  // Audio ducking state
  const originalVolumes = new WeakMap();
  let isDucked = false;
  let duckTargetVolume = 0.05; // 5% by default for clear dubbing prominence

  // Settings
  let showSubtitles = true;
  let showBilingual = false;

  // =========================================================================
  // Unified Dubbing Queue (Ensures sentences play in sequence without overlap)
  // =========================================================================
  class UnifiedDubbingQueue {
    constructor() {
      this.queue = [];
      this.isPlaying = false;
      this.currentAudioEl = null;
    }

    enqueue(item) {
      if (!item.text && !item.audioDataUrl) return;

      // Keep maximum 3 pending sentences to avoid falling behind live video
      if (this.queue.length >= 3) {
        const dropped = this.queue.shift();
        console.log('%c[OmniDub Dubbing] ⏩ Dropped older queued utterance to keep pace with video:', 'color: #94a3b8;', dropped.text);
      }

      this.queue.push(item);

      if (!this.isPlaying) {
        this.playNext();
      }
    }

    playNext() {
      if (this.queue.length === 0) {
        this.isPlaying = false;
        endDucking();
        return;
      }

      this.isPlaying = true;
      const item = this.queue.shift();

      // Priority 1: Studio Neural AI Audio (from Gemini TTS)
      if (item.audioDataUrl) {
        try {
          const audio = new Audio(item.audioDataUrl);
          this.currentAudioEl = audio;
          audio.volume = Math.max(0.1, Math.min(1.0, item.volume ?? 0.95));

          audio.onplay = () => {
            startDucking(duckTargetVolume);
            console.log('%c[OmniDub AI Dubbing 🎙️] 🔊 Playing Studio Neural Persian Voice:', 'color: #10b981; font-weight: bold;', item.text);
          };

          audio.onended = () => {
            this.currentAudioEl = null;
            if (this.queue.length > 0) {
              this.playNext(); // Keep ducking seamlessly active for next sentence!
            } else {
              this.isPlaying = false;
              scheduleEndDucking(); // Hold volume at 5% smoothly to prevent bouncing!
            }
          };

          audio.onerror = (e) => {
            console.warn('%c[OmniDub AI Dubbing ⚠️] Audio playback error:', 'color: #f59e0b;', e);
            this.currentAudioEl = null;
            this.playNext();
          };

          audio.play().catch((err) => {
            console.warn('%c[OmniDub AI Dubbing ⚠️] Audio play blocked:', 'color: #f59e0b;', err);
            this.currentAudioEl = null;
            this.playNext();
          });
          return;
        } catch (err) {
          console.warn('%c[OmniDub AI Dubbing ⚠️] Exception playing AI audio:', 'color: #f59e0b;', err);
          this.playNext();
          return;
        }
      }

      // Priority 2: Native Browser Voice (ONLY if a genuine native voice for target language is installed)
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const targetPrefix = (item.targetLang || 'fa').toLowerCase().split('-')[0];
        const nativeVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));

        if (nativeVoice) {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          const utterance = new SpeechSynthesisUtterance(item.text);
          utterance.voice = nativeVoice;
          utterance.lang = nativeVoice.lang;
          utterance.volume = Math.max(0.1, Math.min(1.0, item.volume ?? 0.95));
          utterance.rate = Math.max(0.7, Math.min(1.5, item.rate ?? 1.0));

          utterance.onstart = () => {
            startDucking(duckTargetVolume);
            console.log(`%c[OmniDub Dubbing 🔊] Speaking with native voice "${nativeVoice.name}":`, 'color: #10b981; font-weight: bold;', item.text);
          };

          utterance.onend = () => {
            if (this.queue.length > 0) {
              this.playNext();
            } else {
              this.isPlaying = false;
              scheduleEndDucking(); // Hold volume at 5% smoothly
            }
          };

          utterance.onerror = (e) => {
            console.warn('%c[OmniDub Dubbing ⚠️] Native voice error:', 'color: #f59e0b;', e);
            this.playNext();
          };

          try {
            window.speechSynthesis.speak(utterance);
            return;
          } catch (e) {
            this.playNext();
            return;
          }
        }
      }

      // If no AI audio and no native voice, DO NOT use an English voice (like Microsoft David)
      // This ensures the user NEVER hears broken English/Fingilish again!
      console.log('%c[OmniDub Dubbing ℹ️] Subtitle displayed on screen. Awaiting next studio AI voice chunk.', 'color: #94a3b8;');
      this.playNext();
    }

    stop() {
      this.queue = [];
      this.isPlaying = false;
      if (duckHoldTimer) {
        clearTimeout(duckHoldTimer);
        duckHoldTimer = null;
      }
      if (this.currentAudioEl) {
        try {
          this.currentAudioEl.pause();
          this.currentAudioEl.currentTime = 0;
        } catch (e) {}
        this.currentAudioEl = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      endDucking();
      console.log('%c[OmniDub Dubbing ⏹️] Stopped all speech and cleared queue.', 'color: #94a3b8;');
    }
  }

  const dubbingQueue = new UnifiedDubbingQueue();

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
  // Video Volume Ducking (Persistent hold to eliminate jarring volume bouncing)
  // =========================================================================
  let duckHoldTimer = null;
  const DUCK_HOLD_MS = 2600; // Hold volume low for 2.6s after speech to prevent jumping

  function startDucking(duckTo = duckTargetVolume) {
    if (duckHoldTimer) {
      clearTimeout(duckHoldTimer);
      duckHoldTimer = null;
    }

    if (isDucked) return;
    isDucked = true;

    const mediaElements = Array.from(document.querySelectorAll('video, audio'));
    if (mediaElements.length === 0) return;

    console.log(`%c[OmniDub Ducking 🔉] Lowering ${mediaElements.length} media element(s) volume to ${Math.round(duckTo * 100)}% for dubbing clarity`, 'color: #f59e0b;');

    mediaElements.forEach((el) => {
      if (el === dubbingQueue.currentAudioEl) return;
      if (!originalVolumes.has(el)) {
        originalVolumes.set(el, el.volume);
      }
      fadeVolume(el, el.volume, Math.min(el.volume, duckTo), 80);
    });
  }

  function scheduleEndDucking(delayMs = DUCK_HOLD_MS) {
    if (duckHoldTimer) clearTimeout(duckHoldTimer);
    duckHoldTimer = setTimeout(() => {
      endDucking();
      duckHoldTimer = null;
    }, delayMs);
  }

  function endDucking() {
    if (!isDucked) return;
    isDucked = false;

    const mediaElements = Array.from(document.querySelectorAll('video, audio'));
    if (mediaElements.length === 0) return;

    console.log(`%c[OmniDub Ducking 🔊] Restoring video volume back to normal.`, 'color: #10b981;');

    mediaElements.forEach((el) => {
      if (el === dubbingQueue.currentAudioEl) return;
      const original = originalVolumes.get(el) ?? 1.0;
      fadeVolume(el, el.volume, original, 300);
    });
  }

  function fadeVolume(el, fromVol, toVol, durationMs) {
    const steps = 10;
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
        dubbingQueue.enqueue({
          text: message.translatedText,
          audioDataUrl: message.audioDataUrl,
          targetLang: message.targetLang,
          volume: message.volume,
          rate: message.rate,
          preferredVoice: message.voiceUri
        });
        sendResponse({ queued: true });
        break;

      case 'START_AUDIO_DUCKING':
        startDucking(message.duckLevel ?? duckTargetVolume);
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
        if (typeof message.duckLevel === 'number') {
          duckTargetVolume = message.duckLevel;
        }
        sendResponse({ updated: true });
        break;

      case 'CLEAR_SUBTITLES':
        if (container) {
          container.classList.add('omnidub-hidden');
        }
        dubbingQueue.stop();
        endDucking();
        sendResponse({ cleared: true });
        break;
    }
    return false;
  });
})();
