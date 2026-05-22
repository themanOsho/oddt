<?php
/**
 * oddtranslator - Bootstrap File
 * Central loader for all core classes
 */

// oddt\boot.php

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

function oddtElementHasClass(DOMElement $element, string $class): bool
{
    $classes = preg_split('/\s+/', trim($element->getAttribute('class')),
        -1,
        PREG_SPLIT_NO_EMPTY
    );

    return in_array($class, $classes, true);
}

function oddtElementMatchesSimpleSelector(DOMElement $element, string $selector): bool
{
    $selector = trim($selector);
    if ($selector === '') {
        return false;
    }

    if (str_starts_with($selector, '.')) {
        return oddtElementHasClass($element, substr($selector, 1));
    }

    if (preg_match('/^\[([a-zA-Z0-9_-]+)\]$/', $selector, $matches)) {
        return $element->hasAttribute($matches[1]);
    }

    if (preg_match('/^\[([a-zA-Z0-9_-]+)=(["\']?)(.*?)\2\]$/', $selector, $matches)) {
        return $element->hasAttribute($matches[1]) && $element->getAttribute($matches[1]) === $matches[3];
    }

    if (preg_match('/^[a-zA-Z][a-zA-Z0-9_-]*$/', $selector)) {
        return strtolower($element->tagName) === strtolower($selector);
    }

    return false;
}

function oddtElementMatchesSkipSelector(DOMElement $element, string $skipSelectors): bool
{
    if ($skipSelectors === '') {
        return false;
    }

    $selectors = preg_split('/\s*,\s*/', trim($skipSelectors), -1, PREG_SPLIT_NO_EMPTY);
    foreach ($selectors as $selector) {
        if (oddtElementMatchesSimpleSelector($element, $selector)) {
            return true;
        }
    }

    return false;
}

function oddtShouldSkipTextNode(DOMNode $node, string $skipSelectors): bool
{
    if (!$node instanceof DOMText) {
        return false;
    }

    $ancestor = $node->parentNode;
    while ($ancestor instanceof DOMElement) {
        if (oddtElementMatchesSkipSelector($ancestor, $skipSelectors)) {
            return true;
        }

        $ancestor = $ancestor->parentNode;
    }

    return false;
}

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
                try {
                    $db = DatabaseConnection::getInstance();
                    $skipSelectors = $db->getSetting('skip_selectors', '.oddt-skip,[data-oddt-skip],.price,.no-translate');
                } catch (Throwable $e) {
                    $skipSelectors = '.oddt-skip,[data-oddt-skip],.price,.no-translate';
                }

                ob_start(function ($buffer) use ($requestedLang, $skipSelectors) {
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
                            if (oddtShouldSkipTextNode($node, $skipSelectors)) {
                                continue;
                            }

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