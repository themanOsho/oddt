<?php
/**
 * oddtranslator - HTML Output Injector
 * Automatically appends widget assets into rendered pages.
 */

class HtmlInjector {
    private const GLOBAL_KEY = 'oddt_html_injector_started';

    public static function start(): void {
        if (isset($GLOBALS[self::GLOBAL_KEY])) {
            return;
        }

        ob_start([self::class, 'processOutput']);
        $GLOBALS[self::GLOBAL_KEY] = true;
    }

    public static function processOutput(string $buffer): string {
        $assets = self::renderAssets();

        if (stripos($buffer, '</body>') !== false) {
            return str_ireplace('</body>', $assets . '</body>', $buffer);
        }

        return $buffer . $assets;
    }

    private static function renderAssets(): string {
        try {
            $db = DatabaseConnection::getInstance();
            $style = $db->getSetting('btn_type', 'floating');
            $position = $db->getSetting('btn_position', 'bottom-right');
            $skip = $db->getSetting('skip_selectors', '.oddt-skip,[data-oddt-skip],.price,.no-translate');
        } catch (Throwable $e) {
            $style = 'floating';
            $position = 'bottom-right';
            $skip = '.oddt-skip,[data-oddt-skip],.price,.no-translate';
        }

        $baseUrl = defined('ODDT_BASE_URL') ? rtrim(ODDT_BASE_URL, '/') : rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
        $timestamp = time();
        $scriptSrc = htmlspecialchars($baseUrl . '/assets/js/oddt-translator.js?v=' . $timestamp, ENT_QUOTES);
        $cssHref = htmlspecialchars($baseUrl . '/assets/css/oddt-style.css?v=' . $timestamp, ENT_QUOTES);

        $hasStyle = stripos($buffer, 'oddt-style.css') !== false;
        $hasScript = stripos($buffer, 'oddt-translator.js') !== false;
        $hasWidget = stripos($buffer, 'id="oddt-widget"') !== false || stripos($buffer, "id='oddt-widget'") !== false;

        $assets = "\n<!-- oddtranslator injection -->\n";
        if (!$hasStyle) {
            $assets .= "<link rel=\"stylesheet\" href=\"{$cssHref}\">\n";
        }
        if (!$hasScript) {
            $assets .= "<script src=\"{$scriptSrc}\" defer></script>\n";
        }
        if (!$hasWidget) {
            $assets .= "<div id=\"oddt-widget\" data-btn-type=\"{$style}\" data-btn-position=\"{$position}\" data-skip-selectors=\"{$skip}\"></div>\n";
        }

        if ($assets === "\n<!-- oddtranslator injection -->\n") {
            return '';
        }

        return $assets;
    }
}
