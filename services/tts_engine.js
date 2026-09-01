/**
 * OmniDub - TTS Engine
 * Manages speech synthesis for live video dubbing using chrome.tts and Web Speech API.
 * Handles audio ducking notifications and non-blocking speech queues.
 */

class TTSEngine {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
  }

  /**
   * Set callback handlers for audio ducking
   */
  setCallbacks({ onStart, onEnd }) {
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
  }

  /**
   * Enqueue a text string to be spoken in the specified language.
   *
   * @param {string} text - Text to speak
   * @param {Object} options - { lang: 'fa-IR', rate: 1.0, volume: 0.9, pitch: 1.0 }
   */
  speak(text, options = {}) {
    if (!text || !text.trim()) return;

    this.queue.push({
      text: text.trim(),
      options: {
        lang: options.lang || 'fa-IR',
        rate: Math.min(2.0, Math.max(0.5, options.rate || 1.0)),
        volume: Math.min(1.0, Math.max(0.1, options.volume || 0.9)),
        pitch: options.pitch || 1.0
      }
    });

    if (!this.isSpeaking) {
      this._processQueue();
    }
  }

  /**
   * Process next item in the speech queue
   */
  _processQueue() {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    this.isSpeaking = true;
    const item = this.queue.shift();

    if (this.onStartCallback) {
      this.onStartCallback();
    }

    // Use chrome.tts if available in extension environment
    if (typeof chrome !== 'undefined' && chrome.tts && chrome.tts.speak) {
      chrome.tts.speak(item.text, {
        lang: item.options.lang,
        rate: item.options.rate,
        volume: item.options.volume,
        pitch: item.options.pitch,
        onEvent: (event) => {
          if (event.type === 'end' || event.type === 'interrupted' || event.type === 'error') {
            this._processQueue();
          }
        }
      });
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = item.options.lang;
      utterance.rate = item.options.rate;
      utterance.volume = item.options.volume;
      utterance.pitch = item.options.pitch;

      utterance.onend = () => this._processQueue();
      utterance.onerror = () => this._processQueue();

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('OmniDub TTS: No TTS engine available in this context');
      this._processQueue();
    }
  }

  /**
   * Stop all speech immediately and clear queue
   */
  stop() {
    this.queue = [];
    this.isSpeaking = false;

    if (typeof chrome !== 'undefined' && chrome.tts && chrome.tts.stop) {
      chrome.tts.stop();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }
}

export const ttsEngine = new TTSEngine();

