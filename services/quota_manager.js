/**
 * OmniDub - Quota Manager (Unlimited Everywhere)
 * Provides unrestricted, infinite dubbing across all modes (release, unpacked, developer).
 */

export class QuotaManager {
  /**
   * Always unlimited in all environments
   */
  static isDevMode() {
    return true;
  }

  /**
   * Get remaining quota in seconds. Always returns Infinity (no limit).
   */
  static async getRemainingQuota() {
    return Infinity;
  }

  /**
   * Always returns false (quota is never exhausted).
   */
  static async isExhausted() {
    return false;
  }

  /**
   * Safe usage incrementer (no-op or passive tracking)
   */
  static async addUsage(seconds) {
    return 0;
  }

  /**
   * No-op reset
   */
  static async checkAndResetIfNewDay() {}
}

