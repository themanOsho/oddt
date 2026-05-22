/**
 * oddtranslator - Frontend Widget & DOM Translator
 * Dynamically positioned language selector with batch translation
 */

class OddtTranslator {
  constructor() {
    // Selectors that should be skipped during translation.
    this.skipSelectors = '[data-oddt-skip], .oddt-skip, .price, .no-translate';
    this.isTranslating = false;
    this.isTriggerHovered = false;
    this.isDropdownHovered = false;
    this._hoverCloseTimeout = null;

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
        const head = document.head;
        if (primary.parentElement !== head) {
          head.appendChild(primary);
        }
        const existingComment = Array.from(head.childNodes).find(node => node.nodeType === 8 && node.nodeValue.trim() === 'oddtranslator injection');
        if (!existingComment) {
          const comment = document.createComment(' oddtranslator injection ');
          head.insertBefore(comment, primary);
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
      const head = document.head;
      const existingComment = Array.from(head.childNodes).find(node => node.nodeType === 8 && node.nodeValue.trim() === 'oddtranslator injection');
      if (!existingComment) {
        const comment = document.createComment(' oddtranslator injection ');
        head.appendChild(comment);
      }
      head.appendChild(link);
    } catch (e) {
      // silently ignore DOM issues
    }
  }

  renderWidget(type, position) {
    const widget = document.getElementById('oddt-widget');
    if (!widget) return;

    const positionClass = type === 'floating' ? this.getPositionClass(position) : '';
    const buttonHtml = this.getButtonLabelHtml();
    const dropdownBase = 'oddt-dropdown oddt-absolute oddt-max-h-72 mb-2 oddt-w-40 oddt-overflow-y-auto oddt-rounded-xl oddt-bg-white oddt-p-1.5 oddt-shadow-2xl oddt-border oddt-border-gray-100 oddt-opacity-0 oddt-translate-y-4 oddt-pointer-events-none oddt-transition-all oddt-duration-200 oddt-ease-in-out';

    if (type === 'floating') {
      widget.className = `oddt-widget oddt-fixed ${positionClass} oddt-z-50 oddt-inline-block oddt-group`;
      widget.innerHTML = `<!-- oddtranslator Floating Wrapper Container --><button id="oddt-btn" class="oddt-trigger oddt-cursor-pointer oddt-flex oddt-items-center oddt-justify-center oddt-gap-2 oddt-h-12 oddt-px-3 sm:oddt-px-4 oddt-rounded-md oddt-bg-indigo-600 hover:oddt-bg-indigo-700 oddt-text-white oddt-font-semibold oddt-shadow-lg hover:oddt-shadow-indigo-500/30 oddt-transition-all oddt-duration-200 active:oddt-scale-95" aria-label="Translate" aria-expanded="false" aria-controls="oddt-dropdown">${buttonHtml}</button><!-- Dropdown Menu (Positioned absolutely above the button) --><div id="oddt-dropdown" class="${dropdownBase} oddt-bottom-full oddt-right-0" role="menu" aria-orientation="vertical"><ul class="oddt-space-y-0.5"></ul></div>`;
    } else {
      widget.className = 'oddt-widget oddt-relative oddt-inline-block';
      widget.innerHTML = `<!-- oddtranslator Floating Wrapper Container --><button id="oddt-btn" class="oddt-trigger oddt-cursor-pointer oddt-inline-flex oddt-items-center oddt-justify-center oddt-gap-2 oddt-h-12 oddt-px-3 sm:oddt-px-4 oddt-rounded-md oddt-bg-indigo-600 hover:oddt-bg-indigo-700 oddt-text-white oddt-font-semibold oddt-shadow-lg hover:oddt-shadow-indigo-500/30 oddt-transition-all oddt-duration-200 active:oddt-scale-95" aria-label="Select Language" aria-expanded="false" aria-controls="oddt-dropdown">${buttonHtml}</button><!-- Dropdown Menu (Positioned absolutely above the button) --><div id="oddt-dropdown" class="${dropdownBase} oddt-top-full oddt-left-0" role="menu" aria-orientation="vertical"><ul class="oddt-space-y-0.5"></ul></div>`;
    }

    const dropdown = widget.querySelector('#oddt-dropdown');
    const trigger = widget.querySelector('.oddt-trigger');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown(widget, dropdown, trigger);
    });

    trigger.addEventListener('mouseenter', () => {
      this.isTriggerHovered = true;
      if (!this.isTranslating) {
        this.openDropdown(widget, dropdown, trigger);
      }
    });

    trigger.addEventListener('mouseleave', () => {
      this.isTriggerHovered = false;
      this.scheduleDropdownClose(widget, dropdown, trigger);
    });

    dropdown.addEventListener('mouseenter', () => {
      this.isDropdownHovered = true;
      this.clearHoverClose();
    });

    dropdown.addEventListener('mouseleave', () => {
      this.isDropdownHovered = false;
      this.scheduleDropdownClose(widget, dropdown, trigger);
    });

    this.populateLanguages(dropdown, widget, trigger);
  }

  toggleDropdown(widget, dropdown, trigger) {
    const isOpen = widget.getAttribute('data-open') === 'true';
    if (isOpen) {
      this.closeDropdown(widget, dropdown, trigger);
    } else {
      this.openDropdown(widget, dropdown, trigger);
    }
  }

  openDropdown(widget, dropdown, trigger) {
    if (widget.getAttribute('data-open') === 'true') {
      return;
    }

    this.clearHoverClose();
    dropdown.classList.remove('oddt-opacity-0', 'oddt-translate-y-4', 'oddt-pointer-events-none');
    dropdown.classList.add('oddt-opacity-100', 'oddt-translate-y-0');
    widget.setAttribute('data-open', 'true');
    trigger.setAttribute('aria-expanded', 'true');

    this._outsideClickHandler = (e) => {
      if (!widget.contains(e.target)) {
        this.closeDropdown(widget, dropdown, trigger);
      }
    };
    this._escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown(widget, dropdown, trigger);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', this._outsideClickHandler);
      document.addEventListener('keydown', this._escHandler);
    }, 10);
  }

  closeDropdown(widget, dropdown, trigger) {
    this.clearHoverClose();
    dropdown.classList.add('oddt-opacity-0', 'oddt-translate-y-4', 'oddt-pointer-events-none');
    dropdown.classList.remove('oddt-opacity-100', 'oddt-translate-y-0');
    widget.removeAttribute('data-open');
    trigger.setAttribute('aria-expanded', 'false');
    this.removeOpenListeners();
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

  scheduleDropdownClose(widget, dropdown, trigger) {
    this.clearHoverClose();
    this._hoverCloseTimeout = setTimeout(() => {
      if (!this.isTriggerHovered && !this.isDropdownHovered) {
        this.closeDropdown(widget, dropdown, trigger);
      }
    }, 120);
  }

  clearHoverClose() {
    if (this._hoverCloseTimeout) {
      clearTimeout(this._hoverCloseTimeout);
      this._hoverCloseTimeout = null;
    }
  }

  positionDropdown(dropdown, trigger) {
    // No dynamic positioning required for the Tailwind-based fixed wrapper layout.
  }

  getPositionClass(position) {
    const positions = {
      'top-left': 'oddt-top-4 oddt-left-4',
      'top-right': 'oddt-top-4 oddt-right-4',
      'bottom-left': 'oddt-bottom-4 oddt-left-4',
      'bottom-right': 'oddt-bottom-4 oddt-right-4'
    };
    return positions[position] || positions['bottom-right'];
  }

  getButtonLabelHtml() {
    const language = this.languages[this.currentLang] || this.languages.en;
    return `
      <span class="fi fi-${language.flag}" aria-hidden="true"></span>
      <span class="oddt-trigger-code oddt-hidden sm:oddt-inline oddt-text-sm">${language.label}</span>
    `;
  }

  populateLanguages(dropdown, widget, trigger) {
    // Build the dropdown list with flags and language names.
    const ul = dropdown.querySelector('ul');
    let html = '';

    for (const [code, meta] of Object.entries(this.languages)) {
      const isActive = code === this.currentLang ? 'oddt-active' : '';
      const activeClass = code === this.currentLang 
        ? 'oddt-bg-indigo-50/70 oddt-text-indigo-600 oddt-font-semibold' 
        : 'oddt-text-gray-700 hover:oddt-bg-gray-50 hover:oddt-text-indigo-600 oddt-font-medium';
      
      html += `<li role="none"><button class="oddt-lang-btn ${isActive} oddt-cursor-pointer oddt-w-full oddt-flex oddt-items-center oddt-gap-3 oddt-px-3 oddt-py-2 oddt-text-sm ${activeClass} oddt-rounded-lg oddt-transition-colors oddt-duration-150" data-lang="${code}" data-lang-name="${meta.name}" role="menuitem"><span class="fi fi-${meta.flag} oddt-shrink-0 oddt-rounded-sm oddt-shadow-sm" aria-hidden="true"></span><span class="oddt-lang-name oddt-truncate">${meta.name}</span></button></li>`;
    }

    ul.innerHTML = html;

    dropdown.querySelectorAll('.oddt-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        this.switchLanguage(lang);
        this.closeDropdown(widget, dropdown, trigger);
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
