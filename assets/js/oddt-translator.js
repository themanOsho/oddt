/**
 * oddtranslator - Frontend Widget & DOM Translator
 * Dynamically positioned language selector with batch translation
 */

class OddtTranslator {
  constructor() {
    // Selectors that should be skipped during translation.
    this.skipSelectors = '[data-oddt-skip], .oddt-skip, .price, .no-translate';
    this.isTranslating = false;

    // Supported languages, labels and flag icon country codes.
    this.languages = {
      en: { name: 'English', flag: 'gb', label: 'GB' },
      es: { name: 'Español', flag: 'es', label: 'ES' },
      fr: { name: 'Français', flag: 'fr', label: 'FR' },
      de: { name: 'Deutsch', flag: 'de', label: 'DE' },
      yo: { name: 'Yorùbá', flag: 'ng', label: 'NG' },
      it: { name: 'Italiano', flag: 'it', label: 'IT' },
      pt: { name: 'Português', flag: 'pt', label: 'PT' },
      hi: { name: 'हिन्दी', flag: 'in', label: 'HI' },
      zh: { name: '中文', flag: 'cn', label: 'ZH' },
      ja: { name: '日本語', flag: 'jp', label: 'JA' },
      ru: { name: 'Русский', flag: 'ru', label: 'RU' },
      ar: { name: 'العربية', flag: 'sa', label: 'AR' },
      sw: { name: 'Kiswahili', flag: 'ke', label: 'SW' }
    };

    // Detect current language from URL query. Defaults to English.
    this.currentLang = this.detectCurrentLang();
    this.init();
  }

  init() {
    this.loadFlagIcons();
    document.addEventListener('DOMContentLoaded', () => this.setupWidget());
    if (document.readyState !== 'loading') {
      this.setupWidget();
    }
  }

  detectCurrentLang() {
    // Read the URL query string to determine the currently selected language.
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    return lang && this.languages[lang] ? lang : 'en';
  }

  loadFlagIcons() {
    // Add the flag-icons CSS from the CDN once.
    const existing = document.querySelector('link[href*="flag-icons.min.css"]');
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  setupWidget() {
    const widgets = document.querySelectorAll('#oddt-widget');
    if (!widgets || widgets.length === 0) return;
    // Prefer the widget placed closest to </body> so injection happens once at page end
    const widget = widgets[widgets.length - 1];

    const btnType = widget.getAttribute('data-btn-type') || 'floating';
    const position = widget.getAttribute('data-btn-position') || 'bottom-right';
    const skipSelectors = widget.getAttribute('data-skip-selectors') || this.skipSelectors;

    this.skipSelectors = skipSelectors;
    this.ensureStylesInHead();
    this.renderWidget(btnType, position);
  }

  ensureStylesInHead() {
    // Move any existing oddt-style.css link into head and add cache-busting timestamp.
    try {
      const links = Array.from(document.querySelectorAll('link[href*="oddt-style.css"]'));
      if (links.length > 0) {
        const primary = links[0];
        const href = primary.getAttribute('href').split('?')[0];
        const stamped = href + '?v=' + Date.now();
        primary.setAttribute('href', stamped);
        if (primary.parentElement !== document.head) {
          document.head.appendChild(primary);
        }
        const existingComment = Array.from(document.head.childNodes).find(node => node.nodeType === 8 && node.nodeValue.trim() === 'oddtranslator injection');
        if (!existingComment) {
          const comment = document.createComment(' oddtranslator injection ');
          document.head.insertBefore(comment, primary);
        }
        links.slice(1).forEach(l => l.parentElement && l.parentElement.removeChild(l));
        return;
      }

      const currentScript = document.currentScript || Array.from(document.scripts).find(s => s.src && s.src.includes('oddt-translator.js'));
      const href = currentScript
        ? new URL('../css/oddt-style.css', currentScript.src).href + '?v=' + Date.now()
        : 'assets/css/oddt-style.css?v=' + Date.now();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      const existingComment = Array.from(document.head.childNodes).find(node => node.nodeType === 8 && node.nodeValue.trim() === 'oddtranslator injection');
      if (!existingComment) {
        const comment = document.createComment(' oddtranslator injection ');
        document.head.appendChild(comment);
      }
      document.head.appendChild(link);
    } catch (e) {
      // silently ignore DOM issues
    }
  }

  renderWidget(type, position) {
    const widget = document.getElementById('oddt-widget');
    if (!widget) return;

    if (type === 'floating') {
      widget.className = 'oddt-widget fixed bottom-4 right-4 z-50 inline-block group';
      widget.innerHTML = `<!-- Floating Wrapper Container (Strictly takes up space of the button only) --><button id="oddt-btn" class="oddt-trigger flex items-center justify-center gap-2 h-12 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95" aria-label="Translate"><span class="fi fi-${this.languages[this.currentLang].flag} shadow-sm rounded-sm" aria-hidden="true"></span><span class="oddt-trigger-code text-sm">${this.languages[this.currentLang].label}</span></button><!-- Dropdown Menu (Positioned absolutely above the button) --><div id="oddt-dropdown" class="oddt-dropdown absolute bottom-full right-0 mb-3 max-h-72 w-45 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl border border-gray-100 opacity-0 translate-y-4 pointer-events-none transition-all duration-300 ease-out"><ul></ul></div>`;
    } else {
      widget.className = 'oddt-widget relative inline-block';
      widget.innerHTML = `<!-- Floating Wrapper Container (Strictly takes up space of the button only) --><button id="oddt-btn" class="oddt-trigger inline-flex items-center justify-center gap-2 h-12 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95" aria-label="Select Language"><span class="fi fi-${this.languages[this.currentLang].flag} shadow-sm rounded-sm" aria-hidden="true"></span><span class="oddt-trigger-code text-sm">${this.languages[this.currentLang].label}</span></button><!-- Dropdown Menu (Positioned absolutely above the button) --><div id="oddt-dropdown" class="oddt-dropdown absolute top-full left-0 mt-3 max-h-72 w-45 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl border border-gray-100 opacity-0 translate-y-4 pointer-events-none transition-all duration-300 ease-out"><ul></ul></div>`;
    }

    const dropdown = widget.querySelector('#oddt-dropdown');
    const trigger = widget.querySelector('.oddt-trigger');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown(widget, dropdown);
    });

