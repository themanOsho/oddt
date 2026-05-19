<?php
/**
 * oddtranslator - Provider Registry / Factory
 */

class ProviderRegistry {
    private DatabaseConnection $db;

    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
    }

    public function getActiveProvider(): ProviderInterface {
        $active = $this->db->getSetting('active_provider', 'mymemory');

        return match ($active) {
            'mymemory' => new MyMemoryProvider(),
            // 'deepl', 'microsoft', etc. will be added later
            default => new MyMemoryProvider(),
        };
    }
}