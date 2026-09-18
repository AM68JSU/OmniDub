# Contributing to OmniDub

Thank you for your interest in contributing to **OmniDub**! We welcome contributions from everyone — whether it is fixing bugs, adding language support, improving UI/UX, or improving documentation.

---

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AM68JSU/OmniDub.git
   cd OmniDub
   ```

2. **Load the extension into Google Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** using the toggle switch at the top right.
   - Click **Load unpacked**.
   - Select the `OmniDub` directory.
   - The OmniDub icon will now appear in your toolbar.

3. **Get a Google Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Create a free API key and configure it in the extension settings modal.

---

## 📂 Project Structure

- `manifest.json`: Manifest V3 declaration and extension permissions.
- `background/service_worker.js`: Tab audio capture coordination, offscreen document lifecycle, and audio ducking messaging.
- `offscreen/`: Offscreen document handling Web Audio processing, 16kHz audio chunking, and streaming to Google Gemini.
- `content_scripts/`: In-page floating draggable subtitle box and video volume ducking.
- `services/`:
  - `gemini_api.js`: Gemini REST fallback and JSON structured output schema.
  - `gemini_live_client.js`: Real-time WebSocket bidirectional streaming client.
  - `i18n.js`: Internationalization engine (English & Persian).
  - `tts_engine.js`: Speech synthesis controller and audio ducking coordination.
  - `language_list.js`: 50+ supported languages with flags and codes.
  - `quota_manager.js`: Unlimited usage engine.
- `popup/`: Control panel interface (semantic HTML, glassmorphic CSS, popup logic).
- `utils/`: SRT subtitle generator and audio export utilities.

---

## 📦 Packaging & Building

To create a clean, store-ready `.zip` package:
```powershell
.\package-extension.ps1
```
This packages all required files into `OmniDub-v<version>.zip` excluding development and git files.

---

## 💡 Submitting Pull Requests

1. Fork the repo and create a branch for your feature or bug fix:
   ```bash
   git checkout -b feature/awesome-feature
   ```
2. Test your changes locally in Chrome (`chrome://extensions/` -> click reload icon on the extension card).
3. Commit your changes with clear, descriptive commit messages.
4. Push your branch and open a Pull Request against `main`.
5. Describe your changes clearly in the PR description.

---

## 📜 Code of Conduct

Please be respectful, kind, and collaborative. We aim to foster an open and welcoming environment.

