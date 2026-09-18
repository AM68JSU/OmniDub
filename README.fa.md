<p align="center">
  <img src="icons/icon128.png" alt="لوگوی OmniDub" width="96" height="96" />
</p>

<h1 align="center">OmniDub — دوبله زنده ویدیو و زیرنویس هوشمند با هوش مصنوعی</h1>

<p align="center">
  <strong>دوبله همزمان ویدیوهای آنلاین، داکینگ خودکار صدا و زیرنویس دوزبانه شناور با قدرت هوش مصنوعی Google Gemini</strong>
</p>

<p align="center">
  <a href="README.md"><strong>🇺🇸 English</strong></a> •
  <a href="README.fa.md"><strong>🇮🇷 فارسی (Persian)</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/هوش_مصنوعی-Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/مجوز-MIT-green.svg?style=for-the-badge" alt="License MIT" />
  <img src="https://img.shields.io/badge/زبان‌ها-بیش_از_۵۰_زبان-blue?style=for-the-badge" alt="50+ Languages" />
  <img src="https://img.shields.io/badge/نسخه-1.0.0-orange?style=for-the-badge" alt="v1.0.0" />
</p>

---

<div align="right" dir="rtl">

## 🌟 معرفی پروژه

<p align="right" dir="rtl">
افزونه <strong>OmniDub</strong> یک ابزار قدرتمند برای مرورگر گوگل کروم (بر پایه Manifest V3) است که به شما امکان می‌دهد ویدیوهای هر وبسایتی (یوتیوب، کورسرا، یودمی، ویمیو، تد و...) را به صورت <strong>زنده و همزمان به زبان شیرین فارسی یا بیش از ۵۰ زبان دیگر</strong> دوبله کرده و زیرنویس شناور و هوشمند آن را روی صفحه مشاهده کنید.
</p>

<p align="right" dir="rtl">
این افزونه با اتصال مستقیم به <strong>Google Gemini API</strong> (مدل‌های <code>gemini-2.5-flash</code> و موتور استریم بلادرنگ Gemini Live)، صدای ویدیو را در همان لحظه از تب مرورگر دریافت کرده، گفتار را به زبان مقصد ترجمه می‌کند و با گویندگان استودیویی و باکیفیت پخش می‌نماید؛ در همان حین، صدای اصلی ویدیو به طور خودکار به آرامی کم می‌شود (Audio Ducking) تا صدای دوبله فارسی بدون تداخل و بسیار واضح شنیده شود.
</p>

</div>

---

<div align="right" dir="rtl">

## 📸 تصاویر و رابط کاربری

<h3 align="right" dir="rtl">🇮🇷 رابط کاربری فارسی (راست‌چین)</h3>

<p align="center">
  <img src="docs/screenshots/omnidub-fa-full.png" alt="رابط کاربری فارسی OmniDub" width="420" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <em>طراحی مدرن شیشه‌ای تیره با پشتیبانی کامل از زبان فارسی و چینش راست‌چین (RTL).</em>
</p>

<br />

<h3 align="right" dir="rtl">🇺🇸 رابط کاربری انگلیسی (چپ‌چین)</h3>

<p align="center">
  <img src="docs/screenshots/omnidub-en-full.png" alt="رابط کاربری انگلیسی OmniDub" width="420" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <em>رابط استاندارد انگلیسی با دکمه تغییر آنی زبان به فارسی در نوار بالای افزونه.</em>
</p>

</div>

---

<div align="right" dir="rtl">

## 🚀 ویژگی‌های کلیدی

