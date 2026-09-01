# OmniDub (LivDub) - Live AI Video Dubbing & Subtitles Chrome Extension

OmniDub is a Manifest V3 Google Chrome Extension that provides real-time AI dubbing and bilingual subtitles for web videos (YouTube, Coursera, Vimeo, Udemy, etc.) using Google Gemini API (`gemini-2.5-flash` or `gemini-3.7-flash`).

---

## 🚀 Key Features

- **50+ Languages with Search & Flags**: Real-time searchable dropdown with country flags, ISO codes, and native language names (e.g. Persian / فارسی, Spanish, French, German, Arabic, Turkish, etc.).
- **Live Tab Audio Capture**: Direct capture of tab audio using `chrome.tabCapture` & `Offscreen Document` without interrupting playback.
- **Ultra-Low Latency AI**: Streams 2.8s audio segments to Google Gemini API (`gemini-2.5-flash` / `gemini-3.7-flash`) with structured JSON schema responses.
- **Audio Ducking**: Automatically ducks web video volume down to 20% while the translated voice (TTS) is speaking, restoring normal volume immediately afterwards.
- **Floating Draggable Subtitle Box**: High-contrast, customizable subtitle overlay that floats directly on top of video players, with optional bilingual view (original + translated).
- **Subtitle & Audio Recording**: Automatically saves and downloads timestamped `.srt` subtitle files.
- **Daily Quota Manager**: 45-minute daily free quota tracker with midnight automatic reset.
- **Client-Side & Secure**: Uses your own Google Gemini API key stored securely in `chrome.storage.local`.

---

## 📁 Architecture & File Structure

```text
OmniDub/
├── manifest.json                 # Chrome Manifest V3 configuration
├── CHROMEWEBSTORE.md             # Chrome Web Store submission & permissions doc
├── README.md                     # Documentation and setup guide
├── icons/                        # Standard 16x16, 48x48, 128x128 icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                        # Control Panel UI
│   ├── popup.html                # Semantic HTML with glassmorphism design
│   ├── popup.css                 # Dark theme, animations, visualizer
│   └── popup.js                  # State sync, language filter, API modal
├── background/                   # Background Service Worker
│   └── service_worker.js         # TabCapture, Offscreen lifecycle, Quota, Ducking
├── offscreen/                    # Web Audio & Stream Processing
│   ├── offscreen.html
│   └── offscreen.js              # Audio slicing, 16kHz WAV encoding, Gemini REST
├── content_scripts/              # In-Page Video Overlay
│   ├── subtitle_overlay.css      # Floating subtitle box styles
│   └── subtitle_overlay.js       # Draggable overlay & Video volume ducking
├── services/                     # Core Business Logic
│   ├── gemini_api.js             # Google Gemini API connector with JSON schema
│   ├── tts_engine.js             # Speech synthesis queue with ducking hooks
│   ├── language_list.js          # 50+ languages with ISO & BCP-47 codes
│   └── quota_manager.js          # Daily usage calculator & reset logic
└── utils/                        # Utilities
    ├── audio_recorder.js         # Session recording & export manager
    └── srt_generator.js          # SubRip (.srt) subtitle formatter
```

---

## 🛠️ Installation & Testing (Developer Mode)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn ON the **Developer mode** toggle in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `OmniDub` project folder (`d:\GitHubSource\OmniDub`).
5. Pin the **OmniDub** icon to your Chrome toolbar.

---

## ⚡ How to Use

1. Click the **OmniDub** icon in your toolbar.
2. Click the gear icon (Settings) or the alert prompt to open the **Gemini API Settings** modal.
3. Paste your [Google AI Studio API Key](https://aistudio.google.com/app/apikey) and click **Test Connection**, then **Save Settings**.
4. Choose your target language (e.g., **Persian / فارسی**) from the searchable dropdown.
5. Open any web video (e.g. YouTube).
6. Click **Start Live Dubbing**.
7. Watch the live subtitles float on screen and listen to the dubbed audio with automatic video ducking!

