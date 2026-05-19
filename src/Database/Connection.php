<?php
/**
 * oddtranslator - Database Connection
 * PDO Singleton with helper methods for settings and cache
 */

class DatabaseConnection {
    private static ?self $instance = null;
    private PDO $pdo;

    private function __construct() {
        if (!defined('DB_HOST')) {
            throw new Exception('Database constants not defined. Run installer first.');
        }

        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        
        $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getPdo(): PDO {
        return $this->pdo;
    }

    // Get setting from oddt_settings table
    public function getSetting(string $key, $default = null) {
        $stmt = $this->pdo->prepare("SELECT value FROM oddt_settings WHERE `key` = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetchColumn();
        return $result !== false ? $result : $default;
    }

    // Set/update setting
    public function setSetting(string $key, $value): bool {
        $stmt = $this->pdo->prepare(
            "INSERT INTO oddt_settings (`key`, `value`) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)"
        );
        return $stmt->execute([$key, $value]);
    }

    // Cache helpers
    public function getCache(string $hash, string $targetLang): ?string {
        $stmt = $this->pdo->prepare("SELECT translated_text FROM oddt_cache WHERE hash = ? AND target_lang = ?");
        $stmt->execute([$hash, $targetLang]);
        return $stmt->fetchColumn() ?: null;
    }

    public function setCache(string $hash, string $sourceText, string $translatedText, string $targetLang): bool {
        $stmt = $this->pdo->prepare(
            "INSERT INTO oddt_cache (hash, target_lang, source_text, translated_text) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE translated_text = VALUES(translated_text)"
        );
        return $stmt->execute([$hash, $targetLang, $sourceText, $translatedText]);
    }
}