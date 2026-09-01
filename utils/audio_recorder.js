/**
 * OmniDub - Audio & Subtitle Session Recorder
 * Buffers subtitles and audio segments during a live dubbing session for post-session export.
 */

import { SRTGenerator } from './srt_generator.js';

export class SessionRecorder {
  constructor() {
    this.sessionStartTime = 0;
    this.subtitles = [];
    this.isActive = false;
  }

  /**
   * Start a new recording session
   */
  start() {
    this.sessionStartTime = Date.now();
    this.subtitles = [];
    this.isActive = true;
  }

  /**
   * Add a subtitle chunk to the session
   */
  addSubtitle(originalText, translatedText, durationMs = 3000) {
    if (!this.isActive) return;

    const startMs = Date.now() - this.sessionStartTime;
    const endMs = startMs + durationMs;

    this.subtitles.push({
      startMs,
      endMs,
      text: translatedText,
      original: originalText
    });
  }

  /**
   * Finalize session and trigger SRT export
   */
  exportSRT(bilingual = false, filename = 'omnidub_subtitles.srt') {
    if (this.subtitles.length === 0) return null;

    const srtContent = SRTGenerator.generateSRT(this.subtitles, bilingual);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    this.isActive = false;
    return { url, filename, count: this.subtitles.length };
  }

  clear() {
    this.subtitles = [];
    this.isActive = false;
  }
}

export const sessionRecorder = new SessionRecorder();

