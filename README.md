# 🌍 oddtranslator

**Self-contained, zero-code drop-in translation engine for any PHP website.**

Upload the folder → run the one-click activator → instantly add professional multi-language translation to your entire site with smart caching. No coding, no plugins, no bloat.

![ODDT Banner](https://via.placeholder.com/1200x400/0A2540/00D4FF?text=oddtranslator+-+Zero-Code+Translation+Engine)
*Banner coming soon with final branding*

## Table of Contents

- [Features](#-features)
- [Quick Start (60 seconds)](#-quick-start-60-seconds)
- [How It Works](#-how-it-works)
- [Folder Structure](#-folder-structure)
- [Admin Dashboard](#-admin-dashboard)
- [Integrations & Providers](#-integrations--providers)
- [Requirements](#-requirements)
- [Roadmap](#-roadmap)
- [License](#-license)

## ✨ Features

- **True Zero-Code Integration** — `oddt-enable.php` automatically activates the engine (no manual `require_once`)
- **Works on Any PHP Site** — Plain PHP, WordPress, Laravel, custom CMS, legacy code — everything
- **Smart Auto-Translation** — Automatically translates page content (headings, paragraphs, spans, articles, etc.)
- **Configurable Widget** — Floating button or dropdown selector (multiple positions)
- **MyMemory Default** — Works immediately with no API key (5k → 50k characters/day)
- **Multi-Provider Support** — Easily switch to DeepL, Microsoft Translator, etc. via your own keys
- **Lightning-Fast Caching** — MD5-based cache in your database (repeated text = instant, zero cost)
- **Skip Protection** — Protect prices, brand names, code blocks with `.oddt-skip` or `data-oddt-skip`
- **Beautiful Tailwind Admin** — Modern dashboard with toast notifications
- **Fully Isolated** — All CSS/JS uses `oddt-` namespace (no theme conflicts)
- **Production Ready** — PDO prepared statements, encrypted keys, installer lock

## 🚀 Quick Start (60 seconds)

1. Upload the entire `oddt/` folder to your website root.
2. Visit `https://your-site.com/oddt/oddt-enable.php` → Click **Activate** (zero-code magic).
3. Run the installer: `https://your-site.com/oddt/installer.php`
4. Complete the 4-step wizard (database + admin account).
5. Done! Your site now has a working translation widget.

**Manual fallback:** Add one line at the top of your `index.php`:
```php
<?php require_once $_SERVER['DOCUMENT_ROOT'] . '/oddt/boot.php'; ?>
```

## 🔧 How It Works

1. `boot.php` + output buffering automatically injects assets and widget.
2. Visitor clicks the language widget.
3. Frontend JS scans the page and sends text blocks via AJAX.
4. Backend checks MD5 cache → returns instantly if available.
5. On cache miss: translates using the active provider → saves to cache → updates DOM live.
6. All changes made in the admin panel reflect immediately on the frontend.

## 📁 Folder Structure

```text
oddt/
├── assets/
│   ├── css/
│   │   ├── oddt-style.css
│   │   └── oddt-admin.css
│   └── js/
│       ├── oddt-translator.js
│       └── oddt-admin.js
├── src/
│   ├── Auth/
│   ├── Database/
│   ├── Engine/
│   ├── Providers/          # MyMemory (default) + others
│   └── Utils/
├── views/                  # Tailwind admin pages
├── admin.php
├── boot.php
├── installer.php
├── oddt-enable.php         # Zero-code activator
├── translate.php
├── config.php              # Auto-generated
├── .installed              # Install lock
├── PRD.md
├── README.md
└── .gitignore
```

## 🛠️ Admin Dashboard

Access at `/oddt/admin.php` after login.

- **Dashboard** — Translation stats & cache overview
- **Configure** — Widget type (floating/dropdown), position, skip selectors
- **Integrations** — Switch translation provider + enter your API keys
- **Settings** — Database connection test
- **License** — Premium features (future)

All settings apply live without clearing cache.

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
- **v0.0.2** — Premium license system + more providers

## License

This project is licensed under the MIT License.

---

**Made with ❤️ for PHP developers and site owners who want powerful translation without the headache.**

Star the repo if this helps you!