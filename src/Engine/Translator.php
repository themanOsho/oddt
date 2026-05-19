<?php
/**
 * oddtranslator - Main Translation Engine
 */

class Translator {
    private DatabaseConnection $db;
    private ProviderRegistry $registry;

    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
        $this->registry = new ProviderRegistry();
    }

    public function translate(string $text, string $targetLang = 'en'): string {
        if (empty(trim($text))) {
            return $text;
        }

        if (strtolower($targetLang) === 'en') {
            return $text;
        }

        // Generate cache key
        $hash = md5($text . '_' . $targetLang);

        // Check cache first
        $cached = $this->db->getCache($hash, $targetLang);
        if ($cached !== null) {
            return $cached;
        }

        // Get provider and translate
        $provider = $this->registry->getActiveProvider();
        $translated = $provider->translate($text, $targetLang);

        // Save to cache
        $this->db->setCache($hash, $text, $translated, $targetLang);

        return $translated;
    }
}