    this.populateLanguages(dropdown);
  }

  toggleDropdown(widget, dropdown) {
    const isOpen = widget.getAttribute('data-open') === 'true';
    if (isOpen) {
      widget.removeAttribute('data-open');
      this.removeOpenListeners();
      return;
    }

    dropdown.classList.remove('hidden');
    widget.setAttribute('data-open', 'true');

    this._outsideClickHandler = (e) => {
      if (!widget.contains(e.target)) {
        widget.removeAttribute('data-open');
        this.removeOpenListeners();
      }
    };
    this._escHandler = (e) => {
      if (e.key === 'Escape') {
        widget.removeAttribute('data-open');
        this.removeOpenListeners();
      }
    };
    setTimeout(() => {
      document.addEventListener('click', this._outsideClickHandler);
      document.addEventListener('keydown', this._escHandler);
    }, 10);
  }

  removeOpenListeners() {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler);
      this._outsideClickHandler = null;
    }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this._openDropdown = null;
  }

  positionDropdown(dropdown, trigger) {
    // No dynamic positioning required for the Tailwind-based fixed wrapper layout.
  }

  getPositionStyle(position) {
    const positions = {
      'top-left': 'top: 16px; left: 16px;',
      'top-right': 'top: 16px; right: 16px;',
      'bottom-left': 'bottom: 16px; left: 16px;',
      'bottom-right': 'bottom: 16px; right: 16px;'
    };
    return positions[position] || positions['bottom-right'];
  }

  getButtonLabelHtml() {
    const language = this.languages[this.currentLang] || this.languages.en;
    return `
      <span class="fi fi-${language.flag}" aria-hidden="true"></span>
      <span class="oddt-trigger-code">${language.label}</span>
    `;
  }

  populateLanguages(dropdown) {
    // Build the dropdown list with flags and language names.
    let html = '<ul>';

    for (const [code, meta] of Object.entries(this.languages)) {
      const isActive = code === this.currentLang ? 'oddt-active' : '';
      html += `<li><button class="oddt-lang-btn ${isActive}" data-lang="${code}" data-lang-name="${meta.name}"><span class="fi fi-${meta.flag}" aria-hidden="true"></span><span class="oddt-lang-name">${meta.name}</span></button></li>`;
    }

    html += '</ul>';
    dropdown.innerHTML = html;

    dropdown.querySelectorAll('.oddt-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        this.switchLanguage(lang);
        dropdown.classList.add('hidden');
      });

      btn.addEventListener('mouseover', () => {
        btn.classList.add('hovered');
      });

      btn.addEventListener('mouseout', () => {
        btn.classList.remove('hovered');
      });
    });
  }

  switchLanguage(lang) {
    const params = new URLSearchParams(window.location.search);

    if (lang === 'en') {
      params.delete('lang');
      const query = params.toString();
      window.location.href = window.location.pathname + (query ? '?' + query : '');
      return;
    }

    this.currentLang = lang;
    params.set('lang', lang);
    window.location.href = window.location.pathname + '?' + params.toString();
  }
}

// Auto-initialize once
if (!window.oddtTranslatorLoaded) {
  window.oddtTranslatorLoaded = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new OddtTranslator());
  } else {
    new OddtTranslator();
  }
}