<ul dir="rtl" align="right">
  <li>🎙️ <strong>دوبله زنده با کمترین تاخیر</strong>: دریافت مستقیم صدای تب فعال بدون قطعی پخش ویدیو و ترجمه بلادرنگ با هوش مصنوعی جمینای گوگل.</li>
  <li>🌍 <strong>پشتیبانی از بیش از ۵۰ زبان</strong>: دارای منوی جستجوی پرچم‌ها و کدهای بین‌المللی با پشتیبانی کامل از زبان شیرین فارسی (IR / Farsi)، انگلیسی، اسپانیایی، فرانسوی، عربی، آلمانی، ترکی، روسی، چینی و...</li>
  <li>🔊 <strong>داکینگ هوشمند صدا (Smart Audio Ducking)</strong>: کاهش خودکار صدای اصلی ویدیو به ۵٪ (یا حالت بی‌صدا ۰٪، ۱۵٪ یا ۲۵٪) در حین صحبت گوینده، و بازگشت آنی ولوم به ۱۰۰٪ در زمان سکوت.</li>
  <li>✨ <strong>گویندگان حرفه‌ای استودیویی و شبیه‌ساز صدا (Voice Match)</strong>: دارای آرشیو صداهای طبیعی زن و مرد (مانند Aoede، Puck، Kore، Fenrir، Charon و...) و قابلیت شبیه‌سازی خودکار لحن، جنسیت و احساس گوینده ویدیو.</li>
  <li>💬 <strong>باکس زیرنویس شیشه‌ای و شناور</strong>: کادر زیرنویس قابل کشیدن و جابه‌جایی با ماوس روی پلیر ویدیو، با قابلیت نمایش دوزبانه (متن اصلی ویدیو + متن ترجمه‌شده).</li>
  <li>💾 <strong>ضبط و استخراج خودکار فایل</strong>: دانلود خودکار فایل استاندارد زیرنویس زمان‌بندی‌شده (<code>.srt</code>) و فایل صوتی دوبله پس از پایان تماشای ویدیو.</li>
  <li>🌐 <strong>رابط کاربری کاملاً دوزبانه</strong>: طراحی مدرن شیشه‌ای تیره با پشتیبانی بومی از راست‌چین (RTL) برای زبان فارسی و چپ‌چین (LTR) برای انگلیسی.</li>
  <li>♾️ <strong>کاملاً نامحدود و رایگان</strong>: بدون هرگونه سقف زمانی یا محدودیت روزانه در تمام حالت‌ها (نسخه نصبی و توسعه).</li>
  <li>🔒 <strong>حفظ کامل حریم خصوصی و امنیت</strong>: تمام عملیات در سمت مرورگر (Client-Side) انجام می‌شود. کلید API شما فقط روی حافظه محلی سیستم خودتان ذخیره می‌شود و هیچ سرور واسطه‌ای وجود ندارد.</li>
</ul>

</div>

---

<div align="right" dir="rtl">

## 📥 راهنمای نصب و راه‌اندازی سریع

### روش اول: دانلود فایل آماده (ساده‌ترین روش برای عموم کاربران)

<p align="right" dir="rtl">
<strong>مسیر مراحل نصب:</strong><br />
دانلود فایل فشرده ← استخراج فایل ← باز کردن <code>chrome://extensions/</code> ← روشن کردن Developer mode ← کلیک روی Load unpacked ← انتخاب پوشه
</p>

<ol dir="rtl" align="right">
  <li>به بخش <a href="https://github.com/AM68JSU/OmniDub/releases"><strong>Releases (نسخه‌ها)</strong></a> در همین ریپازیتوری مراجعه کنید.</li>
  <li>آخرین فایل فشرده <code>OmniDub-v1.0.0.zip</code> را دانلود کنید.</li>
  <li>فایل ZIP را در یک پوشه دلخواه روی کامپیوتر خود از حالت فشرده خارج (Extract) کنید (مثلاً در مسیر <code>C:\Extensions\OmniDub</code>).</li>
  <li>مرورگر گوگل کروم را باز کرده و در نوار آدرس عبارت <code>chrome://extensions/</code> را تایپ و Enter بزنید.</li>
  <li>در گوشه بالا سمت راست، گزینه <strong>Developer mode</strong> را روشن کنید.</li>
  <li>روی دکمه <strong>Load unpacked</strong> در بالا سمت چپ کلیک کنید.</li>
  <li>پوشه‌ای که فایل‌ها را در آن اکسترکت کردید انتخاب نمایید.</li>
  <li>آیکون <strong>OmniDub</strong> را در نوار ابزار بالای مرورگر خود سنجاق (Pin) کنید.</li>
</ol>

<br />

### روش دوم: نصب از طریق سورس کد گیت (مخصوص برنامه‌نویسان)

<p align="right" dir="rtl">
<strong>مسیر مراحل:</strong><br />
کلون کردن مخزن گیت ← باز کردن <code>chrome://extensions/</code> ← فعال‌سازی حالت توسعه ← کلیک روی Load unpacked
</p>

