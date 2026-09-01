# Chrome Web Store Listing — OmniDub

> Last Updated: 2026-09-01

## Store Listing

**Extension Name**
OmniDub - Live AI Video Dubbing & Subtitles

**Short Description**
Real-time AI dubbing and subtitles for web videos powered by Google Gemini. Listen, translate, and dub live in 50+ languages.

**Detailed Description**
OmniDub brings real-time live AI dubbing and bilingual subtitles directly to your favorite web video players, including YouTube, Coursera, Vimeo, Udemy, and online lectures.

Powered directly by Google Gemini API (gemini-2.5-flash and gemini-3.7-flash), OmniDub captures the tab's audio stream, transcribes spoken words, translates the dialogue with high accuracy into your chosen language, and speaks the translated voice while gently ducking original video audio.

Key Features:
- 50+ Languages Supported: Persian (Farsi), English, Spanish, French, German, Arabic, Turkish, Chinese, Japanese, and more.
- Real-Time AI Dubbing (TTS): Natural voice dubbing with automatic audio ducking (lowers video volume to 20% while speech is playing).
- Floating Subtitle Overlay: Draggable, high-contrast subtitle box with optional bilingual display.
- Direct Client-Side Processing: Works with your personal Google Gemini API key with zero external server dependencies.
- Subtitle & Audio Recording: Export SRT subtitles and dubbed sessions upon completion.
- Daily Quota Tracking: Built-in 45-minute daily counter to manage usage.

How to Use:
1. Click the OmniDub icon in your Chrome toolbar.
2. Click the settings gear icon to configure your free Google Gemini API Key.
3. Select your target language from the searchable dropdown list.
4. Open any video in your active tab and click "Start Live Dubbing".

Privacy & Permissions:
OmniDub processes tab audio exclusively during active user sessions. No user data, passwords, or personal files are collected or stored on external servers.

**Category**
Productivity

**Single Purpose**
Transcribes, translates, and live-dubs audio from active web video tabs in real time using Gemini AI.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon128.png |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Ready for capture | screenshots/overview.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Ready for capture | screenshots/dubbing_active.png |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ⬜ Ready for capture | screenshots/settings_modal.png |

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `tabCapture` | permissions | Required to capture the tab audio stream to pass to the offscreen audio slicer for translation. |
| `offscreen` | permissions | Required by Manifest V3 to perform Web Audio API processing and audio slicing in a dedicated background document. |
| `storage` | permissions | Required to store user preferences (selected language, audio volume, subtitle toggle) and the user's Gemini API key locally in `chrome.storage.local`. |
| `activeTab` | permissions | Required to identify the active tab when the user clicks "Start Live Dubbing". |
| `scripting` | permissions | Required to inject the subtitle overlay UI and video volume ducking listener into the video webpage. |
| `alarms` | permissions | Required to periodically decrement active session usage against the 45-minute daily quota counter. |
| `tts` | permissions | Required to synthesize translated speech using the browser's native text-to-speech engine. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Required to send audio chunks to Google Gemini API for speech recognition and translation. |
| `<all_urls>` | host_permissions | Required to enable video audio ducking and floating subtitles on video websites (e.g. YouTube, Coursera, web players). |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No.
Audio captured from the user's active tab is temporarily sliced into 2.8-second chunks in local memory and streamed directly to the Google Gemini API endpoint using the user's private API key. No audio or transcripts are logged, sent to third-party tracking services, or stored remotely.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-09-01 | Initial release with live tab audio capture, Gemini API integration, floating subtitles, TTS ducking, and 50+ languages. | Draft |

