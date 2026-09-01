/**
 * OmniDub - SRT Subtitle Generator
 * Converts recorded timestamped subtitle events into standard SubRip (.srt) format.
 */

export class SRTGenerator {
  /**
   * Format milliseconds into SRT timestamp HH:MM:SS,mmm
   */
  static formatTimestamp(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = ms % 1000;

    const pad = (n, width = 2) => String(n).padStart(width, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
  }

  /**
   * Convert subtitle items into SRT content string
   *
   * @param {Array<{startMs: number, endMs: number, text: string, original?: string}>} items
   * @param {boolean} bilingual
   * @returns {string}
   */
  static generateSRT(items, bilingual = false) {
    if (!items || items.length === 0) return '';

    return items
      .map((item, index) => {
        const start = this.formatTimestamp(item.startMs);
        const end = this.formatTimestamp(item.endMs);
        let content = item.text || '';
        if (bilingual && item.original) {
          content = `${content}\n${item.original}`;
        }
        return `${index + 1}\n${start} --> ${end}\n${content}\n`;
      })
      .join('\n');
  }

  /**
   * Create a downloadable Blob URL for the SRT file
   */
  static createDownloadUrl(items, bilingual = false) {
    const srtText = this.generateSRT(items, bilingual);
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    return URL.createObjectURL(blob);
  }
}

