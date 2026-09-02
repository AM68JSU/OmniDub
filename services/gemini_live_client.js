/**
 * OmniDub - Gemini Live Translation Client
 * Implements real-time bidirectional WebSocket streaming using `gemini-3.5-live-translate-preview`.
 * Streams 16kHz PCM audio in 100ms chunks and receives continuous 24kHz PCM audio & live transcripts.
 */

export class GeminiLiveTranslateClient {
  constructor({ apiKey, targetLang = 'fa', voiceName = 'Aoede', onAudioChunk, onInputTranscript, onOutputTranscript, onError, onClose }) {
    this.apiKey = apiKey;
    this.targetLang = targetLang;
    this.voiceName = voiceName;
    this.onAudioChunk = onAudioChunk || (() => {});
    this.onInputTranscript = onInputTranscript || (() => {});
    this.onOutputTranscript = onOutputTranscript || (() => {});
    this.onError = onError || (() => {});
    this.onClose = onClose || (() => {});

    this.ws = null;
    this.isConnected = false;
    this.isSetupComplete = false;
  }

  /**
   * Connect to Gemini Live API WebSocket endpoint
   */
  connect() {
    return new Promise((resolve, reject) => {
      const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(this.apiKey.trim())}`;
      console.log('%c[OmniDub Live] 🌐 Connecting to Gemini Live API WebSocket...', 'color: #38bdf8; font-weight: bold;');

      try {
        this.ws = new WebSocket(endpoint);
      } catch (err) {
        return reject(err);
      }

      this.ws.onopen = () => {
        console.log('%c[OmniDub Live] ⚡ WebSocket connected. Sending Live Translation Setup message...', 'color: #10b981;');
        this.isConnected = true;
        this.sendSetupMessage();
      };

      this.ws.onmessage = async (event) => {
        try {
          let text = event.data;
          if (text instanceof Blob) {
            text = await text.text();
          } else if (text instanceof ArrayBuffer) {
            text = new TextDecoder().decode(text);
          }
          const msg = JSON.parse(text);
          this.handleServerMessage(msg, resolve);
        } catch (err) {
          console.warn('[OmniDub Live] Failed to parse server message:', err);
        }
      };

      this.ws.onerror = (event) => {
        console.error('%c[OmniDub Live ❌] WebSocket error:', 'color: #ef4444;', event);
        this.onError(event);
      };

      this.ws.onclose = (event) => {
        console.log(`%c[OmniDub Live 🛑] WebSocket closed: code=${event.code}, reason=${event.reason || 'None'}`, 'color: #94a3b8;');
        this.isConnected = false;
        this.isSetupComplete = false;
        this.onClose(event);
      };
    });
  }

  /**
   * Send setup message for gemini-3.5-live-translate-preview
   */
  sendSetupMessage() {
    const setup = {
      setup: {
        model: 'models/gemini-3.5-live-translate-preview',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.voiceName || 'Aoede'
              }
            }
          },
          translationConfig: {
            targetLanguageCode: this.targetLang || 'fa',
            echoTargetLanguage: true
          }
        }
      }
    };

    console.log('%c[OmniDub Live] 📤 Sending Setup configuration:', 'color: #818cf8;', setup);
    this.ws.send(JSON.stringify(setup));
  }

  /**
   * Handle incoming messages from Gemini Live API
   */
  handleServerMessage(msg, onSetupResolve) {
    if (msg.setupComplete) {
      console.log('%c[OmniDub Live] ✅ Live Translation Session Established & Ready!', 'color: #10b981; font-weight: bold;');
      this.isSetupComplete = true;
      if (onSetupResolve) onSetupResolve(this);
      return;
    }

    if (msg.serverContent) {
      const content = msg.serverContent;

      // 1. Live Subtitles (Output / Translated Transcript)
      if (content.outputTranscription && content.outputTranscription.text) {
        this.onOutputTranscript(content.outputTranscription.text);
      }

      // 2. Original Language Transcript
      if (content.inputTranscription && content.inputTranscription.text) {
        this.onInputTranscript(content.inputTranscription.text);
      }

      // 3. Translated 24kHz Audio Chunks
      if (content.modelTurn && Array.isArray(content.modelTurn.parts)) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            this.onAudioChunk(part.inlineData.data);
          }
        }
      }

      // 4. Interruption handling
      if (content.interrupted) {
        console.log('%c[OmniDub Live ⚡] Model turn interrupted.', 'color: #f59e0b;');
      }
    }
  }

  /**
   * Stream 100ms raw 16kHz PCM audio chunk (little-endian mono)
   * @param {string} base64Pcm - Base64 encoded 16kHz 16-bit PCM audio
   */
  sendAudioChunk(base64Pcm) {
    if (!this.isConnected || !this.isSetupComplete || !this.ws) return;

    const payload = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Pcm
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Close Live translation session cleanly
   */
  disconnect() {
    this.isConnected = false;
    this.isSetupComplete = false;
    if (this.ws) {
      try {
        this.ws.close(1000, 'OmniDub session ended');
      } catch (e) {}
      this.ws = null;
    }
    console.log('%c[OmniDub Live] Disconnected cleanly.', 'color: #94a3b8;');
  }
}

