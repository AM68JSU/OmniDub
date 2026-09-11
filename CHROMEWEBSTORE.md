# Chrome Web Store Listing & Submission Guide — OmniDub

> **Extension Name**: OmniDub - Live AI Video Dubbing & Subtitles  
> **Version**: 1.0.0  
> **Default Language**: English (en)  
> **Supported Languages**: English, Persian (فارسی), and 50+ world languages  
> **Manifest Version**: 3  
> **Last Updated**: 2026-09-11  

---

## 1. Store Listing Metadata (English — Primary)

### Extension Name
`OmniDub - Live AI Video Dubbing & Subtitles`

### Summary / Short Description (Max 132 chars)
`Real-time AI dubbing and bilingual subtitles for web videos powered by Google Gemini. Listen and dub live in 50+ languages.`

### Detailed Description
```markdown
OmniDub brings real-time live AI voice dubbing and bilingual subtitles directly to your web browser. Watch foreign lectures, tutorials, movies, and streams in your native language with zero waiting time.

Powered by Google Gemini (including Gemini 3.5 Live Translate API), OmniDub captures the tab's audio stream, transcribes spoken words, translates the dialogue with high contextual accuracy into your chosen language, and synthesizes natural studio voices while smoothly ducking the original video volume.

🌟 KEY FEATURES:
• Real-Time Live AI Dubbing: Ultra-low latency voice-to-voice and text-to-speech dubbing.
• 50+ Languages Supported: Persian (Farsi), English, Spanish, French, German, Arabic, Turkish, Chinese, Japanese, Korean, and many more.
• Studio Neural Voice Profiles: Select from expressive female and male neural voices (Aoede, Puck, Kore, Fenrir, etc.) or enable Zero-Shot Voice Cloning.
• Smart Audio Ducking: Intelligently lowers the original video audio to 5% while speech is playing so you hear crystal-clear dubbing.
• Floating & Draggable Subtitles: High-contrast glassmorphic subtitle overlay on video with dynamic RTL / LTR text direction and optional bilingual display (Original + Translated).
• Direct Client-Side Privacy: Connects directly with your personal Google Gemini API Key. No middleman servers, no tracking, no subscription traps.
• Session Recording & SRT Export: Export standard .SRT subtitle files and dubbed audio upon stopping.
• Bilingual Interface: Sleek dark modern UI with instant English & Persian toggle.

🚀 HOW TO USE:
1. Install OmniDub and pin it to your browser toolbar.
2. Click the gear icon in the popup to enter your free Google Gemini API Key (get one from Google AI Studio).
3. Select your target language (e.g., Persian / Farsi).
4. Play any video on YouTube, Coursera, Udemy, or any web player, and click "Start Live Dubbing".
5. Enjoy real-time translated voice dubbing and floating subtitles!

🔒 PRIVACY & SECURITY:
OmniDub works entirely on the client side. Audio capture is initiated exclusively upon your explicit click, processed in local memory, and sent directly to Google Gemini API via secure HTTPS/WSS using your own key. No browsing activity, audio, or credentials are stored or transferred to any third party.
```

---

## 2. مشخصات استور به زبان فارسی (Persian Store Listing)

### نام افزونه:
`OmniDub - دوبله و زیرنویس زنده ویدیو با هوش مصنوعی`

### توضیح کوتاه:
`دوبله صوتی همزمان و زیرنویس زنده ویدیوهای وب با هوش مصنوعی گوگل جمینای به ۵۰+ زبان دنیا با صدای طبیعی گویندگان استودیویی.`

### شرح کامل:
افزونه OmniDub امکان دوبله همزمان و پخش زیرنویس دوزبانه زنده را برای تمامی ویدیوهای وب (یوتیوب، کورسرا، یودمی و ویدیو پلیرهای آنلاین) فراهم می‌کند. این افزونه با استفاده مستقیم از API رسمی Google Gemini، صدای تب فعال را دریافت، به متن تبدیل، ترجمه دقیق کرده و با صدای باکیفیت هوش مصنوعی پخش می‌کند.

---

## 3. توجیه امنیتی دسترسی‌ها (Permissions Justification for Review Team)

کپی مستقیم این توجیه‌ها در بخش **Privacy practices > Permissions** در کنسول توسعه‌دهندگان گوگل الزامی است:

| Permission | Type | Plain-English Review Justification |
| :--- | :--- | :--- |
| `tabCapture` | Permissions | Required to capture the audio stream of the active video tab so it can be transcribed and translated in real-time. |
| `offscreen` | Permissions | Required by Manifest V3 to process and slice the captured Web Audio stream in an isolated background offscreen document. |
| `storage` | Permissions | Required to save user preferences (target language, UI language, audio volume, subtitle toggle) and the user's private Gemini API key locally in `chrome.storage.local`. |
| `activeTab` | Permissions | Required to identify the user's currently focused video tab when the user clicks the "Start Live Dubbing" action button. |
| `scripting` | Permissions | Required to inject the floating subtitle overlay UI and video volume ducking listener into the active video webpage. |
| `alarms` | Permissions | Required to calculate and deduct daily usage time against the free 45-minute daily session quota counter. |
| `tts` | Permissions | Required to provide offline browser speech synthesis voice options for languages when offline synthesis is preferred. |
| `https://generativelanguage.googleapis.com/*` | Host Permissions | Required to stream audio chunks and receive live translations directly from the official Google Gemini API endpoint using the user's API key. |
| `<all_urls>` | Host Permissions | Required to enable floating subtitles and video volume ducking across video websites (such as YouTube, Vimeo, Coursera, and educational portals). |

