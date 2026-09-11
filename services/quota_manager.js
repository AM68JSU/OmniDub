/**
 * OmniDub - Daily Quota Manager
 * Tracks daily usage in seconds, resets daily at midnight, and persists in chrome.storage.local.
 * Automatically disables restrictions in development/unpacked mode.
 */

const MAX_DAILY_SECONDS = 45 * 60; // 45 minutes daily free quota

export class QuotaManager {
  /**
   * Check if running in unpacked/developer mode (no update_url in manifest)
   */
  static isDevMode() {
    try {
      const manifest = chrome.runtime.getManifest();
      return !manifest.update_url;
    } catch (e) {
      return true;
    }
  }

  /**
   * Get remaining quota in seconds for the current day.
   * Returns Infinity in developer mode.
   */
  static async getRemainingQuota() {
    if (this.isDevMode()) {
      return Infinity;
    }
    await this.checkAndResetIfNewDay();
    const data = await chrome.storage.local.get(['quotaUsedSeconds']);
    const used = data.quotaUsedSeconds || 0;
    return Math.max(0, MAX_DAILY_SECONDS - used);
  }

  /**
   * Check if the daily quota is exhausted.
   * Always false in developer mode.
   */
  static async isExhausted() {
    if (this.isDevMode()) {
      return false;
    }
    const remaining = await this.getRemainingQuota();
    return remaining <= 0;
  }

  /**
   * Increment used quota by a given number of seconds
   */
  static async addUsage(seconds) {
    await this.checkAndResetIfNewDay();
    const data = await chrome.storage.local.get(['quotaUsedSeconds']);
    const current = data.quotaUsedSeconds || 0;
    const updated = current + seconds;
    await chrome.storage.local.set({ quotaUsedSeconds: updated });
    return updated;
  }

  /**
   * Check if today is a new calendar day compared to last reset, if so reset quota
   */
  static async checkAndResetIfNewDay() {
    const data = await chrome.storage.local.get(['quotaLastReset', 'quotaUsedSeconds']);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    if (data.quotaLastReset !== todayStr) {
      await chrome.storage.local.set({
        quotaUsedSeconds: 0,
        quotaLastReset: todayStr
      });
    }
  }
}

