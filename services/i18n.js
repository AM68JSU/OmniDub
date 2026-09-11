/**
 * OmniDub - Internationalization (i18n) Engine
 * Provides comprehensive translations for English (Default) and Persian (Farsi).
 */

export const TRANSLATIONS = {
  en: {
    // Brand & Status
    appName: 'OmniDub',
    appSubtitle: 'Live AI Video Dubbing',
    statusReady: 'Ready',
    statusLive: 'Live Dubbing',
    statusConnecting: 'Connecting...',
    statusStopping: 'Stopping...',
    statusFinishing: 'Finishing...',

    // Header Actions
    btnSettingsTitle: 'Gemini API Key Settings',
    btnSettingsAria: 'Settings',
    langEn: 'EN',
    langFa: 'FA',

    // Alert Banner
    alertMissingKey: '⚠️ Google Gemini API Key required',
    btnConfigureKey: 'Configure Key',

    // Target Language Selection
    labelTargetLang: 'Target Dubbing Language',
    searchLangPlaceholder: 'Search 50+ languages or code...',
    noLangFound: 'No language found',

    // Main Action Button
    btnStartDubbing: 'Start Live Dubbing',
    btnStopDubbing: 'Stop Live Dubbing',

    // Toggle: Dubbed Audio (TTS)
    titleDubbedAudio: 'Dubbed Audio (AI Voice)',
    descDubbedAudio: 'Speaks translated voice & ducks original video volume',
    labelVolume: 'TTS Volume:',
    labelSpeed: 'Reading Speed:',
    labelVoice: 'Dubbing Voice',
    labelDuckLevel: 'Original Video Volume While Dubbing',
    hintDuckingLogs: '🔊 Press F12 on the video page to inspect live Dubbing & Ducking logs.',

    // Voice Groups & Names
    voiceGroupAuto: '✨ AI Voice Match (Voice Cloning)',
    voiceAutoOption: 'Auto (Clones original speaker voice, gender & tone)',
    voiceGroupFemale: '👩 Female Studio Neural Voices',
    voiceAoede: 'Aoede (Female — Natural, warm & crystal clear) [Recommended]',
    voiceKore: 'Kore (Female — Calm, soothing & gentle)',
    voiceLeda: 'Leda (Female — Clear, confident & lively)',
    voiceZephyr: 'Zephyr (Female — Soft, melodious & emotional)',
    voiceCallisto: 'Callisto (Female — Formal, crisp & broadcast)',
    voiceGroupMale: '👨 Male Studio Neural Voices',
    voicePuck: 'Puck (Male — Energetic, youthful & dynamic) [Recommended]',
    voiceFenrir: 'Fenrir (Male — Powerful, crisp & authoritative)',
    voiceCharon: 'Charon (Male — Deep, calm & documentary narrator)',
    voiceOrpheus: 'Orpheus (Male — Warm, rich & broadcast)',
    voiceGroupBrowser: '🌐 Browser System Voices (Offline)',

    // Ducking Level Options
    duckOption5: '5% (Whisper Background — Recommended)',
    duckOption0: 'Mute Original (0% — Dubbing Only)',
    duckOption15: '15% (Low Background)',
    duckOption25: '25% (Moderate Background)',

    // Toggle: Floating Subtitles
    titleSubtitles: 'Floating Subtitles',
    descSubtitles: 'Displays draggable subtitle box on web video',
    labelBilingual: 'Show bilingual subtitles (Original + Translated)',

    // Toggle: Record & Export
    titleRecord: 'Record & Export',
    descRecord: 'Download SRT subtitles & dubbed audio on stop',

    // Toggle: Scope
    titleAllSites: 'Enable for all websites',
    descAllSites: 'Apply settings automatically across all tabs',

    // Daily Quota
    titleDailyQuota: 'Daily Free Quota',
    titleDailyQuotaDev: 'Daily Quota (Dev Mode)',
    quotaRemaining: '{mins}m {secs}s remaining',
    quotaUnlimitedDev: '∞ Unlimited (Dev Mode)',
    quotaResetsIn: 'Resets in: {hours}h {mins}m',
    quotaResetsDev: 'Demo quota: Unpacked developer mode',
    quotaTotal: 'Total: 45 mins',
    quotaTotalDev: 'Limit: None (Dev Mode)',

    // Settings Modal
    modalTitle: 'Gemini API Settings',
    labelApiKey: 'Google Gemini API Key',
    hintApiKey: 'Free tier available. Get key at',
    googleAiStudio: 'Google AI Studio',
    labelAiModel: 'AI Live Dubbing Engine',
    modelLiveOption: 'Gemini 3.5 Live Translate (Google Real-Time Speech-to-Speech)',
    hintLiveModel: '⚡ Official Google Gemini Live API — Ultra-low latency voice-to-voice stream.',
    btnTestConnection: 'Test Connection',
    btnSaveSettings: 'Save Settings',

    // Test & Validation Messages
    testEnterKey: 'Please enter an API Key first.',
    testConnectingWs: 'Connecting to Gemini Live WebSocket...',
    testWsSuccess: '⚡ Live Stream Connected! Engine is active and ready for real-time dubbing.',
    testWsError: 'Live WebSocket error. Please verify your network/VPN connection.',
    testWsTimeout: 'Connection timed out. Please check your network or VPN.',
    testWsClosed: 'Connection closed (Code {code}: {reason}). Check API key permissions.',
    testTestingRest: 'Testing connection with Gemini API...',
    testRestSuccess: 'Connection successful! Gemini API is active and verified.',
    testRestFailed: 'Validation failed: {msg}',
    testNetworkError: 'Network error: {msg}',

    // Subtitle In-Page UI
    subtitlesCloseTooltip: 'Hide subtitles',
    badgeLiveText: 'OmniDub Live'
  },

  fa: {
    // Brand & Status
    appName: 'OmniDub',
    appSubtitle: 'دوبله زنده ویدیو با هوش مصنوعی',
    statusReady: 'آماده',
    statusLive: 'دوبله زنده',
    statusConnecting: 'در حال اتصال...',
    statusStopping: 'در حال توقف...',
    statusFinishing: 'پایان سشن...',

    // Header Actions
    btnSettingsTitle: 'تنظیمات کلید API جمینای',
    btnSettingsAria: 'تنظیمات',
    langEn: 'EN',
    langFa: 'فا',

    // Alert Banner
    alertMissingKey: '⚠️ کلید Google Gemini API مورد نیاز است',
    btnConfigureKey: 'تنظیم کلید',

    // Target Language Selection
    labelTargetLang: 'زبان مقصد دوبله و ترجمه',
    searchLangPlaceholder: 'جستجوی بیش از ۵۰ زبان یا کد...',
    noLangFound: 'زبانی یافت نشد',

    // Main Action Button
    btnStartDubbing: 'شروع دوبله زنده',
    btnStopDubbing: 'توقف دوبله زنده',

    // Toggle: Dubbed Audio (TTS)
    titleDubbedAudio: 'دوبله صوتی (صدای هوش مصنوعی)',
    descDubbedAudio: 'پخش صدای گوینده هوشمند و کاهش خودکار صدای ویدیو',
    labelVolume: 'بلندی صدای دوبله:',
    labelSpeed: 'سرعت گویندگی:',
    labelVoice: 'صدای گوینده دوبله',
    labelDuckLevel: 'میزان صدای ویدیو هنگام پخش دوبله',
    hintDuckingLogs: '🔊 برای مشاهده لاگ‌های همگام‌سازی دوبله و داکینگ در صفحه ویدیو کلید F12 را بزنید.',

    // Voice Groups & Names
    voiceGroupAuto: '✨ شبیه‌ساز خودکار صدا (Voice Cloning)',
    voiceAutoOption: 'Auto (شبیه‌ساز خودکار لحن، احساس و جنسیت گوینده ویدیو)',
    voiceGroupFemale: '👩 صداهای استودیویی زن (نورال)',
    voiceAoede: 'Aoede (زن — طبیعی، گرم و شفاف فارسی) [پیشنهادی]',
    voiceKore: 'Kore (زن — آرامش‌بخش، ملایم و دلنشین)',
    voiceLeda: 'Leda (زن — رسا، شاداب و بااعتمادبه‌نفس)',
    voiceZephyr: 'Zephyr (زن — لطیف، ملودیک و احساسی)',
    voiceCallisto: 'Callisto (زن — رسمی، محکم و رادیویی)',
    voiceGroupMale: '👨 صداهای استودیویی مرد (نورال)',
    voicePuck: 'Puck (مرد — پرانرژی، جوان و پویا) [پیشنهادی]',
    voiceFenrir: 'Fenrir (مرد — مقتدر، رسا و محکم)',
    voiceCharon: 'Charon (مرد — بم، آرام و راوی مستند)',
    voiceOrpheus: 'Orpheus (مرد — گرم، عمیق و گوینده خبر)',
    voiceGroupBrowser: '🌐 صداهای آفلاین سیستم مرورگر',

    // Ducking Level Options
    duckOption5: '۵٪ (زمزمه پس‌زمینه — پیشنهادی)',
    duckOption0: 'بی‌صدا کردن کامل ویدیو (۰٪ — فقط دوبله)',
    duckOption15: '۱۵٪ (پس‌زمینه آرام و ملایم)',
    duckOption25: '۲۵٪ (متوسط)',

    // Toggle: Floating Subtitles
    titleSubtitles: 'زیرنویس شناور روی ویدیو',
    descSubtitles: 'نمایش کادر شیشه‌ای و قابل جابه‌جایی روی پلیر ویدیو',
    labelBilingual: 'نمایش زیرنویس دوزبانه (متن اصلی + متن ترجمه‌شده)',

    // Toggle: Record & Export
    titleRecord: 'ضبط و استخراج فایل',
    descRecord: 'دانلود خودکار زیرنویس SRT و فایل صوتی دوبله پس از توقف',

    // Toggle: Scope
    titleAllSites: 'فعال‌سازی در تمام وبسایت‌ها',
    descAllSites: 'اعمال خودکار تنظیمات بر روی تمام تب‌های باز مرورگر',

    // Daily Quota
    titleDailyQuota: 'سهمیه روزانه رایگان',
    titleDailyQuotaDev: 'سهمیه روزانه (حالت توسعه)',
    quotaRemaining: '{mins} دقیقه و {secs} ثانیه باقی‌مانده',
    quotaUnlimitedDev: '∞ نامحدود (حالت دولوپ)',
    quotaResetsIn: 'ریست تا: {hours} ساعت و {mins} دقیقه',
    quotaResetsDev: 'سهمیه نمایشی: نصب در حالت توسعه (بدون محدودیت)',
    quotaTotal: 'مجموع: ۴۵ دقیقه',
    quotaTotalDev: 'محدودیت: ندارد (حالت دولوپ)',

    // Settings Modal
    modalTitle: 'تنظیمات Google Gemini API',
    labelApiKey: 'کلید Google Gemini API',
    hintApiKey: 'پلن رایگان فعال است. دریافت کلید اختصاصی از',
    googleAiStudio: 'Google AI Studio',
    labelAiModel: 'موتور دوبله زنده هوش مصنوعی',
    modelLiveOption: 'Gemini 3.5 Live Translate (استریم بلادرنگ صوت به صوت گوگل)',
    hintLiveModel: '⚡ ای‌پی‌آی رسمی Gemini Live گوگل — انتقال مستقیم صدا بدون افت کیفیت و حداقل تاخیر.',
    btnTestConnection: 'تست اتصال زنده',
    btnSaveSettings: 'ذخیره تنظیمات',

    // Test & Validation Messages
    testEnterKey: 'لطفاً ابتدا کلید API را وارد فرمایید.',
    testConnectingWs: 'در حال برقراری ارتباط وب‌سوکت با Gemini Live...',
    testWsSuccess: '⚡ استریم زنده متصل شد! موتور هوش مصنوعی فعال و آماده دوبله زنده است.',
    testWsError: 'خطا در اتصال وب‌سوکت لایو. لطفاً وضعیت اینترنت یا فیلترشکن را بررسی کنید.',
    testWsTimeout: 'مهلت اتصال پایان یافت. لطفاً اینترنت یا فیلترشکن را بررسی نمایید.',
    testWsClosed: 'ارتباط بسته شد (کد {code}: {reason}). دسترسی‌های کلید را چک فرمایید.',
    testTestingRest: 'در حال اعتبارسنجی کلید با سرویس گوگل...',
    testRestSuccess: 'اتصال موفقیت‌آمیز بود! کلید جمینای فعال و پاسخگوست.',
    testRestFailed: 'خطا در اعتبارسنجی: {msg}',
    testNetworkError: 'خطای شبکه اینترنت: {msg}',

    // Subtitle In-Page UI
    subtitlesCloseTooltip: 'پنهان کردن زیرنویس',
    badgeLiveText: 'OmniDub Live'
  }
};

/**
 * Get translation for a specific key
 */
export function t(key, lang = 'en', params = {}) {
  const currentLang = TRANSLATIONS[lang] ? lang : 'en';
  let str = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  
  // Replace {param} placeholders if any
  for (const [pKey, pVal] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
  }
  return str;
}

/**
 * Apply translations to DOM elements bearing data-i18n attributes
 */
export function applyTranslations(lang = 'en') {
  const currentLang = TRANSLATIONS[lang] ? lang : 'en';
  const isRtl = currentLang === 'fa';

  // Set document direction and language attribute
  document.documentElement.setAttribute('lang', currentLang);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = t(key, currentLang);
    if (text) {
      el.textContent = text;
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = t(key, currentLang);
    if (text) {
      el.setAttribute('placeholder', text);
    }
  });

  // Translate titles / tooltips
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const text = t(key, currentLang);
    if (text) {
      el.setAttribute('title', text);
    }
  });

  // Translate aria-label
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const text = t(key, currentLang);
    if (text) {
      el.setAttribute('aria-label', text);
    }
  });
}

