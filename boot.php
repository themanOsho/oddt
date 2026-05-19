<?php
/**
 * oddtranslator - Bootstrap File
 * Central loader for all core classes
 */

// Security
if (basename($_SERVER['SCRIPT_FILENAME']) === 'boot.php') {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

// Load config if it exists
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// Core classes
require_once __DIR__ . '/src/Database/Connection.php';
require_once __DIR__ . '/src/Auth/Session.php';

// === Phase 3: Translation Engine ===
require_once __DIR__ . '/src/Providers/ProviderInterface.php';
require_once __DIR__ . '/src/Providers/MyMemoryProvider.php';
require_once __DIR__ . '/src/Engine/ProviderRegistry.php';
require_once __DIR__ . '/src/Engine/Translator.php';
require_once __DIR__ . '/src/Utils/HtmlInjector.php';

// Start output buffering for injection and optional server-side translation
if (!isset($GLOBALS['oddt_buffer_started'])) {
    $scriptName = basename($_SERVER['SCRIPT_FILENAME']);
    $excluded = ['boot.php', 'installer.php', 'installer-form.php', 'translate.php', 'test-phase1.php', 'test-phase3.php'];

    if (!in_array($scriptName, $excluded, true)) {
        if (file_exists(__DIR__ . '/.installed')) {
            HtmlInjector::start();
        }

        if (array_key_exists('lang', $_GET)) {
            $requestedLang = trim(strtolower((string) ($_GET['lang'] ?? '')));
            if ($requestedLang !== '') {
                ob_start(function ($buffer) use ($requestedLang) {
                    if (stripos($buffer, '<html') === false) {
                        return $buffer;
                    }

                    try {
                        $translator = new Translator();
                        $dom = new DOMDocument();
                        @$dom->loadHTML('<?xml encoding="utf-8"?>' . $buffer, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
                        $xpath = new DOMXPath($dom);
                        $nodes = $xpath->query('//text()[normalize-space() and not(ancestor::script) and not(ancestor::style) and not(ancestor::noscript) and not(ancestor::textarea) and not(ancestor::code) and not(ancestor::pre) and not(ancestor::option)]');

                        foreach ($nodes as $node) {
                            $text = trim($node->nodeValue);
                            if ($text === '') {
                                continue;
                            }

                            $translated = $translator->translate($text, $requestedLang);
                            if ($translated !== $text) {
                                $node->nodeValue = str_replace($text, $translated, $node->nodeValue);
                            }
                        }

                        return $dom->saveHTML();
                    } catch (Throwable $e) {
                        return $buffer;
                    }
                });
            }
        }
    }

    $GLOBALS['oddt_buffer_started'] = true;
}

// Initialize session
new OddtSession();