---

## 4. خط‌مشی محرمانگی و داده‌ها (Privacy & Data Use Declarations)

در تب **Privacy practices** پنل توسعه‌دهندگان گوگل گزینه‌های زیر را انتخاب نمایید:

1. **Single Purpose Description**:  
   `Transcribes, translates, and live-dubs audio from active web video tabs in real time using Google Gemini AI.`
2. **Data Collection**:
   - آیا افزونه اطلاعات هویتی یا شخصی جمع‌آوری می‌کند؟ **خیر (No)**.
   - صوت دریافتی تب صرفاً در حافظه موقت رم پردازش شده و مستقیماً به سرور گوگل ارسال می‌شود و در هیچ پایگاه داده خارجی ذخیره نمی‌گردد.
3. **Data Usage Certifications**:
   - [x] Data is NOT sold to third parties.
   - [x] Data is NOT used for purposes unrelated to the extension's core functionality.
   - [x] Data is NOT used for creditworthiness or lending purposes.

---

## 5. تصاویر و دارایی‌های گرافیکی مورد نیاز (Required Graphic Assets)

| دارایی (Asset) | ابعاد (Dimensions) | وضعیت در پروژه | مسیر فایل |
| :--- | :--- | :--- | :--- |
| **Store Icon** [الزامی] | ۱۲۸×۱۲۸ PNG | ✅ آماده | [`icons/icon128.png`](file:///E:/Source/Repos/OmniDub/icons/icon128.png) |
| **Screenshot 1** [الزامی] | ۱۲۸۰×۸۰۰ یا ۶۴۰×۴۰۰ | ⬜ نیاز به ضبط از پاپ‌آپ | `screenshots/popup_en.png` |
| **Screenshot 2** [پیشنهادی] | ۱۲۸۰×۸۰۰ | ⬜ نیاز به ضبط از زیرنویس شناور | `screenshots/video_subtitles.png` |
| **Small Promo Tile** [پیشنهادی] | ۴۴۰×۲۸۰ PNG/JPEG | ⬜ برای صفحه اصلی استور | `screenshots/promo_small.png` |

---

## 6. راهنمای گام‌به‌گام انتشار (Step-by-Step Publishing Guide)

### مرحله اول: ساخت فایل پکیج نهایی (ZIP)
در خط فرمان پاورشل، اسکریپت آماده شده در پروژه را اجرا کنید:
```powershell
powershell -ExecutionPolicy Bypass -File E:\Source\Repos\OmniDub\package-extension.ps1
```
این اسکریپت فایلی با نام `OmniDub-v1.0.0.zip` بدون فایل‌های اضافه (مانند `.git` و اسکریپت‌ها) در ریشه پروژه تولید می‌کند.

### مرحله دوم: ثبت‌نام در پنل توسعه‌دهندگان کروم (Chrome Web Store Developer Dashboard)
1. به آدرس [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) بروید.
2. با اکانت گوگل خود وارد شوید.
3. هزینه یک‌باره ثبت‌نام اکانت توسعه‌دهنده (۵ دلار آمریکا) را از طریق مسترکارت/ویزا یا کارت‌های ارزی پرداخت نمایید.

### مرحله سوم: بارگذاری فایل افزونه
1. روی دکمه **New Item** (مورد جدید) کلیک کنید.
2. فایل `OmniDub-v1.0.0.zip` را در پنجره آپلود رها کنید (Drag & Drop).

### مرحله چهارم: تکمیل فرم مشخصات (Store Listing)
1. **Product details**: عنوان، خلاصه و شرح کامل را از بخش ۱ یا ۲ این مستند کپی کنید.
2. **Category**: دسته‌بندی را روی **Productivity** یا **Accessibility** قرار دهید.
3. **Language**: روی **English** تنظیم کنید.
4. **Graphic assets**: حداقل ۱ اسکرین‌شات از نمای افزونه با رزولوشن ۱۲۸۰×۸۰۰ آپلود کنید.

### مرحله پنجم: فرم حریم خصوصی و توجیه دسترسی‌ها (Privacy Practices)
1. به تب **Privacy practices** بروید.
2. فیلد **Single Purpose** را طبق بخش ۳ پر کنید.
3. در زیر هر دسترسی (`tabCapture`, `scripting`, `<all_urls>` و...)، توجیه آماده شده در جدول بخش ۳ را عیناً کپی کنید.
4. چک‌باکس‌های تعهد عدم فروش داده‌ها را تیک بزنید.
5. لینک Privacy Policy زنده (مثلاً در گیت‌هاب پیجز یا یک صفحه وب عمومی) را وارد فرمایید.

### مرحله ششم: ثبت نهایی برای بررسی (Submit for Review)
1. دکمه **Submit for Review** در بالای صفحه را بزنید.
2. بررسی امنیتی گوگل معمولاً بین ۲۴ تا ۷۲ ساعت کاری زمان می‌برد و پس از تأیید، افزونه در دسترس عموم کاربران جهان قرار خواهد گرفت.