<div dir="ltr" align="left">

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/AM68JSU/OmniDub.git

# ۲. ورود به دایرکتوری پروژه
cd OmniDub
```

</div>

<p align="right" dir="rtl">
سپس در مرورگر کروم به مسیر <code>chrome://extensions/</code> رفته، حالت Developer mode را روشن کنید و با دکمه <strong>Load unpacked</strong> این پوشه را انتخاب نمایید.
</p>

</div>

---

<div align="right" dir="rtl">

## 🔑 راهنمای دریافت کلید رایگان Google Gemini API

<p align="right" dir="rtl">
برای اینکه افزونه بتواند مستقیماً با هوش مصنوعی گوگل ارتباط برقرار کند، به یک کلید API نیاز دارید (دریافت آن کمتر از ۲ دقیقه زمان می‌برد و در پنل گوگل پلن استفاده رایگان دارد):
</p>

<p align="right" dir="rtl">
<strong>مسیر مراحل:</strong><br />
ورود به Google AI Studio ← کلیک روی Create API key ← کپی کلید ← باز کردن تنظیمات OmniDub (چرخ‌دنده) ← جای‌گذاری و ذخیره
</p>

<ol dir="rtl" align="right">
  <li>به وبسایت <a href="https://aistudio.google.com/app/apikey"><strong>Google AI Studio</strong></a> بروید.</li>
  <li>با حساب کاربری گوگل (Gmail) خود وارد شوید.</li>
  <li>بر روی دکمه آبی‌رنگ <strong>Create API key</strong> کلیک کنید.</li>
  <li>کلید ساخته‌شده را کپی کنید.</li>
  <li>در مرورگر کروم، روی آیکون <strong>OmniDub</strong> کلیک کنید، سپس آیکون چرخ‌دنده (⚙️ تنظیمات) را در بالای پنجره بزنید.</li>
  <li>کلید API خود را در کادر مربوطه جای‌گذاری (Paste) کرده و دکمه <strong>ذخیره تنظیمات</strong> را بزنید.</li>
  <li>روی دکمه <strong>تست اتصال زنده</strong> کلیک کنید تا از اتصال سالم به گوگل اطمینان پیدا کنید.</li>
</ol>

> [!TIP]
> با توجه به محدودیت‌های آی‌پی، کاربران مقیم ایران باید در هنگام استفاده یا تست اتصال، از ابزار تغییر آی‌پی (VPN) که به سرویس‌های گوگل دسترسی دارد استفاده کنند.

</div>

---

<div align="right" dir="rtl">

## 💡 راهنمای استفاده گام‌به‌گام

<p align="right" dir="rtl">
<strong>مسیر مراحل:</strong><br />
اجرای ویدیو در وبسایت ← باز کردن OmniDub ← انتخاب زبان مقصد ← کلیک روی «شروع دوبله زنده»
</p>

<ol dir="rtl" align="right">
  <li>وارد سایتی شوید که ویدیوی مورد نظر شما در آن قرار دارد (مانند یوتیوب یا وبسایت‌های دوره‌های آموزشی).</li>
  <li>ویدیو را پلی (Play) کنید.</li>
  <li>روی آیکون <strong>OmniDub</strong> در بالای مرورگر کلیک کنید.</li>
  <li><strong>زبان مقصد</strong> را انتخاب کنید (به‌صورت پیش‌فرض روی فارسی تنظیم شده است).</li>
  <li>در صورت تمایل تنظیمات را سفارشی‌سازی کنید:
    <ul>
      <li><strong>بلندی صدا و سرعت</strong>: میزان صدای گوینده هوش مصنوعی و تند یا کند بودن گویندگی.</li>
      <li><strong>صدای گوینده دوبله</strong>: انتخاب گوینده‌های استودیویی زن و مرد یا حالت خودکار شبیه‌ساز صدا.</li>
      <li><strong>میزان صدای ویدیوی اصلی</strong>: مثلاً ۵٪ برای زمزمه ملایم پس‌زمینه ویدیو.</li>
      <li><strong>زیرنویس شناور</strong>: فعال کردن کادر زیرنویس و نمایش دوزبانه متن اصلی و فارسی.</li>
    </ul>
  </li>
  <li>روی دکمه بزرگ <strong>▶ شروع دوبله زنده</strong> کلیک کنید.</li>
  <li>از تماشای ویدیو با دوبله روان و زیرنویس همزمان لذت ببرید!</li>
  <li>در پایان برای خاتمه روی دکمه <strong>⏹ توقف دوبله زنده</strong> کلیک کنید. اگر گزینه ضبط فعال باشد، فایل زیرنویس SRT به‌طور خودکار دانلود خواهد شد.</li>
</ol>

</div>

---

<div align="right" dir="rtl">

## 🏗️ ساختار فایل‌های پروژه

<div dir="ltr" align="left">

```text
OmniDub/
├── manifest.json                 # فایل پیکربندی Manifest V3 افزونه کروم
├── CHROMEWEBSTORE.md             # توضیحات، دسترسی‌ها و مدارک برای انتشار در استور کروم
├── README.md                     # راهنمای کامل به زبان انگلیسی
├── README.fa.md                  # راهنمای کامل به زبان فارسی
├── LICENSE                       # مجوز رسمی نرم‌افزار (MIT)
├── icons/                        # آیکون‌های رسمی در ابعاد مختلف (۱۶، ۴۸، ۱۲۸)
├── popup/                        # کدهای رابط کاربری و پنل کنترل
│   ├── popup.html                # ساختار HTML با طراحی گلس‌مورفیسم
│   ├── popup.css                 # استایل‌های تم دارک، راست‌چین/چپ‌چین و انیمیشن‌ها
│   └── popup.js                  # منطق تعاملی، فیلتر زبان‌ها و پاپ‌آپ تنظیمات API
├── background/                   # سرویس ورکر پس‌زمینه کروم
│   └── service_worker.js         # مدیریت ضبط تب، داکینگ صدا و ارتباط بین بخش‌ها
├── offscreen/                    # پردازش صدا در محیط ایزوله Web Audio
│   ├── offscreen.html
│   ├── offscreen.js              # قطعه‌بندی صوت، کدک ۱۶ کیلوهرتز و ارسال استریم
│   └── audio_processor.js        # پردازنده صوتی بافرها
├── content_scripts/              # اسکریپت‌های تزریق شونده به صفحه ویدیو
│   ├── subtitle_overlay.css      # استایل‌های کادر شناور زیرنویس
│   └── subtitle_overlay.js       # کادر جابجاشونده با ماوس و کنترلر ولوم ویدیو
├── services/                     # هسته منطق محاسباتی و ارتباطات
│   ├── gemini_api.js             # کلاینت REST جمینای همراه با اسکیما JSON ساختاریافته
│   ├── gemini_live_client.js     # کلاینت وب‌سوکت برای استریم بلادرنگ
│   ├── tts_engine.js             # صف پخش گفتار و هماهنگ‌سازی داکینگ
│   ├── i18n.js                   # موتور چندزبانه (فارسی و انگلیسی)
│   ├── language_list.js          # لیست بیش از ۵۰ زبان با پرچم و کدها
│   └── quota_manager.js          # موتور استفاده نامحدود (بدون سقف زمانی)
└── utils/                        # ابزارهای کمکی
    ├── audio_recorder.js         # مدیریت ضبط سشن صوتی و خروجی WAV
    └── srt_generator.js          # تولیدکننده فایل زیرنویس با فرمت استاندارد SRT
