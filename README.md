<h1 style="display: flex; align-items: center; gap: 8px;">
  <img src="assets/oddt-logo-solid.png" alt="Logo" width="32" height="32" style="vertical-align: middle;">
  oddtranslator
</h1>

**Self-contained, zero-code drop-in translation engine for any PHP website.**

Upload the folder → run the one-click activator → instantly add professional multi-language translation to your entire site with smart caching. No coding, no plugins, no bloat.

![Setup Wizard](assets/screenshots/welcome-screen.png)

## Table of Contents

- [Features](#-features)
- [Quick Start (60 seconds)](#-quick-start-60-seconds)
- [How It Works](#-how-it-works)
- [Folder Structure](#-folder-structure)
- [Integrations & Providers](#-integrations--providers)
- [Requirements](#-requirements)
- [Roadmap](#-roadmap)
- [License](#-license)

## ✨ Features

- **True Zero-Code Integration** — `oddt-enable.php` automatically activates the engine (no manual `require_once`)
- **Works on Any PHP Site** — Plain PHP, WordPress, Laravel, custom CMS, legacy code — everything
- **SEO-Friendly URL Translation** — Zero-config `?lang=es` parameter for indexable, crawlable pages
- **Server-Side Rendering** — Optional output buffering for full-page HTML translation (faster, no JS parsing)
- **Language Widget** — Floating button
- **8 Languages Built-In** — English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese
- **MyMemory Default** — Works immediately with no API key (5k → 50k characters/day)
- **Multi-Provider Support** — Easily switch to DeepL, Microsoft Translator, LibreTranslate via API keys
- **Composite-Key Caching** — MD5 hash + target language = zero cache collisions between languages
- **Skip Protection** — Protect prices, brand names, code blocks with `.oddt-skip` or `data-oddt-skip`
- **Fully Isolated** — All CSS/JS uses `oddt-` namespace (no theme conflicts)

## 🚀 Quick Start (60 seconds)

1. Upload the entire `oddt/` folder to your website root directory.
2. Visit `https://your-site.com/oddt/oddt-enable.php` to automatically run the zero-code activator. This script will inject the necessary code into your `index.php` to enable the translation engine without any manual coding.
3. Verify that the activation script displays an `injected` status for your `index.php` file.
4. Click the "Proceed to Installer" button to run the secure installer.
4. Complete the 4-step wizard to set up your database connection and admin account.
5. Done! Your site now has a working translation widget.

**Manual fallback:** Add one line at the top of your `index.php`:
```php
<?php require_once $_SERVER['DOCUMENT_ROOT'] . '/oddt/boot.php'; ?>
```

## 🔧 How It Works

1. `boot.php` checks for `.installed` lock and conditionally starts `HtmlInjector::start()` for automatic widget injection.
2. On requests with `?lang=es` (or any target language), output buffering intercepts the page HTML and translates visible text nodes server-side.
3. Without `?lang` parameter, pages render in English (original language) — no unwanted translation.
4. `oddt-translator.js` renders the floating language selector widget with dynamic viewport positioning.
5. Visitor clicks the widget → selects a language → page reloads with `?lang=XX` appended to URL.
6. Backend checks MD5 cache (keyed by hash + language) → returns instantly if available.
7. On cache miss: translates using the active provider → saves to composite-key cache → page displays translated content.
8. All skip selectors (`.oddt-skip`, `data-oddt-skip`, `.price`, `.no-translate`) remain untouched during translation.

## 📁 Folder Structure

```text
oddt/
├── assets/
│   ├── css/
│   │   ├── oddt-style.css           # Floating widget + dropdown styling (responsive, accessible)
│   │   └── oddt-admin.css           # Tailwind brand overrides for admin panel
│   └── js/
│       ├── oddt-translator.js       # Frontend widget: auto-positioning, language selector, URL switching
│       └── oddt-admin.js            # Admin dashboard: form handling, notifications
│
├── src/
│   ├── Auth/
│   │   └── Session.php              # Native PHP session management + login guard
│   ├── Database/
│   │   └── Connection.php           # PDO singleton, settings & cache helpers, composite key support
│   ├── Engine/
│   │   ├── Translator.php           # Public translate() API, caching, provider abstraction
│   │   └── ProviderRegistry.php     # Factory pattern: loads active provider from DB
│   ├── Providers/
│   │   ├── ProviderInterface.php    # Contract for all translation providers
│   │   ├── MyMemoryProvider.php     # Default (free, no key required)
│   │   ├── DeepLProvider.php        # Premium provider (API key)
│   │   ├── MicrosoftTranslatorProvider.php # Enterprise provider (API key + region)
│   │   ├── LibreTranslateProvider.php     # Self-hosted or public instance
│   │   └── GoogleFreeProvider.php   # Legacy fallback
│   └── Utils/
│       └── HtmlInjector.php         # Output buffering, automatic asset injection before </body>
│
├── views/                           # Admin panel pages (pure Tailwind)
│   ├── header.php                   # Nav, CDN links, admin CSS
│   ├── footer.php                   # Common footer snippet
│   ├── dashboard.php                # Cache stats, system health
│   ├── configure.php                # Widget type, position, skip selectors
│   ├── integrations.php             # Provider selector, API key forms
│   ├── settings.php                 # Database connection tester
│   └── license.php                  # Future premium features
│
├── docs/
│   ├── file-str.md                  # This folder structure reference
│   ├── PRD.md                       # Product requirements document
│   └── roadmap.md                   # Development roadmap
│
├── admin.php                        # Central admin router + auth guard
├── boot.php                         # Single entry point: loads classes, starts injection/translation
├── config.php                       # Auto-generated by installer (DB credentials)
├── installer.php                    # Secure backend installer logic (CSRF protected)
├── installer-form.php               # Installer UI (4-step wizard with Tailwind)
├── login.php                        # Admin login screen
├── translate.php                    # AJAX endpoint for frontend language requests
├── oddt-enable.php                  # Zero-code activator (injects boot.php into index.php)
├── .installed                       # Lock file created after successful install
├── .gitignore
├── LICENSE
├── README.md
└── vendor/                          # stichoza (bundled for legacy GoogleFreeProvider)
```

## 🌐 Language Switching via URL

Pages are translated by appending the `?lang` parameter to the URL:

```
https://your-site.com/page.php?lang=es       # Spanish
https://your-site.com/page.php?lang=fr       # French
https://your-site.com/page.php?lang=de       # German
https://your-site.com/page.php                # English (default, no translation)
```

**Benefits:**
- SEO-friendly: Search engines can index translated versions separately
- Shareable: Users can send translated links to friends
- Zero JavaScript: Works even if frontend JS is disabled
- Bookmarkable: Translations persist across page reloads
- No client-side parsing required: Server handles all translation

The frontend widget (`oddt-translator.js`) automatically handles language switching by reloading the page with the appropriate `?lang=` parameter.

## 🚫 Skip Selectors

Elements matching these selectors are protected from translation:

```html
<p class="oddt-skip">This text won't be translated</p>
<div data-oddt-skip>Protected content</div>
<span class="price">$19.99</span>          <!-- Prices never translate -->
<code class="no-translate">myFunction()</code>
```

## 🔑 Integrations & Providers

- **Default:** MyMemory (no key needed)
- Add your own keys for:
  - DeepL
  - Microsoft Translator
  - LibreTranslate
  - Google Free (fallback)

Higher-traffic sites can upgrade quality and limits instantly.

## 📈 Requirements

- PHP 8.0+
- MySQL / MariaDB
- PDO_MYSQL + cURL extensions
- Write permissions on `/oddt/` folder during install

## Roadmap

- **v0.0.1** — Core engine + MyMemory + Integrations (Current)

## License

This project is licensed under the MIT License.

---

**Made with ❤️ for PHP developers and site owners who want powerful translation without the headache.**

Star the repo if this helps you!