```

</div>

</div>

---

<div align="right" dir="rtl">

## 📦 ساخت بسته برای انتشار (Build & Packaging)

<p align="right" dir="rtl">
برای ساخت فایل ZIP خالص و استاندارد مناسب انتشار در گیت‌هاب یا آپلود در پنل توسعه‌دهندگان گوگل کروم، کافی است اسکریپت پاورشل آماده را اجرا کنید:
</p>

<div dir="ltr" align="left">

```powershell
.\package-extension.ps1
```

</div>

<p align="right" dir="rtl">
این اسکریپت به‌صورت خودکار فایل‌های ضروری را استخراج کرده و آرشیو آماده <code>OmniDub-v1.0.0.zip</code> را بدون فایل‌های غیرضروری و گیت ایجاد می‌کند.
</p>

</div>

---

<div align="right" dir="rtl">

## 🔒 امنیت و حریم خصوصی داده‌ها

<ul dir="rtl" align="right">
  <li><strong>بدون نیاز به سرور مرکزی</strong>: افزونه کاملاً به شکل مستقل روی مرورگر سیستم کاربر اجرا می‌شود.</li>
  <li><strong>ارتباط مستقیم و امن</strong>: تمام درخواست‌ها مستقیماً از طریق پروتکل رمزنگاری شده HTTPS و WSS به آدرس رسمی گوگل (<code>generativelanguage.googleapis.com</code>) ارسال می‌شوند.</li>
  <li><strong>ذخیره‌سازی محلی</strong>: کلید API شما فقط در حافظه امن و رمزنگاری‌شده مرورگر خودتان ذخیره می‌شود (<code>chrome.storage.local</code>).</li>
  <li>هیچ‌گونه داده شخصی، اطلاعات مرور، ردیابی یا تبلیغاتی در برنامه وجود ندارد.</li>
</ul>

</div>

---

<div align="right" dir="rtl">

## ❓ پرسش‌های متداول (FAQ)

<details dir="rtl" align="right">
<summary><strong>آیا استفاده از این افزونه پولی است؟</strong></summary>
<p align="right" dir="rtl">
خیر. افزونه OmniDub کاملاً اوپن‌سورس و رایگان است. شما از کلید رایگان شخصی خود در گوگل استودیو استفاده می‌کنید که سهمیه روزانه رایگان و مناسبی برای استفاده شخصی ارائه می‌دهد.
</p>
</details>

<details dir="rtl" align="right">
<summary><strong>چرا هنگام شروع دوبله، صدای ویدیوی اصلی کم می‌شود؟</strong></summary>
<p align="right" dir="rtl">
این قابلیت حرفه‌ای اصطلاحاً Audio Ducking نامیده می‌شود تا صدای زبان اصلی ویدیو مانع از شنیدن صدای دوبله فارسی نشود. شما می‌توانید در پنل افزونه این مقدار را از ۰٪ (بی‌صدای کامل) تا ۲۵٪ تغییر دهید.
</p>
</details>

<details dir="rtl" align="right">
<summary><strong>آیا در وبسایت‌های مختلف مثل یوتیوب و سایت‌های آموزشی کار می‌کند؟</strong></summary>
<p align="right" dir="rtl">
بله! افزونه با تمامی پلیرهای ویدیویی مبتنی بر HTML5 سازگار است و در یوتیوب، کورسرا، یودمی، آپارات و وبینارها تست شده است.
</p>
</details>

<details dir="rtl" align="right">
<summary><strong>در اتصال وب‌سوکت با خطای تایم‌اوت یا خطا مواجه می‌شوم، راه حل چیست؟</strong></summary>
<p align="right" dir="rtl">
سرویس‌های هوش مصنوعی گوگل برای آی‌پی‌های ایران محدود هستند. لطفاً مطمئن شوید که فیلترشکن شما روشن و دارای پایداری و سرعت مناسب است، سپس دکمه تست اتصال را در تنظیمات بزنید.
</p>
</details>

</div>

---

<div align="right" dir="rtl">

## 🤝 مشارکت و بهبود پروژه

<p align="right" dir="rtl">
از همه پیشنهادها، رفع باگ‌ها و مشارکت‌های شما به گرمی استقبال می‌کنیم!<br />
می‌توانید مشکلات یا ایده‌های خود را در بخش <a href="https://github.com/AM68JSU/OmniDub/issues">Issues</a> مطرح کرده یا با مطالعه <a href="CONTRIBUTING.md">CONTRIBUTING.md</a> پول‌ریکوئست (PR) ارسال فرمایید.
</p>

</div>

---

<div align="right" dir="rtl">

## 📄 لایسنس و مجوز

<p align="right" dir="rtl">
این پروژه تحت مجوز آزاد <strong>MIT License</strong> منتشر شده است — برای اطلاعات بیشتر فایل <a href="LICENSE">LICENSE</a> را مشاهده کنید.
</p>

<p align="center">
  ساخته‌شده با ❤️ برای دسترسی آزاد و آسان همگان به دانش جهانی.
</p>

</div>

